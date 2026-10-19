import { describe, expect, it } from "vitest";

import { issueLabel, topIssues } from "@/lib/ballot/issues";
import {
  buildPack,
  normalizeAnswers,
  normalizeTopic,
  sideLinks,
  systemPrompt,
  type ItemPack,
} from "@/lib/discuss/pack";

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

describe("vote disclaimers", () => {
  const one = (answer: string) =>
    normalizeAnswers(race, buildPack(race).sources, [{ side: "ann", answer, sourceIds: [1] }])[0]!.answer;

  it("drops a leading per-answer disclaimer", () => {
    expect(
      one("I can't tell you how to vote, so here is what the public record says about Ann. She supports more parks."),
    ).toBe("She supports more parks.");
    expect(one("I can't tell you how to vote. Ann supports more parks [1].")).toBe("Ann supports more parks [1].");
    expect(one("I cannot recommend who to vote for, but the record shows Ann supports more parks.")).toBe(
      "The record shows Ann supports more parks.",
    );
  });

  it("leaves ordinary answers alone", () => {
    expect(one("Ann supports more parks [1].")).toBe("Ann supports more parks [1].");
    const gap = "Our sources don't say how Ann would vote on the levy. She has spoken about parks.";
    expect(one(gap)).toBe(gap);
  });
});

describe("coverage and topics", () => {
  it("marks an answer covered only when the model says so and it cites something", () => {
    const { sources } = buildPack(race);
    const out = normalizeAnswers(race, sources, [
      { side: "ann", answer: "Ann has said X.", sourceIds: [1], covered: true },
      { side: "bo", answer: "Nothing on this. On a related subject, Bo said Y.", sourceIds: [2], covered: false },
    ]);
    expect(out.map((a) => a.covered)).toEqual([true, false]);
    const none = normalizeAnswers(race, sources, [{ side: "ann", answer: "Nothing.", sourceIds: [], covered: true }]);
    expect(none[0]!.covered).toBe(false);
  });

  it("keeps the topic to an issue id or a few plain words", () => {
    expect(normalizeTopic("energy")).toBe("energy");
    expect(normalizeTopic(" Housing ")).toBe("housing");
    expect(normalizeTopic("other: Ferry service on the river at 5pm daily!")).toBe("other: ferry service on the");
    expect(normalizeTopic("")).toBe("other");
  });

  it("labels sources with their issue so related questions can find them", () => {
    const pack: ItemPack = {
      kind: "race",
      title: "Test",
      background: [],
      sides: [
        {
          id: "ann",
          label: "Ann",
          facts: [
            {
              topic: "energy",
              statement: "Ann spoke on power bills.",
              excerpt: null,
              sourceUrl: null,
              publisher: null,
            },
          ],
          endorsements: [],
        },
      ],
    };
    expect(buildPack(pack).text).toContain("[1] (Energy, utilities and data centers) Ann spoke");
    expect(systemPrompt("race")).toMatch(/covered/);
    expect(systemPrompt("race")).toMatch(/Never repeat a private person's name/);
  });
});

describe("topIssues", () => {
  it("ranks issues by how many candidates have sources on them", () => {
    const out = topIssues([{ topics: ["housing", "energy", "custom:bio"] }, { topics: ["energy", "energy", null] }]);
    expect(out.map((i) => i.id)).toEqual(["energy", "housing"]);
    expect(issueLabel("custom:bio")).toBeNull();
  });
});

describe("sideLinks", () => {
  it("reads the stored link bank, official page first, and never invents one", () => {
    expect(
      sideLinks({ officialUrl: "https://www.merkley.senate.gov/", websiteUrl: "https://jeffmerkley.com" }),
    ).toEqual([
      { label: "Official page", url: "https://www.merkley.senate.gov/" },
      { label: "Campaign website", url: "https://jeffmerkley.com" },
    ]);
    expect(sideLinks({ officialUrl: null, websiteUrl: null })).toEqual([]);
    const vp = "https://sos.oregon.gov/vp.pdf";
    expect(sideLinks({ officialUrl: null, websiteUrl: null, pamphletUrl: vp })).toEqual([
      { label: "Voters' pamphlet", url: vp },
    ]);
    expect(sideLinks({ officialUrl: null, websiteUrl: "https://a.com", pamphletUrl: vp })).toHaveLength(1);
  });
});

describe("topicLabel", () => {
  it("drops internal prefixes", async () => {
    const { topicLabel } = await import("@/lib/ballot/issues");
    expect(topicLabel("custom:background")).toBe("Background");
    expect(topicLabel("custom:city-budget")).toBe("City budget");
    expect(topicLabel("other: ferry service")).toBe("Ferry service");
    expect(topicLabel(null)).toBeNull();
  });
});
