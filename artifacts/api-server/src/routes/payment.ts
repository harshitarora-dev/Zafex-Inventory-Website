import { Router } from "express";
import { createHmac } from "node:crypto";
import Razorpay from "razorpay";
import { db, ordersTable, orderStatusHistoryTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";

const router = Router();

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  return {
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
    keySecret,
  };
}

/** POST /api/payment/create-order */
router.post("/payment/create-order", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { orderId } = req.body as { orderId?: number };

    if (!orderId) {
      res.status(400).json({ error: "orderId is required" });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, Number(orderId)), eq(ordersTable.userId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.paymentStatus === "paid") {
      res.status(400).json({ error: "Order is already paid" });
      return;
    }

    const rzp = getRazorpay();
    if (!rzp) {
      res.status(503).json({ error: "Payment gateway is not configured. Contact support or use COD." });
      return;
    }

    const rzpOrder = await rzp.client.orders.create({
      amount: order.totalAmount * 100, // paise
      currency: "INR",
      receipt: `order_${order.id}`,
    });

    await db
      .update(ordersTable)
      .set({ razorpayOrderId: rzpOrder.id, updatedAt: new Date() })
      .where(eq(ordersTable.id, order.id));

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: rzp.keyId,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

/** POST /api/payment/verify */
router.post("/payment/verify", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      orderId?: number;
    };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      res.status(400).json({ error: "All payment fields are required" });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, Number(orderId)), eq(ordersTable.userId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) {
      res.status(503).json({ error: "Payment gateway not configured" });
      return;
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await db
        .update(ordersTable)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(ordersTable.id, Number(orderId)));

      res.status(400).json({ success: false, error: "Payment verification failed" });
      return;
    }

    // Signature valid — mark as paid
    await db
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
        paymentId: razorpayPaymentId,
        paymentSignature: razorpaySignature,
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, Number(orderId)));

    await db.insert(orderStatusHistoryTable).values({
      orderId: Number(orderId),
      status: "confirmed",
      note: "Payment received via Razorpay",
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
