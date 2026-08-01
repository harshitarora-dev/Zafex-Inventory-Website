import app from "./app";
import { logger } from "./lib/logger";
import { db, pool, productsTable } from "@workspace/db";
import { PRODUCTS } from "./data/products";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/** Create all tables if they don't exist (idempotent) */
async function ensureSchema() {
  await pool.query(`
    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
      sub TEXT NOT NULL,
      price INTEGER NOT NULL,
      badge TEXT,
      image TEXT NOT NULL,
      "desc" TEXT,
      tags TEXT[],
      in_stock BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Orders (full schema including new columns)
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_pincode TEXT,
      shipping_country TEXT DEFAULT 'India',
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL,
      razorpay_order_id TEXT,
      payment_id TEXT,
      payment_signature TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Migrate existing orders table (safe for existing installs)
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'India';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_signature TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

    -- Order items
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );

    -- Cart
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, product_id)
    );

    -- Wishlist
    CREATE TABLE IF NOT EXISTS wishlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, product_id)
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, product_id)
    );

    -- Contacts
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Order Status History
    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
  `);
}

/** Seed products into the DB if the table is empty */
async function seedIfEmpty() {
  try {
    const existing = await db.select().from(productsTable);
    if (existing.length > 0) return;

    logger.info("Products table is empty — seeding from static catalogue…");
    await db.insert(productsTable).values(
      PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        cat: p.cat,
        sub: p.sub,
        price: p.price,
        badge: p.badge ?? null,
        image: p.image,
        desc: p.desc ?? null,
        tags: p.tags ?? null,
        inStock: p.inStock ?? true,
      })),
    );
    logger.info({ count: PRODUCTS.length }, "Seeded products successfully");
  } catch (err) {
    logger.warn({ err }, "Could not seed products (DB may not be ready)");
  }
}

/** Initialise DB then start listening — fatal on schema failure */
async function start() {
  try {
    await ensureSchema();
  } catch (err) {
    logger.error({ err }, "Schema initialisation failed — refusing to start");
    process.exit(1);
  }

  await seedIfEmpty();

  app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

start();
