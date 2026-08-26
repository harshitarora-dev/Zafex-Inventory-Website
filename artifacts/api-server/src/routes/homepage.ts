import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, homepageConfigTable, productsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const DEFAULT_HOMEPAGE_CONFIG = {
  hero: {
    slides: [
      {
        image: "/images/hp-hero-1.png",
        headline: "Crafted for history.",
        subtitle: "Discover museum-worthy armor, chainmail, leather goods, and historical costumes made by master artisans.",
        ctaText: "Explore the collection →",
        ctaLink: "/shop",
      },
      {
        image: "/images/hp-hero-2.png",
        headline: "Authentic Medieval Craft.",
        subtitle: "Handcrafted functional armor, helmets, shields, and historical equipment for reenactors and collectors worldwide.",
        ctaText: "Shop New Arrivals →",
        ctaLink: "/shop?badge=new",
      },
    ],
  },
  newArrivals: {
    title: "NEW ARRIVALS",
    subtitle: "Freshly forged armor, handcrafted chainmail, and rare historical reproductions.",
    mode: "auto", // "auto" | "manual"
    productIds: [],
  },
  topSelling: {
    title: "Top Selling",
    subtitle: "Most demanded collector pieces and battle-ready gear chosen by reenactors.",
    mode: "auto", // "auto" | "manual"
    productIds: [],
  },
  featuredCollections: {
    title: "EXPLORE ZAFEX COLLECTIONS",
    subtitle: "Discover handcrafted armor, medieval gear, historical pieces, and fantasy creations inspired by legendary eras and worlds.",
    collections: [
      {
        name: "Roman Collection",
        href: "/shop?collection=roman",
        description: "Handcrafted Roman-inspired armor, helmets, shields, and accessories inspired by the legendary Roman era.",
        image: "/images/round-shields.png",
      },
      {
        name: "Viking Collection",
        href: "/shop?collection=viking",
        description: "Viking-inspired armor, helmets, chainmail, and accessories crafted for collectors, reenactors, and enthusiasts.",
        image: "/images/viking-helmet.png",
      },
      {
        name: "Templar Collection",
        href: "/shop?collection=templar",
        description: "Medieval Templar-inspired armor, helmets, chainmail, and accessories inspired by the legendary Knights Templar.",
        image: "/images/tamplar-crusader-shields.png",
      },
      {
        name: "Fantasy Collection",
        href: "/shop?collection=fantasy",
        description: "Enter a world of legendary warriors with handcrafted fantasy armor, costumes, helmets, and accessories.",
        image: "/images/arm-armor.png",
      },
      {
        name: "Women's Armor Collection",
        href: "/shop?collection=womens-armor",
        description: "Handcrafted armor, chainmail, and medieval accessories designed for women, cosplay, LARP, and historical-inspired looks.",
        image: "/images/leather-breastplates.png",
      },
      {
        name: "LARP & Cosplay Collection",
        href: "/shop?collection=larp",
        description: "Handcrafted armor, costumes, helmets, and accessories for LARP, cosplay, festivals, and fantasy events.",
        image: "/images/axes.png",
      },
      {
        name: "Cinematic & Character-Inspired Collection",
        href: "/shop?collection=movie-replicas",
        description: "Explore cinematic and character-inspired armor, helmets, and costume pieces crafted for collectors and enthusiasts.",
        image: "/images/full-body-armor.png",
      },
    ],
  },
  shopByMaterial: {
    badge: "MATERIAL SELECTION",
    title: "THE ART OF MATERIALS",
    subtitle: "Every ZafEx creation begins with carefully selected materials, shaped by skilled hands and inspired by history.",
    materials: [
      {
        name: "Iron & Steel",
        image: "/images/arm-armor.png",
        description: "Strong and durable metals used to create authentic armor, weapons, and historical-inspired pieces.",
      },
      {
        name: "Stainless Steel",
        image: "/images/full-body-armor.png",
        description: "Corrosion-resistant and durable stainless steel, ideal for long-lasting armor and collectible pieces.",
      },
      {
        name: "Lightweight Aluminium",
        image: "/images/viking-helmet.png",
        description: "Lightweight aluminium designed for comfortable wear while maintaining the look and character of traditional armor.",
      },
      {
        name: "Genuine Leather",
        image: "/images/leather-breastplates.png",
        description: "Premium genuine leather used for armor straps, belts, accessories, and handcrafted details.",
      },
      {
        name: "Natural Cotton",
        image: "/images/gambeson.png",
        description: "Natural cotton fabrics used for comfortable garments, costume elements, padding, and historical-inspired designs.",
      },
      {
        name: "Antique Brass",
        image: "/images/round-shields.png",
        description: "Antique brass accents and fittings that add an authentic vintage and historical character to each creation.",
      },
    ],
  },
  shopByRealm: {
    badge: "REALMS OF ZAFEX",
    title: "SHOP BY REALM",
    subtitle: "Explore handcrafted creations inspired by history, legendary warriors, fantasy worlds, and unforgettable characters.",
    realms: [
      {
        name: "HISTORICAL",
        description: "Authentic-inspired pieces from legendary eras and civilizations.",
        href: "/shop?realm=historical",
        badge: "Legacy",
        stripe: "bg-[#b98d46]",
        image: "/images/hp-hero-1.png",
      },
      {
        name: "ROMAN",
        description: "Armor, helmets, shields, and accessories inspired by ancient Rome.",
        href: "/shop?realm=roman",
        badge: "Imperium",
        stripe: "bg-[#7b6d59]",
        image: "/images/full-body-armor.png",
      },
      {
        name: "VIKING",
        description: "Norse-inspired armor, chainmail, helmets, and accessories.",
        href: "/shop?realm=viking",
        badge: "Valhalla",
        stripe: "bg-[#5f6c75]",
        image: "/images/viking-helmet.png",
      },
      {
        name: "TEMPLAR",
        description: "Medieval knightly armor and accessories inspired by the Knights Templar.",
        href: "/shop?realm=templar",
        badge: "Crusade",
        stripe: "bg-[#9e765b]",
        image: "/images/arm-armor.png",
      },
      {
        name: "FANTASY",
        description: "Legendary armor and creations inspired by mythical worlds and warriors.",
        href: "/shop?realm=fantasy",
        badge: "Mythic",
        stripe: "bg-[#7c678a]",
        image: "/images/hp-stl-1.png",
      },
      {
        name: "WOMEN'S ARMOR",
        description: "Handcrafted armor and medieval pieces designed for women.",
        href: "/shop?realm=womens-armor",
        badge: "Crafted",
        stripe: "bg-[#9d7278]",
        image: "/images/hp-stl-2.png",
      },
      {
        name: "LARP & COSPLAY",
        description: "Armor, costumes, helmets, and accessories for immersive characters and events.",
        href: "/shop?realm=larp-cosplay",
        badge: "Stage",
        stripe: "bg-[#5f7b7d]",
        image: "/images/hp-stl-3.png",
      },
      {
        name: "CINEMATIC & CHARACTER",
        description: "Character-inspired pieces created for collectors, performers, and enthusiasts.",
        href: "/shop?realm=cinematic-character",
        badge: "Screen",
        stripe: "bg-[#a55d3f]",
        image: "/images/hp-stl-4.png",
      },
    ],
  },
  whyChoose: {
    badge: "WHY ZAFEX",
    title: "Why Choose ZAFEX",
    subtitle: "Trusted by reenactors, performers, and collectors for premium materials, authentic detail, and reliable delivery.",
    pillars: [
      { label: "10+ Years Experience" },
      { label: "1000+ Unique Products" },
      { label: "25+ Countries Served" },
      { label: "100% Handmade Craft" },
      { label: "Premium Forged Steel" },
      { label: "Secure Fast Checkout" },
    ],
  },
  customerReviews: {
    title: "The ZafEx Experience",
    reviews: [
      {
        name: "Riya Kapoor",
        text: "Beautiful armour, excellent fit, and the team answered every question before shipping.",
        image: "/images/hp-gram-1.jpg",
        flag: "India",
        verified: true,
      },
      {
        name: "Marcus Lee",
        text: "Arrived quickly and looks amazing on stage. The chainmail is solid and comfortable.",
        image: "/images/hp-gram-2.jpg",
        flag: "USA",
        verified: true,
      },
      {
        name: "Elena Schmidt",
        text: "A gorgeous replica for my medieval wedding photos. Gorgeous finish and excellent quality.",
        image: "/images/hp-gram-3.jpg",
        flag: "Germany",
        verified: true,
      },
    ],
  },
  zafexCollection: {
    title: "THE ZAFEX COLLECTION",
    items: [
      { name: "MEDIEVAL CLOTHING", img: "/images/hp-stl-main.png", href: "/shop?category=medieval-clothing" },
      { name: "GAMBESONS", img: "/images/gambeson.png", href: "/shop?category=gambesons" },
      { name: "MEDIEVAL HELMETS", img: "/images/viking-helmet.png", href: "/shop?category=medieval-helmets" },
      { name: "PLATE ARMOR", img: "/images/full-body-armor.png", href: "/shop?category=plate-armor" },
      { name: "LEATHER ARMOR", img: "/images/leather-breastplates.png", href: "/shop?category=leather-armor" },
      { name: "SHIELDS", img: "/images/round-shields.png", href: "/shop?category=shields" },
      { name: "WEAPONS", img: "/images/axes.png", href: "/shop?category=weapons" },
      { name: "ACCESSORIES", img: "/images/hp-stl-4.png", href: "/shop?category=accessories" },
    ],
  },
  shopTheLook: {
    badge: "COMPLETE THE SET",
    title: "SHOP THE LOOK",
    subtitle: "Get the complete warrior's kit assembled by our LARP and reenactment specialists",
    mainImage: "/images/hp-stl-main.png",
    featuredAttireBadge: "FEATURED ATTIRE",
    featuredAttireTitle: "The Gothic Knight Commander",
    featuredAttireDesc: "A formidable compilation of hand-crafted steel, chainmail, and supple leather, built to project authority and withstand the demands of reenactment and display.",
    productIds: ["pa-1", "hm-6", "hm-3", "ac-1"],
  },
  featuredArsenal: {
    badge: "OUR ARSENAL",
    title: "Featured Collection",
    mode: "auto", // "auto" | "manual"
    productIds: [],
  },
  aboutZafex: {
    badge: "THE ZAFEX LEGACY",
    title: "About Zafex Collectibles",
    paragraph1: "We are dedicated artisans specializing in the creation of authentic, heirloom-quality medieval armor, functional historical equipment, and unique collectibles. Every piece that leaves our workshop is meticulously handcrafted with respect for historical accuracy and an uncompromising commitment to quality.",
    paragraph2: "From the resonant ring of our chainmail to the sturdy protection of our leather armor, we equip reenactors, theater productions, and history enthusiasts worldwide.",
    image: "/images/hp-stl-main.png",
    buttonText: "Learn More →",
    buttonLink: "/about",
  },
  trustStrip: {
    items: [
      { title: "NO ORDER BACKLOG", desc: "We dispatch active stock immediately. No long waiting queues." },
      { title: "WORLDWIDE SHIPPING", desc: "Expedited courier services right to your doorstep, globally." },
      { title: "100% SATISFIED", desc: "Easy size returns and refunds if your order doesn't fit or impress." },
      { title: "SECURE PAYMENTS", desc: "Pay via Razorpay, Cards, NetBanking or UPI – 100% safe & encrypted." },
    ],
  },
  instagramGrid: {
    badge: "SOCIAL",
    title: "FOLLOW US ON INSTAGRAM",
    images: [
      "/images/hp-gram-1.jpg",
      "/images/hp-gram-2.jpg",
      "/images/hp-gram-3.jpg",
      "/images/hp-gram-4.jpg",
      "/images/hp-gram-5.jpg",
      "/images/hp-gram-6.jpg",
      "/images/hp-gram-7.jpg",
    ],
  },
  newsletter: {
    badge: "STAY UPDATED",
    title: "JOIN THE ZAFEX CIRCLE",
    subtitle: "Subscribe for early access to new arrivals, exclusive collector's discounts, and stories from the world of historical armour and LARP.",
    buttonText: "SUBSCRIBE",
  },
};

