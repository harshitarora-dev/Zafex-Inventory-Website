import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, asc, desc, ilike, or, sql } from "drizzle-orm";
import { PRODUCTS } from "../data/products";

const router: IRouter = Router();

const VALID_SORTS = ["newest", "price_asc", "price_desc", "name_asc"] as const;

/**
 * GET /api/products/search?q=&limit=5
 * Live-search suggestions — must be defined before /products/:id
 */
router.get("/products/search", async (req, res) => {
  const q = String(req.query["q"] ?? "").trim();
  const limit = Math.min(20, Math.max(1, Number(req.query["limit"] ?? 5)));

  if (!q) {
    res.json({ products: [] });
    return;
  }

  try {
    const results = await db
      .select()
      .from(productsTable)
      .where(
        or(
          ilike(productsTable.name, `%${q}%`),
          ilike(productsTable.cat, `%${q}%`),
          ilike(productsTable.sub, `%${q}%`),
          ilike(productsTable.desc, `%${q}%`),
        ),
      )
      .limit(limit);

    res.json({ products: results });
  } catch {
    const query = q.toLowerCase();
    const fallback = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.cat.toLowerCase().includes(query) ||
        (p.desc ?? "").toLowerCase().includes(query),
    ).slice(0, limit);
    res.json({ products: fallback });
  }
});

/**
 * GET /api/products
 */
router.get("/products", async (req, res) => {
  const {
    cat,
    sub,
    badge,
    inStock,
    q,
    page: rawPage = "1",
    limit: rawLimit = "12",
    sort = "newest",
  } = req.query as Record<string, string | undefined>;

  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 12));
  const offset = (page - 1) * limit;

  try {
    let results = await db.select().from(productsTable);

    // Filters
    if (cat) results = results.filter((p) => p.cat === cat);
    if (sub) results = results.filter((p) => p.sub === sub);
    if (badge) results = results.filter((p) => p.badge === badge);
    if (inStock !== undefined) results = results.filter((p) => String(p.inStock) === inStock);
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

    // Sort
    if (sort === "price_asc") results.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") results.sort((a, b) => b.price - a.price);
    else if (sort === "name_asc") results.sort((a, b) => a.name.localeCompare(b.name));
    else results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const products = results.slice(offset, offset + limit);

    res.json({ products, total, page, limit, totalPages });
  } catch {
    // DB error — fallback to static data
    let fallback = [...PRODUCTS];
    if (cat) fallback = fallback.filter((p) => p.cat === cat);
    if (sub) fallback = fallback.filter((p) => p.sub === sub);
    const total = fallback.length;
    const products = fallback.slice(offset, offset + limit);
    res.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
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
      .where(eq(productsTable.id, req.params["id"] as string));
    if (product) {
      res.json(product);
      return;
    }
  } catch {
    // fall through to static
  }
  const product = PRODUCTS.find((p) => p.id === (req.params["id"] as string));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

export default router;
