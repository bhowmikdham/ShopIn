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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meal Planner',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _meals.isEmpty
              ? const Center(child: Text('No meal plans available'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
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
        ? Colors.orange
        : meal.cuisine == 'Italian'
            ? Colors.red
            : AppTheme.primary;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: cuisineColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(meal.cuisine,
                      style: TextStyle(
                          color: cuisineColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12)),
                ),
                const Spacer(),
                Icon(Icons.people, size: 14, color: Colors.grey.shade500),
                Text(' ${meal.servings}',
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey.shade600)),
                const SizedBox(width: 12),
                Icon(Icons.schedule, size: 14, color: Colors.grey.shade500),
                Text(' ${meal.prepTime} min',
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey.shade600)),
              ],
            ),
            const SizedBox(height: 10),

            // Name & description
            Text(meal.name,
                style: const TextStyle(
                    fontWeight: FontWeight.w700, fontSize: 18)),
            const SizedBox(height: 4),
            Text(meal.description,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            const SizedBox(height: 14),

            // Ingredients
            const Text('Ingredients:',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            ...ingredients.map((product) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle,
                          size: 16, color: Colors.green.shade400),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text('${product.name} (${product.unit})',
                            style: const TextStyle(fontSize: 13)),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 14),

            // Action buttons
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
                            content: Text(
                                '${ingredients.length} items added to cart'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    },
                    icon: const Icon(Icons.add_shopping_cart, size: 16),
                    label: const Text('Add All to Cart'),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: () async {
                    final result = await db.findCheapestStore(
                        meal.ingredientIds);
                    if (result != null && context.mounted) {
                      final store = result['store'] as dynamic;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                              'Cheapest at ${store.name}: \$${(result['totalCost'] as double).toStringAsFixed(2)}'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                  child: const Text('Find Best Store'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
