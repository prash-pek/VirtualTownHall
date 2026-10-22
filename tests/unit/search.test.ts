import { describe, expect, it } from "vitest";

import { buildIndex, normalize, searchCatalog } from "@/lib/ballot/search";
import type { CatalogItem } from "@/lib/ballot/types";

const items: CatalogItem[] = [
  {
    key: "race:or-governor",
    slug: "or-governor",
    office: "Governor",
    districtLabel: null,
    jurisdiction: "Oregon",
    jurisdictionSlug: "or",
    group: "State",
    candidates: [{ slug: "tina-kotek", name: "Tina Kotek", party: "Democrat", incumbent: true }],
  },
  {
    key: "race:portland-council-d3",
    slug: "portland-council-d3",
    office: "City Councilor",
    districtLabel: "3",
    jurisdiction: "City of Portland",
    jurisdictionSlug: "city-of-portland",
    group: "City",
    candidates: [{ slug: "angelita-morillo", name: "Angelita Morillo", party: null, incumbent: true }],
  },
  {
    key: "measure:troutdale-26-265",
    slug: "troutdale-26-265",
    number: "26-265",
    title: "Five-year Local Option Levy for Police, Fire & 911 Operations",
    jurisdiction: "City of Troutdale",
    jurisdictionSlug: "city-of-troutdale",
    group: "City measures",
  },
  {
    key: "measure:portland-26-267",
    slug: "portland-26-267",
    number: "26-267",
    title: "Amends Charter: Portland residents decide 2% of city’s annual discretionary budget.",
    jurisdiction: "City of Portland",
    jurisdictionSlug: "city-of-portland",
    group: "City measures",
    keywords: "Question: Should Portland create participatory budgeting?",
  },
  {
    key: "measure:forest-grove-34-353",
    slug: "forest-grove-34-353",
    number: "34-353",
    title: "General Obligation Bonds to replace the current police facility",
    jurisdiction: "City of Forest Grove",
    jurisdictionSlug: "city-of-forest-grove",
    group: "City measures",
  },
];

const index = buildIndex(items);
const keys = (q: string, kind?: "all" | "races" | "measures") => searchCatalog(index, q, kind).map((i) => i.key);

describe("ballot search", () => {
  it("normalizes punctuation, case and accents", () => {
    expect(normalize("Measure 26–267")).toBe("measure 26 267");
    expect(normalize("City’s Café")).toBe("citys cafe");
  });

  it("finds a measure by number in any common spelling", () => {
    for (const q of ["26-267", "26 267", "26267", "measure 26-267", "267"]) {
      expect(keys(q)[0]).toBe("measure:portland-26-267");
    }
  });

  it("puts the exact measure number ahead of partial ones", () => {
    expect(keys("26-265")).toEqual(["measure:troutdale-26-265"]);
  });

  it("matches topic words in titles and the official ballot title", () => {
    expect(keys("police")).toEqual(["measure:troutdale-26-265", "measure:forest-grove-34-353"]);
    expect(keys("participatory")).toEqual(["measure:portland-26-267"]);
  });

  it("needs every word to match, at the start of a word", () => {
    expect(keys("portland meas")).toEqual(["measure:portland-26-267"]);
    expect(keys("police bonds")).toEqual(["measure:forest-grove-34-353"]);
    expect(keys("olice")).toEqual([]);
  });

  it("finds races by office, district, place and candidate", () => {
    expect(keys("governor")).toEqual(["race:or-governor"]);
    expect(keys("kotek")).toEqual(["race:or-governor"]);
    expect(keys("council district 3")).toEqual(["race:portland-council-d3"]);
  });

  it("filters by kind and lists everything of that kind when nothing is typed", () => {
    expect(keys("portland", "races")).toEqual(["race:portland-council-d3"]);
    expect(keys("", "measures")).toEqual([
      "measure:troutdale-26-265",
      "measure:portland-26-267",
      "measure:forest-grove-34-353",
    ]);
  });
});
