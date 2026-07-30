import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

/* ── Image upload setup ────────────────────────────────────────────────── */
const IMAGES_DIR = path.resolve(
  process.cwd(),
  "..",
  "zafex-collectibles",
  "public",
  "images",
);
fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/* ── Helpers ────────────────────────────────────────────────────────────── */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateId(name: string) {
  return `${slugify(name).slice(0, 20)}-${Date.now().toString(36)}`;
}

/* ── GET /api/admin/products ─────────────────────────────────────────────*/
router.get("/admin/products", requireAdmin, async (_req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.createdAt);
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ── GET /api/admin/products/:id ─────────────────────────────────────────*/
router.get("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, req.params['id'] as string));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/* ── POST /api/admin/products — create ───────────────────────────────────*/
router.post(
  "/admin/products",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, cat, sub, price, badge, desc, tags, inStock } =
        req.body as Record<string, string | undefined>;

      if (!name || !cat || !sub || !price) {
        res.status(400).json({ error: "name, cat, sub and price are required" });
        return;
      }

      const imageFile = req.file;
      const imagePath = imageFile
        ? `/images/${imageFile.filename}`
        : "/images/placeholder.png";

      const id = generateId(name);

      const parsedTags = tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const [created] = await db
        .insert(productsTable)
        .values({
          id,
          name,
          cat,
          sub,
          price: Number(price),
          badge: badge || null,
          image: imagePath,
          desc: desc || null,
          tags: parsedTags.length ? parsedTags : null,
          inStock: inStock !== "false",
        })
        .returning();

      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: "Failed to create product" });
    }
  },
);

/* ── PUT /api/admin/products/:id — update ────────────────────────────────*/
router.put(
  "/admin/products/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, cat, sub, price, badge, desc, tags, inStock } =
        req.body as Record<string, string | undefined>;

      const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, req.params['id'] as string));
      if (!existing.length) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const imageFile = req.file;
      const imagePath = imageFile
        ? `/images/${imageFile.filename}`
        : (existing[0].image ?? "/images/placeholder.png");

      // Delete old image file if replaced
      if (imageFile && existing[0].image?.startsWith("/images/")) {
        const oldFile = path.join(
          IMAGES_DIR,
          path.basename(existing[0].image),
        );
        fs.unlink(oldFile, () => {}); // best-effort
      }

      const parsedTags =
        tags !== undefined
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : existing[0].tags ?? [];

      const updates: Partial<typeof existing[0]> = {
        ...(name && { name }),
        ...(cat && { cat }),
        ...(sub && { sub }),
        ...(price && { price: Number(price) }),
        badge: badge || null,
        ...(desc !== undefined && { desc: desc || null }),
        tags: parsedTags.length ? parsedTags : null,
        inStock: inStock !== undefined ? inStock !== "false" : existing[0].inStock,
        image: imagePath,
        updatedAt: new Date(),
      };

      const [updated] = await db
        .update(productsTable)
        .set(updates)
        .where(eq(productsTable.id, req.params['id'] as string))
        .returning();

      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update product" });
    }
  },
);

/* ── DELETE /api/admin/products/:id ─────────────────────────────────────*/
router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, req.params['id'] as string))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    // Delete image file if it was uploaded (not a pre-seeded image)
    if (deleted.image?.startsWith("/images/")) {
      const file = path.join(IMAGES_DIR, path.basename(deleted.image));
      fs.unlink(file, () => {});
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
