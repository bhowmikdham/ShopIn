/// Shopping cart item.
class CartItem {
  final String productId;
  final String productName;
  final String unit;
  int quantity;
  double? bestPrice;
  String? bestStoreId;

  CartItem({
    required this.productId,
    required this.productName,
    required this.unit,
    this.quantity = 1,
    this.bestPrice,
    this.bestStoreId,
  });

  double get totalPrice => (bestPrice ?? 0) * quantity;
}
