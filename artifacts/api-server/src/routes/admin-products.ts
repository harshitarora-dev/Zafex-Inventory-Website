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
  const dirs = new Set<string>();

  // 1. Hostinger production directories
  const absHostinger = "/home/u933632718/domains/zafexcollectibles.com/public_html/images";
  dirs.add(absHostinger);

  const relHostinger = path.resolve(process.cwd(), "..", "public_html", "images");
  dirs.add(relHostinger);

  const cwdPublicHtml = path.resolve(process.cwd(), "public_html", "images");
  dirs.add(cwdPublicHtml);

  // 2. Local dev directories
  const localArtifacts = path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images");
  dirs.add(localArtifacts);

  const localHostinger = path.resolve(process.cwd(), "hostinger-frontend", "images");
  dirs.add(localHostinger);

  return Array.from(dirs);
}

function getPrimaryImagesDir(): string {
  const absHostinger = "/home/u933632718/domains/zafexcollectibles.com/public_html/images";
  if (fs.existsSync("/home/u933632718/domains/zafexcollectibles.com/public_html")) {
    try { fs.mkdirSync(absHostinger, { recursive: true }); } catch { }
    return absHostinger;
  }
  const relHostinger = path.resolve(process.cwd(), "..", "public_html", "images");
  if (fs.existsSync(path.resolve(process.cwd(), "..", "public_html"))) {
    try { fs.mkdirSync(relHostinger, { recursive: true }); } catch { }
    return relHostinger;
  }
  const localArtifactsDir = path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images");
  try { fs.mkdirSync(localArtifactsDir, { recursive: true }); } catch { }
  return localArtifactsDir;
}

function writeImageToAllDirs(filename: string, buffer: Buffer): void {
  for (const d of getTargetImageDirs()) {
    try {
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, filename), buffer);
    } catch { }
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getPrimaryImagesDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const uploadMedia = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

const safeUpload = (req: any, res: any, next: any) => {
  uploadMedia.single("image")(req, res, (err: any) => {
    if (err) {
      return next();
    }
    next();
  });
};

/* ── POST /api/admin/upload-media (Direct Fast Stream Upload) ────────────*/
router.post("/admin/upload-media", requireAdmin, uploadMedia.single("file"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file received" });
      return;
    }
    const filename = req.file.filename;
    try {
      const fileBuf = fs.readFileSync(req.file.path);
      writeImageToAllDirs(filename, fileBuf);
    } catch { }
    res.json({ url: `/images/${filename}` });
  } catch (err: any) {
    res.status(500).json({ error: "Upload failed: " + (err?.message || "") });
  }
});

function saveBase64Media(dataUri: string): string | null {
  try {
    if (!dataUri || typeof dataUri !== "string") return null;
    const commaIdx = dataUri.indexOf(",");
    if (commaIdx === -1) return null;

    const header = dataUri.slice(0, commaIdx);
    const base64Data = dataUri.slice(commaIdx + 1);

    let ext = "jpg";
    if (header.includes("video/mp4")) ext = "mp4";
    else if (header.includes("video/webm")) ext = "webm";
    else if (header.includes("video/quicktime") || header.includes("video/mov")) ext = "mov";
    else if (header.includes("video/ogg")) ext = "ogv";
    else if (header.includes("image/png")) ext = "png";
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

function saveBase64Image(dataUri: string): string | null {
  return saveBase64Media(dataUri);
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function parseStringArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch { }
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseSizesArray(raw: any): any[] {
  if (!raw) return [];
  let parsed: any = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw.split(",").map((s: string) => s.trim()).filter((s: string) => s && s !== "[object Object]");
    }
  }
  if (!Array.isArray(parsed)) return [];

  const list: any[] = [];
  for (const item of parsed) {
    if (!item) continue;
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (!trimmed || trimmed === "[object Object]") continue;
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const obj = JSON.parse(trimmed);
          const sanitized = sanitizeSizeObj(obj);
          if (sanitized) list.push(sanitized);
          continue;
        } catch { }
      }
      list.push(trimmed);
    } else if (typeof item === "object") {
      const sanitized = sanitizeSizeObj(item);
      if (sanitized) list.push(sanitized);
    }
  }
  return list;
}

