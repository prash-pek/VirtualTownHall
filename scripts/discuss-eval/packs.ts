/**
 * Builds the per-item discussion source packs straight from data/oregon-2026 (verified JSON plus
 * outlet slates), mirroring what lib/discuss/run.ts loads from the database, so the eval needs no
 * database and sees the same prompt text production does.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ItemPack, PackSource } from "@/lib/discuss/pack";
import {
  outletSlateSchema,
  usable,
  verifiedCandidateSchema,
  verifiedMeasureSchema,
  type VerifiedCandidate,
  type VerifiedItem,
  type VerifiedMeasure,
} from "@/lib/seed/verified";

/** Two full test ballots (project memory: Portland Council District 3 address, and King City). */
export const ballots: Record<string, string[]> = {
  "portland-d3": [
    "race:or-us-senate",
    "race:or-governor",
    "race:or-us-house-3",
    "race:or-house-42",
    "race:multnomah-county-chair",
    "race:multnomah-county-auditor",
    "race:multnomah-county-sheriff",
    "race:portland-auditor",
    "race:portland-council-d3",
    "race:or-circuit-court-4-pos-2",
    "race:or-circuit-court-4-pos-14",
    "race:or-circuit-court-4-pos-6",
    "measure:portland-26-267",
  ],
  "king-city": [
    "race:or-us-senate",
    "race:or-governor",
    "race:or-us-house-6",
    "race:or-house-26",
    "race:or-senate-13",
    "race:washington-county-commissioner-at-large",
    "race:king-city-council",
    "measure:king-city-34-354",
  ],
};

type Inventory = {
  races: { id: string; office: string; district: string | null; candidate_ids: string[] }[];
  measures: { id: string; number: string; title: string; jurisdiction_id: string }[];
  jurisdictions: { id: string; name: string }[];
};

type Outlet = { endorser: string; statement: string; excerpt: string | null; url: string; publisher: string };

type Candidate = VerifiedCandidate & { name?: string; party?: string | null; incumbent?: boolean | null };

export type Dataset = {
  inventory: Inventory;
  candidates: Map<string, Candidate>;
  measures: Map<string, VerifiedMeasure>;
  outletsByCandidate: Map<string, Outlet[]>;
  outletsByMeasureSide: Map<string, Outlet[]>;
};

async function readJsonDir(dir: string): Promise<unknown[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
}

/** `root` is a data/oregon-2026 directory; outlet slates default to its endorsements/outlets. */
export async function loadDataset(root: string, outletsDir = join(root, "endorsements", "outlets")): Promise<Dataset> {
  const inventory = JSON.parse(await readFile(join(root, "inventory.json"), "utf8")) as Inventory;
  const candidates = new Map(
    (await readJsonDir(join(root, "verified", "candidates"))).map((raw) => {
      const c = verifiedCandidateSchema.parse(raw) as Candidate;
      return [c.id, c] as const;
    }),
  );
  const measures = new Map(
    (await readJsonDir(join(root, "verified", "measures"))).map((raw) => {
      const m = verifiedMeasureSchema.parse(raw);
      return [m.id, m] as const;
    }),
  );
  const outletsByCandidate = new Map<string, Outlet[]>();
  const outletsByMeasureSide = new Map<string, Outlet[]>();
  const push = (map: Map<string, Outlet[]>, key: string, o: Outlet) => map.set(key, [...(map.get(key) ?? []), o]);
  let slates: unknown[] = [];
  try {
    slates = await readJsonDir(outletsDir);
  } catch {
    // Older checkouts have no outlet slates.
  }
  for (const raw of slates) {
    const slate = outletSlateSchema.parse(raw);
    for (const e of slate.endorsements) {
      const o = {
        endorser: e.endorser,
        statement: e.statement,
        excerpt: e.excerpt ?? null,
        url: e.source,
        publisher: slate.outlet,
      };
      if (e.pick === "candidate" && e.candidate_id) push(outletsByCandidate, e.candidate_id, o);
      else if ((e.pick === "yes" || e.pick === "no") && e.measure_id)
        push(outletsByMeasureSide, `${e.measure_id}:${e.pick}`, o);
    }
  }
  return { inventory, candidates, measures, outletsByCandidate, outletsByMeasureSide };
}

const src = (i: Pick<VerifiedItem, "statement" | "excerpt" | "source">): PackSource => ({
  statement: i.statement,
  excerpt: i.excerpt ?? null,
  sourceUrl: i.source.url,
  publisher: i.source.publisher ?? null,
});

/** Same shape lib/discuss/run.ts `loadPack` builds from the database. Null when there's no content. */
export function packFor(ds: Dataset, itemKey: string): ItemPack | null {
  const [type, slug] = itemKey.split(":") as [string, string];
  if (type === "race") {
    const race = ds.inventory.races.find((r) => r.id === slug);
    if (!race) return null;
    const sides = race.candidate_ids.flatMap((id) => {
      const c = ds.candidates.get(id);
      if (!c) return [];
      const outlets = ds.outletsByCandidate.get(id) ?? [];
      return [
        {
          id,
          label: [c.name ?? id, c.party, c.incumbent ? "incumbent" : null].filter(Boolean).join(", "),
          facts: [...usable(c.bio), ...usable(c.positions), ...usable(c.voting_record)].map(src),
          endorsements: [
            ...usable(c.endorsements).map((e) => ({ ...src(e), endorser: e.endorser })),
            ...outlets.map((o) => ({
              statement: o.statement,
              excerpt: o.excerpt,
              sourceUrl: o.url,
              publisher: o.publisher,
              endorser: o.endorser,
            })),
          ],
        },
      ];
    });
    if (!sides.length) return null;
    return { kind: "race", title: [race.office, race.district].filter(Boolean).join(", "), background: [], sides };
  }
  const meta = ds.inventory.measures.find((m) => m.id === slug);
  const d = ds.measures.get(slug);
  if (type !== "measure" || !meta || !d) return null;
  const jurisdiction =
    ds.inventory.jurisdictions.find((j) => j.id === meta.jurisdiction_id)?.name ?? meta.jurisdiction_id;
  const official = (label: string, text: string | null | undefined): PackSource[] =>
    text
      ? [
          {
            statement: `${label}: ${text}`,
            excerpt: null,
            sourceUrl: d.full_text_url ?? null,
            publisher: "Official measure record",
          },
        ]
      : [];
  const args = usable(d.arguments);
  const side = (s: "yes" | "no") => ({
    id: s,
    label: `The case for ${s.toUpperCase()}`,
    facts: args.filter((a) => a.side === s && a.kind !== "explainer").map(src),
    endorsements: [
      ...usable(d.endorsements)
        .filter((e) => e.side === s)
        .map((e) => ({ ...src(e), endorser: e.endorser })),
      ...(ds.outletsByMeasureSide.get(`${slug}:${s}`) ?? []).map((o) => ({
        statement: o.statement,
        excerpt: o.excerpt,
        sourceUrl: o.url,
        publisher: o.publisher,
        endorser: o.endorser,
      })),
    ],
  });
  return {
    kind: "measure",
    title: `Measure ${meta.number}: ${meta.title} (${jurisdiction})`,
    background: [
      ...official("Summary", d.summary),
      ...official("A YES vote", d.yes_means),
      ...official("A NO vote", d.no_means),
      ...official("Fiscal impact", d.fiscal_impact),
      ...args.filter((a) => a.kind === "explainer").map(src),
    ],
    sides: [side("yes"), side("no")],
  };
}
