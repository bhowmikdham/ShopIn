import { useState, useMemo, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star, Navigation } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { MapView } from './Map';

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

// Store chain logos/colors for map markers
const STORE_CHAIN_CONFIG: Record<string, { color: string; logo: string; bgColor: string }> = {
  Woolworths: {
    color: '#1a8a3b',
    logo: 'W',
    bgColor: '#e6f5eb',
  },
  Coles: {
    color: '#e01a22',
    logo: 'C',
    bgColor: '#fce4e5',
  },
  Aldi: {
    color: '#00508f',
    logo: 'A',
    bgColor: '#e0ecf5',
  },
  IGA: {
    color: '#d4213d',
    logo: 'I',
    bgColor: '#fbe0e5',
  },
  'Local Market': {
    color: '#f59e0b',
    logo: 'LM',
    bgColor: '#fef3c7',
  },
};

function createStoreMarkerElement(chain: string, name: string, isOpen: boolean): HTMLElement {
  const config = STORE_CHAIN_CONFIG[chain] || { color: '#6b7280', logo: '?', bgColor: '#f3f4f6' };

  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;

  // Logo circle
  const logoCircle = document.createElement('div');
  logoCircle.style.cssText = `
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${config.color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: ${config.logo.length > 1 ? '11px' : '18px'};
    font-family: 'Inter', system-ui, sans-serif;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    position: relative;
  `;
  logoCircle.textContent = config.logo;

  // Open/closed indicator dot
  const statusDot = document.createElement('div');
  statusDot.style.cssText = `
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${isOpen ? '#22c55e' : '#ef4444'};
    border: 2px solid white;
  `;
  logoCircle.appendChild(statusDot);

  // Pin pointer
  const pointer = document.createElement('div');
  pointer.style.cssText = `
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid ${config.color};
    margin-top: -1px;
  `;

  // Name label
  const label = document.createElement('div');
  label.style.cssText = `
    background: white;
    color: #1f2937;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 2px;
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    font-family: 'Inter', system-ui, sans-serif;
  `;
  label.textContent = name;

  container.appendChild(logoCircle);
  container.appendChild(pointer);
  container.appendChild(label);

  return container;
}

function isStoreOpen(hoursOpen: string, hoursClose: string) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = hoursOpen.split(':').map(Number);
  const [closeHour, closeMin] = hoursClose.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  return currentTime >= openTime && currentTime < closeTime;
}

export default function StoreLocator() {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Fetch all stores
  const { data: stores, isLoading } = trpc.pricing.getStores.useQuery();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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

  // Calculate distances
  const storesWithDistance = useMemo(() => {
    if (!stores) return [] as StoreWithDistance[];

    const mapped = stores.map((store) => {
      const distance = userLat && userLon
        ? calculateDistance(userLat, userLon, store.latitude, store.longitude)
        : undefined;
      return { ...store, distance } as StoreWithDistance;
    });

    return mapped.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [stores, userLat, userLon, sortBy]);

  // Add markers to map when ready
  const addStoreMarkers = useCallback((map: L.Map) => {
    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!stores || stores.length === 0) return;

    const bounds = L.latLngBounds([]);

    stores.forEach((store) => {
      const latLng: L.LatLngExpression = [store.latitude, store.longitude];
      const open = isStoreOpen(store.hoursOpen, store.hoursClose);
      const markerEl = createStoreMarkerElement(store.chain, store.name, open);

      const icon = L.divIcon({
        html: markerEl.outerHTML,
        className: 'leaflet-store-marker',
        iconSize: [50, 60],
        iconAnchor: [25, 60],
        popupAnchor: [0, -55],
      });

      const marker = L.marker(latLng, { icon, title: `${store.name} (${store.chain})` }).addTo(map);

      const chainConfig = STORE_CHAIN_CONFIG[store.chain];
      const popupContent = `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${chainConfig?.color || '#6b7280'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
              ${chainConfig?.logo || '?'}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">${store.name}</div>
              <div style="font-size: 11px; color: #6b7280;">${store.chain}</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">📍 ${store.address}, ${store.suburb} ${store.postcode}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">🕐 ${store.hoursOpen} - ${store.hoursClose}</div>
          <div style="font-size: 12px; color: #4b5563;">⭐ ${store.rating.toFixed(1)}/5 ${open ? '• <span style="color: #22c55e; font-weight: 600;">Open</span>' : '• <span style="color: #ef4444; font-weight: 600;">Closed</span>'}</div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}" target="_blank" rel="noopener noreferrer"
            style="display: block; margin-top: 8px; padding: 6px 12px; background: ${chainConfig?.color || '#6b7280'}; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">
            Get Directions
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('click', () => {
        setSelectedStoreId(store.id);
      });

      markersRef.current.push(marker);
      bounds.extend(latLng);
    });

    // Add user location marker if available
    if (userLat && userLon) {
      const userLatLng: L.LatLngExpression = [userLat, userLon];
      const userIcon = L.divIcon({
        html: '<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6,0 2px 8px rgba(59,130,246,0.5);"></div>',
        className: 'leaflet-user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker(userLatLng, { icon: userIcon, title: 'Your Location' }).addTo(map);
      markersRef.current.push(userMarker);
      bounds.extend(userLatLng);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stores, userLat, userLon]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    addStoreMarkers(map);
  }, [addStoreMarkers]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLon(position.coords.longitude);
          if (mapRef.current) {
            addStoreMarkers(mapRef.current);
          }
        },
        () => {
          setUserLat(-37.8136);
          setUserLon(144.9631);
        }
      );
    }
  };

  const handleStoreClick = (store: StoreWithDistance) => {
    setSelectedStoreId(store.id);
    if (mapRef.current) {
      mapRef.current.setView([store.latitude, store.longitude], 15);
    }
  };

  const handleGetDirections = (store: StoreWithDistance) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Woolworths':
        return 'bg-green-100 text-green-800';
      case 'Coles':
        return 'bg-red-100 text-red-800';
      case 'Aldi':
        return 'bg-blue-100 text-blue-800';
      case 'IGA':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

      {/* Map with Store Markers & Logo Legend */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">Store Map</h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(STORE_CHAIN_CONFIG).map(([chain, config]) => (
                <div key={chain} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ background: config.color, boxShadow: '0 0 0 1px ' + config.color + '40' }}
                  />
                  <span className="text-muted-foreground font-medium">{chain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MapView
          className="w-full h-[450px]"
          initialCenter={{ lat: -37.8136, lng: 144.9631 }}
          initialZoom={11}
          onMapReady={handleMapReady}
        />
      </Card>

      {/* Stores List */}
      <div className="space-y-3">
        {storesWithDistance.map((store) => (
          <Card
            key={store.id}
            className={`p-4 hover:shadow-lg transition-all cursor-pointer ${
              selectedStoreId === store.id ? 'ring-2 ring-accent bg-accent/5' : ''
            }`}
            onClick={() => handleStoreClick(store)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* Store chain logo badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: STORE_CHAIN_CONFIG[store.chain]?.color || '#6b7280' }}
                  >
                    {STORE_CHAIN_CONFIG[store.chain]?.logo || '?'}
                  </div>
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
                      {'☆'.repeat(5 - Math.floor(store.rating))}
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

            <Button
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleGetDirections(store);
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </Card>
        ))}
      </div>

      {storesWithDistance.length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No stores found. Try enabling location access to see nearby stores.</p>
        </Card>
      )}
    </div>
  );
}
