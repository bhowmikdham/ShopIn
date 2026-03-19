/// Represents a grocery store.
class StoreModel {
  final String id;
  final String name;
  final String chain;
  final String address;
  final String suburb;
  final String postcode;
  final double latitude;
  final double longitude;
  final String hoursOpen;
  final String hoursClose;
  final double rating;
  final bool isActive;
  double? distance; // calculated client-side

  StoreModel({
    required this.id,
    required this.name,
    required this.chain,
    required this.address,
    required this.suburb,
    required this.postcode,
    required this.latitude,
    required this.longitude,
    required this.hoursOpen,
    required this.hoursClose,
    required this.rating,
    this.isActive = true,
    this.distance,
  });

  factory StoreModel.fromMap(String id, Map<dynamic, dynamic> map) {
    return StoreModel(
      id: id,
      name: map['name'] ?? '',
      chain: map['chain'] ?? '',
      address: map['address'] ?? '',
      suburb: map['suburb'] ?? '',
      postcode: map['postcode'] ?? '',
      latitude: (map['latitude'] ?? 0).toDouble(),
      longitude: (map['longitude'] ?? 0).toDouble(),
      hoursOpen: map['hoursOpen'] ?? '07:00',
      hoursClose: map['hoursClose'] ?? '22:00',
      rating: (map['rating'] ?? 0).toDouble(),
      isActive: map['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'chain': chain,
        'address': address,
        'suburb': suburb,
        'postcode': postcode,
        'latitude': latitude,
        'longitude': longitude,
        'hoursOpen': hoursOpen,
        'hoursClose': hoursClose,
        'rating': rating,
        'isActive': isActive,
      };

  bool get isOpenNow {
    final now = DateTime.now();
    final parts = hoursOpen.split(':');
    final open = DateTime(now.year, now.month, now.day,
        int.parse(parts[0]), int.parse(parts[1]));
    final closeParts = hoursClose.split(':');
    var close = DateTime(now.year, now.month, now.day,
        int.parse(closeParts[0]), int.parse(closeParts[1]));
    // Handle midnight closing (00:00)
    if (close.isBefore(open) || close.isAtSameMomentAs(open)) {
      close = close.add(const Duration(days: 1));
    }
    return now.isAfter(open) && now.isBefore(close);
  }
}
