# ShopIn

Cross-platform grocery price comparison & store locator built with **Flutter** + **Firebase**.

## Features
- Live price comparison across Woolworths, Coles, Aldi, IGA & local markets
- Interactive map with branded store markers (OpenStreetMap via flutter_map)
- Meal planner with smart shopping list generation
- Cart with cost optimisation across nearby stores
- Firebase Auth (Google Sign-In) + Realtime Database + Firestore

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run on Chrome
flutter run -d chrome

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android

# Build for web
flutter build web
```

## Project Structure
```
lib/
  config/         # Firebase config, router, theme
  models/         # Data models (Store, Product, Price, CartItem, MealPlan)
  providers/      # State management (CartProvider)
  screens/        # Full-page screens
  services/       # Firebase auth, database, location services
  widgets/        # Reusable widgets (AppShell)
  main.dart       # Entry point
```

## Firebase Setup
Firebase credentials live in `lib/config/firebase_config.dart` and `.env`.
Service account JSON (for server-side / Cloud Functions) is in `.env`.