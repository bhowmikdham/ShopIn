export interface Meal {
  id: string;
  name: string;
  description: string;
  cuisine: 'Indian' | 'Italian' | 'Mexican';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prepTime: number; // in minutes
  servings: number;
  ingredients: string[]; // product IDs
  dietary: {
    wheatFree: boolean;
    dairyFree: boolean;
  };
  estimatedCost: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const meals: Meal[] = [
  // Indian Breakfast
  {
    id: 'meal-paneer-paratha',
    name: 'Paneer Paratha with Yogurt',
    description: 'Flaky Indian flatbread stuffed with spiced paneer cheese, served with yogurt',
    cuisine: 'Indian',
    mealType: 'breakfast',
    prepTime: 45,
    servings: 2,
    ingredients: ['paneer-lemnos-200', 'milk-vitasoy-almond'],
    dietary: { wheatFree: false, dairyFree: false },
    estimatedCost: 8.50,
    difficulty: 'medium',
  },

  // Indian Lunch
  {
    id: 'meal-paneer-butter-masala',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato-based curry with soft paneer cubes, served with basmati rice',
    cuisine: 'Indian',
    mealType: 'lunch',
    prepTime: 40,
    servings: 3,
    ingredients: ['paneer-westhaven-500', 'rice-woolworths-1kg', 'ready-mtr-palak-paneer'],
    dietary: { wheatFree: true, dairyFree: false },
    estimatedCost: 12.80,
    difficulty: 'medium',
  },

  {
    id: 'meal-palak-paneer',
    name: 'Palak Paneer',
    description: 'Spinach and paneer curry, a classic Indian vegetarian dish',
    cuisine: 'Indian',
    mealType: 'lunch',
    prepTime: 35,
    servings: 3,
    ingredients: ['paneer-westhaven-500', 'rice-sunrice-2kg', 'ready-mtr-palak-paneer'],
    dietary: { wheatFree: true, dairyFree: false },
    estimatedCost: 13.20,
    difficulty: 'medium',
  },

  // Indian Dinner
  {
    id: 'meal-paneer-tikka-masala',
    name: 'Paneer Tikka Masala',
    description: 'Marinated paneer cubes in a rich tomato cream sauce with aromatic spices',
    cuisine: 'Indian',
    mealType: 'dinner',
    prepTime: 50,
    servings: 4,
    ingredients: ['paneer-westhaven-1kg', 'rice-woolworths-1kg'],
    dietary: { wheatFree: true, dairyFree: false },
    estimatedCost: 15.50,
    difficulty: 'medium',
  },

  // Italian Breakfast
  {
    id: 'meal-italian-pasta-breakfast',
    name: 'Light Pasta Carbonara',
    description: 'Simple Italian pasta with cheese and herbs, perfect for breakfast',
    cuisine: 'Italian',
    mealType: 'breakfast',
    prepTime: 20,
    servings: 2,
    ingredients: ['pasta-barilla-spaghettoni', 'cheese-parmesan', 'sauce-barilla-napoletana'],
    dietary: { wheatFree: false, dairyFree: false },
    estimatedCost: 7.80,
    difficulty: 'easy',
  },

  // Italian Lunch
  {
    id: 'meal-spaghetti-bolognese',
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta with rich meat sauce and Parmesan cheese',
    cuisine: 'Italian',
    mealType: 'lunch',
    prepTime: 35,
    servings: 3,
    ingredients: ['pasta-barilla-spaghettoni', 'sauce-barilla-bolognese', 'cheese-parmesan'],
    dietary: { wheatFree: false, dairyFree: false },
    estimatedCost: 10.20,
    difficulty: 'easy',
  },

  {
    id: 'meal-penne-napoletana',
    name: 'Penne alla Napoletana',
    description: 'Penne pasta with classic Neapolitan tomato sauce and fresh mozzarella',
    cuisine: 'Italian',
    mealType: 'lunch',
    prepTime: 25,
    servings: 2,
    ingredients: ['pasta-barilla-penne', 'sauce-barilla-napoletana', 'cheese-mozzarella'],
    dietary: { wheatFree: false, dairyFree: false },
    estimatedCost: 9.50,
    difficulty: 'easy',
  },

  // Italian Dinner
  {
    id: 'meal-rigatoni-bolognese',
    name: 'Rigatoni al Ragù',
    description: 'Hearty rigatoni pasta with slow-cooked Bolognese sauce and Parmesan',
    cuisine: 'Italian',
    mealType: 'dinner',
    prepTime: 45,
    servings: 4,
    ingredients: ['pasta-barilla-rigatoni', 'sauce-barilla-bolognese', 'cheese-parmesan'],
    dietary: { wheatFree: false, dairyFree: false },
    estimatedCost: 12.80,
    difficulty: 'medium',
  },

  {
    id: 'meal-gluten-free-pasta',
    name: 'Gluten-Free Fusilli with Marinara',
    description: 'Delicious gluten-free pasta option with fresh tomato sauce',
    cuisine: 'Italian',
    mealType: 'dinner',
    prepTime: 30,
    servings: 3,
    ingredients: ['pasta-barilla-gf-fusilli', 'sauce-barilla-napoletana', 'cheese-mozzarella'],
    dietary: { wheatFree: true, dairyFree: false },
    estimatedCost: 11.50,
    difficulty: 'easy',
  },

  // Mexican Breakfast
  {
    id: 'meal-breakfast-tacos',
    name: 'Breakfast Tacos',
    description: 'Corn tortillas with beans, salsa, and fresh cilantro',
    cuisine: 'Mexican',
    mealType: 'breakfast',
    prepTime: 15,
    servings: 2,
    ingredients: ['tortilla-old-el-paso-corn', 'beans-black-canned', 'salsa-temole-avocado'],
    dietary: { wheatFree: true, dairyFree: true },
    estimatedCost: 6.50,
    difficulty: 'easy',
  },

  // Mexican Lunch
  {
    id: 'meal-bean-burrito',
    name: 'Black Bean Burrito',
    description: 'Wheat flour tortilla filled with seasoned black beans and salsa',
    cuisine: 'Mexican',
    mealType: 'lunch',
    prepTime: 20,
    servings: 2,
    ingredients: ['tortilla-old-el-paso-wheat', 'beans-black-canned', 'salsa-temole-avocado'],
    dietary: { wheatFree: false, dairyFree: true },
    estimatedCost: 7.20,
    difficulty: 'easy',
  },

  {
    id: 'meal-mexican-rice-bowl',
    name: 'Mexican Rice Bowl',
    description: 'Rice bowl with black beans, corn chips, and fresh salsa',
    cuisine: 'Mexican',
    mealType: 'lunch',
    prepTime: 25,
    servings: 2,
    ingredients: ['rice-woolworths-1kg', 'beans-black-canned', 'chips-corn-tortilla', 'salsa-temole-avocado'],
    dietary: { wheatFree: true, dairyFree: true },
    estimatedCost: 8.30,
    difficulty: 'easy',
  },

  // Mexican Dinner
  {
    id: 'meal-enchiladas',
    name: 'Bean Enchiladas',
    description: 'Corn tortillas rolled with kidney beans and topped with salsa',
    cuisine: 'Mexican',
    mealType: 'dinner',
    prepTime: 40,
    servings: 3,
    ingredients: ['tortilla-old-el-paso-corn', 'beans-kidney-canned', 'salsa-temole-avocado'],
    dietary: { wheatFree: true, dairyFree: true },
    estimatedCost: 9.80,
    difficulty: 'medium',
  },

  // Snacks
  {
    id: 'snack-chips-salsa',
    name: 'Chips & Salsa',
    description: 'Crispy corn chips with fresh avocado tomato salsa',
    cuisine: 'Mexican',
    mealType: 'snack',
    prepTime: 5,
    servings: 2,
    ingredients: ['chips-corn-tortilla', 'salsa-temole-avocado'],
    dietary: { wheatFree: true, dairyFree: true },
    estimatedCost: 5.80,
    difficulty: 'easy',
  },
];

// Get meal recommendations based on time of day
export function getMealRecommendations(hour: number, cuisine?: string, dietary?: { wheatFree: boolean; dairyFree: boolean }): Meal[] {
  let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  if (hour >= 6 && hour < 11) {
    mealType = 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    mealType = 'lunch';
  } else if (hour >= 16 && hour < 22) {
    mealType = 'dinner';
  } else {
    mealType = 'snack';
  }

  let filtered = meals.filter((m) => m.mealType === mealType);

  if (cuisine) {
    filtered = filtered.filter((m) => m.cuisine === cuisine);
  }

  if (dietary) {
    filtered = filtered.filter((m) => {
      if (dietary.wheatFree && !m.dietary.wheatFree) return false;
      if (dietary.dairyFree && !m.dietary.dairyFree) return false;
      return true;
    });
  }

  return filtered.sort((a, b) => a.prepTime - b.prepTime);
}

// Get meal suggestions for the entire day
export function getDayMealPlan(cuisine?: string, dietary?: { wheatFree: boolean; dairyFree: boolean }): { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[] } {
  const breakfast = meals.filter((m) => m.mealType === 'breakfast');
  const lunch = meals.filter((m) => m.mealType === 'lunch');
  const dinner = meals.filter((m) => m.mealType === 'dinner');

  const filterByPreferences = (mealList: Meal[]) => {
    let filtered = mealList;
    if (cuisine) {
      filtered = filtered.filter((m) => m.cuisine === cuisine);
    }
    if (dietary) {
      filtered = filtered.filter((m) => {
        if (dietary.wheatFree && !m.dietary.wheatFree) return false;
        if (dietary.dairyFree && !m.dietary.dairyFree) return false;
        return true;
      });
    }
    return filtered;
  };

  return {
    breakfast: filterByPreferences(breakfast),
    lunch: filterByPreferences(lunch),
    dinner: filterByPreferences(dinner),
  };
}
