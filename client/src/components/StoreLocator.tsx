import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star, Navigation } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface StoreWithDistance {
  id: string;
  name: string;
  chain: string;
  address: string;
  suburb: string;
  postcode: string;
  hoursOpen: string;
  hoursClose: string;
  rating: number;
  distance?: number;
  latitude: number;
  longitude: number;
}

export default function StoreLocator() {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');

  // Fetch all stores
  const { data: stores, isLoading } = trpc.pricing.getStores.useQuery();

  // Calculate distances
  const storesWithDistance = useMemo(() => {
    if (!stores || !userLat || !userLon) return (stores || []) as StoreWithDistance[];

    return stores
      .map((store) => {
        const distance = calculateDistance(userLat, userLon, store.latitude, store.longitude);
        return { ...store, distance };
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return (a.distance || 0) - (b.distance || 0);
          case 'rating':
            return b.rating - a.rating;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [stores, userLat, userLon, sortBy]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLat(position.coords.latitude);
        setUserLon(position.coords.longitude);
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Woolworths':
        return 'bg-red-100 text-red-800';
      case 'Coles':
        return 'bg-blue-100 text-blue-800';
      case 'Aldi':
        return 'bg-orange-100 text-orange-800';
      case 'IGA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isStoreOpen = (hoursOpen: string, hoursClose: string) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = hoursOpen.split(':').map(Number);
    const [closeHour, closeMin] = hoursClose.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime < closeTime;
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <p className="text-muted-foreground">Loading store locations...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header and Controls */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Nearby Stores</h2>
        <div className="space-y-4">
          <Button
            onClick={handleUseCurrentLocation}
            className="w-full md:w-auto"
            variant="outline"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Use My Location
          </Button>

          {userLat && userLon && (
            <div className="text-sm text-muted-foreground">
              📍 Location detected: {userLat.toFixed(4)}, {userLon.toFixed(4)}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <div className="flex gap-2">
              {(['distance', 'rating', 'name'] as const).map((option) => (
                <Button
                  key={option}
                  variant={sortBy === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option)}
                  className="capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stores List */}
      <div className="space-y-3">
        {(storesWithDistance as StoreWithDistance[]).map((store) => (
          <Card key={store.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{store.name}</h3>
                  <Badge className={getChainColor(store.chain)}>{store.chain}</Badge>
                  {isStoreOpen(store.hoursOpen, store.hoursClose) ? (
                    <Badge className="bg-green-100 text-green-800">Open Now</Badge>
                  ) : (
                    <Badge variant="outline">Closed</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {store.address}, {store.suburb} {store.postcode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {store.hoursOpen} - {store.hoursClose}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(store.rating))}
                    </div>
                    <span className="text-sm font-medium">{store.rating.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                {store.distance !== undefined && (
                  <div>
                    <p className="text-2xl font-bold text-accent">{store.distance.toFixed(1)} km</p>
                    <p className="text-xs text-muted-foreground">away</p>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" size="sm">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </Card>
        ))}
      </div>

      {(storesWithDistance as StoreWithDistance[]).length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No stores found. Enable location access to see nearby stores.</p>
        </Card>
      )}
    </div>
  );
}
