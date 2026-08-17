import app from "./app";
import { logger } from "./lib/logger";
import { db, productsTable } from "@workspace/db";
import { PRODUCTS } from "./data/products";

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
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

app.listen(port, async () => {
  logger.info({ port }, "Server listening");
  await seedIfEmpty();
});
