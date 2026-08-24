import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "mysql",
  dbCredentials: {
    url: process.env["DATABASE_URL"] || "mysql://root:@localhost:3306/zafex_db",
  },
});
