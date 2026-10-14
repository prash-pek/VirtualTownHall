import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString, max: 5 });
  // Lets Fluid Compute close idle connections before a function instance is suspended.
  attachDatabasePool(pool);
  return drizzle(pool, { schema });
}

let db: ReturnType<typeof createDb> | undefined;

/** Lazily created so builds and tests that never touch the DB don't need DATABASE_URL. */
export function getDb() {
  db ??= createDb();
  return db;
}

export type Db = ReturnType<typeof getDb>;
