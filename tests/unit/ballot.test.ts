import { describe, expect, it } from "vitest";

import {
  matchJurisdictions,
  matchZip,
  normalizeName,
  parseCensusResponse,
  type JurisdictionRef,
} from "@/lib/ballot/districts";
import { withState } from "@/lib/ballot/states";
import { raceTitle, sanitizeBallot } from "@/lib/ballot/types";

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

describe("matchZip", () => {
  it("suggests what covers the whole ZIP and lists split districts as possible", () => {
    const { matched, possible, nearby } = matchZip(
      {
        county: [["Multnomah", 1]],
        city: [["Portland", 0.9]],
        cd: [[3, 1]],
        sd: [[17, 1]],
        hd: [
          [33, 0.6],
          [34, 0.4],
        ],
      },
      refs,
    );
    expect(matched.sort()).toEqual(["or", "multnomah-county", "or-cd-3", "or-sd-17", "mult-circuit"].sort());
    expect(possible.sort()).toEqual(["city-of-portland", "or-hd-33", "or-hd-34"].sort());
    expect(nearby.sort()).toEqual(["pps", "mult-water"].sort());
  });

  it("treats a county-wide office in a split county as possible", () => {
    const { matched, possible } = matchZip(
      {
        county: [
          ["Washington", 0.7],
          ["Multnomah", 0.3],
        ],
        city: [],
        cd: [[1, 1]],
        sd: [],
        hd: [],
      },
      refs,
    );
    expect(matched.sort()).toEqual(["or", "or-cd-1"].sort());
    expect(possible.sort()).toEqual(["washington-county", "multnomah-county", "wash-circuit", "mult-circuit"].sort());
  });
});

describe("sanitizeBallot", () => {
  it("keeps valid unique keys in order and caps the list", () => {
    expect(sanitizeBallot(["race:a", "measure:b", "race:a", "bogus", 5, "race:Bad"])).toEqual(["race:a", "measure:b"]);
    expect(sanitizeBallot("race:a")).toEqual([]);
    expect(sanitizeBallot(["race:a", "race:b", "race:c"], 2)).toEqual(["race:a", "race:b"]);
  });
});

describe("withState", () => {
  it("adds the chosen state unless the address already ends with a state or ZIP", () => {
    expect(withState("5055 north Greeley avenue", "OR")).toBe("5055 north Greeley avenue, OR");
    expect(withState("5055 N Greeley Ave, Portland, OR", "OR")).toBe("5055 N Greeley Ave, Portland, OR");
    expect(withState("5055 N Greeley Ave Portland Oregon", "OR")).toBe("5055 N Greeley Ave Portland Oregon");
    expect(withState("5055 N Greeley Ave 97217", "OR")).toBe("5055 N Greeley Ave 97217");
    expect(withState("1600 Pennsylvania Ave NW, Washington", "DC")).toBe("1600 Pennsylvania Ave NW, Washington, DC");
  });
});

describe("raceTitle", () => {
  it("doesn't repeat a seat the office already names", () => {
    expect(raceTitle("Judge of the Circuit Court, 4th District, Position 2", "Position 2")).toBe(
      "Judge of the Circuit Court, 4th District, Position 2",
    );
  });
  it("reads a bare number as a district", () => {
    expect(raceTitle("County Commissioner", "2")).toBe("County Commissioner, District 2");
    expect(raceTitle("US Representative", "3")).toBe("US Representative, District 3");
  });
  it("keeps named seats and offices with no seat", () => {
    expect(raceTitle("City Councilor", "Position 4")).toBe("City Councilor, Position 4");
    expect(raceTitle("Director", "Sub-District 4 (unexpired term)")).toBe("Director, Sub-District 4 (unexpired term)");
    expect(raceTitle("Governor", null)).toBe("Governor");
  });
  it("doesn't treat a longer number as a match", () => {
    expect(raceTitle("Judge, Position 12", "Position 2")).toBe("Judge, Position 12, Position 2");
  });
});

it("raceTitle: a bare number only matches a whole trailing number", () => {
  expect(raceTitle("Judge, Position 12", "2")).toBe("Judge, Position 12, District 2");
});
