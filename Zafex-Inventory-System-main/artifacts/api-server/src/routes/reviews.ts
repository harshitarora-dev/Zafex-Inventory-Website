import { Router } from "express";
import { db, reviewsTable, usersTable, productsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";
import fs from "node:fs";
import path from "node:path";

const router = Router();

function getTargetImageDirs(): string[] {
  const dirs = new Set<string>();
  const absHostinger = "/home/u933632718/domains/zafexcollectibles.com/public_html/images";
  dirs.add(absHostinger);
  dirs.add(path.resolve(process.cwd(), "..", "public_html", "images"));
  dirs.add(path.resolve(process.cwd(), "public_html", "images"));
  dirs.add(path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images"));
  dirs.add(path.resolve(process.cwd(), "hostinger-frontend", "images"));
  return Array.from(dirs);
}

function saveBase64ReviewImage(dataUri: string): string | null {
  try {
    if (!dataUri || typeof dataUri !== "string") return null;
    const commaIdx = dataUri.indexOf(",");
    if (commaIdx === -1) return null;

    const header = dataUri.slice(0, commaIdx);
    const base64Data = dataUri.slice(commaIdx + 1);

    let ext = "jpg";
    if (header.includes("image/png")) ext = "png";
    else if (header.includes("image/webp")) ext = "webp";
    else if (header.includes("image/gif")) ext = "gif";

    const filename = `review-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");
    if (!buffer || buffer.length === 0) return null;

    for (const d of getTargetImageDirs()) {
      try {
        fs.mkdirSync(d, { recursive: true });
        fs.writeFileSync(path.join(d, filename), buffer);
      } catch {}
    }

    return `/images/${filename}`;
  } catch {
    return null;
  }
}

/** GET /api/products/:productId/reviews */
router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const productId = String(req.params["productId"] || "").trim();

    const rows = await db
      .select({
        review: reviewsTable,
        userName: usersTable.name,
        userAvatar: usersTable.avatar,
      })
      .from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));

    const reviews = rows.map(({ review, userName, userAvatar }) => {
      let parsedPhotos: string[] = [];
      if (review.photos) {
        if (Array.isArray(review.photos)) {
          parsedPhotos = review.photos;
        } else if (typeof review.photos === "string") {
          try {
            parsedPhotos = JSON.parse(review.photos);
          } catch {
            parsedPhotos = [];
          }
        }
      }

      return {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        rating: review.rating,
        title: review.title || null,
        comment: review.comment || "",
        photos: parsedPhotos,
        verified: review.verified ?? true,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          name: userName || "Verified Collector",
          avatar: userAvatar || null,
        },
      };
    });

    const totalReviews = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

    // Calculate star counts & percentages
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      starCounts[star] = (starCounts[star] || 0) + 1;
    }

    const starBreakdown: Record<number, { count: number; percentage: number }> = {
      5: { count: starCounts[5], percentage: totalReviews > 0 ? Math.round((starCounts[5] / totalReviews) * 100) : 0 },
      4: { count: starCounts[4], percentage: totalReviews > 0 ? Math.round((starCounts[4] / totalReviews) * 100) : 0 },
      3: { count: starCounts[3], percentage: totalReviews > 0 ? Math.round((starCounts[3] / totalReviews) * 100) : 0 },
      2: { count: starCounts[2], percentage: totalReviews > 0 ? Math.round((starCounts[2] / totalReviews) * 100) : 0 },
      1: { count: starCounts[1], percentage: totalReviews > 0 ? Math.round((starCounts[1] / totalReviews) * 100) : 0 },
    };

    res.json({
      reviews,
      averageRating,
      totalReviews,
      starBreakdown,
    });
  } catch (err) {
    console.error("[Reviews] Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/** POST /api/products/:productId/reviews */
router.post("/products/:productId/reviews", requireUser, async (req, res) => {
  try {
    const productId = String(req.params["productId"] || "").trim();
    const userId = req.session.userId!;
    const { rating, title, comment, photos: rawPhotos } = req.body as {
      rating?: number;
      title?: string;
      comment?: string;
      photos?: string[];
    };

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
      return;
    }

    if (!comment || !comment.trim()) {
      res.status(400).json({ error: "Review description/comment is required" });
      return;
    }

    // Process review photos (save base64 strings to disk)
    const savedPhotos: string[] = [];
    if (Array.isArray(rawPhotos)) {
      for (const p of rawPhotos) {
        if (typeof p === "string") {
          if (p.startsWith("data:image/")) {
            const saved = saveBase64ReviewImage(p);
            if (saved) savedPhotos.push(saved);
          } else if (p.trim()) {
            savedPhotos.push(p.trim());
          }
        }
      }
    }

    // Check for existing review by this user on this product
    const [existing] = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.userId, userId), eq(reviewsTable.productId, productId)));

    let reviewId: number;

    if (existing) {
      // Update existing review
      await db
        .update(reviewsTable)
        .set({
          rating: Math.round(Number(rating)),
          title: title?.trim() || null,
          comment: comment.trim(),
          photos: savedPhotos.length > 0 ? savedPhotos : existing.photos,
          verified: true,
          updatedAt: new Date(),
        })
        .where(eq(reviewsTable.id, existing.id));
      reviewId = existing.id;
    } else {
      // Insert new review
      const [insertRes] = await db
        .insert(reviewsTable)
        .values({
          userId,
          productId,
          rating: Math.round(Number(rating)),
          title: title?.trim() || null,
          comment: comment.trim(),
          photos: savedPhotos.length > 0 ? savedPhotos : null,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      reviewId = insertRes.insertId;
    }

    const [createdReview] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, reviewId));

    const [user] = await db
      .select({ name: usersTable.name, avatar: usersTable.avatar })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.status(201).json({
      review: {
        ...createdReview,
        user: {
          name: user?.name || "Verified Collector",
          avatar: user?.avatar || null,
        },
      },
    });
  } catch (err) {
    console.error("[Reviews] Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review. Please try again." });
  }
});

/** PUT /api/reviews/:id */
router.put("/reviews/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = Number(req.params["id"] as string);
    const { rating, title, comment, photos: rawPhotos } = req.body as {
      rating?: number;
      title?: string;
      comment?: string;
      photos?: string[];
    };

    const [existing] = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const savedPhotos: string[] = [];
    if (Array.isArray(rawPhotos)) {
      for (const p of rawPhotos) {
        if (typeof p === "string") {
          if (p.startsWith("data:image/")) {
            const saved = saveBase64ReviewImage(p);
            if (saved) savedPhotos.push(saved);
          } else if (p.trim()) {
            savedPhotos.push(p.trim());
          }
        }
      }
    }

    await db
      .update(reviewsTable)
      .set({
        ...(rating ? { rating: Math.max(1, Math.min(5, Math.round(Number(rating)))) } : {}),
        ...(title !== undefined ? { title: title.trim() || null } : {}),
        ...(comment !== undefined ? { comment: comment.trim() || null } : {}),
        ...(rawPhotos !== undefined ? { photos: savedPhotos.length > 0 ? savedPhotos : null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(reviewsTable.id, id));

    const [updated] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, id));

    const [user] = await db
      .select({ name: usersTable.name, avatar: usersTable.avatar })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.json({
      review: {
        ...updated,
        user: { name: user?.name || "Verified Collector", avatar: user?.avatar || null },
      },
    });
  } catch (err) {
    console.error("[Reviews] Error updating review:", err);
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
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    console.error("[Reviews] Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
