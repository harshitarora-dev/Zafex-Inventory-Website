import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "node:path";
import fs from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/errorHandler";

// Ensure session type augmentation is loaded
import type {} from "./types/session.d.ts";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const allowedOrigins = [
  "https://zafexcollectibles.com",
  "https://www.zafexcollectibles.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for easy Hostinger deployment
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.text({ type: "*/*", limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static images directory from all possible locations
const staticImageDirs = [
  path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public", "images"),
  path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "public"),
  path.resolve(process.cwd(), "artifacts", "zafex-collectibles", "dist", "public", "images"),
  path.resolve(process.cwd(), "hostinger-frontend", "images"),
  path.resolve(process.cwd(), "public", "images"),
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "public_html", "images"),
  path.resolve(process.cwd(), "..", "public_html", "images"),
  "/home/u933632718/domains/zafexcollectibles.com/public_html/images",
  "/home/u933632718/public_html/images",
];
for (const dir of staticImageDirs) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  app.use("/images", express.static(dir));
}

const localPublicDir = path.resolve(process.cwd(), "public");
try {
  fs.mkdirSync(localPublicDir, { recursive: true });
} catch {}
app.use(express.static(localPublicDir));

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env["SESSION_SECRET"] ?? "zafex-super-secret-session-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd && process.env["COOKIE_SECURE"] === "true", // set to true if HTTPS on Hostinger
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// Mount API routes
app.use("/api", router);

// Error Handler
app.use(errorHandler);

export default app;
