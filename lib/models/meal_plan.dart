/// A meal plan with ingredients mapped to products.
class MealPlan {
  final String id;
  final String name;
  final String cuisine;
  final int servings;
  final int prepTime;
  final List<String> ingredientIds;
  final String description;

  MealPlan({
    required this.id,
    required this.name,
    required this.cuisine,
    required this.servings,
    required this.prepTime,
    required this.ingredientIds,
    required this.description,
  });

  factory MealPlan.fromMap(String id, Map<dynamic, dynamic> map) {
    final ingredients = (map['ingredients'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    return MealPlan(
      id: id,
      name: map['name'] ?? '',
      cuisine: map['cuisine'] ?? '',
      servings: map['servings'] ?? 2,
      prepTime: map['prepTime'] ?? 15,
      ingredientIds: ingredients,
      description: map['description'] ?? '',
    );
  }
}
