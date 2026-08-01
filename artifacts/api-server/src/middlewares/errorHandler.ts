import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");
  if (res.headersSent) return;
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
