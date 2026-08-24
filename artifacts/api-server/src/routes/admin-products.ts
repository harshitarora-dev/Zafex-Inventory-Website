import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { db, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

/* ── Image upload setup ────────────────────────────────────────────────── */
function getTargetImageDirs(): string[] {
  return [
    path.resolve(process.cwd(), "..", "public_html", "images"),
    path.resolve(process.cwd(), "public_html", "images"),
    "/home/u933632718/domains/zafexcollectibles.com/public_html/images",
    "/home/u933632718/public_html/images",
    path.resolve(process.cwd(), "public", "images"),
    path.resolve(process.cwd(), "dist", "public", "images"),
    path.resolve(process.cwd(), "..", "zafex-collectibles", "public", "images"),
  ];
}

function getPrimaryImagesDir(): string {
  const hostingerDir = path.resolve(process.cwd(), "..", "public_html", "images");
  if (fs.existsSync(path.resolve(process.cwd(), "..", "public_html"))) {
    try { fs.mkdirSync(hostingerDir, { recursive: true }); } catch {}
    return hostingerDir;
  }
  const absHostinger = "/home/u933632718/domains/zafexcollectibles.com/public_html/images";
  if (fs.existsSync("/home/u933632718/domains/zafexcollectibles.com/public_html")) {
    try { fs.mkdirSync(absHostinger, { recursive: true }); } catch {}
    return absHostinger;
  }
  const localDir = path.resolve(process.cwd(), "..", "zafex-collectibles", "public", "images");
  try { fs.mkdirSync(localDir, { recursive: true }); } catch {}
  return localDir;
}

function writeImageToAllDirs(filename: string, buffer: Buffer): void {
  for (const d of getTargetImageDirs()) {
    try {
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, filename), buffer);
    } catch {}
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getPrimaryImagesDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const safeUpload = (req: any, res: any, next: any) => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      return next();
    }
    next();
  });
};

function saveBase64Image(dataUri: string): string | null {
  try {
    if (!dataUri || typeof dataUri !== "string") return null;
    const commaIdx = dataUri.indexOf(",");
    if (commaIdx === -1 || !dataUri.startsWith("data:image/")) return null;

    const header = dataUri.slice(0, commaIdx);
    const base64Data = dataUri.slice(commaIdx + 1);

    let ext = "jpg";
    if (header.includes("image/png")) ext = "png";
    else if (header.includes("image/webp")) ext = "webp";
    else if (header.includes("image/gif")) ext = "gif";
    else if (header.includes("image/svg")) ext = "svg";

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");
    if (!buffer || buffer.length === 0) return null;

    writeImageToAllDirs(filename, buffer);
    return `/images/${filename}`;
  } catch {
    return null;
  }
}

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
      .orderBy(desc(productsTable.createdAt));
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ── GET /api/admin/products/:id ─────────────────────────────────────────*/
router.get("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params["id"] as string;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
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
  safeUpload,
  async (req, res) => {
    try {
      const { name, cat, sub, price, mrp, discount, badge, desc: description, tags, inStock, image: imageBase64, gallery: rawGallery } =
        req.body as Record<string, any>;

      if (!name || !cat || !sub || (!price && !mrp)) {
        res.status(400).json({ error: "name, cat, sub and price or mrp are required" });
        return;
      }

      let imagePath = "/images/full-body-armor.png";

      if (req.file) {
        imagePath = `/images/${req.file.filename}`;
      } else if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/")) {
        const saved = saveBase64Image(imageBase64);
        if (saved) imagePath = saved;
      } else if (imageBase64 && typeof imageBase64 === "string" && (imageBase64.startsWith("/images/") || imageBase64.startsWith("http"))) {
        imagePath = imageBase64;
      }

      // Process multiple gallery images
      let galleryImages: string[] = [];
      let parsedGallery: any = rawGallery;
      if (typeof rawGallery === "string") {
        try { parsedGallery = JSON.parse(rawGallery); } catch {}
      }
      if (Array.isArray(parsedGallery)) {
        for (const item of parsedGallery) {
          if (typeof item === "string") {
            if (item.startsWith("data:image/")) {
              const saved = saveBase64Image(item);
              if (saved) galleryImages.push(saved);
            } else if (item.trim()) {
              galleryImages.push(item.trim());
            }
          }
        }
      }
      if (galleryImages.length === 0 && imagePath) {
        galleryImages = [imagePath];
      }

      const id = generateId(name);

      const parsedTags = tags
        ? (typeof tags === "string" ? tags.split(",") : tags)
            .map((t: string) => String(t).trim())
            .filter(Boolean)
        : [];

      let mrpNum = mrp ? Number(mrp) : null;
      let finalPrice = price ? Number(price) : (mrpNum ?? 0);
      let discountNum =
        mrpNum && mrpNum > finalPrice && mrpNum > 0
          ? Math.round(((mrpNum - finalPrice) / mrpNum) * 100)
          : (discount ? Number(discount) : 0);

      await db
        .insert(productsTable)
        .values({
          id,
          name,
          cat,
          sub,
          price: finalPrice,
          mrp: mrpNum,
          discount: discountNum,
          badge: badge || null,
          image: imagePath,
          gallery: galleryImages.length ? galleryImages : [imagePath],
          desc: description || null,
          tags: parsedTags.length ? parsedTags : null,
          inStock: inStock !== false && inStock !== "false",
        });

      const [created] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));

      res.status(201).json(created);
    } catch (err: unknown) {
      res.status(500).json({ error: "Failed to create product: " + (err instanceof Error ? err.message : "") });
    }
  },
);

