/// Represents a grocery product.
class ProductModel {
  final String id;
  final String name;
  final String brand;
  final String category;
  final String cuisine;
  final String unit;
  final String? imageUrl;

  ProductModel({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.cuisine,
    required this.unit,
    this.imageUrl,
  });

  factory ProductModel.fromMap(String id, Map<dynamic, dynamic> map) {
    return ProductModel(
      id: id,
      name: map['name'] ?? '',
      brand: map['brand'] ?? '',
      category: map['category'] ?? '',
      cuisine: map['cuisine'] ?? '',
      unit: map['unit'] ?? '',
      imageUrl: map['imageUrl'],
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'brand': brand,
        'category': category,
        'cuisine': cuisine,
        'unit': unit,
        'imageUrl': imageUrl,
      };
}
