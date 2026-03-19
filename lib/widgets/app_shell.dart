import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';

/// Bottom navigation shell that wraps all main screens.
class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  static const _tabs = [
    (icon: Icons.home_rounded, label: 'Home', path: '/'),
    (icon: Icons.map_rounded, label: 'Stores', path: '/stores'),
    (icon: Icons.compare_arrows_rounded, label: 'Compare', path: '/compare'),
    (icon: Icons.restaurant_menu_rounded, label: 'Meals', path: '/meals'),
    (icon: Icons.shopping_cart_rounded, label: 'Cart', path: '/cart'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    for (int i = 0; i < _tabs.length; i++) {
      if (location == _tabs[i].path) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final index = _currentIndex(context);
    final cart = context.watch<CartProvider>();

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: _tabs.map((tab) {
          if (tab.path == '/cart' && cart.itemCount > 0) {
            return NavigationDestination(
              icon: Badge.count(
                count: cart.itemCount,
                child: Icon(tab.icon),
              ),
              label: tab.label,
            );
          }
          return NavigationDestination(
            icon: Icon(tab.icon),
            label: tab.label,
          );
        }).toList(),
      ),
    );
  }
}
