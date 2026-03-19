import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/database_service.dart';

/// Manages shopping cart state. Syncs with Firebase when authenticated.
class CartProvider extends ChangeNotifier {
  final DatabaseService _db;
  String? _uid;

  final Map<String, CartItem> _items = {};
  final bool _loading = false;

  CartProvider(this._db);

  Map<String, CartItem> get items => Map.unmodifiable(_items);
  List<CartItem> get itemList => _items.values.toList();
  int get itemCount => _items.values.fold(0, (sum, i) => sum + i.quantity);
  double get totalPrice => _items.values.fold(0, (sum, i) => sum + i.totalPrice);
  bool get loading => _loading;
  bool get isEmpty => _items.isEmpty;

  /// Link to authenticated user for sync.
  void setUser(String? uid) {
    if (_uid == uid) return;
    _uid = uid;
    if (uid != null) {
      _listenToRemoteCart(uid);
    } else {
      _items.clear();
      notifyListeners();
    }
  }

  void _listenToRemoteCart(String uid) {
    _db.watchCart(uid).listen((remote) async {
      final products = await _db.getProducts();
      final productMap = {for (var p in products) p.id: p};

      _items.clear();
      for (final entry in remote.entries) {
        final product = productMap[entry.key];
        if (product != null) {
          _items[entry.key] = CartItem(
            productId: entry.key,
            productName: product.name,
            unit: product.unit,
            quantity: entry.value,
          );
          // Fetch best price
          _fetchBestPrice(entry.key);
        }
      }
      notifyListeners();
    });
  }

  Future<void> _fetchBestPrice(String productId) async {
    final prices = await _db.getProductPrices(productId);
    final inStock = prices.where((p) => p.inStock).toList();
    if (inStock.isNotEmpty) {
      inStock.sort((a, b) => a.price.compareTo(b.price));
      final item = _items[productId];
      if (item != null) {
        item.bestPrice = inStock.first.price;
        item.bestStoreId = inStock.first.storeId;
        notifyListeners();
      }
    }
  }

  Future<void> addItem(ProductModel product, {int quantity = 1}) async {
    if (_items.containsKey(product.id)) {
      _items[product.id]!.quantity += quantity;
    } else {
      _items[product.id] = CartItem(
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: quantity,
      );
    }
    notifyListeners();
    _fetchBestPrice(product.id);

    if (_uid != null) {
      await _db.addToCart(_uid!, product.id, _items[product.id]!.quantity);
    }
  }

  Future<void> removeItem(String productId) async {
    _items.remove(productId);
    notifyListeners();
    if (_uid != null) {
      await _db.removeFromCart(_uid!, productId);
    }
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    if (_items.containsKey(productId)) {
      _items[productId]!.quantity = quantity;
      notifyListeners();
    }
    if (_uid != null) {
      await _db.updateCartQuantity(_uid!, productId, quantity);
    }
  }

  Future<void> clearCart() async {
    _items.clear();
    notifyListeners();
    if (_uid != null) {
      await _db.clearCart(_uid!);
    }
  }
}
