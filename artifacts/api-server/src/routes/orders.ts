import { Router } from "express";
import { db, ordersTable, orderItemsTable, orderStatusHistoryTable, cartTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";

const router = Router();

const SHIPPING_THRESHOLD = 100; // free shipping above $100
const SHIPPING_COST = 15; // standard shipping $15

/** POST /api/orders/checkout */
router.post("/orders/checkout", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const {
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingCountry = "India",
      phone,
      notes,
      paymentMethod = "razorpay",
    } = req.body as Record<string, string | undefined>;

    if (!shippingAddress?.trim() || !shippingCity?.trim() || !shippingState?.trim() || !shippingPincode?.trim() || !phone?.trim()) {
      res.status(400).json({ error: "Shipping address, city, state, pincode, and phone are required" });
      return;
    }

    // Get user's cart items
    const cartRows = await db
      .select()
      .from(cartTable)
      .innerJoin(productsTable, eq(cartTable.productId, productsTable.id))
      .where(eq(cartTable.userId, userId));

    if (cartRows.length === 0) {
      res.status(400).json({ error: "Your cart is empty" });
      return;
    }

    const subtotal = cartRows.reduce((s, { cart, products }) => s + products.price * cart.quantity, 0);
    const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalAmount = subtotal + shippingCost;

    // Get user details
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    const isCod = paymentMethod === "cod";
    const initialStatus = isCod ? "confirmed" : "pending";
    const initialPaymentStatus = "pending";

    // Insert order into MySQL
    const [orderResult] = await db
      .insert(ordersTable)
      .values({
        userId,
        customerName: user ? user.name : "Guest",
        customerEmail: user ? user.email : "",
        customerPhone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingState: shippingState.trim(),
        shippingPincode: shippingPincode.trim(),
        shippingCountry: shippingCountry.trim() || "India",
        totalAmount,
        subtotal,
        shippingCost,
        notes: notes?.trim() || null,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        paymentMethod: isCod ? "cod" : "razorpay",
      });

    const orderId = orderResult.insertId;

    // Insert order items
    for (const { cart, products } of cartRows) {
      await db.insert(orderItemsTable).values({
        orderId,
        productId: products.id,
        productName: products.name,
        unitPrice: products.price,
        quantity: cart.quantity,
      });
    }

    // Insert initial status history
    await db.insert(orderStatusHistoryTable).values({
      orderId,
      status: initialStatus,
      note: isCod ? "Order placed with Cash on Delivery (COD)" : "Order placed, awaiting payment",
    });

    // Clear user cart
    await db.delete(cartTable).where(eq(cartTable.userId, userId));

    // Fetch newly created order object
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    res.status(201).json({ orderId, order, subtotal, shippingCost });
  } catch (err) {
    res.status(500).json({ error: "Checkout failed" });
  }
});

/** GET /api/orders */
router.get("/orders", requireUser, async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, req.session.userId!))
      .orderBy(desc(ordersTable.createdAt));

    res.json({ orders });
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/** GET /api/orders/:id */
router.get("/orders/:id", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const orderId = Number(req.params["id"] as string);

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)));

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

/** POST /api/orders/:id/cancel */
router.post("/orders/:id/cancel", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const orderId = Number(req.params["id"] as string);

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      res.status(400).json({ error: "This order cannot be cancelled" });
      return;
    }

    await db
      .update(ordersTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    await db.insert(orderStatusHistoryTable).values({
      orderId,
      status: "cancelled",
      note: "Cancelled by customer",
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
