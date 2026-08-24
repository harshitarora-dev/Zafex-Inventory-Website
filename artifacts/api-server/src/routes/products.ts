import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { PRODUCTS } from "../data/products";

const router: IRouter = Router();

function parseTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * GET /api/products/search
 */
router.get("/products/search", async (req, res) => {
  const { q, limit: limitQuery } = req.query as { q?: string; limit?: string };
  const limit = Math.min(50, Math.max(1, Number(limitQuery ?? 10)));

  try {
    const allProducts = await db.select().from(productsTable);
    const source = allProducts.length > 0 ? allProducts : PRODUCTS;

    if (!q || !q.trim()) {
      res.json({ products: source.slice(0, limit) });
      return;
    }

    const query = q.toLowerCase().trim();
    const filtered = source.filter((p) => {
      const tags = parseTags(p.tags);
      return (
        p.name.toLowerCase().includes(query) ||
        p.cat.toLowerCase().includes(query) ||
        p.sub.toLowerCase().includes(query) ||
        (p.desc ?? "").toLowerCase().includes(query) ||
        tags.some((t) => t.toLowerCase().includes(query))
      );
    });

    res.json({ products: filtered.slice(0, limit) });
  } catch {
    const query = (q ?? "").toLowerCase().trim();
    const filtered = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.cat.toLowerCase().includes(query) ||
      (p.desc ?? "").toLowerCase().includes(query)
    );
    res.json({ products: filtered.slice(0, limit) });
  }
});

/**
 * GET /api/products
 * Returns products with filtering, search, pagination, and sorting.
 */
router.get("/products", async (req, res) => {
  const {
    cat,
    sub,
    badge,
    inStock,
    q,
    page: pageQuery,
    limit: limitQuery,
    sort,
  } = req.query as Record<string, string | undefined>;

  try {
    let results = await db.select().from(productsTable).orderBy(productsTable.createdAt);

    // Fall back to static data if DB is empty
    if (results.length === 0) {
      results = PRODUCTS as any;
    }

    let filtered = [...results];

    // Filter by Category
    if (cat) {
      filtered = filtered.filter((p) => p.cat.toLowerCase() === cat.toLowerCase());
    }

    // Filter by Subcategory
    if (sub) {
      filtered = filtered.filter((p) => p.sub.toLowerCase() === sub.toLowerCase());
    }

    // Filter by Badge
    if (badge) {
      filtered = filtered.filter((p) => p.badge?.toLowerCase() === badge.toLowerCase());
    }

    // Filter by Stock status
    if (inStock !== undefined) {
      const stockBool = inStock === "true" || inStock === "1";
      filtered = filtered.filter((p) => Boolean(p.inStock) === stockBool);
    }

    // Search query
    if (q) {
      const query = q.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const tags = parseTags(p.tags);
        return (
          p.name.toLowerCase().includes(query) ||
          p.cat.toLowerCase().includes(query) ||
          p.sub.toLowerCase().includes(query) ||
          (p.desc ?? "").toLowerCase().includes(query) ||
          tags.some((t) => t.toLowerCase().includes(query))
        );
      });
    }

    // Sort
    if (sort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    const total = filtered.length;
    const page = Math.max(1, Number(pageQuery ?? 1));
    const limit = limitQuery ? Math.max(1, Number(limitQuery)) : total;
    const totalPages = Math.ceil(total / (limit || 1)) || 1;
    const offset = (page - 1) * limit;
    const paginated = limitQuery ? filtered.slice(offset, offset + limit) : filtered;

    res.json({
      products: paginated,
      total,
      page,
      limit: limit || total,
      totalPages,
    });
  } catch {
    let fallback = [...PRODUCTS];
    if (cat) fallback = fallback.filter((p) => p.cat.toLowerCase() === cat.toLowerCase());
    if (sub) fallback = fallback.filter((p) => p.sub.toLowerCase() === sub.toLowerCase());
    if (q) {
      const query = q.toLowerCase();
      fallback = fallback.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.cat.toLowerCase().includes(query) ||
        (p.desc ?? "").toLowerCase().includes(query)
      );
    }
    res.json({
      products: fallback,
      total: fallback.length,
      page: 1,
      limit: fallback.length,
      totalPages: 1,
    });
  }
});

/**
 * GET /api/products/:id
 */
router.get("/products/:id", async (req, res) => {
  const id = req.params["id"] as string;
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (product) {
      res.json(product);
      return;
    }
  } catch {
    // fall through to static
  }
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

export default router;
