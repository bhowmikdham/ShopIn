import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, DollarSign, Package, TrendingDown, Navigation, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import ShoppingCart from '@/components/ShoppingCart';

export default function ShoppingListPage() {
  const [activeTab, setActiveTab] = useState('cart');
  const { isAuthenticated, loading } = useAuth();

  // Only fetch cart data when authenticated
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Shopping List</h1>
          <p className="text-muted-foreground">
            Organize your purchases across multiple stores and save money
          </p>
        </div>
      </div>

      {/* Auth Gate */}
      {!loading && !isAuthenticated ? (
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center max-w-md mx-auto">
            <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your shopping list and cart
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Card>
        </div>
      ) : (

      /* Main Content */
      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        {cartSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Items</p>
              <p className="text-3xl font-bold">{cartSummary.itemCount}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-accent">{formatCurrency(cartSummary.totalCost)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Stores</p>
              <p className="text-3xl font-bold">{cartSummary.storeCount}</p>
            </Card>
            {bestStore && (
              <Card className="p-4 border-accent/20 bg-accent/5">
                <p className="text-sm text-muted-foreground mb-1">Best Store</p>
                <p className="text-lg font-bold text-accent">{bestStore.bestStore}</p>
                <p className="text-xs text-accent mt-1">Save {formatCurrency(cartSummary.totalCost - (bestStore.lowestCost || 0))}</p>
              </Card>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="cart">Shopping Cart</TabsTrigger>
            <TabsTrigger value="stores">By Store</TabsTrigger>
          </TabsList>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-4">
            <ShoppingCart />
          </TabsContent>

          {/* By Store Tab */}
          <TabsContent value="stores" className="space-y-6">
            {itemsByStore && Object.entries(itemsByStore).length > 0 ? (
              Object.entries(itemsByStore).map(([storeId, items]: [string, any[]]) => {
                const storeCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
                const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <Card key={storeId} className="overflow-hidden">
                    {/* Store Header */}
                    <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold">{storeId}</h2>
                          <p className="text-sm text-muted-foreground">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                          <p className="text-2xl font-bold text-accent">{formatCurrency(storeCost)}</p>
                        </div>
                      </div>

                      <Button className="w-full">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions to Store
                      </Button>
                    </div>

                    {/* Items List */}
                    <div className="p-6 space-y-3">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.productId}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.pricePerUnit)}
                            </p>
                          </div>
                          <p className="font-bold text-lg">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No items in your shopping list</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        {cartSummary && cartSummary.storeCount > 1 && (
          <Card className="mt-12 p-6 border-l-4 border-accent bg-accent/5">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              Money-Saving Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ You're shopping at {cartSummary.storeCount} stores. Consider consolidating to save time.</li>
              {bestStore && (
                <li>✓ Shopping at {bestStore.bestStore} would save you {formatCurrency(cartSummary.totalCost - (bestStore.lowestCost || 0))}.</li>
              )}
              <li>✓ Compare prices across stores before finalizing your purchase.</li>
              <li>✓ Check for store specials and loyalty programs for additional savings.</li>
            </ul>
          </Card>
        )}
      </div>
      )}
    </div>
  );
}
