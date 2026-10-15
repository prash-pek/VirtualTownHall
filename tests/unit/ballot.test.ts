import { describe, expect, it } from "vitest";

import { matchJurisdictions, normalizeName, parseCensusResponse, type JurisdictionRef } from "@/lib/ballot/districts";
import { sanitizeBallot } from "@/lib/ballot/types";

const census = {
  result: {
    addressMatches: [
      {
        matchedAddress: "1221 SW 4TH AVE, PORTLAND, OR, 97204",
        geographies: {
          Counties: [{ NAME: "Multnomah County", BASENAME: "Multnomah" }],
          "Incorporated Places": [{ NAME: "Portland city", BASENAME: "Portland" }],
          "120th Congressional Districts": [{ BASENAME: "3" }],
          "2026 State Legislative Districts - Upper": [{ BASENAME: "17" }],
          "2026 State Legislative Districts - Lower": [{ BASENAME: "33" }],
          "Unified School Districts": [{ NAME: "Portland School District 1J" }],
        },
      },
    ],
  },
};

const refs: JurisdictionRef[] = [
  { slug: "or", name: "Oregon", type: "state", parentSlug: null },
  { slug: "multnomah-county", name: "Multnomah County", type: "county", parentSlug: "or" },
  { slug: "washington-county", name: "Washington County", type: "county", parentSlug: "or" },
  { slug: "city-of-portland", name: "City of Portland", type: "city", parentSlug: "multnomah-county" },
  { slug: "or-cd-3", name: "Congressional District 3", type: "congressional_district", parentSlug: "or" },
  { slug: "or-cd-1", name: "Congressional District 1", type: "congressional_district", parentSlug: "or" },
  { slug: "or-sd-17", name: "Senate District 17", type: "state_senate_district", parentSlug: "or" },
  { slug: "or-hd-33", name: "House District 33", type: "state_house_district", parentSlug: "or" },
  { slug: "or-hd-34", name: "House District 34", type: "state_house_district", parentSlug: "or" },
  { slug: "pps", name: "Portland School District No. 1J", type: "school_district", parentSlug: "multnomah-county" },
  { slug: "mult-circuit", name: "Multnomah Circuit Court", type: "other", parentSlug: "multnomah-county" },
  { slug: "wash-circuit", name: "Washington Circuit Court", type: "other", parentSlug: "washington-county" },
  { slug: "mult-water", name: "Some Water District", type: "special_district", parentSlug: "multnomah-county" },
];

describe("parseCensusResponse", () => {
  it("extracts districts regardless of layer vintage", () => {
    expect(parseCensusResponse(census)).toEqual({
      matchedAddress: "1221 SW 4TH AVE, PORTLAND, OR, 97204",
      county: "Multnomah County",
      place: "Portland",
      congressional: 3,
      stateSenate: 17,
      stateHouse: 33,
      schoolDistricts: ["Portland School District 1J"],
    });
  });

  it("returns null when nothing matched", () => {
    expect(parseCensusResponse({ result: { addressMatches: [] } })).toBeNull();
    expect(parseCensusResponse(null)).toBeNull();
  });
});

describe("normalizeName", () => {
  it("ignores 'No.' before a number but keeps words starting with 'no'", () => {
    expect(normalizeName("Reynolds School District No. 7")).toBe(normalizeName("Reynolds School District 7"));
    expect(normalizeName("North Clackamas")).toBe("north clackamas");
  });
});

describe("matchJurisdictions", () => {
  it("suggests the address's jurisdictions and lists county special districts as nearby", () => {
    const d = parseCensusResponse(census)!;
    const { matched, nearby } = matchJurisdictions(d, refs);
    expect(matched.sort()).toEqual(
      ["or", "multnomah-county", "city-of-portland", "or-cd-3", "or-sd-17", "or-hd-33", "pps", "mult-circuit"].sort(),
    );
    expect(nearby).toEqual(["mult-water"]);
  });
});

describe("sanitizeBallot", () => {
  it("keeps valid unique keys in order and caps the list", () => {
    expect(sanitizeBallot(["race:a", "measure:b", "race:a", "bogus", 5, "race:Bad"])).toEqual(["race:a", "measure:b"]);
    expect(sanitizeBallot("race:a")).toEqual([]);
    expect(sanitizeBallot(["race:a", "race:b", "race:c"], 2)).toEqual(["race:a", "race:b"]);
  });
});
