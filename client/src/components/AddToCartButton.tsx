import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  storeId: string;
  price: number;
  productName?: string;
}

export default function AddToCartButton({
  productId,
  storeId,
  price,
  productName = 'Item',
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success(`${productName} added to cart!`);
      setQuantity(1);
    },
    onError: () => {
      toast.error('Failed to add item to cart');
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId,
      storeId,
      quantity,
      pricePerUnit: price,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="h-8 w-8"
        >
          −
        </Button>
        <span className="w-8 text-center font-medium text-sm">{quantity}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setQuantity(quantity + 1)}
          className="h-8 w-8"
        >
          +
        </Button>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending}
        className="flex-1"
      >
        <ShoppingBag className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
    </div>
  );
}
