import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingDown, MapPin, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

interface PriceComparison {
  store: {
    id: string;
    name: string;
    chain: string;
    suburb: string;
  } | null;
  price: number;
  inStock: boolean;
  lastUpdated: Date;
}

export default function LivePriceComparison() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch all products
  const { data: products, isLoading: productsLoading } = trpc.pricing.getProducts.useQuery();

  // Fetch price comparison for selected product
  const { data: priceComparison, isLoading: comparisonLoading } = trpc.pricing.comparePrices.useQuery(
    { productId: selectedProductId },
    { enabled: showComparison && !!selectedProductId }
  );

  // Fetch price statistics
  const { data: priceStats } = trpc.pricing.getPriceStats.useQuery(
    { productId: selectedProductId },
    { enabled: showComparison && !!selectedProductId }
  );

  // Add to cart mutation
  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Please log in to add items to cart');
    },
  });

  const handleAddToCart = (storeId: string, price: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    addToCartMutation.mutate({
      productId: selectedProductId,
      storeId,
      quantity: 1,
      pricePerUnit: price,
    });
  };

  const handleCompare = () => {
    if (selectedProductId) {
      setShowComparison(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Live Price Comparison</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Product</label>
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Choose a product...</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.cuisine}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleCompare}
                disabled={!selectedProductId || comparisonLoading}
                className="px-6"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Compare Prices
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Price Statistics */}
      {priceStats && showComparison && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold mb-4">Price Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lowest Price</p>
              <p className="text-lg font-bold text-accent">{formatCurrency(priceStats.min)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Highest Price</p>
              <p className="text-lg font-bold">{formatCurrency(priceStats.max)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Average Price</p>
              <p className="text-lg font-bold">{formatCurrency(priceStats.avg)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">In Stock</p>
              <p className="text-lg font-bold">{priceStats.storesWithStock}/{priceStats.totalStores}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Price Comparison Results */}
      {showComparison && priceComparison && priceComparison.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Available at {priceComparison.length} stores</h3>
          {priceComparison.map((item, index) => (
            <Card
              key={`${item.store?.id}-${index}`}
              className={`p-4 transition-all ${
                index === 0 ? 'ring-2 ring-accent bg-accent/5' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">{item.store?.name}</h4>
                    {index === 0 && (
                      <Badge className="bg-accent text-accent-foreground">Best Price</Badge>
                    )}
                    {!item.inStock && (
                      <Badge variant="destructive" className="flex gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.store?.suburb}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {formatDate(item.lastUpdated)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{formatCurrency(item.price)}</p>
                  {index > 0 && priceComparison[0] && (
                    <p className="text-xs text-red-500 mt-1">
                      +{formatCurrency(item.price - priceComparison[0].price)}
                    </p>
                  )}
                </div>
              </div>
              {item.inStock && item.store && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  variant={index === 0 ? 'default' : 'outline'}
                  onClick={() => handleAddToCart(item.store!.id, item.price)}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showComparison && (!priceComparison || priceComparison.length === 0) && !comparisonLoading && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No pricing data available for this product yet.</p>
        </Card>
      )}

      {/* Loading State */}
      {comparisonLoading && (
        <Card className="p-8 text-center">
          <div className="animate-pulse">
            <p className="text-muted-foreground">Fetching live prices...</p>
          </div>
        </Card>
      )}
    </div>
  );
}
