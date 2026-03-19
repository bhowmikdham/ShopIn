import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, TrendingDown } from 'lucide-react';
import { getDayMealPlan, type Meal } from '@/lib/meals';
import { calculateMealCost, findBestStoreForMeal, formatCurrency, getNearbyStores } from '@/lib/utils';
import type { StoreLocation } from '@/lib/stores';

interface MealPlannerProps {
  cuisine?: string;
  dietary?: { wheatFree: boolean; dairyFree: boolean };
  nearbyStores: StoreLocation[];
}

export function MealPlanner({ cuisine, dietary, nearbyStores }: MealPlannerProps) {
  const dayPlan = getDayMealPlan(cuisine, dietary);

  const MealCard = ({ meal }: { meal: Meal }) => {
    const mealCost = calculateMealCost(meal, nearbyStores);
    const bestStore = findBestStoreForMeal(meal, nearbyStores);

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold">{meal.name}</h4>
          <Badge variant="outline" className="text-xs">
            {meal.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{meal.prepTime} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>{meal.servings} servings</span>
          </div>
        </div>

        <div className="bg-accent/10 p-2 rounded mb-3">
          <p className="text-xs text-muted-foreground">Estimated Cost</p>
          <p className="font-bold text-accent">{formatCurrency(mealCost.totalCost)}</p>
        </div>

        {bestStore && (
          <div className="text-xs mb-3">
            <p className="text-muted-foreground">Best at: {bestStore.store.name}</p>
            {bestStore.savings > 0 && <p className="text-green-600 font-medium">Save {formatCurrency(bestStore.savings)}</p>}
          </div>
        )}

        <Button size="sm" className="w-full">
          Add to Shopping List
        </Button>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breakfast */}
      <div>
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Badge>Breakfast</Badge>
          <span className="text-sm text-muted-foreground">({dayPlan.breakfast.length} options)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayPlan.breakfast.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>

      {/* Lunch */}
      <div>
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Badge>Lunch</Badge>
          <span className="text-sm text-muted-foreground">({dayPlan.lunch.length} options)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayPlan.lunch.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>

      {/* Dinner */}
      <div>
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Badge>Dinner</Badge>
          <span className="text-sm text-muted-foreground">({dayPlan.dinner.length} options)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayPlan.dinner.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
}
