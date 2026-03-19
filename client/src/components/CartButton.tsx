import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

export default function CartButton() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Only query cart summary when authenticated
  const { data: cartSummary } = trpc.cart.getSummary.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => setLocation('/shopping-list')}
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
