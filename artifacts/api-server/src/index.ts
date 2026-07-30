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

/** Create tables if they don't exist yet (idempotent) */
async function ensureSchema() {
  await pool.query(`
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
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );
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

  // Seed is best-effort; a failure doesn't prevent the server from starting
  await seedIfEmpty();

  app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

start();
