import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'package:provider/provider.dart';
import '../models/store.dart';
import '../services/database_service.dart';
import '../services/location_service.dart';
import '../config/theme.dart';

class StoreLocatorScreen extends StatefulWidget {
  const StoreLocatorScreen({super.key});

  @override
  State<StoreLocatorScreen> createState() => _StoreLocatorScreenState();
}

class _StoreLocatorScreenState extends State<StoreLocatorScreen> {
  final MapController _mapController = MapController();
  final LocationService _locationService = LocationService();

  List<StoreModel> _stores = [];
  StoreModel? _selectedStore;
  bool _loading = true;
  LatLng? _userLocation;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final db = context.read<DatabaseService>();
    final stores = await db.getStores();

    // Try getting user location
    final pos = await _locationService.getCurrentLocation();
    LatLng? userLoc;
    if (pos != null) {
      userLoc = LatLng(pos.latitude, pos.longitude);
      // Compute distances
      for (final s in stores) {
        s.distance = LocationService.distanceKm(
            pos.latitude, pos.longitude, s.latitude, s.longitude);
      }
      stores.sort(
          (a, b) => (a.distance ?? 999).compareTo(b.distance ?? 999));
    }

    if (mounted) {
      setState(() {
        _stores = stores;
        _userLocation = userLoc;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Locator',
            style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () {
              if (_userLocation != null) {
                _mapController.move(_userLocation!, 14);
              }
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // ── Map ─────────────────────────────────────────
                Expanded(
                  flex: 3,
                  child: FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter:
                          _userLocation ?? const LatLng(-37.912, 145.123),
                      initialZoom: 13,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.shopin.flutter',
                      ),
                      MarkerLayer(
                        markers: [
                          // User location
                          if (_userLocation != null)
                            Marker(
                              point: _userLocation!,
                              width: 24,
                              height: 24,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.blue,
                                  shape: BoxShape.circle,
                                  border:
                                      Border.all(color: Colors.white, width: 3),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.blue,
                                      blurRadius: 8,
                                      spreadRadius: 2,
                                    )
                                  ],
                                ),
                              ),
                            ),
                          // Store markers
                          ..._stores.map((store) => Marker(
                                point:
                                    LatLng(store.latitude, store.longitude),
                                width: 50,
                                height: 65,
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _selectedStore = store),
                                  child:
                                      _StoreMarkerWidget(store: store),
                                ),
                              )),
                        ],
                      ),
                    ],
                  ),
                ),

                // ── Store List ──────────────────────────────────
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      // Selected store card
                      if (_selectedStore != null)
                        _StoreDetailCard(
                          store: _selectedStore!,
                          onClose: () =>
                              setState(() => _selectedStore = null),
                        ),
                      // Store list
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemCount: _stores.length,
                          itemBuilder: (context, i) =>
                              _StoreListTile(
                            store: _stores[i],
                            isSelected: _stores[i].id == _selectedStore?.id,
                            onTap: () {
                              setState(() => _selectedStore = _stores[i]);
                              _mapController.move(
                                LatLng(_stores[i].latitude,
                                    _stores[i].longitude),
                                15,
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

// ── Store map marker widget ──────────────────────────────────
class _StoreMarkerWidget extends StatelessWidget {
  final StoreModel store;
  const _StoreMarkerWidget({required this.store});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;
    final logo = store.chain == 'Local Market' ? 'LM' : store.chain[0];

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [
              BoxShadow(
                  color: color.withValues(alpha: 0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2)),
            ],
          ),
          child: Center(
            child: Text(logo,
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: logo.length > 1 ? 11 : 18)),
          ),
        ),
        // Pin tail
        CustomPaint(
          size: const Size(16, 10),
          painter: _PinTailPainter(color),
        ),
      ],
    );
  }
}

class _PinTailPainter extends CustomPainter {
  final Color color;
  _PinTailPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── Store detail card (shown when marker tapped) ─────────────
class _StoreDetailCard extends StatelessWidget {
  final StoreModel store;
  final VoidCallback onClose;
  const _StoreDetailCard({required this.store, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;

    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                store.chain[0],
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 18),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(store.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 15)),
                Text(
                    '${store.address}, ${store.suburb} ${store.postcode}',
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey.shade600)),
                Row(
                  children: [
                    Icon(Icons.schedule,
                        size: 13, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text('${store.hoursOpen} – ${store.hoursClose}',
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey.shade600)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: store.isOpenNow
                            ? Colors.green.shade50
                            : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(store.isOpenNow ? 'Open' : 'Closed',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: store.isOpenNow
                                  ? Colors.green.shade700
                                  : Colors.red.shade700)),
                    ),
                    const Spacer(),
                    Icon(Icons.star, size: 13, color: Colors.amber.shade600),
                    Text(' ${store.rating}',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 18),
            onPressed: onClose,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }
}

// ── Store list tile ──────────────────────────────────────────
class _StoreListTile extends StatelessWidget {
  final StoreModel store;
  final bool isSelected;
  final VoidCallback onTap;
  const _StoreListTile(
      {required this.store, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;
    return Card(
      color: isSelected ? color.withValues(alpha: 0.06) : null,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          radius: 18,
          child: Text(store.chain[0],
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 14)),
        ),
        title: Text(store.name,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(
            store.distance != null
                ? '${store.distance!.toStringAsFixed(1)} km • ${store.suburb}'
                : store.suburb,
            style: const TextStyle(fontSize: 12)),
        trailing: Text(
          store.isOpenNow ? 'Open' : 'Closed',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: store.isOpenNow ? Colors.green : Colors.red,
          ),
        ),
        onTap: onTap,
        dense: true,
      ),
    );
  }
}
