import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../models/price.dart';
import '../services/database_service.dart';
import '../providers/cart_provider.dart';
import '../config/theme.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  ProductModel? _product;
  PriceComparison? _comparison;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final db = context.read<DatabaseService>();
    final products = await db.getProducts();
    final product = products.where((p) => p.id == widget.productId).firstOrNull;
    PriceComparison? comparison;
    if (product != null) {
      comparison = await db.comparePrices(product.id);
    }
    if (mounted) {
      setState(() {
        _product = product;
        _comparison = comparison;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(_product?.name ?? 'Product',
            style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _product == null
              ? const Center(child: Text('Product not found'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Product info card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primary.withValues(alpha: 0.05),
                            AppTheme.primary.withValues(alpha: 0.02),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 36,
                            backgroundColor: AppTheme.primary.withValues(alpha: 0.15),
                            child: Text(_product!.name[0],
                                style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.primary)),
                          ),
                          const SizedBox(height: 12),
                          Text(_product!.name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 20),
                              textAlign: TextAlign.center),
                          const SizedBox(height: 4),
                          Text('${_product!.brand} • ${_product!.unit}',
                              style: TextStyle(
                                  color: Colors.grey.shade600, fontSize: 14)),
                          const SizedBox(height: 8),
                          Chip(
                            label: Text(_product!.cuisine),
                            avatar: const Icon(Icons.restaurant, size: 16),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton.icon(
                              onPressed: () {
                                cart.addItem(_product!);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('${_product!.name} added to cart'),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              },
                              icon: const Icon(Icons.add_shopping_cart),
                              label: const Text('Add to Cart'),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Price comparison
                    const Text('Prices Across Stores',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 18)),
                    const SizedBox(height: 12),
                    if (_comparison == null || _comparison!.prices.isEmpty)
                      const Text('No pricing data yet')
                    else
                      ..._comparison!.prices.map((entry) {
                        final isCheapest =
                            entry.storeId == _comparison!.cheapest?.storeId;
                        final color =
                            AppTheme.chainColors[entry.storeChain] ?? Colors.grey;

                        return Card(
                          color: isCheapest ? Colors.green.shade50 : null,
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: color,
                              radius: 18,
                              child: Text(entry.storeChain[0],
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800)),
                            ),
                            title: Text(entry.storeName,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600)),
                            trailing: Text(
                              '\$${entry.price.toStringAsFixed(2)}',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                                color: isCheapest
                                    ? Colors.green.shade700
                                    : null,
                              ),
                            ),
                          ),
                        );
                      }),
                  ],
                ),
    );
  }
}
