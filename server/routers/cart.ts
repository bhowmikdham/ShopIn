import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getOrCreateCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  getCartWithItems,
  clearCart,
  getCartItemsByStore,
  createOrder,
  getUserOrders,
  calculateBestStore,
} from "../cart";

export const cartRouter = router({
  /**
   * Get or create cart for current user
   */
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) return null;

    return {
      ...cart,
      totalCost: parseFloat((cart.totalCost || "0").toString()),
    };
  }),

  /**
   * Get cart with items
   */
  getCartWithItems: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) return null;

    const cartWithItems = await getCartWithItems(cart.id);
    if (!cartWithItems) return null;

    return {
      ...cartWithItems,
      items: cartWithItems.items.map((item) => ({
        ...item,
        pricePerUnit: parseFloat(item.pricePerUnit.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
      })),
    };
  }),

  /**
   * Add item to cart
   */
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        storeId: z.string(),
        quantity: z.number().min(1),
        pricePerUnit: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await addToCart(
        ctx.user.id,
        input.productId,
        input.storeId,
        input.quantity,
        input.pricePerUnit
      );
    }),

  /**
   * Remove item from cart
   */
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);
      if (!cart) throw new Error("Cart not found");

      return await removeFromCart(cart.id, input.itemId);
    }),

  /**
   * Update item quantity
   */
  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      return await updateItemQuantity(input.itemId, input.quantity);
    }),

  /**
   * Clear entire cart
   */
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) throw new Error("Cart not found");

    return await clearCart(cart.id);
  }),

  /**
   * Get cart items grouped by store
   */
  getItemsByStore: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) return {};

    const itemsByStore = await getCartItemsByStore(cart.id);

    const result: { [key: string]: any[] } = {};
    for (const [storeId, items] of Object.entries(itemsByStore)) {
      result[storeId] = items.map((item) => ({
        ...item,
        pricePerUnit: parseFloat(item.pricePerUnit.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
      }));
    }

    return result;
  }),

  /**
   * Calculate best store for current cart
   */
  calculateBestStore: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) return null;

    return await calculateBestStore(cart.id);
  }),

  /**
   * Create order from cart
   */
  checkout: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);
      if (!cart) throw new Error("Cart not found");

      const order = await createOrder(cart.id, input.storeId, ctx.user.id);
      if (!order) throw new Error("Failed to create order");

      return {
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
      };
    }),

  /**
   * Get user's order history
   */
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const orders = await getUserOrders(ctx.user.id);

    return orders.map((order) => ({
      ...order,
      totalAmount: parseFloat(order.totalAmount.toString()),
    }));
  }),

  /**
   * Get cart summary
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    if (!cart) return null;

    const cartWithItems = await getCartWithItems(cart.id);
    if (!cartWithItems) return null;

    const itemsByStore = await getCartItemsByStore(cart.id);
    const storeCount = Object.keys(itemsByStore).length;

    return {
      cartId: cart.id,
      itemCount: cart.itemCount || 0,
      totalCost: parseFloat((cart.totalCost || "0").toString()),
      storeCount,
      stores: Object.keys(itemsByStore),
    };
  }),
});
