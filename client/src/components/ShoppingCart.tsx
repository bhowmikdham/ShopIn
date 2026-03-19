import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

export default function ShoppingCart() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart data (only when authenticated)
  const { data: cartSummary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.cart.getSummary.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const { data: cartWithItems, isLoading: itemsLoading, refetch: refetchItems } = trpc.cart.getCartWithItems.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const { data: itemsByStore, refetch: refetchByStore } = trpc.cart.getItemsByStore.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  // Cart mutations
  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      toast.success('Item removed from cart');
      refetchItems();
      refetchSummary();
      refetchByStore();
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetchItems();
      refetchSummary();
      refetchByStore();
    },
    onError: () => {
      toast.error('Failed to update quantity');
    },
  });

  const clearCartMutation = trpc.cart.clearCart.useMutation({
    onSuccess: () => {
      toast.success('Cart cleared');
      refetchItems();
      refetchSummary();
      refetchByStore();
    },
    onError: () => {
      toast.error('Failed to clear cart');
    },
  });

  const checkoutMutation = trpc.cart.checkout.useMutation({
    onSuccess: (order) => {
      toast.success(`Order created successfully! Order ID: ${order.id}`);
      refetchItems();
      refetchSummary();
      refetchByStore();
      setIsCheckingOut(false);
    },
    onError: () => {
      toast.error('Checkout failed');
      setIsCheckingOut(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({ itemId });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = async () => {
    if (!cartSummary || cartSummary.storeCount === 0) {
      toast.error('Cart is empty');
      return;
    }

    // For now, checkout to the first store
    const stores = cartSummary.stores;
    if (stores.length > 0) {
      setIsCheckingOut(true);
      checkoutMutation.mutate({ storeId: stores[0] });
    }
  };

  if (summaryLoading || itemsLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </Card>
    );
  }

  if (!cartSummary || cartSummary.itemCount === 0) {
    return (
      <Card className="p-8 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">
          Start adding items from the price comparison or meal recommendations
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Cart Summary */}
      <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Shopping Cart</h2>
            <p className="text-muted-foreground">
              {cartSummary.itemCount} item{cartSummary.itemCount !== 1 ? 's' : ''} from {cartSummary.storeCount} store{cartSummary.storeCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-3xl font-bold text-accent">{formatCurrency(cartSummary.totalCost)}</p>
          </div>
        </div>
      </Card>

      {/* Items by Store */}
      {itemsByStore && Object.entries(itemsByStore).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(itemsByStore).map(([storeId, items]) => (
            <Card key={storeId} className="p-6">
              <h3 className="font-bold text-lg mb-4">Store: {storeId}</h3>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productId}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.pricePerUnit)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mx-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeItemMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No items in cart</p>
        </Card>
      )}

      {/* Cart Actions */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={handleClearCart}
          disabled={clearCartMutation.isPending}
        >
          Clear Cart
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Continue Shopping
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut || checkoutMutation.isPending}
            className="px-8"
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
