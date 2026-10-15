import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { checkInventoryIntegrity, inventorySchema, sortJurisdictionsParentFirst } from "@/lib/seed/inventory";

const raw = JSON.parse(readFileSync("data/oregon-2026/inventory.json", "utf8"));

describe("data/oregon-2026/inventory.json", () => {
  const inv = inventorySchema.parse(raw);

  it("parses against the import schema", () => {
    expect(inv.races.length).toBeGreaterThan(0);
    expect(inv.candidates.length).toBeGreaterThan(0);
  });

  it("has no dangling references or duplicate ids", () => {
    expect(checkInventoryIntegrity(inv)).toEqual([]);
  });
});

describe("checkInventoryIntegrity", () => {
  it("reports unknown references", () => {
    const inv = inventorySchema.parse({
      election: { id: "e", name: "E", date: "2026-11-03", sources: [] },
      jurisdictions: [{ id: "a", name: "A", type: "state", parent_id: "missing" }],
      races: [
        {
          id: "r",
          jurisdiction_id: "nope",
          office: "X",
          district: null,
          seats: 1,
          partisan: false,
          candidate_ids: ["ghost"],
          source_url: "https://example.org",
        },
      ],
      measures: [],
      candidates: [
        { id: "c", name: "C", race_id: "r", party: null, incumbent: null, filing_source_url: "https://example.org" },
      ],
    });
    expect(checkInventoryIntegrity(inv)).toEqual([
      "jurisdiction a: unknown parent missing",
      "race r: unknown jurisdiction nope",
      "race r: unknown candidate ghost",
      "candidate c: not listed in race r",
    ]);
  });
});

describe("sortJurisdictionsParentFirst", () => {
  it("puts every parent before its children", () => {
    const sorted = sortJurisdictionsParentFirst([
      { id: "c", parent_id: "b" },
      { id: "b", parent_id: "a" },
      { id: "a", parent_id: null },
    ]);
    expect(sorted.map((j) => j.id)).toEqual(["a", "b", "c"]);
  });
  it("rejects cycles", () => {
    expect(() =>
      sortJurisdictionsParentFirst([
        { id: "a", parent_id: "b" },
        { id: "b", parent_id: "a" },
      ]),
    ).toThrow(/cycle/);
  });
});