function getTargetImageDirs(): string[] {
  const possibleDirs = [
    path.resolve(process.cwd(), "artifacts/zafex-collectibles/public/images"),
    path.resolve(process.cwd(), "zafex-collectibles/public/images"),
    path.resolve(process.cwd(), "public/images"),
    path.resolve(process.cwd(), "../zafex-collectibles/public/images"),
  ];
  return possibleDirs.filter((dir) => {
    try {
      return fs.existsSync(path.dirname(dir));
    } catch {
      return false;
    }
  });
}

function saveBase64Image(dataUrl: string): string | null {
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) return null;
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const filename = `hp_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

    const targetDirs = getTargetImageDirs();
    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
      } catch {}
    }
    return `/images/${filename}`;
  } catch {
    return null;
  }
}

// ── GET /api/homepage (Public) ─────────────────────────────────────────────
router.get("/homepage", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(homepageConfigTable)
      .where(eq(homepageConfigTable.id, "default"))
      .limit(1);

    if (rows.length > 0 && rows[0].data) {
      // Merge with defaults so any missing sections remain populated
      const merged = { ...DEFAULT_HOMEPAGE_CONFIG, ...(rows[0].data as Record<string, any>) };
      res.json(merged);
    } else {
      res.json(DEFAULT_HOMEPAGE_CONFIG);
    }
  } catch (err: unknown) {
    res.json(DEFAULT_HOMEPAGE_CONFIG);
  }
});

// ── GET /api/admin/homepage (Admin) ─────────────────────────────────────────
router.get("/admin/homepage", requireAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(homepageConfigTable)
      .where(eq(homepageConfigTable.id, "default"))
      .limit(1);

    const allProducts = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        image: productsTable.image,
        price: productsTable.price,
        badge: productsTable.badge,
        cat: productsTable.cat,
      })
      .from(productsTable);

    let config = DEFAULT_HOMEPAGE_CONFIG;
    if (rows.length > 0 && rows[0].data) {
      config = { ...DEFAULT_HOMEPAGE_CONFIG, ...(rows[0].data as Record<string, any>) };
    }

    res.json({ config, products: allProducts });
  } catch (err: unknown) {
    res.status(500).json({ error: "Failed to load homepage config: " + (err instanceof Error ? err.message : "") });
  }
});

// ── PUT /api/admin/homepage (Admin) ─────────────────────────────────────────
router.put("/admin/homepage", requireAdmin, async (req, res) => {
  try {
    const rawData = req.body;
    if (!rawData || typeof rawData !== "object") {
      res.status(400).json({ error: "Invalid homepage configuration data" });
      return;
    }

    // Process any base64 images within the incoming config
    const processObjectImages = (obj: any): any => {
      if (!obj) return obj;
      if (typeof obj === "string") {
        if (obj.startsWith("data:image/")) {
          const saved = saveBase64Image(obj);
          return saved || obj;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(processObjectImages);
      }
      if (typeof obj === "object") {
        const next: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          next[k] = processObjectImages(v);
        }
        return next;
      }
      return obj;
    };

    const cleanedConfig = processObjectImages(rawData);

    const existing = await db
      .select()
      .from(homepageConfigTable)
      .where(eq(homepageConfigTable.id, "default"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(homepageConfigTable)
        .set({ data: cleanedConfig, updatedAt: new Date() })
        .where(eq(homepageConfigTable.id, "default"));
    } else {
      await db.insert(homepageConfigTable).values({
        id: "default",
        data: cleanedConfig,
      });
    }

    res.json({ success: true, config: cleanedConfig });
  } catch (err: unknown) {
    res.status(500).json({ error: "Failed to save homepage config: " + (err instanceof Error ? err.message : "") });
  }
});

export default router;
