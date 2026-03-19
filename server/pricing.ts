import { eq, and, desc, asc } from "drizzle-orm";
import { productPrices, priceHistory, apiSyncLogs, storeLocations, products, type InsertProductPrice, type InsertPriceHistory, type InsertApiSyncLog } from "../drizzle/schema";
import { getDb } from "./db";
import { getFirestore } from "./_core/firebase";
import { DEMO_STORES, DEMO_PRODUCTS, DEMO_PRICES } from "./demoData";

/**
 * Get all current prices for a product across all stores
 */
export async function getProductPrices(productId: string) {
  // Try Firebase first
  const firestore = getFirestore();
  if (firestore) {
    const snap = await firestore.collection('productPrices')
      .where('productId', '==', productId)
      .orderBy('price', 'asc')
      .get();
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  }

  // Try MySQL
  const db = await getDb();
  if (db) {
    return await db
      .select()
      .from(productPrices)
      .where(eq(productPrices.productId, productId))
      .orderBy(asc(productPrices.price));
  }

  // Fallback to demo data
  return DEMO_PRICES
    .filter(p => p.productId === productId)
    .sort((a, b) => a.price - b.price)
    .map(p => ({
      id: `${p.productId}-${p.storeId}`,
      productId: p.productId,
      storeId: p.storeId,
      price: p.price.toString(),
      inStock: p.inStock,
      stockLevel: null,
      source: 'demo',
      externalId: null,
      lastUpdatedAt: p.lastUpdatedAt,
      createdAt: p.lastUpdatedAt,
      updatedAt: p.lastUpdatedAt,
    }));
}

/**
 * Get the best price for a product
 */
export async function getBestPrice(productId: string) {
  const db = await getDb();
  if (db) {
    const result = await db
      .select()
      .from(productPrices)
      .where(and(eq(productPrices.productId, productId), eq(productPrices.inStock, true)))
      .orderBy(asc(productPrices.price))
      .limit(1);
    if (result.length > 0) return result[0];
  }

  // Fallback to demo data
  const best = DEMO_PRICES
    .filter(p => p.productId === productId && p.inStock)
    .sort((a, b) => a.price - b.price)[0];
  if (!best) return null;
  return {
    id: `${best.productId}-${best.storeId}`,
    productId: best.productId,
    storeId: best.storeId,
    price: best.price.toString(),
    inStock: best.inStock,
    stockLevel: null,
    source: 'demo',
    externalId: null,
    lastUpdatedAt: best.lastUpdatedAt,
    createdAt: best.lastUpdatedAt,
    updatedAt: best.lastUpdatedAt,
  };
}

/**
 * Get prices for multiple products at a specific store
 */
export async function getStorePrices(storeId: string) {
  const db = await getDb();
  if (db) {
    const result = await db
      .select()
      .from(productPrices)
      .where(eq(productPrices.storeId, storeId))
      .orderBy(desc(productPrices.lastUpdatedAt));
    if (result.length > 0) return result;
  }

  // Fallback to demo data
  return DEMO_PRICES
    .filter(p => p.storeId === storeId)
    .map(p => ({
      id: `${p.productId}-${p.storeId}`,
      productId: p.productId,
      storeId: p.storeId,
      price: p.price.toString(),
      inStock: p.inStock,
      stockLevel: null,
      source: 'demo',
      externalId: null,
      lastUpdatedAt: p.lastUpdatedAt,
      createdAt: p.lastUpdatedAt,
      updatedAt: p.lastUpdatedAt,
    }));
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
  // Try Firebase first
  const firestore = getFirestore();
  if (firestore) {
    const snap = await firestore.collection('storeLocations')
      .where('isActive', '==', true)
      .get();
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  }

  // Try MySQL
  const db = await getDb();
  if (db) {
    const result = await db
      .select()
      .from(storeLocations)
      .where(eq(storeLocations.isActive, true));
    if (result.length > 0) return result;
  }

  // Fallback to demo data
  return DEMO_STORES.filter(s => s.isActive).map(s => ({
    ...s,
    latitude: s.latitude.toString(),
    longitude: s.longitude.toString(),
    rating: s.rating.toString(),
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Get all products
 */
export async function getAllProducts() {
  // Try Firebase first
  const firestore = getFirestore();
  if (firestore) {
    const snap = await firestore.collection('products').get();
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  }

  // Try MySQL
  const db = await getDb();
  if (db) {
    const result = await db.select().from(products);
    if (result.length > 0) return result;
  }

  // Fallback to demo data
  return DEMO_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    cuisine: p.cuisine,
    basePrice: p.basePrice.toString(),
    description: p.description,
    brand: p.brand,
    isWheatFree: p.isWheatFree,
    isDairyFree: p.isDairyFree,
    imageUrl: p.imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Get products by cuisine
 */
export async function getProductsByCuisine(cuisine: string) {
  // Try Firebase first
  const firestore = getFirestore();
  if (firestore) {
    const snap = await firestore.collection('products')
      .where('cuisine', '==', cuisine)
      .get();
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  }

  // Try MySQL
  const db = await getDb();
  if (db) {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.cuisine, cuisine as any));
    if (result.length > 0) return result;
  }

  // Fallback to demo data
  return DEMO_PRODUCTS
    .filter(p => p.cuisine.toLowerCase() === cuisine.toLowerCase())
    .map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      cuisine: p.cuisine,
      basePrice: p.basePrice.toString(),
      description: p.description,
      brand: p.brand,
      isWheatFree: p.isWheatFree,
      isDairyFree: p.isDairyFree,
      imageUrl: p.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
}

/**
 * Get price statistics for a product
 */
export async function getPriceStats(productId: string) {
  let priceRows: { price: number; inStock: boolean }[] = [];

  // Try Firebase first
  const firestore = getFirestore();
  if (firestore) {
    const snap = await firestore.collection('productPrices')
      .where('productId', '==', productId)
      .get();
    if (!snap.empty) {
      priceRows = snap.docs.map(d => {
        const data = d.data();
        return { price: parseFloat(data.price?.toString() || '0'), inStock: Boolean(data.inStock) };
      });
    }
  }

  // Try MySQL
  if (priceRows.length === 0) {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({
          price: productPrices.price,
          inStock: productPrices.inStock,
        })
        .from(productPrices)
        .where(eq(productPrices.productId, productId));
      priceRows = rows.map(r => ({
        price: parseFloat(r.price.toString()),
        inStock: r.inStock ?? false,
      }));
    }
  }

  // Fallback to demo data
  if (priceRows.length === 0) {
    priceRows = DEMO_PRICES
      .filter(p => p.productId === productId)
      .map(p => ({ price: p.price, inStock: p.inStock }));
  }

  if (priceRows.length === 0) return null;

  const inStockPrices = priceRows.filter((p) => p.inStock).map((p) => p.price);

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
    storesWithStock: priceRows.filter((p) => p.inStock).length,
    totalStores: priceRows.length,
  };
}
