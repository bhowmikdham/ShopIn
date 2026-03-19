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
    final theme = Theme.of(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.9),
        surfaceTintColor: Colors.transparent,
        title: const Text('Store Locator'),
        actions: [
          IconButton.filledTonal(
            icon: const Icon(Icons.my_location_rounded),
            onPressed: () {
              if (_userLocation != null) {
                _mapController.move(_userLocation!, 14);
              }
            },
            style: IconButton.styleFrom(
              backgroundColor: AppTheme.primary.withOpacity(0.1),
              foregroundColor: AppTheme.primary,
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                // ── Map ─────────────────────────────────────────
                FlutterMap(
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
                      tileBuilder: (context, tileWidget, tile) {
                        return ColorFiltered(
                          colorFilter: const ColorFilter.matrix([
                            0.33, 0.33, 0.33, 0, 0,
                            0.33, 0.33, 0.33, 0, 0,
                            0.33, 0.33, 0.33, 0, 0,
                            0, 0, 0, 1, 0,
                          ]),
                          child: tileWidget,
                        );
                      },
                    ),
                    MarkerLayer(
                      markers: [
                        // User location
                        if (_userLocation != null)
                          Marker(
                            point: _userLocation!,
                            width: 32,
                            height: 32,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.blue.shade600,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 4),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.blue.withOpacity(0.3),
                                    blurRadius: 15,
                                    spreadRadius: 5,
                                  )
                                ],
                              ),
                            ),
                          ),
                        // Store markers
                        ..._stores.map((store) => Marker(
                              point: LatLng(store.latitude, store.longitude),
                              width: 56,
                              height: 56,
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedStore = store),
                                child: _StoreMarkerWidget(
                                  store: store,
                                  isSelected: store.id == _selectedStore?.id,
                                ),
                              ),
                            )),
                      ],
                    ),
                  ],
                ),

                // ── Store Detail Card (Overlay) ──────────────────
                if (_selectedStore != null)
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 40,
                    child: _StoreDetailCard(
                      store: _selectedStore!,
                      onClose: () => setState(() => _selectedStore = null),
                    ),
                  ),

                // ── Quick List (Overlay) ─────────────────────────
                if (_selectedStore == null)
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Container(
                      height: 180,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.white.withOpacity(0), Colors.white],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          stops: const [0.0, 0.3],
                        ),
                      ),
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 60, 20, 40),
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        itemCount: _stores.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 16),
                        itemBuilder: (context, i) => _StoreMiniCard(
                          store: _stores[i],
                          onTap: () {
                            setState(() => _selectedStore = _stores[i]);
                            _mapController.move(
                              LatLng(_stores[i].latitude, _stores[i].longitude),
                              15,
                            );
                          },
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}

class _StoreMarkerWidget extends StatelessWidget {
  final StoreModel store;
  final bool isSelected;
  const _StoreMarkerWidget({required this.store, this.isSelected = false});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutBack,
      width: isSelected ? 56 : 48,
      height: isSelected ? 56 : 48,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: isSelected ? 12 : 8,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Center(
        child: Text(store.chain[0],
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 18)),
      ),
    );
  }
}

class _StoreDetailCard extends StatelessWidget {
  final StoreModel store;
  final VoidCallback onClose;
  const _StoreDetailCard({required this.store, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 30,
              offset: const Offset(0, 10))
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(store.chain[0],
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(store.name,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, letterSpacing: -0.5)),
                    Text(store.chain,
                        style: TextStyle(fontSize: 14, color: color, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              IconButton.filledTonal(
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded, size: 20),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.grey.shade100,
                  foregroundColor: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _InfoRow(icon: Icons.location_on_rounded, text: '${store.address}, ${store.suburb}'),
          const SizedBox(height: 12),
          _InfoRow(
            icon: Icons.access_time_filled_rounded, 
            text: '${store.hoursOpen} – ${store.hoursClose}',
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: store.isOpenNow ? Colors.green.shade50 : Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(store.isOpenNow ? 'OPEN' : 'CLOSED', 
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: store.isOpenNow ? Colors.green.shade700 : Colors.red.shade700)),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.directions_rounded, size: 18),
                  label: const Text('Directions'),
                ),
              ),
              const SizedBox(width: 12),
              IconButton.outlined(
                onPressed: () {},
                icon: const Icon(Icons.phone_rounded),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.grey.shade300),
                  padding: const EdgeInsets.all(16),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StoreMiniCard extends StatelessWidget {
  final StoreModel store;
  final VoidCallback onTap;
  const _StoreMiniCard({required this.store, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.chainColors[store.chain] ?? Colors.grey;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 200,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                  child: Center(child: Text(store.chain[0], style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900))),
                ),
                const Spacer(),
                if (store.distance != null)
                  Text('${store.distance!.toStringAsFixed(1)} km', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primary)),
              ],
            ),
            const Spacer(),
            Text(store.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
            Text(store.suburb, style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final Widget? trailing;
  const _InfoRow({required this.icon, required this.text, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade400),
        const SizedBox(width: 12),
        Expanded(child: Text(text, style: TextStyle(color: Colors.grey.shade700, fontSize: 14, fontWeight: FontWeight.w500))),
        if (trailing != null) trailing!,
      ],
    );
  }
}
