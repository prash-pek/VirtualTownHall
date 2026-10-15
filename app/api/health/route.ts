import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/client";
import { clerkEnabled, databaseUrl, redisConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Reports which providers are configured and whether the database answers. Never returns secrets. */
export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (databaseUrl()) {
    try {
      await getDb().execute(sql`select 1`);
      database = "ok";
    } catch {
      database = "error";
    }
  }
  return NextResponse.json({
    database,
    auth: clerkEnabled() ? "ok" : "unconfigured",
    ratelimit: redisConfig() ? "ok" : "unconfigured",
  });
}
