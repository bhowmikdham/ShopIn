import { describe, it, expect, beforeAll } from "vitest";
import {
  getProductPrices,
  getBestPrice,
  getPriceStats,
  getActiveStores,
  getAllProducts,
} from "./pricing";

describe("Pricing Service", () => {
  describe("getActiveStores", () => {
    it("should return an array of stores", async () => {
      const stores = await getActiveStores();
      expect(Array.isArray(stores)).toBe(true);
    });

    it("should return stores with required fields", async () => {
      const stores = await getActiveStores();
      if (stores.length > 0) {
        const store = stores[0];
        expect(store).toHaveProperty("id");
        expect(store).toHaveProperty("name");
        expect(store).toHaveProperty("chain");
        expect(store).toHaveProperty("address");
      }
    });
  });

  describe("getAllProducts", () => {
    it("should return an array of products", async () => {
      const products = await getAllProducts();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should return products with required fields", async () => {
      const products = await getAllProducts();
      if (products.length > 0) {
        const product = products[0];
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("cuisine");
      }
    });
  });

  describe("getProductPrices", () => {
    it("should return prices for a product", async () => {
      const products = await getAllProducts();
      if (products.length > 0) {
        const productId = products[0].id;
        const prices = await getProductPrices(productId);
        expect(Array.isArray(prices)).toBe(true);
      }
    });

    it("should return empty array for non-existent product", async () => {
      const prices = await getProductPrices("non-existent-id");
      expect(Array.isArray(prices)).toBe(true);
      expect(prices.length).toBe(0);
    });
  });

  describe("getBestPrice", () => {
    it("should return null for non-existent product", async () => {
      const price = await getBestPrice("non-existent-id");
      expect(price).toBeNull();
    });

    it("should return price object with required fields when available", async () => {
      const products = await getAllProducts();
      if (products.length > 0) {
        const productId = products[0].id;
        const price = await getBestPrice(productId);
        if (price) {
          expect(price).toHaveProperty("productId");
          expect(price).toHaveProperty("storeId");
          expect(price).toHaveProperty("price");
          expect(price).toHaveProperty("inStock");
        }
      }
    });
  });

  describe("getPriceStats", () => {
    it("should return null for non-existent product", async () => {
      const stats = await getPriceStats("non-existent-id");
      expect(stats).toBeNull();
    });

    it("should return stats object with required fields when available", async () => {
      const products = await getAllProducts();
      if (products.length > 0) {
        const productId = products[0].id;
        const stats = await getPriceStats(productId);
        if (stats) {
          expect(stats).toHaveProperty("min");
          expect(stats).toHaveProperty("max");
          expect(stats).toHaveProperty("avg");
          expect(stats).toHaveProperty("median");
          expect(stats).toHaveProperty("storesWithStock");
          expect(stats).toHaveProperty("totalStores");

          // Validate price logic
          expect(stats.min).toBeLessThanOrEqual(stats.max);
          expect(stats.avg).toBeGreaterThanOrEqual(stats.min);
          expect(stats.avg).toBeLessThanOrEqual(stats.max);
        }
      }
    });
  });
});
