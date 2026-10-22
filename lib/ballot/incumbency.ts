/**
 * Who holds the seat now, for the race page.
 *
 * Whether each candidate is the incumbent comes from the inventory (each `true`/`false` has an
 * `incumbent_source_url` there). When no incumbent is running, `currentHolders` names who holds
 * the seat today, taken from the office's official roster. Seats missing from it just say no
 * incumbent is running. Never fill this in from memory or news; a wrong name is worse than none.
 * Client-safe: no server imports.
 */

import type { CatalogCandidate } from "./types";

type Holder = { name: string; sourceUrl: string; checked: string } | { note: string };

const house = "https://www.oregonlegislature.gov/house/Pages/print-representatives.aspx";
const senate = "https://www.oregonlegislature.gov/senate/Pages/print-senators.aspx";
const holder = (name: string, sourceUrl: string): Holder => ({ name, sourceUrl, checked: "2026-10-22" });

/** Keyed by race slug. Only seats where none of the candidates is the incumbent. */
export const currentHolders: Record<string, Holder> = {
  "or-senate-3": holder("Jeff Golden", senate),
  "or-senate-6": holder("Cedric Hayden", senate),
  "or-senate-11": holder("Kim Thatcher", senate),
  "or-senate-15": holder("Janeen Sollman", senate),
  "or-senate-16": holder("Suzanne Weber", senate),
  "or-senate-26": holder("Christine Drazan", senate),
  "or-house-7": holder("John Lively", house),
  "or-house-9": holder("Boomer Wright", house),
  "or-house-11": holder("Jami Cate", house),
  "or-house-17": holder("Ed Diehl", house),
  "or-house-18": holder("Rick Lewis", house),
  "or-house-27": holder("Ken Helm", house),
  "or-house-40": holder("Annessa Hartman", house),
  "or-house-52": holder("Jeff Helfrich", house),
  "multnomah-county-chair": holder("Jessica Vega Pederson", "https://multco.us/board"),
  "multnomah-county-commissioner-d2": holder("Shannon Singleton", "https://multco.us/board"),
  "multnomah-county-auditor": holder("Jennifer McGuirk", "https://www.multco.us/auditor"),
  "gresham-council-pos-2": holder("Eddy Morales", "https://www.greshamoregon.gov/meet-the-council"),
  "gresham-council-pos-4": holder("Jerry Hinton", "https://www.greshamoregon.gov/meet-the-council"),
  "rockwood-water-pud-sub-district-5": holder("Larry Dixon", "https://www.rwpud.org/about-us/board-of-directors/"),
  "columbia-river-pud-subdivision-1": holder(
    "Debbie Reed",
    "https://www.crpud.net/my-pud/board-of-directors/board-members/",
  ),
  "mt-angel-monitor-fire-district-directors": {
    note: "This would be a new district, so no one holds these seats yet.",
  },
};

export type Incumbency =
  | { kind: "running"; names: string[] }
  | { kind: "open"; holder?: { name: string; sourceUrl: string } }
  | { kind: "note"; text: string }
  | { kind: "unknown" };

export function raceIncumbency(raceSlug: string, candidates: CatalogCandidate[]): Incumbency | null {
  if (candidates.length === 0) return null;
  const running = candidates.filter((c) => c.incumbent === true).map((c) => c.name);
  if (running.length) return { kind: "running", names: running };
  const known = currentHolders[raceSlug];
  if (known && "note" in known) return { kind: "note", text: known.note };
  // Only call a seat open when every candidate is confirmed not to be the incumbent.
  if (candidates.every((c) => c.incumbent === false)) {
    return { kind: "open", holder: known && "name" in known ? known : undefined };
  }
  return { kind: "unknown" };
}
