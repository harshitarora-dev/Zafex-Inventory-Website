import { Router } from "express";
import { db, contactsTable } from "@workspace/db";

const router = Router();

/** POST /api/contact */
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body as Record<string, string | undefined>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: "Name, email, and message are required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    await db.insert(contactsTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

export default router;
