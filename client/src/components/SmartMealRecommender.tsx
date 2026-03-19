import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Utensils, TrendingDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface MealRecommendation {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  prepTime: number;
  servings: number;
  estimatedCost: number;
  ingredients: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const MEAL_RECOMMENDATIONS: MealRecommendation[] = [
  {
    id: '1',
    name: 'Paneer Tikka Masala',
    cuisine: 'Indian',
    description: 'Creamy tomato-based curry with paneer cheese',
    prepTime: 45,
    servings: 4,
    estimatedCost: 18.99,
    ingredients: ['paneer', 'tomato', 'onion', 'spices'],
    mealType: 'dinner',
  },
  {
    id: '2',
    name: 'Spaghetti Carbonara',
    cuisine: 'Italian',
    description: 'Classic Italian pasta with parmesan and eggs',
    prepTime: 20,
    servings: 2,
    estimatedCost: 12.50,
    ingredients: ['pasta', 'parmesan', 'eggs', 'bacon'],
    mealType: 'dinner',
  },
  {
    id: '3',
    name: 'Chicken Tacos',
    cuisine: 'Mexican',
    description: 'Spiced chicken in corn tortillas with fresh toppings',
    prepTime: 30,
    servings: 4,
    estimatedCost: 15.75,
    ingredients: ['chicken', 'tortillas', 'salsa', 'cheese'],
    mealType: 'lunch',
  },
  {
    id: '4',
    name: 'Biryani',
    cuisine: 'Indian',
    description: 'Fragrant rice dish with spiced vegetables',
    prepTime: 60,
    servings: 6,
    estimatedCost: 22.00,
    ingredients: ['basmati rice', 'vegetables', 'spices', 'yogurt'],
    mealType: 'dinner',
  },
  {
    id: '5',
    name: 'Risotto',
    cuisine: 'Italian',
    description: 'Creamy arborio rice with mushrooms',
    prepTime: 35,
    servings: 3,
    estimatedCost: 14.99,
    ingredients: ['arborio rice', 'mushrooms', 'parmesan', 'white wine'],
    mealType: 'dinner',
  },
];

export default function SmartMealRecommender() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealRecommendation | null>(null);

  // Get current time-based meal type
  const currentMealType = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'breakfast';
    if (hour < 17) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  }, []);

  // Get recommended meals based on time and cuisine
  const recommendedMeals = useMemo(() => {
    return MEAL_RECOMMENDATIONS.filter((meal) => {
      const matchesCuisine = !selectedCuisine || meal.cuisine === selectedCuisine;
      const matchesTime = meal.mealType === currentMealType;
      return matchesCuisine && matchesTime;
    }).sort((a, b) => a.estimatedCost - b.estimatedCost);
  }, [selectedCuisine, currentMealType]);

  const getMealTypeEmoji = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🌤️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍿';
      default:
        return '🍽️';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  return (
    <div className="w-full space-y-6">
      {/* Time-Based Greeting */}
      <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{getMealTypeEmoji(currentMealType)}</div>
          <div>
            <h2 className="text-2xl font-bold capitalize">
              {currentMealType === 'breakfast'
                ? 'Good Morning!'
                : currentMealType === 'lunch'
                  ? 'Good Afternoon!'
                  : currentMealType === 'dinner'
                    ? 'Good Evening!'
                    : 'Late Night Snack?'}
            </h2>
            <p className="text-muted-foreground">
              It's {currentMealType} time. Here are your best meal options.
            </p>
          </div>
        </div>
      </Card>

      {/* Cuisine Filter */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Filter by Cuisine</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCuisine === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCuisine(null)}
          >
            All Cuisines
          </Button>
          {['Indian', 'Italian', 'Mexican'].map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCuisine(cuisine)}
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </Card>

      {/* Meal Recommendations */}
      {recommendedMeals.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recommended Meals ({recommendedMeals.length})</h3>
          {recommendedMeals.map((meal) => (
            <Card
              key={meal.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedMeal?.id === meal.id ? 'ring-2 ring-accent bg-accent/5' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedMeal(selectedMeal?.id === meal.id ? null : meal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">{meal.name}</h4>
                    <Badge variant="secondary">{meal.cuisine}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{meal.prepTime} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4 text-muted-foreground" />
                      <span>{meal.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-accent">{formatCurrency(meal.estimatedCost)}</span>
                    </div>
                  </div>

                  {selectedMeal?.id === meal.id && (
                    <div className="bg-background p-3 rounded-lg mt-3 border border-border">
                      <p className="text-xs font-semibold mb-2">Key Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ing) => (
                          <Badge key={ing} variant="outline" className="text-xs">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full" size="sm" variant="outline">
                Add to Shopping List
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No meals found for {selectedCuisine} cuisine at {currentMealType} time.
          </p>
        </Card>
      )}
    </div>
  );
}
