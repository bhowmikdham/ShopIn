import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/meal_plan.dart';
import '../models/product.dart';
import '../services/database_service.dart';
import '../providers/cart_provider.dart';
import '../config/theme.dart';

class MealPlannerScreen extends StatefulWidget {
  const MealPlannerScreen({super.key});

  @override
  State<MealPlannerScreen> createState() => _MealPlannerScreenState();
}

class _MealPlannerScreenState extends State<MealPlannerScreen> {
  List<MealPlan> _meals = [];
  Map<String, ProductModel> _productMap = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final db = context.read<DatabaseService>();
    final meals = await db.getMealPlans();
    final products = await db.getProducts();
    if (mounted) {
      setState(() {
        _meals = meals;
        _productMap = {for (var p in products) p.id: p};
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meal Planner'),
        actions: [
          IconButton.filledTonal(
            onPressed: () {},
            icon: const Icon(Icons.add_rounded),
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
          : _meals.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.restaurant_menu_rounded, size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      Text('No meal plans yet', style: theme.textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Text('Start by creating your first plan', style: theme.textTheme.bodyMedium),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  physics: const BouncingScrollPhysics(),
                  itemCount: _meals.length,
                  itemBuilder: (context, i) =>
                      _MealCard(meal: _meals[i], productMap: _productMap),
                ),
    );
  }
}

class _MealCard extends StatelessWidget {
  final MealPlan meal;
  final Map<String, ProductModel> productMap;
  const _MealCard({required this.meal, required this.productMap});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    final db = context.read<DatabaseService>();
    final ingredients =
        meal.ingredientIds.map((id) => productMap[id]).whereType<ProductModel>().toList();

    final cuisineColor = meal.cuisine == 'Indian'
        ? Colors.orange.shade700
        : meal.cuisine == 'Italian'
            ? Colors.red.shade700
            : AppTheme.primary;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner area
          Container(
            height: 100,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [cuisineColor.withOpacity(0.15), cuisineColor.withOpacity(0.05)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -10,
                  bottom: -10,
                  child: Icon(Icons.restaurant_rounded, 
                    size: 80, color: cuisineColor.withOpacity(0.1)),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: cuisineColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(meal.cuisine,
                            style: TextStyle(
                                color: cuisineColor,
                                fontWeight: FontWeight.w800,
                                fontSize: 12,
                                letterSpacing: 0.5)),
                      ),
                      const Spacer(),
                      _Tag(icon: Icons.people_outline_rounded, label: '${meal.servings}'),
                      const SizedBox(width: 12),
                      _Tag(icon: Icons.timer_outlined, label: '${meal.prepTime}m'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(meal.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 20, letterSpacing: -0.5)),
                const SizedBox(height: 6),
                Text(meal.description,
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 14, height: 1.4)),
                const SizedBox(height: 20),

                // Ingredients List
                const Text('INGREDIENTS',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 1.2, color: AppTheme.textSecondary)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ingredients.map((product) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Text(product.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  )).toList(),
                ),
                
                const SizedBox(height: 24),
                
                // Actions
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () async {
                          for (final product in ingredients) {
                            await cart.addItem(product);
                          }
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${ingredients.length} items added to cart'),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                backgroundColor: AppTheme.textPrimary,
                              ),
                            );
                          }
                        },
                        icon: const Icon(Icons.shopping_cart_checkout_rounded, size: 18),
                        label: const Text('Add to Cart'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    IconButton.outlined(
                      onPressed: () async {
                        final result = await db.findCheapestStore(meal.ingredientIds);
                        if (result != null && context.mounted) {
                          final store = result['store'] as dynamic;
                          _showCheapestStore(context, store.name, result['totalCost'] as double);
                        }
                      },
                      icon: const Icon(Icons.price_check_rounded, color: AppTheme.primary),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primary, width: 1.5),
                        padding: const EdgeInsets.all(12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showCheapestStore(BuildContext context, String storeName, double cost) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(28),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Best Price Found!', 
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: -0.5)),
            const SizedBox(height: 12),
            Text('We found the cheapest ingredients at $storeName', 
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primary.withOpacity(0.1)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Total Cost:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  const SizedBox(width: 12),
                  Text('\$${cost.toStringAsFixed(2)}', 
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 28, color: AppTheme.primary)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Great, thanks!'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _Tag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade700),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey.shade700)),
      ],
    );
  }
}
