import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/townhall" },
  // PostGIS owns these; never diff or drop them.
  extensionsFilters: ["postgis"],
  strict: true,
  verbose: true,
});
