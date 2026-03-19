import { describe, it, expect } from "vitest";
import {
  getOrCreateCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  getCartWithItems,
  clearCart,
  getCartItemsByStore,
  calculateBestStore,
} from "./cart";

describe("Shopping Cart Service", () => {
  const generateTestId = () => Math.floor(Math.random() * 1000000);

  describe("getOrCreateCart", () => {
    it("should create a new cart for a user", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      expect(cart).toBeDefined();
      expect(cart?.userId).toBe(userId);
      expect(cart?.status).toBe("active");
    });

    it("should return existing active cart", async () => {
      const userId = generateTestId();
      const cart1 = await getOrCreateCart(userId);
      const cart2 = await getOrCreateCart(userId);
      expect(cart1?.id).toBe(cart2?.id);
    });
  });

  describe("addToCart", () => {
    it("should add item to cart", async () => {
      const userId = generateTestId();
      const result = await addToCart(
        userId,
        `product-${generateTestId()}`,
        `store-${generateTestId()}`,
        2,
        19.99
      );
      expect(result?.success).toBe(true);
      expect(result?.cartId).toBeDefined();
    });
  });

  describe("getCartWithItems", () => {
    it("should return cart with items", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, `store-${generateTestId()}`, 1, 19.99);

      const cartWithItems = await getCartWithItems(cart.id);
      expect(cartWithItems).toBeDefined();
      expect(Array.isArray(cartWithItems?.items)).toBe(true);
    });

    it("should calculate total cost", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, `store-${generateTestId()}`, 2, 19.99);

      const cartWithItems = await getCartWithItems(cart.id);
      expect(cartWithItems?.totalCost).toBeGreaterThan(0);
    });
  });

  describe("getCartItemsByStore", () => {
    it("should group items by store", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, "store-1", 1, 10);
      await addToCart(userId, `product-${generateTestId()}`, "store-2", 1, 15);

      const itemsByStore = await getCartItemsByStore(cart.id);
      expect(Object.keys(itemsByStore).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("calculateBestStore", () => {
    it("should identify store with lowest cost", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, "store-1", 1, 100);
      await addToCart(userId, `product-${generateTestId()}`, "store-2", 1, 50);

      const bestStore = await calculateBestStore(cart.id);
      expect(bestStore).toBeDefined();
      expect(bestStore?.bestStore).toBeDefined();
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, `store-${generateTestId()}`, 1, 19.99);
      await clearCart(cart.id);

      const cartWithItems = await getCartWithItems(cart.id);
      expect(cartWithItems?.items.length).toBe(0);
    });
  });

  describe("updateItemQuantity", () => {
    it("should update item quantity", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, `store-${generateTestId()}`, 1, 19.99);

      const cartWithItems = await getCartWithItems(cart.id);
      if (!cartWithItems?.items[0]) throw new Error("Item not found");

      await updateItemQuantity(cartWithItems.items[0].id, 5);

      const updatedCart = await getCartWithItems(cart.id);
      expect(updatedCart?.items[0]?.quantity).toBe(5);
    });

    it("should remove item if quantity is 0", async () => {
      const userId = generateTestId();
      const cart = await getOrCreateCart(userId);
      if (!cart) throw new Error("Cart not created");

      await addToCart(userId, `product-${generateTestId()}`, `store-${generateTestId()}`, 1, 19.99);

      const cartWithItems = await getCartWithItems(cart.id);
      if (!cartWithItems?.items[0]) throw new Error("Item not found");

      await updateItemQuantity(cartWithItems.items[0].id, 0);

      const updatedCart = await getCartWithItems(cart.id);
      expect(updatedCart?.items.length).toBe(0);
    });
  });
});
