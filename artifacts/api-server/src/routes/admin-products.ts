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
    path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images"),
    path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "dist", "public", "images"),
    path.resolve(process.cwd(), "hostinger-frontend", "images"),
    path.resolve(process.cwd(), "public", "images"),
    path.resolve(process.cwd(), "public_html", "images"),
    path.resolve(process.cwd(), "..", "public_html", "images"),
    "/home/u933632718/domains/zafexcollectibles.com/public_html/images",
    "/home/u933632718/public_html/images",
    path.resolve(process.cwd(), "..", "zafex-collectibles", "public", "images"),
  ];
}

function getPrimaryImagesDir(): string {
  const localArtifactsDir = path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images");
  try { fs.mkdirSync(localArtifactsDir, { recursive: true }); } catch {}

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
  return localArtifactsDir;
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
      const {
        name,
        sku,
        brand,
        cat,
        sub,
        collection,
        price,
        mrp,
        discount,
        priceRangeMin,
        priceRangeMax,
        badge,
        desc: description,
        tags,
        inStock,
        stockCount,
        image: imageBase64,
        gallery: rawGallery,
        video,
        customerPhotos: rawCustomerPhotos,
        lifestyleImages: rawLifestyleImages,
        sizeChartImage: rawSizeChartImage,
        material,
        ringSize,
        ringType,
        gauge,
        finish,
        weight,
        manufacturingTime,
        country,
        hsCode,
        availability,
        estimatedDelivery,
        colors: rawColors,
        ebayUrl,
      } = req.body as Record<string, any>;

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

      // Process helper for multiple image arrays
      const processImageArray = (raw: any): string[] => {
        let list: string[] = [];
        let parsed: any = raw;
        if (typeof raw === "string") {
          try { parsed = JSON.parse(raw); } catch {}
        }
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === "string") {
              if (item.startsWith("data:image/")) {
                const saved = saveBase64Image(item);
                if (saved) list.push(saved);
              } else if (item.trim()) {
                list.push(item.trim());
              }
            }
          }
        }
        return list;
      };

      const galleryImages = processImageArray(rawGallery);
      if (galleryImages.length === 0 && imagePath) {
        galleryImages.push(imagePath);
      }

      const customerPhotos = processImageArray(rawCustomerPhotos).slice(0, 2);
      const lifestyleImages = processImageArray(rawLifestyleImages);

      let sizeChartImagePath: string | null = null;
      if (rawSizeChartImage && typeof rawSizeChartImage === "string") {
        if (rawSizeChartImage.startsWith("data:image/")) {
          sizeChartImagePath = saveBase64Image(rawSizeChartImage);
        } else if (rawSizeChartImage.trim()) {
          sizeChartImagePath = rawSizeChartImage.trim();
        }
      }

      const parseStringArray = (raw: any): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
          } catch {}
          return raw.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return [];
      };

      const sizesList = parseStringArray(req.body.sizes);
      const highlightsList = parseStringArray(req.body.highlights);
      const materialsList = parseStringArray(req.body.materials);

      let colorsList: string[] = [];
      if (rawColors) {
        if (Array.isArray(rawColors)) {
          colorsList = rawColors;
        } else if (typeof rawColors === "string") {
          try {
            colorsList = JSON.parse(rawColors);
          } catch {
            colorsList = rawColors.split(",").map((c: string) => c.trim()).filter(Boolean);
          }
        }
      }

      let priceRange: [number, number] | null = null;
      if (priceRangeMin || priceRangeMax) {
        priceRange = [Number(priceRangeMin) || Number(price) || 0, Number(priceRangeMax) || Number(price) || 0];
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
          sku: sku || null,
          name,
          brand: brand || "ZAFS",
          cat,
          sub,
          collection: collection || null,
          price: finalPrice,
          mrp: mrpNum,
          discount: discountNum,
          priceRange: priceRange,
          badge: badge || null,
          image: imagePath,
          gallery: galleryImages.length ? galleryImages : [imagePath],
          video: video || null,
          customerPhotos: customerPhotos.length ? customerPhotos : null,
          lifestyleImages: lifestyleImages.length ? lifestyleImages : null,
          sizeChartImage: sizeChartImagePath,
          material: material || null,
          ringSize: ringSize || null,
          ringType: ringType || null,
          gauge: gauge || null,
          finish: finish || null,
          weight: weight || null,
          manufacturingTime: manufacturingTime || null,
          country: country || "India",
          hsCode: hsCode || null,
          availability: availability || "In Stock",
          estimatedDelivery: estimatedDelivery || null,
          colors: colorsList.length ? colorsList : null,
          sizes: sizesList.length ? sizesList : null,
          highlights: highlightsList.length ? highlightsList : null,
          materials: materialsList.length ? materialsList : null,
          desc: description || null,
          tags: parsedTags.length ? parsedTags : null,
          inStock: inStock !== false && inStock !== "false",
          stockCount: stockCount ? Number(stockCount) : 100,
          ebayUrl: ebayUrl || null,
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
      const {
        name,
        sku,
        brand,
        cat,
        sub,
        collection,
        price,
        mrp,
        discount,
        priceRangeMin,
        priceRangeMax,
        badge,
        desc: description,
        tags,
        inStock,
        stockCount,
        image: imageBase64,
        gallery: rawGallery,
        video,
        customerPhotos: rawCustomerPhotos,
        lifestyleImages: rawLifestyleImages,
        sizeChartImage: rawSizeChartImage,
        material,
        ringSize,
        ringType,
        gauge,
        finish,
        weight,
        manufacturingTime,
        country,
        hsCode,
        availability,
        estimatedDelivery,
        colors: rawColors,
        ebayUrl,
      } = req.body as Record<string, any>;

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

      const processImageArray = (raw: any): string[] => {
        let list: string[] = [];
        let parsed: any = raw;
        if (typeof raw === "string") {
          try { parsed = JSON.parse(raw); } catch {}
        }
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === "string") {
              if (item.startsWith("data:image/")) {
                const saved = saveBase64Image(item);
                if (saved) list.push(saved);
              } else if (item.trim()) {
                list.push(item.trim());
              }
            }
          }
        }
        return list;
      };

      let galleryImages = rawGallery !== undefined ? processImageArray(rawGallery) : (existing[0].gallery ?? [imagePath]);
      if (galleryImages.length > 0) {
        if (!galleryImages.includes(imagePath)) {
          imagePath = galleryImages[0];
        }
      } else {
        galleryImages = [imagePath];
      }

      const customerPhotos = rawCustomerPhotos !== undefined ? processImageArray(rawCustomerPhotos).slice(0, 2) : existing[0].customerPhotos;
      const lifestyleImages = rawLifestyleImages !== undefined ? processImageArray(rawLifestyleImages) : existing[0].lifestyleImages;

      let sizeChartImagePath = existing[0].sizeChartImage;
      if (rawSizeChartImage !== undefined) {
        if (typeof rawSizeChartImage === "string" && rawSizeChartImage.startsWith("data:image/")) {
          sizeChartImagePath = saveBase64Image(rawSizeChartImage);
        } else {
          sizeChartImagePath = rawSizeChartImage || null;
        }
      }

      let colorsList = existing[0].colors;
      if (rawColors !== undefined) {
        let parsedColors: any = rawColors;
        if (typeof rawColors === "string") {
          try { parsedColors = JSON.parse(rawColors); } catch {
            parsedColors = rawColors.split(",").map((c: string) => c.trim()).filter(Boolean);
          }
        }
        if (Array.isArray(parsedColors)) {
          colorsList = parsedColors.map((c: any) => String(c).trim()).filter(Boolean);
        } else {
          colorsList = null;
        }
      }

      let priceRange = existing[0].priceRange;
      if (priceRangeMin !== undefined || priceRangeMax !== undefined) {
        if (priceRangeMin || priceRangeMax) {
          priceRange = [Number(priceRangeMin) || existing[0].price, Number(priceRangeMax) || existing[0].price];
        } else {
          priceRange = null;
        }
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
        ...(sku !== undefined && { sku: sku || null }),
        ...(brand !== undefined && { brand: brand || "ZAFS" }),
        ...(cat && { cat }),
        ...(sub && { sub }),
        ...(collection !== undefined && { collection: collection || null }),
        price: finalPrice,
        mrp: mrpNum,
        discount: discountNum,
        priceRange: priceRange,
        badge: badge !== undefined ? (badge || null) : existing[0].badge,
        image: imagePath,
        gallery: galleryImages,
        ...(video !== undefined && { video: video || null }),
        customerPhotos: customerPhotos?.length ? customerPhotos : null,
        lifestyleImages: lifestyleImages?.length ? lifestyleImages : null,
        sizeChartImage: sizeChartImagePath,
        ...(material !== undefined && { material: material || null }),
        ...(ringSize !== undefined && { ringSize: ringSize || null }),
        ...(ringType !== undefined && { ringType: ringType || null }),
        ...(gauge !== undefined && { gauge: gauge || null }),
        ...(finish !== undefined && { finish: finish || null }),
        ...(weight !== undefined && { weight: weight || null }),
        ...(manufacturingTime !== undefined && { manufacturingTime: manufacturingTime || null }),
        ...(country !== undefined && { country: country || "India" }),
        ...(hsCode !== undefined && { hsCode: hsCode || null }),
        ...(availability !== undefined && { availability: availability || "In Stock" }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery: estimatedDelivery || null }),
        colors: colorsList?.length ? colorsList : null,
        ...(req.body.sizes !== undefined && { sizes: parseStringArray(req.body.sizes).length ? parseStringArray(req.body.sizes) : null }),
        ...(req.body.highlights !== undefined && { highlights: parseStringArray(req.body.highlights).length ? parseStringArray(req.body.highlights) : null }),
        ...(req.body.materials !== undefined && { materials: parseStringArray(req.body.materials).length ? parseStringArray(req.body.materials) : null }),
        ...(description !== undefined && { desc: description || null }),
        tags: parsedTags.length ? parsedTags : null,
        inStock: inStock !== undefined ? (inStock !== false && inStock !== "false") : existing[0].inStock,
        ...(stockCount !== undefined && { stockCount: Number(stockCount) || 100 }),
        ...(ebayUrl !== undefined && { ebayUrl: ebayUrl || null }),
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
    } catch (err: unknown) {
      res.status(500).json({ error: "Failed to update product: " + (err instanceof Error ? err.message : "") });
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
