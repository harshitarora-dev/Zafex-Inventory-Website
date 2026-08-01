import { Router } from "express";
import { db, ordersTable, orderItemsTable, orderStatusHistoryTable, usersTable, contactsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

const VALID_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

/** GET /api/admin/orders */
router.get("/admin/orders", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query["page"] ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"] ?? 20)));
    const offset = (page - 1) * limit;

    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(ordersTable);

    res.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/** GET /api/admin/orders/:id */
router.get("/admin/orders/:id", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params["id"] as string);

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, orderId));

    const statusHistory = await db
      .select()
      .from(orderStatusHistoryTable)
      .where(eq(orderStatusHistoryTable.orderId, orderId))
      .orderBy(orderStatusHistoryTable.createdAt);

    res.json({ order, items, statusHistory });
  } catch {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

/** PUT /api/admin/orders/:id/status */
router.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params["id"] as string);
    const { status, note } = req.body as { status?: string; note?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
      return;
    }

    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    await db
      .update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    await db.insert(orderStatusHistoryTable).values({
      orderId,
      status,
      note: note?.trim() || null,
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

/** GET /api/admin/customers */
router.get("/admin/customers", requireAdmin, async (_req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        avatar: usersTable.avatar,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    res.json({ users });
  } catch {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

/** GET /api/admin/contacts */
router.get("/admin/contacts", requireAdmin, async (_req, res) => {
  try {
    const contacts = await db
      .select()
      .from(contactsTable)
      .orderBy(desc(contactsTable.createdAt));

    res.json({ contacts });
  } catch {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

export default router;
