import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { requireUser } from "../middlewares/userAuth";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

const router = Router();
const SALT_ROUNDS = 10;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

function safeUser(user: typeof usersTable.$inferSelect) {
  const { password: _, ...rest } = user;
  return rest;
}

/** POST /api/auth/register */
router.post("/auth/register", authLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body as Record<string, string | undefined>;

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const [emailExists] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));
    if (emailExists) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    if (phone?.trim()) {
      const [phoneExists] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.phone, phone.trim()));
      if (phoneExists) {
        res.status(409).json({ error: "An account with this phone number already exists" });
        return;
      }
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      password: hashed,
    });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, result.insertId));

    req.session.userId = user.id;
    req.session.save(() => {
      res.status(201).json({ user: safeUser(user) });
    });
  } catch (err: unknown) {
    logger.error({ err }, "Registration error");
    res.status(500).json({ error: "Registration failed. " + (err instanceof Error ? err.message : "") });
  }
});

/** POST /api/auth/login */
router.post("/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    req.session.userId = user.id;
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    req.session.save(() => {
      res.json({ user: safeUser(user) });
    });
  } catch (err: unknown) {
    logger.error({ err }, "Login error");
    res.status(500).json({ error: "Login failed. " + (err instanceof Error ? err.message : "") });
  }
});

/** POST /api/auth/logout */
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

/** GET /api/auth/me */
router.get("/auth/me", async (req, res) => {
  try {
    if (!req.session?.userId) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId));
    if (!user) {
      res.status(401).json({ error: "Session invalid" });
      return;
    }
    res.json({ user: safeUser(user) });
  } catch {
    res.status(401).json({ error: "Not logged in" });
  }
});

/** PUT /api/auth/profile */
router.put("/auth/profile", requireUser, async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body as Record<string, string | undefined>;
    const userId = req.session.userId!;

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ error: "Name and email are required" });
      return;
    }

    const [emailConflict] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.email, email.toLowerCase().trim()), ne(usersTable.id, userId)));
    if (emailConflict) {
      res.status(409).json({ error: "This email is already in use" });
      return;
    }

    if (phone?.trim()) {
      const [phoneConflict] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(and(eq(usersTable.phone, phone.trim()), ne(usersTable.id, userId)));
      if (phoneConflict) {
        res.status(409).json({ error: "This phone number is already in use" });
        return;
      }
    }

    await db
      .update(usersTable)
      .set({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        avatar: avatar?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.json({ user: safeUser(updated) });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/** PUT /api/auth/password */
router.put("/auth/password", requireUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new password are required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId!));

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db
      .update(usersTable)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(usersTable.id, req.session.userId!));

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;
