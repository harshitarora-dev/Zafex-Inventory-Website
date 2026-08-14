import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

const IMAGES_DIR = path.resolve(
  process.cwd(),
  "..",
  "zafex-collectibles",
  "public",
  "images",
);

/* Fixed filename for each homepage image slot */
export const HOMEPAGE_IMAGE_MAP: Record<string, string> = {
  "hero-1":          "hp-hero-1.png",
  "hero-2":          "hp-hero-2.png",
  "cat-weaponry":    "hp-cat-weaponry.png",
  "cat-armour":      "hp-cat-armour.png",
  "cat-clothing":    "hp-cat-clothing.png",
  "cat-accessories": "hp-cat-accessories.png",
  "stl-main":        "hp-stl-main.png",
  "stl-1":           "hp-stl-1.png",
  "stl-2":           "hp-stl-2.png",
  "stl-3":           "hp-stl-3.png",
  "stl-4":           "hp-stl-4.png",
  "gram-1":          "hp-gram-1.jpg",
  "gram-2":          "hp-gram-2.jpg",
  "gram-3":          "hp-gram-3.jpg",
  "gram-4":          "hp-gram-4.jpg",
  "gram-5":          "hp-gram-5.jpg",
  "gram-6":          "hp-gram-6.jpg",
  "gram-7":          "hp-gram-7.jpg",
};

/* In-memory storage so we control the final filename */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/* GET /api/admin/homepage-images — list all slots with current path */
router.get("/admin/homepage-images", requireAdmin, (_req, res) => {
  const slots = Object.entries(HOMEPAGE_IMAGE_MAP).map(([key, filename]) => ({
    key,
    filename,
    path: `/images/${filename}`,
    exists: fs.existsSync(path.join(IMAGES_DIR, filename)),
  }));
  res.json({ slots });
});

/* PUT /api/admin/homepage-images/:key — replace image for a slot */
router.put(
  "/admin/homepage-images/:key",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    const { key } = req.params;
    const filename = HOMEPAGE_IMAGE_MAP[key];
    if (!filename) {
      res.status(400).json({ error: "Unknown homepage image key" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }
    const dest = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(dest, req.file.buffer);
    res.json({ ok: true, key, path: `/images/${filename}` });
  },
);

export default router;
