import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { aiCalls } from "@/lib/db/schema";

/**
 * A circuit breaker on discussion spend: once the last 24 hours of logged Claude cost passes the budget,
 * questions pause until it drops again. The Anthropic console's monthly limit is the hard stop; this keeps
 * one bad day from using the whole month. DISCUSS_DAILY_BUDGET_USD overrides the default.
 */
const budgetUsd = Number(process.env.DISCUSS_DAILY_BUDGET_USD ?? "10");

let cached: { at: number; spent: number } | undefined;

export async function overDailyBudget() {
  if (!(budgetUsd > 0)) return false;
  // One query a minute per instance is plenty; spend moves cents per question.
  if (!cached || Date.now() - cached.at > 60_000) {
    const [row] = await getDb()
      .select({ spent: sql<string>`coalesce(sum(${aiCalls.costUsd}), 0)` })
      .from(aiCalls)
      .where(and(eq(aiCalls.route, "discuss"), gte(aiCalls.createdAt, sql`now() - interval '24 hours'`)));
    cached = { at: Date.now(), spent: Number(row?.spent ?? 0) };
  }
  return cached.spent >= budgetUsd;
}