function sanitizeSizeObj(obj: any): Record<string, any> | null {
  if (!obj || typeof obj !== "object") return null;
  const sizeName = typeof obj.size === "string" ? obj.size.trim() : String(obj.size || "").trim();
  if (!sizeName || sizeName === "[object Object]") return null;

  const imagesList: string[] = [];

  // Process multiple images if array provided
  if (Array.isArray(obj.images) && obj.images.length > 0) {
    for (const rawImg of obj.images) {
      if (typeof rawImg === "string") {
        const trimmed = rawImg.trim();
        if (trimmed.startsWith("data:image/")) {
          const saved = saveBase64Image(trimmed);
          if (saved && !imagesList.includes(saved)) imagesList.push(saved);
        } else if (trimmed && !imagesList.includes(trimmed)) {
          imagesList.push(trimmed);
        }
      }
    }
  } else if (obj.image && typeof obj.image === "string") {
    // Process single image fallback ONLY if images array was empty
    let singleImg = obj.image.trim();
    if (singleImg.startsWith("data:image/")) {
      const saved = saveBase64Image(singleImg);
      if (saved) singleImg = saved;
    }
    if (singleImg && !imagesList.includes(singleImg)) {
      imagesList.push(singleImg);
    }
  }

  const result: Record<string, any> = { size: sizeName };
  if (obj.price !== undefined && obj.price !== null && !isNaN(Number(obj.price))) {
    result.price = Math.round(Number(obj.price));
  }
  if (obj.mrp !== undefined && obj.mrp !== null && !isNaN(Number(obj.mrp))) {
    result.mrp = Math.round(Number(obj.mrp));
  }
  if (obj.stock !== undefined && obj.stock !== null && !isNaN(Number(obj.stock))) {
    result.stock = Math.round(Number(obj.stock));
  }
  if (imagesList.length > 0) {
    result.images = imagesList;
    result.image = imagesList[0];
  }
  return result;
}

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
        itemDetails,
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
          try { parsed = JSON.parse(raw); } catch { }
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

      const sizesList = parseSizesArray(req.body.sizes);
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

      let videoPath: string | null = null;
      if (video && typeof video === "string") {
        if (video.startsWith("data:video/") || video.startsWith("data:image/")) {
          videoPath = saveBase64Media(video);
        } else if (video.trim()) {
          videoPath = video.trim();
        }
      }

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
          video: videoPath,
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
          itemDetails: itemDetails || req.body.item_details || null,
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
    const productId = String(req.params["id"] || "").trim();
    if (!productId) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }

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
        desc,
        description: rawDescription,
        itemDetails,
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
        .where(eq(productsTable.id, productId));

      let existingRecord = existing[0];
      if (!existingRecord) {
        // Upsert fallback for initial catalog products
        existingRecord = {
          id: productId,
          name: name || "Product",
          sku: sku || productId,
          brand: brand || "ZAFS",
          cat: cat || "accessories",
          sub: sub || "general",
          collection: collection || null,
          price: Math.round(Number(price)) || 100,
          mrp: mrp ? Math.round(Number(mrp)) : null,
          discount: Math.round(Number(discount)) || 0,
          priceRange: null,
          badge: badge || null,
          image: "/images/full-body-armor.png",
          gallery: [],
          video: null,
          customerPhotos: null,
          lifestyleImages: null,
          sizeChartImage: null,
          material: material || null,
          ringSize: null,
          ringType: null,
          gauge: null,
          finish: null,
          weight: null,
          manufacturingTime: null,
          country: "India",
          hsCode: null,
          availability: "In Stock",
          estimatedDelivery: null,
          colors: null,
          sizes: null,
          highlights: null,
          materials: null,
          desc: null,
          itemDetails: null,
          tags: [],
          inStock: true,
          stockCount: 100,
          ebayUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        try {
          await db.insert(productsTable).values(existingRecord);
        } catch { }
      }

      let imagePath = existingRecord.image ?? "/images/full-body-armor.png";

      if (req.file) {
        imagePath = `/images/${req.file.filename}`;
        try {
          const fileBuf = fs.readFileSync(req.file.path);
          writeImageToAllDirs(req.file.filename, fileBuf);
        } catch { }
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
          try { parsed = JSON.parse(raw); } catch { }
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

      let galleryImages = rawGallery !== undefined ? processImageArray(rawGallery) : (existingRecord.gallery ?? [imagePath]);
      if (galleryImages.length > 0) {
        if (!galleryImages.includes(imagePath)) {
          imagePath = galleryImages[0];
        }
      } else {
        galleryImages = [imagePath];
      }

      const customerPhotos = rawCustomerPhotos !== undefined ? processImageArray(rawCustomerPhotos).slice(0, 2) : existingRecord.customerPhotos;
      const lifestyleImages = rawLifestyleImages !== undefined ? processImageArray(rawLifestyleImages) : existingRecord.lifestyleImages;

      let sizeChartImagePath = existingRecord.sizeChartImage;
      if (rawSizeChartImage !== undefined) {
        if (typeof rawSizeChartImage === "string" && rawSizeChartImage.startsWith("data:image/")) {
          sizeChartImagePath = saveBase64Image(rawSizeChartImage);
        } else {
          sizeChartImagePath = rawSizeChartImage || null;
        }
      }

      let colorsList = existingRecord.colors;
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

      let priceRange = existingRecord.priceRange;
      if (priceRangeMin !== undefined || priceRangeMax !== undefined) {
        if (priceRangeMin || priceRangeMax) {
          priceRange = [Math.round(Number(priceRangeMin)) || existingRecord.price, Math.round(Number(priceRangeMax)) || existingRecord.price];
        } else {
          priceRange = null;
        }
      }

      const parsedTags =
        tags !== undefined
          ? (typeof tags === "string" ? tags.split(",") : tags)
            .map((t: string) => String(t).trim())
            .filter(Boolean)
          : existingRecord.tags ?? [];

      let mrpNum = mrp !== undefined ? (mrp ? Math.round(Number(mrp)) : null) : existingRecord.mrp;
      let finalPrice = price !== undefined && price !== "" ? Math.round(Number(price)) : existingRecord.price;
      let discountNum =
        mrpNum && mrpNum > finalPrice && mrpNum > 0
          ? Math.round(((mrpNum - finalPrice) / mrpNum) * 100)
          : (discount !== undefined ? Math.round(Number(discount)) : (mrpNum && mrpNum > finalPrice ? Math.round(((mrpNum - finalPrice) / mrpNum) * 100) : 0));

      let videoPath: string | null | undefined = undefined;
      if (video !== undefined) {
        if (typeof video === "string" && (video.startsWith("data:video/") || video.startsWith("data:image/"))) {
          videoPath = saveBase64Media(video);
        } else if (typeof video === "string" && video.trim()) {
          videoPath = video.trim();
        } else {
          videoPath = null;
        }
      }

      const updates: Record<string, any> = {
        ...(name && { name }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(brand !== undefined && { brand: brand || "ZAFS" }),
        ...(cat && { cat }),
        ...(sub && { sub }),
        ...(collection !== undefined && { collection: collection || null }),
        price: finalPrice,
        mrp: mrpNum ?? null,
        discount: discountNum ?? 0,
        ...(priceRange !== undefined && { priceRange: priceRange || null }),
        badge: badge !== undefined ? (badge || null) : (existingRecord.badge ?? null),
        image: imagePath,
        gallery: galleryImages.length > 0 ? galleryImages : [imagePath],
        ...(video !== undefined && { video: videoPath || null }),
        customerPhotos: customerPhotos?.length ? customerPhotos : null,
        lifestyleImages: lifestyleImages?.length ? lifestyleImages : null,
        sizeChartImage: sizeChartImagePath ?? null,
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
        ...(req.body.sizes !== undefined && { sizes: parseSizesArray(req.body.sizes).length ? parseSizesArray(req.body.sizes) : null }),
        ...(req.body.highlights !== undefined && { highlights: parseStringArray(req.body.highlights).length ? parseStringArray(req.body.highlights) : null }),
        ...(req.body.materials !== undefined && { materials: parseStringArray(req.body.materials).length ? parseStringArray(req.body.materials) : null }),
        ...( (desc !== undefined || rawDescription !== undefined) && { desc: (desc ? String(desc).trim() : (rawDescription ? String(rawDescription).trim() : null)) } ),
        ...( (itemDetails !== undefined || req.body.item_details !== undefined) && { itemDetails: (itemDetails ? String(itemDetails).trim() : (req.body.item_details ? String(req.body.item_details).trim() : null)) } ),
        tags: parsedTags.length ? parsedTags : null,
        inStock: inStock !== undefined ? (inStock !== false && inStock !== "false") : (existingRecord.inStock ?? true),
        ...(stockCount !== undefined && { stockCount: Math.round(Number(stockCount)) || 100 }),
        ...(ebayUrl !== undefined && { ebayUrl: ebayUrl || null }),
        updatedAt: new Date(),
      };

      await db
        .update(productsTable)
        .set(updates)
        .where(eq(productsTable.id, productId));

      const [updated] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, productId));

      res.json(updated || { ok: true, id: productId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AdminProducts] Error updating product ${productId}:`, err);
      res.status(500).json({ error: `Failed to update product: ${msg}` });
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
      const filename = path.basename(existing.image);
      for (const d of getTargetImageDirs()) {
        try {
          fs.unlink(path.join(d, filename), () => {});
        } catch {}
      }
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
