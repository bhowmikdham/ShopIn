import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../models/price.dart';
import '../services/database_service.dart';
import '../providers/cart_provider.dart';
import '../config/theme.dart';

class PriceComparisonScreen extends StatefulWidget {
  const PriceComparisonScreen({super.key});

  @override
  State<PriceComparisonScreen> createState() => _PriceComparisonScreenState();
}

class _PriceComparisonScreenState extends State<PriceComparisonScreen> {
  List<ProductModel> _products = [];
  ProductModel? _selectedProduct;
  PriceComparison? _comparison;
  bool _loading = true;
  bool _comparing = false;
  String _filterCuisine = 'All';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    final db = context.read<DatabaseService>();
    final products = await db.getProducts();
    if (mounted) {
      setState(() {
        _products = products;
        _loading = false;
      });
    }
  }

  Future<void> _comparePrices(ProductModel product) async {
    setState(() {
      _selectedProduct = product;
      _comparing = true;
      _comparison = null;
    });

    final db = context.read<DatabaseService>();
    final comparison = await db.comparePrices(product.id);

    if (mounted) {
      setState(() {
        _comparison = comparison;
        _comparing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cuisines = ['All', ..._products.map((p) => p.cuisine).toSet()];
    final filteredProducts = _filterCuisine == 'All'
        ? _products
        : _products.where((p) => p.cuisine == _filterCuisine).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Price Comparison',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Cuisine filter chips
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: cuisines.length,
                    separatorBuilder: (context2, index) => const SizedBox(width: 8),
                    itemBuilder: (context, i) => FilterChip(
                      label: Text(cuisines[i]),
                      selected: _filterCuisine == cuisines[i],
                      onSelected: (_) =>
                          setState(() => _filterCuisine = cuisines[i]),
                      selectedColor: AppTheme.primary.withValues(alpha: 0.15),
                      checkmarkColor: AppTheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                Expanded(
                  child: Row(
                    children: [
                      // Product list
                      Expanded(
                        flex: 2,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 12),
                          itemCount: filteredProducts.length,
                          itemBuilder: (context, i) {
                            final product = filteredProducts[i];
                            final isSelected =
                                _selectedProduct?.id == product.id;
                            return Card(
                              color: isSelected
                                  ? AppTheme.primary.withValues(alpha: 0.08)
                                  : null,
                              child: ListTile(
                                title: Text(product.name,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13)),
                                subtitle: Text(
                                    '${product.brand} • ${product.unit}',
                                    style: const TextStyle(fontSize: 11)),
                                trailing: Icon(
                                  Icons.chevron_right,
                                  color: isSelected
                                      ? AppTheme.primary
                                      : Colors.grey.shade400,
                                ),
                                dense: true,
                                onTap: () => _comparePrices(product),
                              ),
                            );
                          },
                        ),
                      ),

                      // Price comparison panel
                      Expanded(
                        flex: 3,
                        child: _buildComparisonPanel(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildComparisonPanel() {
    if (_selectedProduct == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.compare_arrows, size: 48, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            Text('Select a product to compare prices',
                style: TextStyle(color: Colors.grey.shade500)),
          ],
        ),
      );
    }

    if (_comparing) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_comparison == null || _comparison!.prices.isEmpty) {
      return const Center(child: Text('No price data available'));
    }

    final cart = context.read<CartProvider>();
    final cheapest = _comparison!.cheapest;

    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // Product header
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_selectedProduct!.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                    Text(
                        '${_selectedProduct!.brand} • ${_selectedProduct!.unit}',
                        style: TextStyle(
                            color: Colors.grey.shade600, fontSize: 13)),
                  ],
                ),
              ),
              FilledButton.icon(
                onPressed: () => cart.addItem(_selectedProduct!),
                icon: const Icon(Icons.add_shopping_cart, size: 16),
                label: const Text('Add'),
                style: FilledButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Price list
        ..._comparison!.prices.map((entry) {
          final isCheapest = entry.storeId == cheapest?.storeId;
          final color = AppTheme.chainColors[entry.storeChain] ?? Colors.grey;

          return Card(
            color: isCheapest ? Colors.green.shade50 : null,
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: color,
                radius: 18,
                child: Text(entry.storeChain[0],
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 14)),
              ),
              title: Text(entry.storeName,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14)),
              subtitle: Text(entry.storeChain,
                  style: const TextStyle(fontSize: 11)),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('\$${entry.price.toStringAsFixed(2)}',
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: isCheapest ? Colors.green.shade700 : null)),
                  if (isCheapest)
                    Text('BEST',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Colors.green.shade700)),
                  if (!entry.inStock)
                    Text('Out of stock',
                        style: TextStyle(
                            fontSize: 10, color: Colors.red.shade600)),
                ],
              ),
              dense: true,
            ),
          );
        }),
      ],
    );
  }
}
