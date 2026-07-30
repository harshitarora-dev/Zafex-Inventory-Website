# Zafex Collectibles

A historical weapons and armour e-commerce storefront for Zafex Enterprises (brand: Zafs, Est. Meerut).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS v4 + shadcn/ui |
| Backend | Express.js v5 (REST API) |
| Database | PostgreSQL via Drizzle ORM |
| Monorepo | pnpm workspaces |

## Structure

```
artifacts/
  zafex-collectibles/   # React frontend (port 5000)
  api-server/           # Express API (port 3000)
lib/
  db/                   # Drizzle ORM schema + client
  api-spec/             # Shared API types
  api-zod/              # Zod validation schemas
  api-client-react/     # React Query API client
```

## Running locally

Two workflows handle everything:

- **Start application** — `cd artifacts/zafex-collectibles && PORT=5000 BASE_PATH=/ pnpm dev`  
  Starts the Vite dev server at port 5000 (shown in the preview pane).

- **API Server** — managed by the `artifacts/api-server: API Server` workflow  
  Builds and starts the Express server at port 8080. Proxied to the frontend at `/api`.

The database (`DATABASE_URL`) is managed automatically by Replit.

## Database schema

Schema lives in `lib/db/src/schema/`. To push schema changes to the dev database:

```bash
cd lib/db && pnpm push
```

## User preferences

- Use pnpm (not npm or yarn) — enforced by the preinstall script.
