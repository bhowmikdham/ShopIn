import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { products } from './products';
import { productPrices, stores } from './stores';
import type { Product } from './products';
import type { StoreLocation, ProductPrice } from './stores';
import type { Meal } from './meals';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get nearby stores based on user location
export function getNearbyStores(userLat: number, userLon: number, maxDistance: number = 15): StoreLocation[] {
  return stores
    .map((store) => ({
      ...store,
      distance: calculateDistance(userLat, userLon, store.latitude, store.longitude),
    }))
    .filter((store) => store.distance! <= maxDistance)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// Get best price for a product across all stores
export function getBestPrice(productId: string): { price: number; storeId: string; storeName: string } | null {
  const prices = productPrices.filter((p) => p.productId === productId && p.inStock);
  if (prices.length === 0) return null;

  const best = prices.reduce((min, p) => (p.price < min.price ? p : min));
  const store = stores.find((s) => s.id === best.storeId);

  return {
    price: best.price,
    storeId: best.storeId,
    storeName: store?.name || 'Unknown Store',
  };
}

// Get all prices for a product across stores
export function getPriceComparison(productId: string): Array<{ store: StoreLocation; price: number; inStock: boolean }> {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  return productPrices
    .filter((p) => p.productId === productId)
    .map((p) => {
      const store = stores.find((s) => s.id === p.storeId);
      return {
        store: store!,
        price: p.price,
        inStock: p.inStock,
      };
    })
    .sort((a, b) => a.price - b.price);
}

// Calculate total cost of a meal
export function calculateMealCost(meal: Meal, nearbyStores: StoreLocation[]): { totalCost: number; breakdown: Array<{ product: Product; bestPrice: number; store: string }> } {
  const breakdown: Array<{ product: Product; bestPrice: number; store: string }> = [];
  let totalCost = 0;

  meal.ingredients.forEach((productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const prices = productPrices
      .filter((p) => p.productId === productId && p.inStock && nearbyStores.some((s) => s.id === p.storeId))
      .sort((a, b) => a.price - b.price);

    if (prices.length > 0) {
      const bestPrice = prices[0];
      const store = stores.find((s) => s.id === bestPrice.storeId);
      breakdown.push({
        product,
        bestPrice: bestPrice.price,
        store: store?.name || 'Unknown',
      });
      totalCost += bestPrice.price;
    }
  });

  return { totalCost, breakdown };
}

// Find the best store to shop at for a meal
export function findBestStoreForMeal(meal: Meal, nearbyStores: StoreLocation[]): { store: StoreLocation; totalCost: number; savings: number } | null {
  let bestStore: StoreLocation | null = null;
  let lowestCost = Infinity;
  let totalCostByStore: { [key: string]: number } = {};

  // Calculate cost for each store
  nearbyStores.forEach((store) => {
    let storeCost = 0;
    meal.ingredients.forEach((productId) => {
      const price = productPrices.find((p) => p.productId === productId && p.storeId === store.id && p.inStock);
      if (price) {
        storeCost += price.price;
      }
    });

    if (storeCost > 0 && storeCost < lowestCost) {
      lowestCost = storeCost;
      bestStore = store;
    }
    totalCostByStore[store.id] = storeCost;
  });

  if (!bestStore) return null;

  // Calculate average cost
  const costs = Object.values(totalCostByStore).filter((c) => c > 0);
  const averageCost = costs.reduce((a, b) => a + b, 0) / costs.length;
  const savings = averageCost - lowestCost;

  return {
    store: bestStore,
    totalCost: lowestCost,
    savings,
  };
}

// Get current time period
export function getTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Get meal type based on current time
export function getCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Get dietary badge text
export function getDietaryBadges(dietary: { wheatFree: boolean; dairyFree: boolean }): string[] {
  const badges: string[] = [];
  if (dietary.wheatFree) badges.push('Wheat-Free');
  if (dietary.dairyFree) badges.push('Dairy-Free');
  return badges;
}

// Filter products by dietary requirements
export function filterProductsByDietary(
  productList: Product[],
  dietary: { wheatFree?: boolean; dairyFree?: boolean }
): Product[] {
  return productList.filter((product) => {
    if (dietary.wheatFree && !product.dietary.wheatFree) return false;
    if (dietary.dairyFree && !product.dietary.dairyFree) return false;
    return true;
  });
}

// Get store hours status
export function getStoreStatus(store: StoreLocation): 'open' | 'closed' | 'closing-soon' {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (currentTime < store.hours.open || currentTime > store.hours.close) {
    return 'closed';
  }

  // Check if closing within 1 hour
  const closeTime = store.hours.close.split(':');
  const closeHour = parseInt(closeTime[0]);
  const closeMinute = parseInt(closeTime[1]);
  const closeDate = new Date();
  closeDate.setHours(closeHour, closeMinute, 0);

  const timeDiff = closeDate.getTime() - now.getTime();
  const minutesUntilClose = timeDiff / (1000 * 60);

  if (minutesUntilClose < 60) {
    return 'closing-soon';
  }

  return 'open';
}
