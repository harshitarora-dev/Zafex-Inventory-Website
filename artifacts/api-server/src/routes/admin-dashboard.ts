import { Router } from "express";
import { db, ordersTable, usersTable, productsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

/** GET /api/admin/dashboard */
router.get("/admin/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [{ totalUsers }] = await db
      .select({ totalUsers: sql<number>`cast(count(*) as int)` })
      .from(usersTable);

    const [{ totalOrders }] = await db
      .select({ totalOrders: sql<number>`cast(count(*) as int)` })
      .from(ordersTable);

    const [{ revenue }] = await db
      .select({ revenue: sql<number>`coalesce(cast(sum(total_amount) as int), 0)` })
      .from(ordersTable)
      .where(eq(ordersTable.paymentStatus, "paid"));

    const [{ pendingOrders }] = await db
      .select({ pendingOrders: sql<number>`cast(count(*) as int)` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "pending"));

    const lowStockProducts = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.inStock, false));

    const recentOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    res.json({
      totalUsers,
      totalOrders,
      revenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
