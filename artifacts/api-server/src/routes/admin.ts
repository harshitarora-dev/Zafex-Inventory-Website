import { Router } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { logger } from "../lib/logger";

const router = Router();

/** POST /api/admin/login */
router.post("/admin/login", (req, res) => {
  try {
    let body: any = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    const password = body?.password ?? (typeof body === "string" ? body : undefined);
    const p = String(password ?? "").trim();
    const configuredPassword = String(process.env["ADMIN_PASSWORD"] || "admin123").trim();

    // Allow configured password, admin123, or admin
    const valid =
      p.length > 0 &&
      (p === configuredPassword ||
        p === "admin123" ||
        p === "admin");

    if (!valid) {
      res.status(401).json({ error: "Invalid password. Default is admin123 or admin." });
      return;
    }

    req.session.adminAuthenticated = true;
    req.session.save((err) => {
      if (err) {
        logger.error({ err }, "Admin session save error");
      }
      res.json({ ok: true });
    });
  } catch (err: unknown) {
    logger.error({ err }, "Admin login error");
    res.status(500).json({ error: "Admin login error: " + (err instanceof Error ? err.message : "") });
  }
});

/** POST /api/admin/logout */
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

/** GET /api/admin/me — check auth status */
router.get("/admin/me", (req, res) => {
  if (req.session?.adminAuthenticated) {
    res.json({ authenticated: true });
    return;
  }
  res.status(401).json({ authenticated: false, error: "Unauthorized" });
});

export default router;
