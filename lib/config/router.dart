import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/home_screen.dart';
import '../screens/store_locator_screen.dart';
import '../screens/price_comparison_screen.dart';
import '../screens/meal_planner_screen.dart';
import '../screens/cart_screen.dart';
import '../screens/product_detail_screen.dart';
import '../widgets/app_shell.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: '/stores',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: StoreLocatorScreen()),
        ),
        GoRoute(
          path: '/compare',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: PriceComparisonScreen()),
        ),
        GoRoute(
          path: '/meals',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: MealPlannerScreen()),
        ),
        GoRoute(
          path: '/cart',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: CartScreen()),
        ),
      ],
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) =>
          ProductDetailScreen(productId: state.pathParameters['id']!),
    ),
  ],
);
