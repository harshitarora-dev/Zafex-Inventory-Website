import { Router } from "express";
import { db, wishlistTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";

const router = Router();

/** GET /api/wishlist */
router.get("/wishlist", requireUser, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(wishlistTable)
      .innerJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .where(eq(wishlistTable.userId, req.session.userId!));

    res.json({
      items: rows.map(({ wishlist, products }) => ({ ...wishlist, product: products })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

/** POST /api/wishlist */
router.post("/wishlist", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { productId } = req.body as { productId?: string };

    if (!productId) {
      res.status(400).json({ error: "productId is required" });
      return;
    }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const [existing] = await db
      .select()
      .from(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
    if (existing) {
      res.json({ item: { ...existing, product } });
      return;
    }

    const [item] = await db
      .insert(wishlistTable)
      .values({ userId, productId })
      .returning();
    res.status(201).json({ item: { ...item, product } });
  } catch {
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

/** DELETE /api/wishlist/:id */
router.delete("/wishlist/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);

    const [existing] = await db
      .select({ id: wishlistTable.id })
      .from(wishlistTable)
      .where(and(eq(wishlistTable.id, id), eq(wishlistTable.userId, userId)));
    if (!existing) {
      res.status(404).json({ error: "Wishlist item not found" });
      return;
    }

    await db.delete(wishlistTable).where(eq(wishlistTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;
