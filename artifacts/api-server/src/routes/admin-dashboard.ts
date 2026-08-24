import { Router } from "express";
import { db, ordersTable, usersTable, productsTable } from "@workspace/db";
import { eq, desc, count, sum } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

/** GET /api/admin/dashboard */
router.get("/admin/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [{ totalUsers }] = await db
      .select({ totalUsers: count() })
      .from(usersTable);

    const [{ totalOrders }] = await db
      .select({ totalOrders: count() })
      .from(ordersTable);

    const [revenueRes] = await db
      .select({ revenue: sum(ordersTable.totalAmount) })
      .from(ordersTable)
      .where(eq(ordersTable.paymentStatus, "paid"));

    const [{ pendingOrders }] = await db
      .select({ pendingOrders: count() })
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
      totalUsers: Number(totalUsers || 0),
      totalOrders: Number(totalOrders || 0),
      revenue: Number(revenueRes?.revenue || 0),
      pendingOrders: Number(pendingOrders || 0),
      lowStockProducts,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
