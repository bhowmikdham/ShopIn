import { eq, and, desc, asc } from "drizzle-orm";
import { productPrices, priceHistory, apiSyncLogs, storeLocations, products, type InsertProductPrice, type InsertPriceHistory, type InsertApiSyncLog } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all current prices for a product across all stores
 */
export async function getProductPrices(productId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productPrices)
    .where(eq(productPrices.productId, productId))
    .orderBy(asc(productPrices.price));
}

/**
 * Get the best price for a product
 */
export async function getBestPrice(productId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(productPrices)
    .where(and(eq(productPrices.productId, productId), eq(productPrices.inStock, true)))
    .orderBy(asc(productPrices.price))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get prices for multiple products at a specific store
 */
export async function getStorePrices(storeId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productPrices)
    .where(eq(productPrices.storeId, storeId))
    .orderBy(desc(productPrices.lastUpdatedAt));
}

/**
 * Update or insert a product price
 */
export async function upsertProductPrice(data: InsertProductPrice) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .insert(productPrices)
      .values(data)
      .onDuplicateKeyUpdate({
        set: {
          price: data.price,
          inStock: data.inStock,
          stockLevel: data.stockLevel,
          lastUpdatedAt: new Date(),
          source: data.source,
          externalId: data.externalId,
        },
      });

    // Also record in price history for analytics
    if (data.productId && data.storeId) {
      await recordPriceHistory({
        productId: data.productId,
        storeId: data.storeId,
        price: data.price,
        inStock: data.inStock,
        recordedAt: new Date(),
      });
    }

    return result;
  } catch (error) {
    console.error("[Pricing] Failed to upsert price:", error);
    throw error;
  }
}

/**
 * Batch update prices for multiple products
 */
export async function batchUpsertPrices(prices: InsertProductPrice[]) {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await Promise.all(
      prices.map((price) => upsertProductPrice(price))
    );
    return results;
  } catch (error) {
    console.error("[Pricing] Failed to batch upsert prices:", error);
    throw error;
  }
}

/**
 * Record price in history for trend analysis
 */
export async function recordPriceHistory(data: InsertPriceHistory) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.insert(priceHistory).values(data);
  } catch (error) {
    console.error("[Pricing] Failed to record price history:", error);
    throw error;
  }
}

/**
 * Get price history for a product at a store
 */
export async function getPriceHistory(productId: string, storeId: string, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.productId, productId),
        eq(priceHistory.storeId, storeId)
      )
    )
    .orderBy(asc(priceHistory.recordedAt));
}

/**
 * Log API sync operation
 */
export async function logApiSync(data: InsertApiSyncLog) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.insert(apiSyncLogs).values(data);
  } catch (error) {
    console.error("[Pricing] Failed to log API sync:", error);
    throw error;
  }
}

/**
 * Get recent sync logs for a store chain
 */
export async function getRecentSyncLogs(storeChain: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(apiSyncLogs)
    .where(eq(apiSyncLogs.storeChain, storeChain as any))
    .orderBy(desc(apiSyncLogs.createdAt))
    .limit(limit);
}

/**
 * Get all active stores
 */
export async function getActiveStores() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(storeLocations)
    .where(eq(storeLocations.isActive, true));
}

/**
 * Get all products
 */
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products);
}

/**
 * Get products by cuisine
 */
export async function getProductsByCuisine(cuisine: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.cuisine, cuisine as any));
}

/**
 * Get price statistics for a product
 */
export async function getPriceStats(productId: string) {
  const db = await getDb();
  if (!db) return null;

  const prices = await db
    .select({
      price: productPrices.price,
      inStock: productPrices.inStock,
    })
    .from(productPrices)
    .where(eq(productPrices.productId, productId));

  if (prices.length === 0) return null;

  const inStockPrices = prices.filter((p) => p.inStock).map((p) => parseFloat(p.price.toString()));

  if (inStockPrices.length === 0) return null;

  const sorted = inStockPrices.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    min,
    max,
    avg: parseFloat(avg.toFixed(2)),
    median,
    storesWithStock: prices.filter((p) => p.inStock).length,
    totalStores: prices.length,
  };
}
