import { Router } from "express";
import { db, reviewsTable, usersTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";

const router = Router();

/** GET /api/products/:productId/reviews */
router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const productId = req.params["productId"] as string;

    const rows = await db
      .select({
        review: reviewsTable,
        userName: usersTable.name,
      })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(eq(reviewsTable.productId, productId))
      .orderBy(reviewsTable.createdAt);

    const reviews = rows.map(({ review, userName }) => ({
      ...review,
      user: { name: userName },
    }));

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    res.json({ reviews, averageRating, totalReviews });
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/** POST /api/products/:productId/reviews */
router.post("/products/:productId/reviews", requireUser, async (req, res) => {
  try {
    const productId = req.params["productId"] as string;
    const userId = req.session.userId!;
    const { rating, comment } = req.body as { rating?: number; comment?: string };

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const [product] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check for existing review
    const [existing] = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.userId, userId), eq(reviewsTable.productId, productId)));

    if (existing) {
      res.status(409).json({ error: "You have already reviewed this product. Edit your existing review." });
      return;
    }

    const [result] = await db
      .insert(reviewsTable)
      .values({
        userId,
        productId,
        rating: Number(rating),
        comment: comment?.trim() || null,
      });

    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.insertId));

    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.status(201).json({ review: { ...review, user: { name: user?.name || "User" } } });
  } catch {
    res.status(500).json({ error: "Failed to create review" });
  }
});

/** PUT /api/reviews/:id */
router.put("/reviews/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);
    const { rating, comment } = req.body as { rating?: number; comment?: string };

    const [existing] = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.userId, userId)));
    if (!existing) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    if (rating && (Number(rating) < 1 || Number(rating) > 5)) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    await db
      .update(reviewsTable)
      .set({
        ...(rating ? { rating: Number(rating) } : {}),
        ...(comment !== undefined ? { comment: comment.trim() || null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(reviewsTable.id, id));

    const [updated] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, id));

    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.json({ review: { ...updated, user: { name: user?.name || "User" } } });
  } catch {
    res.status(500).json({ error: "Failed to update review" });
  }
});

/** DELETE /api/reviews/:id */
router.delete("/reviews/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);

    const [existing] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.userId, userId)));
    if (!existing) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
