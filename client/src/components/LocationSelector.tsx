import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import { getNearbyStores, formatDistance } from '@/lib/utils';
import type { StoreLocation } from '@/lib/stores';

interface LocationSelectorProps {
  onLocationChange: (lat: number, lon: number) => void;
  nearbyStores: StoreLocation[];
}

export function LocationSelector({ onLocationChange, nearbyStores }: LocationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude);
      });
    }
  };

  const presetLocations = [
    { name: 'Clayton', lat: -37.9123, lon: 145.1234 },
    { name: 'South Yarra', lat: -37.8456, lon: 145.0234 },
    { name: 'Caulfield', lat: -37.8789, lon: 145.0567 },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Your Location
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <Button onClick={handleUseCurrentLocation} className="w-full" variant="outline">
            <Navigation className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>

          <div>
            <p className="text-sm font-medium mb-2">Nearby Areas</p>
            <div className="grid grid-cols-3 gap-2">
              {presetLocations.map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onLocationChange(location.lat, location.lon);
                    setIsExpanded(false);
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Search by Suburb</p>
            <Input placeholder="Enter suburb name..." value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Stores Near You ({nearbyStores.length})</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="text-sm font-medium">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.suburb}</p>
                  </div>
                  <Badge variant="secondary">{store.distance && formatDistance(store.distance)}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
