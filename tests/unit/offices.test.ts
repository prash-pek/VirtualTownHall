import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { currentHolders, raceIncumbency } from "@/lib/ballot/incumbency";
import { describeOffice } from "@/lib/ballot/offices";
import { inventorySchema } from "@/lib/seed/inventory";

const inv = inventorySchema.parse(JSON.parse(readFileSync("data/oregon-2026/inventory.json", "utf8")));
const jurisdictions = new Map(inv.jurisdictions.map((j) => [j.id, j]));

describe("describeOffice", () => {
  it("has a sourced description for every race in the inventory", () => {
    const missing = inv.races.filter((r) => {
      const j = jurisdictions.get(r.jurisdiction_id)!;
      const d = describeOffice(r.office, j.name, j.id);
      return !d || !d.text || !d.sourceUrl.startsWith("https://");
    });
    expect(missing.map((r) => r.id)).toEqual([]);
  });

  it("keeps every description to two sentences at most", () => {
    for (const r of inv.races) {
      const j = jurisdictions.get(r.jurisdiction_id)!;
      const text = describeOffice(r.office, j.name, j.id)!.text;
      expect(text.split(/(?<=[a-z)\d][.!?])\s+(?=[A-Z])/).length, r.id).toBeLessThanOrEqual(2);
    }
  });

  it("tells the kinds of district director apart", () => {
    expect(describeOffice("Director", "Tualatin Soil and Water Conservation District", "x")!.text).toMatch(/soil/);
    expect(describeOffice("Director", "Rockwood Water People's Utility District", "x")!.text).toMatch(/water utility/);
    expect(describeOffice("Director", "Columbia River People's Utility District", "x")!.text).toMatch(/electric/);
    expect(describeOffice("Director", "Somewhere Else", "x")).toBeNull();
  });
});

describe("raceIncumbency", () => {
  const c = (name: string, incumbent: boolean | null) => ({ slug: name, name, party: null, incumbent });

  it("names incumbents who are running", () => {
    expect(raceIncumbency("r", [c("A", true), c("B", false)])).toEqual({ kind: "running", names: ["A"] });
  });

  it("only calls a seat open when every candidate is confirmed not the incumbent", () => {
    expect(raceIncumbency("r", [c("A", false), c("B", null)])).toEqual({ kind: "unknown" });
    expect(raceIncumbency("r", [c("A", false)])).toEqual({ kind: "open", holder: undefined });
    expect(raceIncumbency("or-house-7", [c("A", false)])).toMatchObject({
      kind: "open",
      holder: { name: "John Lively" },
    });
  });

  it("lists current holders only for real races where no incumbent is running", () => {
    const races = new Set(inv.races.map((r) => r.id));
    for (const slug of Object.keys(currentHolders)) {
      expect(races.has(slug), slug).toBe(true);
      expect(
        inv.candidates.some((x) => x.race_id === slug && x.incumbent === true),
        slug,
      ).toBe(false);
    }
  });
});
