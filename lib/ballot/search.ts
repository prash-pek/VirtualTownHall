/**
 * Instant search over the ballot catalog, for "Add a race or measure".
 * Every word the voter types has to match the start of a word somewhere in the item
 * (so "port meas" finds Portland measures), and the best matches come first.
 */
import { isRace, itemTitle, type CatalogItem } from "./types";

export type SearchKind = "all" | "races" | "measures";

/** Lowercase, drop accents and punctuation, so "26-267", "26 267" and "Measure 26–267" all line up. */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type Indexed = {
  item: CatalogItem;
  order: number;
  /** Each field is " word word " so a word-start test is a plain includes(" " + token). */
  number: string;
  title: string;
  place: string;
  people: string;
  keywords: string;
};

const pad = (s: string) => ` ${normalize(s)} `;

export function buildIndex(items: readonly CatalogItem[]): Indexed[] {
  return items.map((item, order) => {
    if (isRace(item)) {
      return {
        item,
        order,
        number: " ",
        title: pad(`${itemTitle(item)} ${item.office} ${item.districtLabel ?? ""}`),
        place: pad(`${item.jurisdiction} ${item.group}`),
        people: pad(item.candidates.map((c) => c.name).join(" ")),
        keywords: pad("race"),
      };
    }
    const num = normalize(item.number);
    return {
      item,
      order,
      // "26-267" is also findable as "26267".
      number: ` ${num} ${num.replace(/ /g, "")} `,
      title: pad(item.title),
      place: pad(`${item.jurisdiction} ${item.group}`),
      people: " ",
      keywords: pad(`measure ballot measure ${item.keywords ?? ""}`),
    };
  });
}

function kindMatches(item: CatalogItem, kind: SearchKind) {
  return kind === "all" || (kind === "races") === isRace(item);
}

/**
 * Items matching every word of the query, best first; ties keep printed-ballot order.
 * An empty query returns every item of the chosen kind in ballot order.
 */
export function searchCatalog(index: readonly Indexed[], query: string, kind: SearchKind = "all"): CatalogItem[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  const pool = index.filter((e) => kindMatches(e.item, kind));
  if (tokens.length === 0) return pool.map((e) => e.item);

  const compact = tokens.join("");
  const scored: { e: Indexed; score: number }[] = [];
  for (const e of pool) {
    let score = 0;
    // A typed measure number ("26-267", "26 267", "26267") is the strongest signal.
    if (!isRace(e.item) && (e.number.includes(` ${tokens.join(" ")} `) || e.number.includes(` ${compact} `))) {
      score += 100;
    }
    let all = true;
    for (const t of tokens) {
      const w = ` ${t}`;
      const hit =
        (e.number.includes(w) ? 20 : 0) +
        (e.title.includes(w) ? 10 : 0) +
        (e.people.includes(w) ? 8 : 0) +
        (e.place.includes(w) ? 5 : 0) +
        (e.keywords.includes(w) ? 1 : 0);
      if (hit === 0) {
        all = false;
        break;
      }
      score += hit;
    }
    if (all) scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.e.order - b.e.order).map(({ e }) => e.item);
}
