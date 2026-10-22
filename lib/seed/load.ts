/**
 * Reads the seed data files for the importers and the import check. Each loader also returns a
 * fingerprint of its input files plus the code that imports them, so an import whose inputs match an
 * earlier finished run can be skipped (keyed in ingestion_runs.scope).
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { checkInventoryIntegrity, inventorySchema, type Inventory } from "./inventory";
import { planVerified, type VerifiedPlan } from "./plan";
import {
  outletSlateSchema,
  pamphletHeadlinesSchema,
  verifiedCandidateSchema,
  verifiedIssueSweepSchema,
  verifiedMeasureSchema,
} from "./verified";

const short = (h: ReturnType<typeof createHash>) => h.digest("hex").slice(0, 16);

export async function loadInventory(path: string): Promise<{ inv: Inventory; fingerprint: string }> {
  const fingerprint = createHash("sha256");
  for (const f of ["scripts/import-inventory.ts", "lib/seed/inventory.ts", "lib/seed/load.ts"])
    fingerprint.update(await readFile(f, "utf8"));
  const text = await readFile(path, "utf8");
  fingerprint.update(`${path}\0${text}`);
  const inv = inventorySchema.parse(JSON.parse(text));
  const problems = checkInventoryIntegrity(inv);
  if (problems.length) throw new Error(`inventory has ${problems.length} integrity problems:\n${problems.join("\n")}`);
  return { inv, fingerprint: short(fingerprint) };
}

export async function loadVerified(dir: string): Promise<{ plan: VerifiedPlan; fingerprint: string }> {
  const fingerprint = createHash("sha256");
  for (const f of ["scripts/import-verified.ts", "lib/seed/verified.ts", "lib/seed/plan.ts", "lib/seed/load.ts"])
    fingerprint.update(await readFile(f, "utf8"));

  async function readAll<T>(folder: string, parse: (v: unknown) => T, optional = false): Promise<T[]> {
    const listing = await readdir(folder).catch((e: NodeJS.ErrnoException) => {
      if (optional && e.code === "ENOENT") return [];
      throw e;
    });
    const out: T[] = [];
    for (const f of listing.filter((f) => f.endsWith(".json")).sort()) {
      const path = join(folder, f);
      const text = await readFile(path, "utf8");
      fingerprint.update(`${path}\0${text}\0`);
      out.push(parse(JSON.parse(text)));
    }
    return out;
  }

  // Pamphlet background lines (pipeline/pamphlet_headlines.py), next to the verified folder.
  const headlinesPath = join(dir, "..", "pamphlet-headlines.json");
  const headlinesText = await readFile(headlinesPath, "utf8").catch((e: NodeJS.ErrnoException) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (headlinesText) fingerprint.update(`${headlinesPath}\0${headlinesText}\0`);

  const plan = planVerified({
    candidates: await readAll(join(dir, "candidates"), (v) => verifiedCandidateSchema.parse(v)),
    measures: await readAll(join(dir, "measures"), (v) => verifiedMeasureSchema.parse(v)),
    // Weekly issue sweeps (ISSUE_SWEEP.md) add items to candidates.
    sweeps: await readAll(join(dir, "issues"), (v) => verifiedIssueSweepSchema.parse(v), true),
    slates: await readAll(join(dir, "..", "endorsements", "outlets"), (v) => outletSlateSchema.parse(v), true),
    headlines: headlinesText ? pamphletHeadlinesSchema.parse(JSON.parse(headlinesText)) : undefined,
  });
  return { plan, fingerprint: short(fingerprint) };
}
