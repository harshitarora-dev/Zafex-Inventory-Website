import { Router } from "express";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "admin";

/** POST /api/admin/login */
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  req.session.adminAuthenticated = true;
  res.json({ ok: true });
});

/** POST /api/admin/logout */
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

/** GET /api/admin/me — check auth status */
router.get("/admin/me", requireAdmin, (_req, res) => {
  res.json({ authenticated: true });
});

export default router;
