import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, MapPin } from 'lucide-react';
import { getPriceComparison, formatCurrency, formatDistance } from '@/lib/utils';
import type { Product } from '@/lib/products';

interface PriceComparisonProps {
  product: Product;
}

export function PriceComparison({ product }: PriceComparisonProps) {
  const priceComparison = getPriceComparison(product.id);

  if (priceComparison.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No price information available</p>
      </Card>
    );
  }

  const lowestPrice = Math.min(...priceComparison.map((p) => p.price));
  const highestPrice = Math.max(...priceComparison.map((p) => p.price));
  const savings = highestPrice - lowestPrice;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{product.name}</h3>
          {savings > 0 && (
            <Badge variant="default" className="bg-green-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              Save {formatCurrency(savings)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Lowest Price</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(lowestPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Highest Price</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(highestPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Average Price</p>
            <p className="text-2xl font-bold">{formatCurrency(priceComparison.reduce((sum, p) => sum + p.price, 0) / priceComparison.length)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {priceComparison.map((comparison, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <p className="font-medium">{comparison.store.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {comparison.store.suburb}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(comparison.price)}</p>
                {!comparison.inStock && <Badge variant="destructive" className="text-xs mt-1">Out of Stock</Badge>}
                {comparison.price === lowestPrice && <Badge variant="default" className="text-xs mt-1 bg-green-600">Best Price</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
