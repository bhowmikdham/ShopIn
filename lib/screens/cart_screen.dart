import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../services/auth_service.dart';
import '../config/theme.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final auth = context.watch<AuthService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart',
            style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          if (cart.itemCount > 0)
            TextButton(
              onPressed: () => _showClearConfirmation(context, cart),
              child: const Text('Clear', style: TextStyle(color: Colors.red)),
            ),
        ],
      ),
      body: cart.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.shopping_cart_outlined,
                      size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('Your cart is empty',
                      style: TextStyle(
                          fontSize: 18, color: Colors.grey.shade500)),
                  const SizedBox(height: 8),
                  Text('Add items from the Compare or Meals tab',
                      style: TextStyle(
                          fontSize: 13, color: Colors.grey.shade400)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: cart.itemList.length,
                    itemBuilder: (context, i) {
                      final item = cart.itemList[i];
                      return Dismissible(
                        key: Key(item.productId),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          color: Colors.red.shade400,
                          child: const Icon(Icons.delete,
                              color: Colors.white),
                        ),
                        onDismissed: (_) => cart.removeItem(item.productId),
                        child: Card(
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  AppTheme.primary.withValues(alpha: 0.1),
                              child: Text(item.productName[0],
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.primary)),
                            ),
                            title: Text(item.productName,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14)),
                            subtitle: Text(
                              item.bestPrice != null
                                  ? '\$${item.bestPrice!.toStringAsFixed(2)} × ${item.quantity}'
                                  : item.unit,
                              style: const TextStyle(fontSize: 12),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline,
                                      size: 20),
                                  onPressed: () => cart.updateQuantity(
                                      item.productId, item.quantity - 1),
                                  visualDensity: VisualDensity.compact,
                                ),
                                Text('${item.quantity}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w700)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline,
                                      size: 20),
                                  onPressed: () => cart.updateQuantity(
                                      item.productId, item.quantity + 1),
                                  visualDensity: VisualDensity.compact,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Checkout bar
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      )
                    ],
                  ),
                  child: SafeArea(
                    child: Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('${cart.itemCount} items',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600)),
                            Text(
                              '\$${cart.totalPrice.toStringAsFixed(2)}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 22),
                            ),
                          ],
                        ),
                        const Spacer(),
                        FilledButton.icon(
                          onPressed: auth.isAuthenticated
                              ? () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Checkout coming soon!'),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                }
                              : () => auth.signInWithGoogle(),
                          icon: Icon(
                            auth.isAuthenticated
                                ? Icons.shopping_bag
                                : Icons.login,
                            size: 18,
                          ),
                          label: Text(auth.isAuthenticated
                              ? 'Checkout'
                              : 'Sign In to Checkout'),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  void _showClearConfirmation(BuildContext context, CartProvider cart) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cart'),
        content: const Text('Remove all items from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              cart.clearCart();
              Navigator.pop(context);
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}
