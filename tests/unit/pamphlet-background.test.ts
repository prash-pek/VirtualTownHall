import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { stableJson } from "@/lib/seed/check";
import { planVerified } from "@/lib/seed/plan";
import { pamphletHeadlinesSchema } from "@/lib/seed/verified";

const source = { title: "Oregon Voters' Pamphlet (state)", url: "https://sos.oregon.gov/x.pdf", page: 31 };

describe("pamphlet background lines", () => {
  const headlines = pamphletHeadlinesSchema.parse({
    candidates: {
      "chris-henry": {
        occupation: "Working Class Truck Driver",
        occupational_background: "LongHaul Trucker",
        educational_background: "UAW Trade School, Portland State University",
        prior_governmental_experience: "n/a",
        other: [{ label: "Civic Leadership", text: "Boards: Oregon Consumer League" }],
        source,
      },
      "jane-doe": { occupation: "Teacher", educational_background: null, source },
    },
    not_found: ["no-statement"],
  });
  const plan = planVerified({ candidates: [], measures: [], sweeps: [], slates: [], headlines });

  it("keeps the candidate's words as filed, leaving out empty fields", () => {
    expect(plan.backgrounds).toEqual([
      {
        slug: "chris-henry",
        background: {
          occupation: "Working Class Truck Driver",
          occupationalBackground: "LongHaul Trucker",
          educationalBackground: "UAW Trade School, Portland State University",
          priorGovernmentalExperience: "n/a",
          other: [{ label: "Civic Leadership", text: "Boards: Oregon Consumer League" }],
          source,
        },
      },
      { slug: "jane-doe", background: { occupation: "Teacher", source } },
      { slug: "no-statement", background: null },
    ]);
  });

  it("compares jsonb read-backs regardless of key order", () => {
    expect(stableJson({ b: 1, a: { d: 2, c: [1, { f: 1, e: 2 }] } })).toBe(
      stableJson({ a: { c: [1, { e: 2, f: 1 }], d: 2 }, b: 1 }),
    );
    expect(stableJson(undefined)).toBe(stableJson(null));
  });

  it("parses the committed data file", () => {
    const file = pamphletHeadlinesSchema.parse(
      JSON.parse(readFileSync("data/oregon-2026/pamphlet-headlines.json", "utf8")),
    );
    expect(Object.keys(file.candidates).length).toBeGreaterThan(300);
    expect(file.candidates["chris-henry"]?.prior_governmental_experience).toBe("n/a");
  });
});
