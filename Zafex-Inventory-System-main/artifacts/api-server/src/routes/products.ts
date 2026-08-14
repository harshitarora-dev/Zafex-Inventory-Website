import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { PRODUCTS } from "../data/products";

const router: IRouter = Router();

/**
 * GET /api/products
 * Returns the product catalogue from the database (falls back to static data).
 */
router.get("/products", async (req, res) => {
  const { cat, sub, badge, inStock, q } = req.query as Record<string, string | undefined>;

  try {
    let results = await db.select().from(productsTable).orderBy(productsTable.createdAt);

    // Fall back to static data if DB is empty
    if (results.length === 0) {
      let fallback = [...PRODUCTS];
      if (cat) fallback = fallback.filter((p) => p.cat === cat);
      if (sub) fallback = fallback.filter((p) => p.sub === sub);
      if (badge) fallback = fallback.filter((p) => p.badge === badge);
      if (inStock !== undefined)
        fallback = fallback.filter((p) => String(p.inStock !== false) === inStock);
      if (q) {
        const query = q.toLowerCase();
        fallback = fallback.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.cat.toLowerCase().includes(query) ||
            (p.desc ?? "").toLowerCase().includes(query) ||
            (p.tags ?? []).some((t) => t.toLowerCase().includes(query)),
        );
      }
      res.json({ products: fallback, total: fallback.length });
      return;
    }

    // Apply filters in memory (simple approach)
    if (cat) results = results.filter((p) => p.cat === cat);
    if (sub) results = results.filter((p) => p.sub === sub);
    if (badge) results = results.filter((p) => p.badge === badge);
    if (inStock !== undefined)
      results = results.filter((p) => String(p.inStock) === inStock);
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.cat.toLowerCase().includes(query) ||
          (p.desc ?? "").toLowerCase().includes(query) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(query)),
      );
    }

    res.json({ products: results, total: results.length });
  } catch {
    // DB error fallback
    let fallback = [...PRODUCTS];
    if (cat) fallback = fallback.filter((p) => p.cat === cat);
    if (sub) fallback = fallback.filter((p) => p.sub === sub);
    if (badge) fallback = fallback.filter((p) => p.badge === badge);
    if (q) {
      const query = q.toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.cat.toLowerCase().includes(query) ||
          (p.desc ?? "").toLowerCase().includes(query) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(query)),
      );
    }
    res.json({ products: fallback, total: fallback.length });
  }
});

/**
 * GET /api/products/:id
 */
router.get("/products/:id", async (req, res) => {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, req.params.id));
    if (product) {
      res.json(product);
      return;
    }
  } catch {
    // fall through to static
  }
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

export default router;
