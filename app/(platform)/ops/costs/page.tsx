import Link from "next/link";
import { desc, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { aiCalls } from "@/lib/db/schema";

import { requireAdminPage } from "../admin-gate";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
const time = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  dateStyle: "short",
  timeStyle: "medium",
});

/** Claude usage as logged per call (ai_calls). Costs are estimates at standard API prices. */
export default async function CostsPage() {
  await requireAdminPage();
  const db = getDb();
  const [calls, [totals]] = await Promise.all([
    db.select().from(aiCalls).orderBy(desc(aiCalls.createdAt)).limit(100),
    db
      .select({
        n: sql<number>`count(*)::int`,
        cost: sql<string>`coalesce(sum(${aiCalls.costUsd}), 0)`,
        today: sql<string>`coalesce(sum(${aiCalls.costUsd}) filter (where ${aiCalls.createdAt} > now() - interval '24 hours'), 0)`,
      })
      .from(aiCalls),
  ]);

  return (
    <main className="page">
      <div>
        <p className="eyebrow">
          <Link href="/ops" className="hover:text-olive">
            Platform admin
          </Link>
        </p>
        <h1 className="title mt-1">Claude usage</h1>
        <div className="title-rule" />
      </div>
      <p className="note">
        {totals?.n ?? 0} calls · {usd(Number(totals?.cost ?? 0))} total · {usd(Number(totals?.today ?? 0))} in the last
        24 hours. Estimated from logged tokens at standard API prices; cache writes count at 1.25x input.
      </p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b border-line">
              {[
                "Time (Pacific)",
                "Route",
                "Model",
                "Input",
                "Cache read",
                "Cache write",
                "Output",
                "Seconds",
                "Cost",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-b-0">
                <td className="px-3 py-2 whitespace-nowrap">{time.format(c.createdAt)}</td>
                <td className="px-3 py-2">{c.route}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.model}
                  {c.effort && ` (${c.effort})`}
                </td>
                <td className="px-3 py-2 text-right">{c.inputTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{c.cacheReadTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{c.cacheWriteTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{c.outputTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{c.latencyMs != null ? (c.latencyMs / 1000).toFixed(1) : ""}</td>
                <td className="px-3 py-2 text-right">{usd(Number(c.costUsd))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
