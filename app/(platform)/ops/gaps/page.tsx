import Link from "next/link";
import { desc, gt, sql } from "drizzle-orm";

import { getCatalog } from "@/lib/ballot/catalog";
import { topicLabel } from "@/lib/ballot/issues";
import { itemHref, itemTitle } from "@/lib/ballot/types";
import { getDb } from "@/lib/db/client";
import { sourceGaps } from "@/lib/db/schema";

import { requireAdminPage } from "../admin-gate";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";

/**
 * Topics voters asked about that our sources couldn't answer, from the last 30 days. Only the topic is
 * logged, never the question. The weekly issue sweep (ISSUE_SWEEP.md) takes the top rows as extra topics.
 */
export default async function GapsPage() {
  await requireAdminPage();
  const [logged, catalog] = await Promise.all([
    getDb()
      .select({ itemKey: sourceGaps.itemKey, topic: sourceGaps.topic, sides: sourceGaps.uncoveredSides })
      .from(sourceGaps)
      .where(gt(sourceGaps.createdAt, sql`now() - interval '30 days'`))
      .orderBy(desc(sourceGaps.createdAt))
      .limit(5000),
    getCatalog(),
  ]);
  const grouped = new Map<string, { itemKey: string; topic: string; times: number; sides: Set<string> }>();
  for (const g of logged) {
    const k = `${g.itemKey} ${g.topic}`;
    const row = grouped.get(k) ?? { itemKey: g.itemKey, topic: g.topic, times: 0, sides: new Set<string>() };
    row.times++;
    for (const s of g.sides) row.sides.add(s);
    grouped.set(k, row);
  }
  const rows = [...grouped.values()].sort((a, b) => b.times - a.times).slice(0, 200);
  const items = new Map([...catalog.races, ...catalog.measures].map((i) => [i.key as string, i]));
  const names = new Map(catalog.races.flatMap((r) => r.candidates.map((c) => [c.slug, c.name] as const)));

  return (
    <main className="page">
      <div>
        <p className="eyebrow">
          <Link href="/ops" className="hover:text-olive">
            Platform admin
          </Link>
        </p>
        <h1 className="title mt-1">Questions our sources couldn&apos;t answer</h1>
        <div className="title-rule" />
      </div>
      <p className="note">
        The last 30 days, by race or measure and topic. We log only the topic, never the question. The weekly issue
        sweep searches the top rows for every candidate in that race.
      </p>
      {rows.length === 0 ? (
        <p className="card text-muted">Nothing yet.</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-line">
                {["Race or measure", "Topic", "Times", "Not covered for"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const item = items.get(r.itemKey);
                return (
                  <tr key={`${r.itemKey} ${r.topic}`} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2">
                      {item ? (
                        <Link href={itemHref(item)} className="link">
                          {itemTitle(item)}
                        </Link>
                      ) : (
                        r.itemKey
                      )}
                    </td>
                    <td className="px-3 py-2">{topicLabel(r.topic) ?? r.topic}</td>
                    <td className="px-3 py-2 text-right">{r.times}</td>
                    <td className="px-3 py-2">{[...r.sides].map((s) => names.get(s) ?? s.toUpperCase()).join(", ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
