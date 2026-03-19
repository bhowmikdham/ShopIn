import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../config/theme.dart';

/// Bottom navigation shell that wraps all main screens.
class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  static const _tabs = [
    (icon: Icons.home_rounded, activeIcon: Icons.home_rounded, label: 'Home', path: '/'),
    (icon: Icons.map_outlined, activeIcon: Icons.map_rounded, label: 'Stores', path: '/stores'),
    (icon: Icons.compare_arrows_rounded, activeIcon: Icons.compare_arrows_rounded, label: 'Compare', path: '/compare'),
    (icon: Icons.restaurant_menu_outlined, activeIcon: Icons.restaurant_menu_rounded, label: 'Meals', path: '/meals'),
    (icon: Icons.shopping_cart_outlined, activeIcon: Icons.shopping_cart_rounded, label: 'Cart', path: '/cart'),
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
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: NavigationBar(
          height: 72,
          elevation: 0,
          backgroundColor: Colors.white,
          selectedIndex: index,
          onDestinationSelected: (i) => context.go(_tabs[i].path),
          destinations: _tabs.map((tab) {
            final isSelected = index == _tabs.indexOf(tab);
            Widget icon = Icon(isSelected ? tab.activeIcon : tab.icon);
            
            if (tab.path == '/cart' && cart.itemCount > 0) {
              icon = Badge.count(
                count: cart.itemCount,
                backgroundColor: AppTheme.secondary,
                textColor: Colors.white,
                child: icon,
              );
            }
            
            return NavigationDestination(
              icon: icon,
              label: tab.label,
            );
          }).toList(),
        ),
      ),
    );
  }
}
