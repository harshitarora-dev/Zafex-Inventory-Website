import { Router } from "express";
import { db, cartTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";

const router = Router();

/** GET /api/cart */
router.get("/cart", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const rows = await db
      .select()
      .from(cartTable)
      .innerJoin(productsTable, eq(cartTable.productId, productsTable.id))
      .where(eq(cartTable.userId, userId));

    const items = rows.map(({ cart, products }) => ({ ...cart, product: products }));
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);

    res.json({ items, subtotal, itemCount });
  } catch {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

/** POST /api/cart */
router.post("/cart", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { productId, quantity = 1 } = req.body as { productId?: string; quantity?: number };

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
      .from(cartTable)
      .where(and(eq(cartTable.userId, userId), eq(cartTable.productId, productId)));

    if (existing) {
      const [updated] = await db
        .update(cartTable)
        .set({ quantity: existing.quantity + Number(quantity) })
        .where(eq(cartTable.id, existing.id))
        .returning();
      res.json({ item: { ...updated, product } });
    } else {
      const [item] = await db
        .insert(cartTable)
        .values({ userId, productId, quantity: Number(quantity) })
        .returning();
      res.status(201).json({ item: { ...item, product } });
    }
  } catch {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

/** PUT /api/cart/:id */
router.put("/cart/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);
    const { quantity } = req.body as { quantity?: number };

    if (!quantity || Number(quantity) < 1) {
      res.status(400).json({ error: "Quantity must be at least 1" });
      return;
    }

    const [existing] = await db
      .select()
      .from(cartTable)
      .where(and(eq(cartTable.id, id), eq(cartTable.userId, userId)));
    if (!existing) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    const [updated] = await db
      .update(cartTable)
      .set({ quantity: Number(quantity) })
      .where(eq(cartTable.id, id))
      .returning();

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, updated.productId));

    res.json({ item: { ...updated, product } });
  } catch {
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

/** DELETE /api/cart/:id */
router.delete("/cart/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);

    const [existing] = await db
      .select({ id: cartTable.id })
      .from(cartTable)
      .where(and(eq(cartTable.id, id), eq(cartTable.userId, userId)));
    if (!existing) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    await db.delete(cartTable).where(eq(cartTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

/** DELETE /api/cart — clear all */
router.delete("/cart", requireUser, async (req, res) => {
  try {
    await db.delete(cartTable).where(eq(cartTable.userId, req.session.userId!));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
