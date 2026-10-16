import { describe, expect, it } from "vitest";

import { buildPack, normalizeAnswers, systemPrompt, type ItemPack } from "@/lib/discuss/pack";

const src = (statement: string, url: string | null = "https://example.org/a") => ({
  statement,
  excerpt: null,
  sourceUrl: url,
  publisher: "Example",
});

const race: ItemPack = {
  kind: "race",
  title: "Mayor",
  background: [],
  sides: [
    { id: "ann", label: "Ann", facts: [src("Ann supports more parks.")], endorsements: [] },
    { id: "bo", label: "Bo", facts: [], endorsements: [{ ...src("Paper endorsed Bo."), endorser: "Paper" }] },
  ],
};

describe("buildPack", () => {
  it("numbers sources in order and tags their side", () => {
    const { text, sources } = buildPack(race);
    expect(sources.map((s) => [s.n, s.side])).toEqual([
      [1, "ann"],
      [2, "bo"],
    ]);
    expect(text).toContain("[1] Ann supports more parks.");
    expect(text).toContain("ENDORSEMENT (the endorser's opinion) by Paper");
  });

  it("says plainly when a side has nothing on record", () => {
    expect(buildPack({ ...race, sides: [{ ...race.sides[1]!, endorsements: [] }] }).text).toContain(
      "(no sourced statements on record)",
    );
  });

  it("is deterministic so the prompt can be cached", () => {
    expect(buildPack(race).text).toBe(buildPack(race).text);
  });
});

describe("systemPrompt", () => {
  it("keeps candidates in the third person and never recommends a vote", () => {
    expect(systemPrompt("race")).toMatch(/third person/);
    expect(systemPrompt("measure")).toMatch(/Never recommend how to vote/);
  });
});

describe("normalizeAnswers", () => {
  it("returns one answer per side in order, drops unknown citations and fills gaps", () => {
    const { sources } = buildPack(race);
    const out = normalizeAnswers(race, sources, [
      { side: "bo", answer: "Bo was endorsed.", sourceIds: [2, 2, 9] },
      { side: "zed", answer: "Not a side.", sourceIds: [] },
    ]);
    expect(out.map((a) => a.side)).toEqual(["ann", "bo"]);
    expect(out[1]!.sourceIds).toEqual([2]);
    expect(out[0]!.answer).toMatch(/No answer/);
  });
});
