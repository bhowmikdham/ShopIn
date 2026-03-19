import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/price.dart';
import '../models/meal_plan.dart';

/// Service that reads all data from Firebase Realtime Database.
/// Uses real-time listeners so the UI updates automatically when data changes.
class DatabaseService {
  final FirebaseDatabase _db;

  DatabaseService(this._db);

  // ── Stores ─────────────────────────────────────────────────
  Stream<List<StoreModel>> watchStores() {
    return _db.ref('stores').onValue.map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) return <StoreModel>[];
      return data.entries
          .map((e) => StoreModel.fromMap(e.key, e.value as Map))
          .where((s) => s.isActive)
          .toList();
    });
  }

  Future<List<StoreModel>> getStores() async {
    final snap = await _db.ref('stores').get();
    final data = snap.value as Map<dynamic, dynamic>?;
    if (data == null) return [];
    return data.entries
        .map((e) => StoreModel.fromMap(e.key, e.value as Map))
        .where((s) => s.isActive)
        .toList();
  }

  Future<StoreModel?> getStore(String id) async {
    final snap = await _db.ref('stores/$id').get();
    if (!snap.exists) return null;
    return StoreModel.fromMap(id, snap.value as Map);
  }

  // ── Products ───────────────────────────────────────────────
  Stream<List<ProductModel>> watchProducts() {
    return _db.ref('products').onValue.map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) return <ProductModel>[];
      return data.entries
          .map((e) => ProductModel.fromMap(e.key, e.value as Map))
          .toList();
    });
  }

  Future<List<ProductModel>> getProducts() async {
    final snap = await _db.ref('products').get();
    final data = snap.value as Map<dynamic, dynamic>?;
    if (data == null) return [];
    return data.entries
        .map((e) => ProductModel.fromMap(e.key, e.value as Map))
        .toList();
  }

  Future<List<ProductModel>> getProductsByCuisine(String cuisine) async {
    final products = await getProducts();
    return products
        .where((p) => p.cuisine.toLowerCase() == cuisine.toLowerCase())
        .toList();
  }

  // ── Prices ─────────────────────────────────────────────────
  /// Get all prices for one product across all stores.
  Future<List<PriceEntry>> getProductPrices(String productId) async {
    final snap = await _db.ref('prices/$productId').get();
    final data = snap.value as Map<dynamic, dynamic>?;
    if (data == null) return [];
    return data.entries
        .map((e) => PriceEntry.fromMap(productId, e.key, e.value as Map))
        .toList();
  }

  /// Build a full price comparison for a product.
  Future<PriceComparison> comparePrices(String productId) async {
    final prices = await getProductPrices(productId);
    final stores = await getStores();
    final products = await getProducts();
    final product = products.firstWhere((p) => p.id == productId,
        orElse: () => ProductModel(
            id: productId,
            name: productId,
            brand: '',
            category: '',
            cuisine: '',
            unit: ''));

    final storeMap = {for (var s in stores) s.id: s};

    return PriceComparison(
      productId: productId,
      productName: product.name,
      prices: prices
          .where((p) => storeMap.containsKey(p.storeId))
          .map((p) => StorePriceEntry(
                storeId: p.storeId,
                storeName: storeMap[p.storeId]!.name,
                storeChain: storeMap[p.storeId]!.chain,
                price: p.price,
                inStock: p.inStock,
              ))
          .toList()
        ..sort((a, b) => a.price.compareTo(b.price)),
    );
  }

  /// Find cheapest store for a list of product IDs.
  Future<Map<String, dynamic>?> findCheapestStore(
      List<String> productIds) async {
    final stores = await getStores();
    final storeScores = <String, _StoreScore>{};
    for (final s in stores) {
      storeScores[s.id] = _StoreScore();
    }

    for (final productId in productIds) {
      final prices = await getProductPrices(productId);
      for (final p in prices) {
        final score = storeScores[p.storeId];
        if (score != null && p.inStock) {
          score.totalCost += p.price;
          score.itemsFound++;
        }
      }
    }

    String? bestId;
    double bestCost = double.infinity;
    int bestItems = 0;

    for (final entry in storeScores.entries) {
      if (entry.value.itemsFound == productIds.length &&
          entry.value.totalCost < bestCost) {
        bestId = entry.key;
        bestCost = entry.value.totalCost;
        bestItems = entry.value.itemsFound;
      }
    }

    // Fallback: most items, lowest cost
    if (bestId == null) {
      for (final entry in storeScores.entries) {
        if (entry.value.itemsFound > 0 && entry.value.totalCost < bestCost) {
          bestId = entry.key;
          bestCost = entry.value.totalCost;
          bestItems = entry.value.itemsFound;
        }
      }
    }

    if (bestId == null) return null;
    final store = stores.firstWhere((s) => s.id == bestId);
    return {
      'store': store,
      'totalCost': bestCost,
      'itemsFound': bestItems,
      'totalItems': productIds.length,
    };
  }

  // ── Meal Plans ─────────────────────────────────────────────
  Stream<List<MealPlan>> watchMealPlans() {
    return _db.ref('mealPlans').onValue.map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) return <MealPlan>[];
      return data.entries
          .map((e) => MealPlan.fromMap(e.key, e.value as Map))
          .toList();
    });
  }

  Future<List<MealPlan>> getMealPlans() async {
    final snap = await _db.ref('mealPlans').get();
    final data = snap.value as Map<dynamic, dynamic>?;
    if (data == null) return [];
    return data.entries
        .map((e) => MealPlan.fromMap(e.key, e.value as Map))
        .toList();
  }

  // ── User Cart (per-user, synced across devices) ────────────
  DatabaseReference cartRef(String uid) => _db.ref('carts/$uid');

  Future<void> addToCart(String uid, String productId, int quantity) async {
    await cartRef(uid).child(productId).set({
      'quantity': quantity,
      'addedAt': ServerValue.timestamp,
    });
  }

  Future<void> removeFromCart(String uid, String productId) async {
    await cartRef(uid).child(productId).remove();
  }

  Future<void> updateCartQuantity(
      String uid, String productId, int quantity) async {
    if (quantity <= 0) {
      await removeFromCart(uid, productId);
    } else {
      await cartRef(uid).child(productId).update({'quantity': quantity});
    }
  }

  Stream<Map<String, int>> watchCart(String uid) {
    return cartRef(uid).onValue.map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) return <String, int>{};
      return data.map((key, value) =>
          MapEntry(key.toString(), (value as Map)['quantity'] as int? ?? 1));
    });
  }

  Future<void> clearCart(String uid) => cartRef(uid).remove();
}

class _StoreScore {
  double totalCost = 0;
  int itemsFound = 0;
}
