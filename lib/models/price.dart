/// A price entry for a product at a store.
class PriceEntry {
  final String productId;
  final String storeId;
  final double price;
  final bool inStock;
  final String? lastUpdated;

  PriceEntry({
    required this.productId,
    required this.storeId,
    required this.price,
    this.inStock = true,
    this.lastUpdated,
  });

  factory PriceEntry.fromMap(
      String productId, String storeId, Map<dynamic, dynamic> map) {
    return PriceEntry(
      productId: productId,
      storeId: storeId,
      price: (map['price'] ?? 0).toDouble(),
      inStock: map['inStock'] ?? true,
      lastUpdated: map['lastUpdated'],
    );
  }
}

/// Price comparison for a product across stores.
class PriceComparison {
  final String productId;
  final String productName;
  final List<StorePriceEntry> prices;

  PriceComparison({
    required this.productId,
    required this.productName,
    required this.prices,
  });

  StorePriceEntry? get cheapest =>
      prices.where((p) => p.inStock).fold<StorePriceEntry?>(null,
          (best, entry) => best == null || entry.price < best.price ? entry : best);
}

class StorePriceEntry {
  final String storeId;
  final String storeName;
  final String storeChain;
  final double price;
  final bool inStock;

  StorePriceEntry({
    required this.storeId,
    required this.storeName,
    required this.storeChain,
    required this.price,
    required this.inStock,
  });
}
