import 'dart:math';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';

/// Handles device location and distance calculations.
class LocationService {
  Position? _currentPosition;

  Position? get currentPosition => _currentPosition;
  double? get latitude => _currentPosition?.latitude;
  double? get longitude => _currentPosition?.longitude;

  /// Request permission and get current location.
  Future<Position?> getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        debugPrint('[Location] Services disabled');
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          debugPrint('[Location] Permission denied');
          return null;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        debugPrint('[Location] Permission permanently denied');
        return null;
      }

      _currentPosition = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 100,
        ),
      );
      return _currentPosition;
    } catch (e) {
      debugPrint('[Location] Error: $e');
      return null;
    }
  }

  /// Calculate distance in km between two lat/lng points (Haversine formula).
  static double distanceKm(
      double lat1, double lon1, double lat2, double lon2) {
    const r = 6371.0; // Earth radius in km
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  static double _toRadians(double deg) => deg * (pi / 180);
}
