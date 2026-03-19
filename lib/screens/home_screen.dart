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
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── App Bar ────────────────────────────────────────────
          SliverAppBar(
            pinned: true,
            expandedHeight: 120,
            backgroundColor: AppTheme.background,
            surfaceTintColor: Colors.transparent,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              centerTitle: false,
              title: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.shopping_bag_rounded, 
                      color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Text('ShopIn', 
                    style: theme.textTheme.titleLarge?.copyWith(
                      letterSpacing: -0.5,
                      fontWeight: FontWeight.w800,
                    )),
                ],
              ),
            ),
            actions: [
              if (auth.isAuthenticated)
                Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor: AppTheme.primary.withOpacity(0.1),
                    backgroundImage: auth.photoUrl != null
                        ? NetworkImage(auth.photoUrl!)
                        : null,
                    child: auth.photoUrl == null
                        ? Text(auth.displayName?[0] ?? '?',
                            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold))
                        : null,
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: IconButton.filledTonal(
                    onPressed: () => auth.signInWithGoogle(),
                    icon: const Icon(Icons.person_outline_rounded, size: 20),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.primary.withOpacity(0.1),
                      foregroundColor: AppTheme.primary,
                    ),
                  ),
                ),
            ],
          ),

          // ── Hero Section ───────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.all(20),
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
                gradient: const LinearGradient(
                  colors: [AppTheme.primary, Color(0xFF166534)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    right: -30,
                    bottom: -20,
                    child: Icon(Icons.shopping_basket_rounded, 
                      size: 180, color: Colors.white.withOpacity(0.1)),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('PREMIUM GUIDE',
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
                        ),
                        const SizedBox(height: 16),
                        const Text('Smart Grocery\nShopping',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                                height: 1.1,
                                letterSpacing: -1)),
                        const Spacer(),
                        Row(
                          children: [
                            FilledButton(
                              onPressed: () => context.go('/stores'),
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppTheme.primary,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Find Stores', style: TextStyle(fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Search Bar ──────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search products, stores, or cuisines...',
                  prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textSecondary),
                  suffixIcon: Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.tune_rounded, color: Colors.white, size: 18),
                  ),
                ),
              ),
            ),
          ),

          // ── Nearby Stores ──────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Nearby Stores', style: theme.textTheme.titleMedium),
                  TextButton(
                    onPressed: () => context.go('/stores'),
                    child: const Text('See all', style: TextStyle(fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _loading
                ? const SizedBox(height: 140)
                : SizedBox(
                    height: 140,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: _stores.length.clamp(0, 6),
                      separatorBuilder: (_, __) => const SizedBox(width: 16),
                      itemBuilder: (context, i) {
                        final store = _stores[i];
                        final color = AppTheme.chainColors[store.chain] ?? Colors.grey;
                        return GestureDetector(
                          onTap: () => context.go('/stores'),
                          child: Container(
                            width: 160,
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
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: color,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(store.chain[0],
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                                      ),
                                    ),
                                    const Spacer(),
                                    Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Colors.grey.shade300),
                                  ],
                                ),
                                const Spacer(),
                                Text(store.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                const SizedBox(height: 2),
                                Text(store.suburb,
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),

          // ── Featured Products ───────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
              child: Text('Featured Products', style: theme.textTheme.titleMedium),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final product = _products[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      leading: Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Center(
                          child: Text(product.name[0],
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                        ),
                      ),
                      title: Text(product.name,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text('${product.brand} • ${product.unit}',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(product.cuisine,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primary)),
                      ),
                      onTap: () => context.push('/product/${product.id}'),
                    ),
                  );
                },
                childCount: _loading ? 0 : _products.length,
              ),
            ),
          ),

          const SliverPadding(padding: EdgeInsets.only(bottom: 40)),
        ],
      ),
    );
  }
}