/* ── PUT /api/admin/products/:id — update ────────────────────────────────*/
router.put(
  "/admin/products/:id",
  requireAdmin,
  safeUpload,
  async (req, res) => {
    try {
      const id = req.params["id"] as string;
      const { name, cat, sub, price, mrp, discount, badge, desc: description, tags, inStock, image: imageBase64, gallery: rawGallery } =
        req.body as Record<string, any>;

      const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));
      if (!existing.length) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      let imagePath = existing[0].image ?? "/images/full-body-armor.png";

      if (req.file) {
        imagePath = `/images/${req.file.filename}`;
        try {
          const fileBuf = fs.readFileSync(req.file.path);
          writeImageToAllDirs(req.file.filename, fileBuf);
        } catch {}
      } else if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/")) {
        const saved = saveBase64Image(imageBase64);
        if (saved) imagePath = saved;
      } else if (imageBase64 && typeof imageBase64 === "string" && (imageBase64.startsWith("/images/") || imageBase64.startsWith("http"))) {
        imagePath = imageBase64;
      }

      // Process multiple gallery images
      let galleryImages: string[] = [];
      if (rawGallery !== undefined) {
        let parsedGallery: any = rawGallery;
        if (typeof rawGallery === "string") {
          try { parsedGallery = JSON.parse(rawGallery); } catch {}
        }
        if (Array.isArray(parsedGallery)) {
          for (const item of parsedGallery) {
            if (typeof item === "string") {
              if (item.startsWith("data:image/")) {
                const saved = saveBase64Image(item);
                if (saved) galleryImages.push(saved);
              } else if (item.trim()) {
                galleryImages.push(item.trim());
              }
            }
          }
        }
      }

      if (galleryImages.length > 0) {
        if (!galleryImages.includes(imagePath)) {
          imagePath = galleryImages[0];
        }
      } else {
        galleryImages = [imagePath];
      }

      const parsedTags =
        tags !== undefined
          ? (typeof tags === "string" ? tags.split(",") : tags)
              .map((t: string) => String(t).trim())
              .filter(Boolean)
          : existing[0].tags ?? [];

      let mrpNum = mrp !== undefined ? (mrp ? Number(mrp) : null) : existing[0].mrp;
      let finalPrice = price !== undefined && price !== "" ? Number(price) : existing[0].price;
      let discountNum =
        mrpNum && mrpNum > finalPrice && mrpNum > 0
          ? Math.round(((mrpNum - finalPrice) / mrpNum) * 100)
          : (discount !== undefined ? Number(discount) : (mrpNum && mrpNum > finalPrice ? Math.round(((mrpNum - finalPrice) / mrpNum) * 100) : 0));

      const updates: Partial<typeof existing[0]> = {
        ...(name && { name }),
        ...(cat && { cat }),
        ...(sub && { sub }),
        price: finalPrice,
        mrp: mrpNum,
        discount: discountNum,
        badge: badge !== undefined ? (badge || null) : existing[0].badge,
        ...(description !== undefined && { desc: description || null }),
        tags: parsedTags.length ? parsedTags : null,
        inStock: inStock !== undefined ? (inStock !== false && inStock !== "false") : existing[0].inStock,
        image: imagePath,
        gallery: galleryImages,
        updatedAt: new Date(),
      };

      await db
        .update(productsTable)
        .set(updates)
        .where(eq(productsTable.id, id));

      const [updated] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));

      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update product" });
    }
  },
);

/* ── DELETE /api/admin/products/:id ─────────────────────────────────────*/
router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params["id"] as string;
    const [existing] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db
      .delete(productsTable)
      .where(eq(productsTable.id, id));

    // Delete image file if it was uploaded
    if (existing.image?.startsWith("/images/")) {
      const file = path.join(IMAGES_DIR, path.basename(existing.image));
      fs.unlink(file, () => {});
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
