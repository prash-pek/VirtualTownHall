import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseUrl } from "@/lib/env";

import * as schema from "./schema";

function createDb() {
  const connectionString = databaseUrl();
  if (!connectionString) throw new Error("No database URL is set (DATABASE_URL or STORAGE1_DATABASE_URL)");
  const pool = new Pool({ connectionString, max: 5 });
  // Lets Fluid Compute close idle connections before a function instance is suspended.
  attachDatabasePool(pool);
  return drizzle(pool, { schema });
}

let db: ReturnType<typeof createDb> | undefined;

/** Lazily created so builds and tests that never touch the DB don't need a database URL. */
export function getDb() {
  db ??= createDb();
  return db;
}

export type Db = ReturnType<typeof getDb>;
