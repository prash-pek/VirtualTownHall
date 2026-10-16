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

  it("matches answers that use labels instead of ids", () => {
    const measure: ItemPack = {
      kind: "measure",
      title: "Measure 1",
      background: [],
      sides: [
        { id: "yes", label: "The case for YES", facts: [src("Supporters say it helps.")], endorsements: [] },
        { id: "no", label: "The case for NO", facts: [src("Opponents say it costs too much.")], endorsements: [] },
      ],
    };
    const m = normalizeAnswers(measure, buildPack(measure).sources, [
      { side: "The case for NO", answer: "Opponents cite cost.", sourceIds: [2] },
      { side: "The case for YES", answer: "Supporters say it helps.", sourceIds: [1] },
    ]);
    expect(m.map((a) => [a.side, a.answer])).toEqual([
      ["yes", "Supporters say it helps."],
      ["no", "Opponents cite cost."],
    ]);

    const senate: ItemPack = {
      ...race,
      sides: [
        { id: "jeff-merkley", label: "Jeff Merkley, Democrat, incumbent", facts: [src("A")], endorsements: [] },
        { id: "jo-rae-perkins", label: "Jo Rae Perkins, Republican", facts: [src("B")], endorsements: [] },
      ],
    };
    const c = normalizeAnswers(senate, buildPack(senate).sources, [
      { side: "Jo Rae Perkins", answer: "Perkins answer.", sourceIds: [] },
      { side: "Jeff Merkley, Democrat, incumbent", answer: "Merkley answer.", sourceIds: [] },
    ]);
    expect(c.map((a) => [a.side, a.answer])).toEqual([
      ["jeff-merkley", "Merkley answer."],
      ["jo-rae-perkins", "Perkins answer."],
    ]);
  });

  it("falls back to position when every side answered but none match", () => {
    const out = normalizeAnswers(race, buildPack(race).sources, [
      { side: "first", answer: "One.", sourceIds: [] },
      { side: "second", answer: "Two.", sourceIds: [] },
    ]);
    expect(out.map((a) => [a.side, a.answer])).toEqual([
      ["ann", "One."],
      ["bo", "Two."],
    ]);
  });
});
