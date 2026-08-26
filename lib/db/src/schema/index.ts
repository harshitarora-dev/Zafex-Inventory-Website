import { mysqlTable, varchar, text, int, serial, boolean, timestamp, json } from "drizzle-orm/mysql-core";

// ── Products ──────────────────────────────────────────────────────────────
export const productsTable = mysqlTable("products", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sku: varchar("sku", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).default("ZAFS"),
  cat: varchar("cat", { length: 100 }).notNull(),
  sub: varchar("sub", { length: 100 }).notNull(),
  collection: varchar("collection", { length: 100 }),
  price: int("price").notNull(),
  mrp: int("mrp"),
  discount: int("discount").default(0),
  priceRange: json("price_range").$type<[number, number]>(),
  badge: varchar("badge", { length: 100 }),
  image: varchar("image", { length: 500 }).notNull(),
  gallery: json("gallery").$type<string[]>(),
  video: varchar("video", { length: 500 }),
  customerPhotos: json("customer_photos").$type<string[]>(),
  lifestyleImages: json("lifestyle_images").$type<string[]>(),
  sizeChartImage: varchar("size_chart_image", { length: 500 }),
  material: varchar("material", { length: 200 }),
  ringSize: varchar("ring_size", { length: 100 }),
  ringType: varchar("ring_type", { length: 100 }),
  gauge: varchar("gauge", { length: 100 }),
  finish: varchar("finish", { length: 200 }),
  weight: varchar("weight", { length: 100 }),
  manufacturingTime: varchar("manufacturing_time", { length: 100 }),
  country: varchar("country", { length: 100 }).default("India"),
  hsCode: varchar("hs_code", { length: 100 }),
  availability: varchar("availability", { length: 100 }).default("In Stock"),
  estimatedDelivery: varchar("estimated_delivery", { length: 100 }),
  colors: json("colors").$type<string[]>(),
  sizes: json("sizes").$type<string[]>(),
  highlights: json("highlights").$type<string[]>(),
  materials: json("materials").$type<string[]>(),
  desc: text("desc"),
  tags: json("tags").$type<string[]>(),
  inStock: boolean("in_stock").notNull().default(true),
  stockCount: int("stock_count").default(100),
  ebayUrl: varchar("ebay_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;

// ── Homepage Config ───────────────────────────────────────────────────────
export const homepageConfigTable = mysqlTable("homepage_config", {
  id: varchar("id", { length: 50 }).primaryKey().default("default"),
  data: json("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertHomepageConfig = typeof homepageConfigTable.$inferInsert;
export type HomepageConfig = typeof homepageConfigTable.$inferSelect;

// ── Users ─────────────────────────────────────────────────────────────────
export const usersTable = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  role: varchar("role", { length: 50 }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

// ── Orders ────────────────────────────────────────────────────────────────
export const ordersTable = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingState: varchar("shipping_state", { length: 100 }),
  shippingPincode: varchar("shipping_pincode", { length: 50 }),
  shippingCountry: varchar("shipping_country", { length: 100 }).default("India"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }).default("razorpay"),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  paymentId: varchar("payment_id", { length: 255 }),
  paymentSignature: varchar("payment_signature", { length: 500 }),
  totalAmount: int("total_amount").notNull(),
  subtotal: int("subtotal").default(0),
  shippingCost: int("shipping_cost").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertOrder = typeof ordersTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;

// ── Order Items ───────────────────────────────────────────────────────────
export const orderItemsTable = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: int("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 100 })
    .notNull()
    .references(() => productsTable.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  unitPrice: int("unit_price").notNull(),
  quantity: int("quantity").notNull().default(1),
});

export type InsertOrderItem = typeof orderItemsTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;

// ── Order Status History ──────────────────────────────────────────────────
export const orderStatusHistoryTable = mysqlTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: int("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertOrderStatusHistory = typeof orderStatusHistoryTable.$inferInsert;
export type OrderStatusHistory = typeof orderStatusHistoryTable.$inferSelect;

// ── Cart ──────────────────────────────────────────────────────────────────
export const cartTable = mysqlTable("cart", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 100 })
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertCart = typeof cartTable.$inferInsert;
export type CartItem = typeof cartTable.$inferSelect;

// ── Wishlist ──────────────────────────────────────────────────────────────
export const wishlistTable = mysqlTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 100 })
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertWishlist = typeof wishlistTable.$inferInsert;
export type WishlistItem = typeof wishlistTable.$inferSelect;

// ── Reviews ───────────────────────────────────────────────────────────────
export const reviewsTable = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 100 })
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertReview = typeof reviewsTable.$inferInsert;
export type Review = typeof reviewsTable.$inferSelect;

// ── Contact Inquiries ─────────────────────────────────────────────────────
export const contactsTable = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertContact = typeof contactsTable.$inferInsert;
export type Contact = typeof contactsTable.$inferSelect;
