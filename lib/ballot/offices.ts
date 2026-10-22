/**
 * Plain-language descriptions of what each kind of office does, shown on race pages.
 *
 * Written per office TYPE, not per seat, so every seat of the same kind gets the same text.
 * Each description is grounded in the linked official source (Oregon law, the constitution,
 * or the office's own site) and is labeled on the page as a general description.
 * Client-safe: no server imports.
 */

export type OfficeDescription = {
  text: string;
  sourceUrl: string;
  /** Short name of the source, shown as the link text. */
  sourceName: string;
};

const ors = (chapter: string) => `https://www.oregonlegislature.gov/bills_laws/ors/ors${chapter}.html`;
const constitution = "https://www.oregonlegislature.gov/bills_laws/Pages/OrConst.aspx";

const cityCouncil: OfficeDescription = {
  text: "A member of the city council, the city's governing body. The council passes city laws, adopts the budget and sets policy for city services such as police, parks, streets and water.",
  sourceUrl: ors("221"),
  sourceName: "Oregon law on city government (ORS chapter 221)",
};

const countyCommissioner: OfficeDescription = {
  text: "A member of the county's board of commissioners, which passes county ordinances, adopts the county budget and oversees county services such as public health, roads, jails and land-use planning.",
  sourceUrl: ors("203"),
  sourceName: "Oregon law on county government (ORS chapter 203)",
};

const circuitJudge: OfficeDescription = {
  text: "Circuit courts are Oregon's trial courts. A circuit judge hears criminal, civil, family, juvenile and probate cases in their judicial district; the position number only identifies the seat.",
  sourceUrl: "https://www.courts.oregon.gov/courts/Pages/default.aspx",
  sourceName: "Oregon Judicial Department",
};

/** Offices whose meaning doesn't depend on where they are. Keys are the office name as filed. */
const byOffice: Record<string, OfficeDescription> = {
  "US Senator": {
    text: "One of Oregon's two members of the U.S. Senate. Senators vote on federal laws and the federal budget, and confirm the President's nominees for judges and other top posts.",
    sourceUrl: "https://www.senate.gov/about.htm",
    sourceName: "U.S. Senate",
  },
  "US Representative": {
    text: "Represents one of Oregon's congressional districts in the U.S. House of Representatives, which votes on federal laws and the federal budget.",
    sourceUrl: "https://www.house.gov/the-house-explained",
    sourceName: "U.S. House of Representatives",
  },
  Governor: {
    text: "Oregon's chief executive. The Governor runs state agencies, proposes the state budget, signs or vetoes bills from the Legislature, and appoints many state officials.",
    sourceUrl: constitution,
    sourceName: "Oregon Constitution, Article V",
  },
  "State Senator": {
    text: "One of 30 members of the Oregon State Senate. Senators write and vote on state laws and the state budget, and confirm many of the Governor's appointments.",
    sourceUrl: "https://www.oregonlegislature.gov/senate",
    sourceName: "Oregon State Senate",
  },
  "State Representative": {
    text: "One of 60 members of the Oregon House of Representatives. Representatives write and vote on state laws and the state budget.",
    sourceUrl: "https://www.oregonlegislature.gov/house",
    sourceName: "Oregon House of Representatives",
  },
  "District Attorney": {
    text: "The county's chief prosecutor, who brings criminal cases in court on behalf of the state.",
    sourceUrl: ors("008"),
    sourceName: "ORS 8.660",
  },
  "County Commissioner": countyCommissioner,
  "County Commissioner At-Large": {
    ...countyCommissioner,
    text: `Elected by voters across the whole county rather than one district. ${countyCommissioner.text}`,
  },
  "County Auditor": {
    text: "An independently elected official who audits county programs and spending, and reports publicly on whether they work well and use public money responsibly.",
    sourceUrl: "https://www.multco.us/auditor",
    sourceName: "Multnomah County Auditor",
  },
  "County Sheriff": {
    text: "The county's chief law enforcement officer. The sheriff keeps the peace, makes arrests, carries out court orders and warrants, and runs the county jail.",
    sourceUrl: ors("206"),
    sourceName: "ORS 206.010",
  },
  "County Clerk": {
    text: "Keeps the county's official records, such as property deeds, and runs county elections.",
    sourceUrl: ors("205"),
    sourceName: "Oregon law on county clerks (ORS chapter 205)",
  },
  "County Treasurer": {
    text: "Receives, safeguards and invests the county's money, and pays the county's bills as authorized.",
    sourceUrl: ors("208"),
    sourceName: "Oregon law on county treasurers (ORS chapter 208)",
  },
  "Justice of the Peace": {
    text: "Presides over a county justice court, which hears traffic and other violations, misdemeanors, and civil cases (including small claims) up to $10,000. Justice courts don't try felonies.",
    sourceUrl: ors("051"),
    sourceName: "ORS chapter 51",
  },
  "City Auditor": {
    text: "An independently elected official who audits city programs and spending, handles complaints about city offices, and oversees city elections and lobbyist registration.",
    sourceUrl: "https://www.portland.gov/auditor",
    sourceName: "Portland City Auditor",
  },
  "City Councilor": cityCouncil,
  "City Council": cityCouncil,
  "Council Member": cityCouncil,
  Mayor: {
    text: "Leads city council meetings and speaks for the city. How much power the mayor has, including whether they vote like other council members, is set by each city's charter.",
    sourceUrl: ors("221"),
    sourceName: "Oregon law on city government (ORS chapter 221)",
  },
  "City Commissioner": {
    text: "A member of the Oregon City Commission, the city's governing body (Oregon City's name for its city council). The commission passes city laws, adopts the budget and sets city policy.",
    sourceUrl: "https://www.orcity.org/169/City-Commission",
    sourceName: "Oregon City Commission",
  },
  "Municipal Court Judge": {
    text: "Presides over the city's municipal court, which handles city code violations and state-law offenses other than felonies, such as traffic tickets, that happen inside city limits.",
    sourceUrl: "https://westlinnoregon.gov/municipalcourt",
    sourceName: "West Linn Municipal Court",
  },
};

