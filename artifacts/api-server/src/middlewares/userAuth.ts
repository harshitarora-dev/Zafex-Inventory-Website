import type { Request, Response, NextFunction } from "express";
import "../types/session";

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ error: "Please log in to continue" });
}
