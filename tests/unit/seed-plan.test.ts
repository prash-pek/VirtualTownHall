import { describe, expect, it } from "vitest";

import { planVerified } from "@/lib/seed/plan";
import { verifiedCandidateSchema } from "@/lib/seed/verified";

const source = { url: "https://Example.org/a/", publisher: "First", tier: "T1" };
const item = (id: string, statement: string, status = "verified", src: object = source) => ({
  id,
  statement,
  source: src,
  verification: { status },
});

describe("planVerified", () => {
  const candidate = verifiedCandidateSchema.parse({
    id: "jane-doe",
    race_id: "r",
    bio: [item("b1", "Same text"), item("b2", "Rejected", "rejected")],
    positions: [item("p1", "Same text"), item("p2", "Other", "verified", { ...source, publisher: "Second" })],
  });
  const plan = planVerified({ candidates: [candidate], measures: [], sweeps: [], slates: [] });

  it("leaves out rejected items and keeps the first of a duplicate", () => {
    expect(plan.items.map((i) => [i.kind, i.statement])).toEqual([
      ["bio", "Same text"],
      ["position", "Other"],
    ]);
  });

  it("keys sources by canonical URL, first citation wins", () => {
    expect([...plan.sources.values()]).toEqual([
      expect.objectContaining({ canonicalUrl: "https://example.org/a", publisher: "First" }),
    ]);
    expect(plan.items.every((i) => i.source === "https://example.org/a")).toBe(true);
  });
});
