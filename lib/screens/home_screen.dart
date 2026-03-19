import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../services/database_service.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../config/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<StoreModel> _stores = [];
  List<ProductModel> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final db = context.read<DatabaseService>();
    final stores = await db.getStores();
    final products = await db.getProducts();
    if (mounted) {
      setState(() {
        _stores = stores;
        _products = products;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return CustomScrollView(
      slivers: [
        // ── App Bar ────────────────────────────────────────────
        SliverAppBar(
          floating: true,
          title: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text('S',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 18)),
                ),
              ),
              const SizedBox(width: 10),
              const Text('ShopIn',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22)),
            ],
          ),
          actions: [
            if (auth.isAuthenticated)
              CircleAvatar(
                radius: 16,
                backgroundImage: auth.photoUrl != null
                    ? NetworkImage(auth.photoUrl!)
                    : null,
                child: auth.photoUrl == null
                    ? Text(auth.displayName?[0] ?? '?')
                    : null,
              )
            else
              TextButton.icon(
                onPressed: () => auth.signInWithGoogle(),
                icon: const Icon(Icons.login, size: 18),
                label: const Text('Sign In'),
              ),
            const SizedBox(width: 12),
          ],
        ),

        // ── Hero Section ───────────────────────────────────────
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, Color(0xFF15803d)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Smart Grocery\nShopping',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        height: 1.2)),
                const SizedBox(height: 8),
                Text('Compare prices across ${_stores.length} stores near you',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 15)),
                const SizedBox(height: 20),
                Row(
                  children: [
                    FilledButton.icon(
                      onPressed: () => context.go('/stores'),
                      icon: const Icon(Icons.map_rounded, size: 18),
                      label: const Text('Find Stores'),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: () => context.go('/compare'),
                      icon: const Icon(Icons.compare_arrows, size: 18),
                      label: const Text('Compare'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // ── Stats Row ──────────────────────────────────────────
        SliverToBoxAdapter(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      _StatCard(
                          icon: Icons.store,
                          value: '${_stores.length}',
                          label: 'Stores'),
                      const SizedBox(width: 12),
                      _StatCard(
                          icon: Icons.inventory_2,
                          value: '${_products.length}',
                          label: 'Products'),
                      const SizedBox(width: 12),
                      _StatCard(
                          icon: Icons.restaurant,
                          value: _products
                              .map((p) => p.cuisine)
                              .toSet()
                              .length
                              .toString(),
                          label: 'Cuisines'),
                    ],
                  ),
                ),
        ),

        // ── Nearby Stores Preview ──────────────────────────────
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Text('Nearby Stores',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
          ),
        ),
        SliverToBoxAdapter(
          child: _loading
              ? const SizedBox.shrink()
              : SizedBox(
                  height: 120,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: _stores.length.clamp(0, 6),
                    separatorBuilder: (context2, index) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final store = _stores[i];
                      final color = AppTheme.chainColors[store.chain] ??
                          Colors.grey;
                      return GestureDetector(
                        onTap: () => context.go('/stores'),
                        child: Container(
                          width: 140,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                                color: color.withValues(alpha: 0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 36,
                                height: 36,
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
                                        fontSize: 16),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(store.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13)),
                              Text(store.suburb,
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey.shade600)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),

        // ── Products Preview ───────────────────────────────────
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Text('Products',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, i) {
              final product = _products[i];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                  child: Text(product.name[0],
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary)),
                ),
                title: Text(product.name,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text('${product.brand} • ${product.unit}'),
                trailing: Chip(
                  label: Text(product.cuisine,
                      style: const TextStyle(fontSize: 11)),
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                ),
                onTap: () => context.push('/product/${product.id}'),
              );
            },
            childCount: _loading ? 0 : _products.length,
          ),
        ),

        const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  const _StatCard(
      {required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.primary, size: 22),
            const SizedBox(height: 4),
            Text(value,
                style: const TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 20)),
            Text(label,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }
}
