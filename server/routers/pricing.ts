import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getProductPrices,
  getBestPrice,
  getStorePrices,
  getPriceHistory,
  getPriceStats,
  getActiveStores,
  getAllProducts,
  getProductsByCuisine,
  getRecentSyncLogs,
} from "../pricing";

export const pricingRouter = router({
  /**
   * Get all prices for a specific product across all stores
   */
  getProductPrices: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const prices = await getProductPrices(input.productId);
      return prices.map((p) => ({
        ...p,
        price: parseFloat(p.price.toString()),
      }));
    }),

  /**
   * Get the best (lowest) price for a product
   */
  getBestPrice: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const price = await getBestPrice(input.productId);
      if (!price) return null;
      return {
        ...price,
        price: parseFloat(price.price.toString()),
      };
    }),

  /**
   * Get all prices at a specific store
   */
  getStorePrices: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ input }) => {
      const prices = await getStorePrices(input.storeId);
      return prices.map((p) => ({
        ...p,
        price: parseFloat(p.price.toString()),
      }));
    }),

  /**
   * Get price history for a product at a store
   */
  getPriceHistory: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        storeId: z.string(),
        days: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) => {
      const history = await getPriceHistory(input.productId, input.storeId, input.days);
      return history.map((h) => ({
        ...h,
        price: parseFloat(h.price.toString()),
      }));
    }),

  /**
   * Get price statistics for a product
   */
  getPriceStats: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return await getPriceStats(input.productId);
    }),

  /**
   * Get all active stores
   */
  getStores: publicProcedure.query(async () => {
    const stores = await getActiveStores();
    return stores.map((s) => ({
      ...s,
      latitude: parseFloat(s.latitude.toString()),
      longitude: parseFloat(s.longitude.toString()),
      rating: parseFloat(s.rating?.toString() || "0"),
    }));
  }),

  /**
   * Get all products
   */
  getProducts: publicProcedure.query(async () => {
    return await getAllProducts();
  }),

  /**
   * Get products by cuisine
   */
  getProductsByCuisine: publicProcedure
    .input(z.object({ cuisine: z.string() }))
    .query(async ({ input }) => {
      return await getProductsByCuisine(input.cuisine);
    }),

  /**
   * Get recent API sync logs
   */
  getRecentSyncLogs: publicProcedure
    .input(
      z.object({
        storeChain: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      return await getRecentSyncLogs(input.storeChain, input.limit);
    }),

  /**
   * Compare prices for a product across stores
   */
  comparePrices: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const prices = await getProductPrices(input.productId);
      const stores = await getActiveStores();

      const comparison = prices.map((price) => {
        const store = stores.find((s) => s.id === price.storeId);
        return {
          store: store
            ? {
                id: store.id,
                name: store.name,
                chain: store.chain,
                suburb: store.suburb,
              }
            : null,
          price: parseFloat(price.price.toString()),
          inStock: price.inStock,
          lastUpdated: price.lastUpdatedAt,
        };
      });

      return comparison.filter((c) => c.store !== null).sort((a, b) => a.price - b.price);
    }),

  /**
   * Find cheapest store for multiple products
   */
  findCheapestStore: publicProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const stores = await getActiveStores();
      const storeScores: { [key: string]: { totalCost: number; itemsFound: number } } = {};

      for (const storeId of stores.map((s) => s.id)) {
        storeScores[storeId] = { totalCost: 0, itemsFound: 0 };
      }

      for (const productId of input.productIds) {
        const prices = await getProductPrices(productId);
        for (const price of prices) {
          if (price.inStock) {
            storeScores[price.storeId].totalCost += parseFloat(price.price.toString());
            storeScores[price.storeId].itemsFound++;
          }
        }
      }

      // Find store with best score (all items found and lowest cost)
      let bestStore = null;
      let bestScore = Infinity;

      for (const [storeId, score] of Object.entries(storeScores)) {
        if (score.itemsFound === input.productIds.length && score.totalCost < bestScore) {
          bestScore = score.totalCost;
          bestStore = stores.find((s) => s.id === storeId);
        }
      }

      if (!bestStore) {
        // If no store has all items, find the one with the lowest cost for available items
        for (const [storeId, score] of Object.entries(storeScores)) {
          if (score.itemsFound > 0 && score.totalCost < bestScore) {
            bestScore = score.totalCost;
            bestStore = stores.find((s) => s.id === storeId);
          }
        }
      }

      return bestStore
        ? {
            store: {
              id: bestStore.id,
              name: bestStore.name,
              chain: bestStore.chain,
              suburb: bestStore.suburb,
              address: bestStore.address,
            },
            totalCost: bestScore,
            itemsFound: storeScores[bestStore.id].itemsFound,
            totalItems: input.productIds.length,
          }
        : null;
    }),
});
