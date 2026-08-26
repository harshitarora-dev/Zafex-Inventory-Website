import fs from "node:fs";
import path from "node:path";
import app from "./app";
import { logger } from "./lib/logger";
import { db, productsTable, initDatabase } from "@workspace/db";
import { PRODUCTS } from "./data/products";

// Native .env parser without external dependencies
try {
  const envPaths = [
    path.resolve(process.cwd(), "artifacts", "api-server", ".env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "..", "..", "artifacts", "api-server", ".env"),
    "/home/u933632718/domains/zafexcollectibles.com/backend/.env",
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          process.env[k] = v;
        }
      }
      break;
    }
  }
} catch {}

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/** Sync any missing products from the full catalogue into MySQL */
async function syncAllProducts() {
  try {
    const existing = await db.select().from(productsTable);
    const existingIds = new Set(existing.map((p) => p.id));

    let addedCount = 0;
    for (const p of PRODUCTS) {
      if (!existingIds.has(p.id)) {
        await db.insert(productsTable).values({
          id: p.id,
          name: p.name,
          cat: p.cat,
          sub: p.sub,
          price: p.price,
          mrp: (p as any).mrp ?? null,
          discount: (p as any).discount ?? null,
          badge: p.badge ?? null,
          image: p.image,
          gallery: (p as any).gallery ?? [p.image],
          desc: p.desc ?? null,
          tags: p.tags ?? null,
          inStock: p.inStock ?? true,
        });
        addedCount++;
      }
    }
    if (addedCount > 0) {
      logger.info({ added: addedCount, totalInCatalog: PRODUCTS.length }, "Synced full product catalogue into MySQL");
    }
  } catch (err) {
    logger.warn({ err }, "Could not sync products catalogue to MySQL");
  }
}

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection (prevented crash)");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception (prevented crash)");
});

const server = app.listen(port, "0.0.0.0", async () => {
  logger.info({ port }, `Server listening on http://0.0.0.0:${port}`);
  try {
    await initDatabase();
    logger.info("MySQL Database schema initialized successfully");
    await syncAllProducts();
  } catch (err) {
    logger.warn({ err }, "Database auto-init notice: ensure MySQL is running");
  }
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    logger.error({ port }, `Port ${port} is in use. Please kill existing process before restarting.`);
  } else {
    logger.error({ err }, "Server error");
  }
});