/** Where an office means something different in one place. Keyed by jurisdiction slug, then office. */
const byJurisdiction: Record<string, Record<string, OfficeDescription>> = {
  portland: {
    "City Councilor": {
      text: "One of 12 members of the Portland City Council, three from each of four geographic districts, chosen by ranked-choice voting. The council passes city laws and the budget; the Mayor and a city administrator run day-to-day operations.",
      sourceUrl: "https://www.portland.gov/council",
      sourceName: "Portland City Council",
    },
  },
  "multnomah-county": {
    "County Commissioner Chair": {
      text: "Leads the Multnomah County Board of Commissioners and is elected countywide. The Chair is also the county's chief executive, overseeing county departments day to day.",
      sourceUrl: "https://multco.us/board",
      sourceName: "Multnomah County Board of Commissioners",
    },
  },
};

/** "Director" depends on the kind of district. Matched on the jurisdiction's name. */
function directorDescription(jurisdiction: string): OfficeDescription | null {
  if (/soil and water conservation district/i.test(jurisdiction)) {
    return {
      text: "Serves on the elected board of the soil and water conservation district, a local government that works with landowners and communities to conserve soil, water and wildlife habitat. Zone directors must live in their zone and at-large directors anywhere in the district; every district voter votes on all seats.",
      sourceUrl: ors("568"),
      sourceName: "ORS 568.560",
    };
  }
  if (/people'?s utility district/i.test(jurisdiction)) {
    const kind = /water/i.test(jurisdiction) ? "water" : "electric";
    return {
      text: `Serves on the elected board of a people's utility district, a publicly owned ${kind} utility. The board sets rates and policy and adopts the utility's budget.`,
      sourceUrl: ors("261"),
      sourceName: "Oregon law on people's utility districts (ORS chapter 261)",
    };
  }
  if (/fire district|fire protection district/i.test(jurisdiction)) {
    const proposed = /proposed/i.test(jurisdiction);
    return {
      text: `Serves on the board of a fire district, which sets the budget and policy for local fire protection and emergency medical service.${
        proposed
          ? " This district is proposed: it only forms if voters approve the related measures on this ballot."
          : ""
      }`,
      sourceUrl: ors("478"),
      sourceName: "Oregon law on fire districts (ORS chapter 478)",
    };
  }
  return null;
}

/** What this office does, or null when we don't have a sourced description for it yet. */
export function describeOffice(
  office: string,
  jurisdiction: string,
  jurisdictionSlug: string,
): OfficeDescription | null {
  const local = byJurisdiction[jurisdictionSlug]?.[office];
  if (local) return local;
  if (office === "Director") return directorDescription(jurisdiction);
  if (office.startsWith("Judge of the Circuit Court")) return circuitJudge;
  return byOffice[office] ?? null;
}
