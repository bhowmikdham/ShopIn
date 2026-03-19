import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

interface CartButtonProps {
  onClick?: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { data: cartSummary } = trpc.cart.getSummary.useQuery();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className="relative"
    >
      <ShoppingBag className="w-5 h-5" />
      {cartSummary && cartSummary.itemCount > 0 && (
        <Badge
          className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
          variant="default"
        >
          {cartSummary.itemCount}
        </Badge>
      )}
    </Button>
  );
}
