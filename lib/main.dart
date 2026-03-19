import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:provider/provider.dart';

import 'config/firebase_config.dart';
import 'config/theme.dart';
import 'config/router.dart';
import 'services/auth_service.dart';
import 'services/database_service.dart';
import 'providers/cart_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: FirebaseConfig.apiKey,
      authDomain: FirebaseConfig.authDomain,
      databaseURL: FirebaseConfig.databaseURL,
      projectId: FirebaseConfig.projectId,
      storageBucket: FirebaseConfig.storageBucket,
      messagingSenderId: FirebaseConfig.messagingSenderId,
      appId: FirebaseConfig.appId,
    ),
  );

  final db = FirebaseDatabase.instance;
  final auth = FirebaseAuth.instance;

  runApp(ShopInApp(database: db, firebaseAuth: auth));
}

class ShopInApp extends StatelessWidget {
  final FirebaseDatabase database;
  final FirebaseAuth firebaseAuth;

  const ShopInApp({
    super.key,
    required this.database,
    required this.firebaseAuth,
  });

  @override
  Widget build(BuildContext context) {
    final dbService = DatabaseService(database);
    final authService = AuthService(firebaseAuth);
    final cartProvider = CartProvider(dbService);

    // Sync cart with authenticated user
    authService.addListener(() {
      cartProvider.setUser(authService.uid);
    });

    return MultiProvider(
      providers: [
        Provider<DatabaseService>.value(value: dbService),
        ChangeNotifierProvider<AuthService>.value(value: authService),
        ChangeNotifierProvider<CartProvider>.value(value: cartProvider),
      ],
      child: MaterialApp.router(
        title: 'ShopIn',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: appRouter,
      ),
    );
  }
}
