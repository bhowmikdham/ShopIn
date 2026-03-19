import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const storeLocations = mysqlTable("storeLocations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  chain: mysqlEnum("chain", ["Woolworths", "Coles", "Aldi", "IGA", "Local Market"]).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  suburb: varchar("suburb", { length: 100 }).notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  hoursOpen: varchar("hoursOpen", { length: 5 }).notNull(),
  hoursClose: varchar("hoursClose", { length: 5 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.0"),
  isActive: boolean("isActive").default(true),
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreLocation = typeof storeLocations.$inferSelect;
export type InsertStoreLocation = typeof storeLocations.$inferInsert;

export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  cuisine: mysqlEnum("cuisine", ["Indian", "Italian", "Mexican", "Alternatives"]).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 255 }),
  wheatFree: boolean("wheatFree").default(false),
  dairyFree: boolean("dairyFree").default(false),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const productPrices = mysqlTable("productPrices", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  storeId: varchar("storeId", { length: 64 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inStock: boolean("inStock").default(true),
  stockLevel: int("stockLevel").default(0),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  source: mysqlEnum("source", ["api", "manual", "scraper"]).default("api"),
  externalId: varchar("externalId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productStoreIdx: index("productStoreIdx").on(table.productId, table.storeId),
  storeIdx: index("storeIdx").on(table.storeId),
  priceIdx: index("priceIdx").on(table.price),
}));

export type ProductPrice = typeof productPrices.$inferSelect;
export type InsertProductPrice = typeof productPrices.$inferInsert;

export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  storeId: varchar("storeId", { length: 64 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inStock: boolean("inStock").default(true),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  productStoreTimeIdx: index("productStoreTimeIdx").on(table.productId, table.storeId, table.recordedAt),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

export const apiSyncLogs = mysqlTable("apiSyncLogs", {
  id: int("id").autoincrement().primaryKey(),
  storeChain: mysqlEnum("storeChain", ["Woolworths", "Coles", "Aldi", "IGA"]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  productsUpdated: int("productsUpdated").default(0),
  errorMessage: text("errorMessage"),
  syncDuration: int("syncDuration"),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  storeChainIdx: index("storeChainIdx").on(table.storeChain),
  statusIdx: index("statusIdx").on(table.status),
}));

export type ApiSyncLog = typeof apiSyncLogs.$inferSelect;
export type InsertApiSyncLog = typeof apiSyncLogs.$inferInsert;

// Shopping cart tables
export const shoppingCarts = mysqlTable("shoppingCarts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active"),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).default("0"),
  itemCount: int("itemCount").default(0),
  preferredStoreId: varchar("preferredStoreId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
  statusIdx: index("statusIdx").on(table.status),
}));

export type ShoppingCart = typeof shoppingCarts.$inferSelect;
export type InsertShoppingCart = typeof shoppingCarts.$inferInsert;

// Cart items
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  cartId: varchar("cartId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  storeId: varchar("storeId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  pricePerUnit: decimal("pricePerUnit", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cartIdx: index("cartIdx").on(table.cartId),
  productStoreIdx: index("productStoreIdx").on(table.productId, table.storeId),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Shopping lists (saved for later)
export const shoppingLists = mysqlTable("shoppingLists", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
}));

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = typeof shoppingLists.$inferInsert;

// Shopping list items
export const shoppingListItems = mysqlTable("shoppingListItems", {
  id: int("id").autoincrement().primaryKey(),
  listId: varchar("listId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  isChecked: boolean("isChecked").default(false),
  notes: text("notes"),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  listIdx: index("listIdx").on(table.listId),
}));

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = typeof shoppingListItems.$inferInsert;

// Order history
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  cartId: varchar("cartId", { length: 64 }).notNull(),
  storeId: varchar("storeId", { length: 64 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  itemCount: int("itemCount").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "ready", "completed", "cancelled"]).default("pending"),
  orderDate: timestamp("orderDate").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
  storeIdx: index("storeIdx").on(table.storeId),
  statusIdx: index("statusIdx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;