import { eq, and } from "drizzle-orm";
import {
  shoppingCarts,
  cartItems,
  orders,
  type InsertShoppingCart,
  type InsertCartItem,
  type InsertOrder,
} from "../drizzle/schema";
import { getDb } from "./db";
import { nanoid } from "nanoid";

/**
 * Get or create a shopping cart for a user
 */
export async function getOrCreateCart(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Find active cart
    const existingCart = await db
      .select()
      .from(shoppingCarts)
      .where(and(eq(shoppingCarts.userId, userId), eq(shoppingCarts.status, "active")))
      .limit(1);

    if (existingCart.length > 0) {
      return existingCart[0];
    }

    // Create new cart
    const cartId = nanoid();
    const newCart: InsertShoppingCart = {
      id: cartId,
      userId,
      status: "active",
      totalCost: "0",
      itemCount: 0,
    };

    await db.insert(shoppingCarts).values(newCart);
    return newCart;
  } catch (error) {
    console.error("[Cart] Failed to get or create cart:", error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  userId: number,
  productId: string,
  storeId: string,
  quantity: number,
  pricePerUnit: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const cart = await getOrCreateCart(userId);
    if (!cart) throw new Error("Failed to create cart");

    const totalPrice = quantity * pricePerUnit;

    // Check if item already in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          eq(cartItems.storeId, storeId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity;
      const newTotalPrice = newQuantity * pricePerUnit;

      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          totalPrice: newTotalPrice.toString(),
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      // Add new item
      const item: InsertCartItem = {
        cartId: cart.id,
        productId,
        storeId,
        quantity,
        pricePerUnit: pricePerUnit.toString(),
        totalPrice: totalPrice.toString(),
      };

      await db.insert(cartItems).values(item);
    }

    // Update cart totals
    await updateCartTotals(cart.id);

    return { success: true, cartId: cart.id };
  } catch (error) {
    console.error("[Cart] Failed to add item:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartId: string, itemId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    await updateCartTotals(cartId);
    return { success: true };
  } catch (error) {
    console.error("[Cart] Failed to remove item:", error);
    throw error;
  }
}

/**
 * Update item quantity
 */
export async function updateItemQuantity(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      const item = await db.select().from(cartItems).where(eq(cartItems.id, itemId)).limit(1);

      if (item.length > 0) {
        const newTotalPrice = quantity * parseFloat(item[0].pricePerUnit.toString());

        await db
          .update(cartItems)
          .set({
            quantity,
            totalPrice: newTotalPrice.toString(),
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, itemId));

        await updateCartTotals(item[0].cartId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[Cart] Failed to update quantity:", error);
    throw error;
  }
}

/**
 * Get cart items
 */
export async function getCartItems(cartId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  } catch (error) {
    console.error("[Cart] Failed to get cart items:", error);
    throw error;
  }
}

/**
 * Update cart totals
 */
export async function updateCartTotals(cartId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const items = await getCartItems(cartId);

    const totalCost = items.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice.toString());
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    await db
      .update(shoppingCarts)
      .set({
        totalCost: totalCost.toString(),
        itemCount,
        updatedAt: new Date(),
      })
      .where(eq(shoppingCarts.id, cartId));

    return { totalCost, itemCount };
  } catch (error) {
    console.error("[Cart] Failed to update totals:", error);
    throw error;
  }
}

/**
 * Get cart by ID with items
 */
export async function getCartWithItems(cartId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const cart = await db.select().from(shoppingCarts).where(eq(shoppingCarts.id, cartId)).limit(1);

    if (cart.length === 0) return null;

    const items = await getCartItems(cartId);
    const cartData = cart[0];
    if (!cartData) return null;

    return {
      ...cartData,
      items,
      totalCost: parseFloat((cartData.totalCost || "0").toString()),
    };
  } catch (error) {
    console.error("[Cart] Failed to get cart with items:", error);
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(cartId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await updateCartTotals(cartId);
    return { success: true };
  } catch (error) {
    console.error("[Cart] Failed to clear cart:", error);
    throw error;
  }
}

/**
 * Group cart items by store
 */
export async function getCartItemsByStore(cartId: string) {
  const db = await getDb();
  if (!db) return {};

  try {
    const items = await getCartItems(cartId);

    const grouped: { [key: string]: typeof items } = {};

    for (const item of items) {
      if (!grouped[item.storeId]) {
        grouped[item.storeId] = [];
      }
      grouped[item.storeId].push(item);
    }

    return grouped;
  } catch (error) {
    console.error("[Cart] Failed to group items:", error);
    throw error;
  }
}

/**
 * Create order from cart
 */
export async function createOrder(cartId: string, storeId: string, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const cart = await getCartWithItems(cartId);
    if (!cart) throw new Error("Cart not found");

    const orderId = nanoid();
    if (userId === null) throw new Error("User ID required");

    const order: InsertOrder = {
      id: orderId,
      userId: userId as number,
      cartId,
      storeId,
      totalAmount: cart.totalCost.toString(),
      itemCount: cart.itemCount || 0,
      status: "pending",
    };

    await db.insert(orders).values(order);

    // Mark cart as completed
    await db
      .update(shoppingCarts)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(shoppingCarts.id, cartId));

    return order;
  } catch (error) {
    console.error("[Cart] Failed to create order:", error);
    throw error;
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  } catch (error) {
    console.error("[Cart] Failed to get user orders:", error);
    throw error;
  }
}

/**
 * Calculate best store for cart items
 */
export async function calculateBestStore(cartId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const itemsByStore = await getCartItemsByStore(cartId);

    let bestStore = null;
    let lowestCost = Infinity;

    for (const [storeId, items] of Object.entries(itemsByStore)) {
      const storeCost = items.reduce((sum, item) => {
        return sum + parseFloat(item.totalPrice.toString());
      }, 0);

      if (storeCost < lowestCost) {
        lowestCost = storeCost;
        bestStore = storeId;
      }
    }

    return { bestStore: bestStore || null, lowestCost };
  } catch (error) {
    console.error("[Cart] Failed to calculate best store:", error);
    throw error;
  }
}
