import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled server error");
  if (res.headersSent) return;

  let message = "Unable to process request right now. Please try again.";
  
  if (err instanceof Error) {
    // If it's a known validation or user-safe message
    if (!err.message.includes("SELECT") && !err.message.includes("INSERT") && !err.message.includes("UPDATE") && !err.message.includes("sql") && !err.message.includes("errno")) {
      message = err.message;
    }
  }

  res.status(500).json({ error: message, success: false });
}
