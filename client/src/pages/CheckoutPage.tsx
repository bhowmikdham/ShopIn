import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, TrendingDown, MapPin, Clock, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

export default function CheckoutPage() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Fetch cart and store data (only when authenticated)
  const { data: cartSummary } = trpc.cart.getSummary.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const { data: itemsByStore } = trpc.cart.getItemsByStore.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const { data: bestStore } = trpc.cart.calculateBestStore.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  // Checkout mutation
  const checkoutMutation = trpc.cart.checkout.useMutation({
    onSuccess: (order) => {
      toast.success(`Order created! Order ID: ${order.id}`);
      setIsProcessing(false);
      // Redirect to order confirmation
      setTimeout(() => {
        window.location.href = `/order-confirmation/${order.id}`;
      }, 2000);
    },
    onError: () => {
      toast.error('Checkout failed. Please try again.');
      setIsProcessing(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const handleCheckout = () => {
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    setIsProcessing(true);
    checkoutMutation.mutate({ storeId: selectedStore });
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="p-8 text-center max-w-md mx-auto">
            <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to proceed with checkout
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!cartSummary || cartSummary.itemCount === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => window.location.href = '/'}>
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Review your order and select a store to complete your purchase
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Store Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cost Optimization */}
            {bestStore && cartSummary.storeCount > 1 && (
              <Card className="p-6 border-accent/20 bg-accent/5">
                <div className="flex items-start gap-4">
                  <TrendingDown className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Save Money!</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Shopping at <span className="font-semibold text-accent">{bestStore.bestStore}</span> would save you{' '}
                      <span className="font-bold text-accent">
                        {formatCurrency(cartSummary.totalCost - (bestStore.lowestCost || 0))}
                      </span>
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setSelectedStore(bestStore.bestStore || null)}
                      className="w-full"
                    >
                      Select Best Store
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Store Options */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Select Store</h2>
              {itemsByStore && Object.entries(itemsByStore).length > 0 ? (
                Object.entries(itemsByStore).map(([storeId, items]: [string, any[]]) => {
                  const storeCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
                  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                  const isBestStore = bestStore?.bestStore === storeId;

                  return (
                    <Card
                      key={storeId}
                      className={`p-6 cursor-pointer transition-all ${
                        selectedStore === storeId
                          ? 'ring-2 ring-accent bg-accent/5'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStore(storeId)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{storeId}</h3>
                            {isBestStore && (
                              <Badge className="bg-accent text-accent-foreground">Best Price</Badge>
                            )}
                            {selectedStore === storeId && (
                              <Badge className="bg-green-100 text-green-800">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {itemCount} item{itemCount !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                          <p className="text-2xl font-bold text-accent">{formatCurrency(storeCost)}</p>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="space-y-2 text-sm">
                        {items.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="flex justify-between text-muted-foreground">
                            <span>{item.productId} × {item.quantity}</span>
                            <span>{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-muted-foreground italic">
                            +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No stores available</p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{cartSummary.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stores</span>
                  <span className="font-medium">{cartSummary.storeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartSummary.totalCost)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(cartSummary.totalCost)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={!selectedStore || isProcessing}
                className="w-full mb-3"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '/shopping-list'}
                className="w-full"
              >
                Back to Cart
              </Button>

              {/* Info */}
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-3 text-sm">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Secure checkout</span>
                </div>
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Ready for pickup today</span>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Get directions to store</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
