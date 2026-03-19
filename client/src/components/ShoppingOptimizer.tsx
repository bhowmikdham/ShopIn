import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, MapPin, Clock, DollarSign } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import { productPrices, stores, type StoreLocation } from '@/lib/stores';
import { formatCurrency, formatDistance, getStoreStatus } from '@/lib/utils';

interface ShoppingOptimizerProps {
  selectedProducts: string[];
  nearbyStores: StoreLocation[];
}

interface StoreOption {
  store: StoreLocation;
  totalCost: number;
  itemsAvailable: number;
  savings: number;
}

export function ShoppingOptimizer({ selectedProducts, nearbyStores }: ShoppingOptimizerProps) {
  if (selectedProducts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Select products to find the best shopping option</p>
      </Card>
    );
  }

  // Calculate cost for each store
  const storeOptions: StoreOption[] = nearbyStores
    .map((store) => {
      let totalCost = 0;
      let itemsAvailable = 0;

      selectedProducts.forEach((productId) => {
        const price = productPrices.find((p) => p.productId === productId && p.storeId === store.id && p.inStock);
        if (price) {
          totalCost += price.price;
          itemsAvailable++;
        }
      });

      return {
        store,
        totalCost,
        itemsAvailable,
        savings: 0,
      };
    })
    .filter((option) => option.itemsAvailable > 0)
    .sort((a, b) => a.totalCost - b.totalCost);

  if (storeOptions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No stores have all selected items in stock</p>
      </Card>
    );
  }

  // Calculate savings
  const maxCost = Math.max(...storeOptions.map((o) => o.totalCost));
  storeOptions.forEach((option) => {
    option.savings = maxCost - option.totalCost;
  });

  const bestOption = storeOptions[0];
  const totalSavings = storeOptions.reduce((sum, o) => sum + o.savings, 0);

  return (
    <div className="space-y-4">
      {/* Best Option Highlight */}
      <Card className="p-6 bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{bestOption.store.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {bestOption.store.suburb} • {bestOption.store.distance && `${bestOption.store.distance.toFixed(1)}km away`}
            </p>
          </div>
          <Badge variant="default" className="bg-green-600">
            Best Deal
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
            <p className="text-3xl font-bold text-accent">{formatCurrency(bestOption.totalCost)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Items Available</p>
            <p className="text-3xl font-bold">{bestOption.itemsAvailable}/{selectedProducts.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">You Save</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(bestOption.savings)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{bestOption.store.hours.open} - {bestOption.store.hours.close}</span>
          </div>
          <Badge variant="outline">{getStoreStatus(bestOption.store) === 'open' ? '✓ Open Now' : 'Closed'}</Badge>
        </div>

        <Button className="w-full">
          Shop at {bestOption.store.name}
        </Button>
      </Card>

      {/* Other Options */}
      <div>
        <h4 className="font-bold mb-3">Other Options</h4>
        <div className="space-y-2">
          {storeOptions.slice(1).map((option, index) => (
            <Card key={option.store.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{option.store.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.store.suburb} • {option.itemsAvailable}/{selectedProducts.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(option.totalCost)}</p>
                  {option.savings > 0 && (
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(option.savings)} vs best
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Potential Savings</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-green-600 opacity-50" />
        </div>
      </Card>
    </div>
  );
}
