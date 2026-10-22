"use client";

import { useDeferredValue, useId, useMemo, useState, type RefObject } from "react";

import { buildIndex, searchCatalog, type SearchKind } from "@/lib/ballot/search";
import { isRace, itemTitle, type BallotKey, type CatalogItem } from "@/lib/ballot/types";

import { ItemRow } from "./item-row";

/** Rows shown before "Show more", so a broad search doesn't dump the whole catalog at once. */
const pageSize = 25;

/** "Add a race or measure": type to filter the whole catalog instantly, or browse one kind. */
export function AddItems({
  all,
  added,
  onAdd,
  onRemove,
  inputRef,
}: {
  all: CatalogItem[];
  added: readonly BallotKey[];
  onAdd: (key: BallotKey) => void;
  onRemove: (key: BallotKey) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");
  const [browseAll, setBrowseAll] = useState(false);
  const [limit, setLimit] = useState(pageSize);
  const deferredQuery = useDeferredValue(query);

  const index = useMemo(() => buildIndex(all), [all]);
  const counts = useMemo(() => {
    const races = all.filter(isRace).length;
    return { all: all.length, races, measures: all.length - races };
  }, [all]);

  const typed = deferredQuery.trim() !== "";
  // With nothing typed, "All" stays collapsed until asked; Races or Measures list that kind straight away.
  const showing = typed || kind !== "all" || browseAll;
  const results = useMemo(
    () => (showing ? searchCatalog(index, deferredQuery, kind) : []),
    [index, deferredQuery, kind, showing],
  );
  const shown = results.slice(0, limit);
  const noun = kind === "races" ? "race" : kind === "measures" ? "measure" : "item";
  const plural = (n: number) => `${n} ${noun}${n === 1 ? "" : "s"}`;

  const status = !showing
    ? ""
    : typed
      ? results.length === 0
        ? "No matches."
        : `${plural(results.length)} ${results.length === 1 ? "matches" : "match"}.`
      : `Showing all ${plural(results.length)}.`;

  const changeQuery = (q: string) => {
    setQuery(q);
    setLimit(pageSize);
  };

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-3 border border-line bg-paper p-5">
      <h2 id={`${id}-h`} className="section-title">
        Add a race or measure
      </h2>
      <label htmlFor={`${id}-q`} className="text-sm font-semibold">
        Search
      </label>
      <div className="relative -mt-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          id={`${id}-q`}
          type="search"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && query) {
              e.preventDefault();
              changeQuery("");
            }
          }}
          placeholder="Measure number, topic, place, office or candidate"
          aria-describedby={`${id}-hint`}
          aria-controls={`${id}-results`}
          autoComplete="off"
          spellCheck={false}
          className="input w-full pl-10"
        />
      </div>
      <p id={`${id}-hint`} className="note -mt-1">
        Try &ldquo;26-267&rdquo;, &ldquo;schools&rdquo;, &ldquo;police levy&rdquo;, &ldquo;Washington County&rdquo; or a
        candidate&apos;s name. Results update as you type.
      </p>

      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Show</legend>
        {(["all", "measures", "races"] as const).map((k) => (
          <label
            key={k}
            className="chip flex items-center gap-2 has-checked:border-ink has-checked:bg-ink has-checked:text-cream has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name={`${id}-kind`}
              value={k}
              checked={kind === k}
              onChange={() => {
                setKind(k);
                setLimit(pageSize);
              }}
              className="sr-only"
            />
            {k === "all" ? "All" : k === "measures" ? "Measures" : "Races"}
            <span className="text-[12.5px] opacity-75">{counts[k]}</span>
          </label>
        ))}
        {!typed && kind === "all" && (
          <button type="button" onClick={() => setBrowseAll((v) => !v)} className="link ml-1 text-sm">
            {browseAll ? "Hide the full list" : `Browse all ${counts.all}`}
          </button>
        )}
      </fieldset>

      <p role="status" aria-live="polite" className="note min-h-5">
        {status}
        {typed && results.length === 0 && (
          <>
            {" "}
            Try fewer words, a measure number like 26-267, or a city or county. We only have Oregon races and measures.
          </>
        )}
      </p>

      <div id={`${id}-results`}>
        {shown.length > 0 && (
          <ul className="flex flex-col border border-line" aria-label="Search results">
            {shown.map((i) => (
              <ItemRow
                key={i.key}
                item={i}
                action={
                  <AddToggle
                    item={i}
                    added={added.includes(i.key)}
                    onAdd={() => onAdd(i.key)}
                    onRemove={() => onRemove(i.key)}
                  />
                }
              />
            ))}
          </ul>
        )}
        {results.length > shown.length && (
          <button type="button" onClick={() => setLimit((n) => n + 100)} className="btn mt-3 text-sm">
            Show {Math.min(100, results.length - shown.length)} more of {results.length}
          </button>
        )}
      </div>
    </section>
  );
}

/** One button that flips between Add and Added, so keyboard focus stays put after adding. */
function AddToggle({
  item,
  added,
  onAdd,
  onRemove,
}: {
  item: CatalogItem;
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={added ? onRemove : onAdd}
      className={
        added
          ? "btn shrink-0 border-olive px-3 py-1 text-sm text-olive hover:border-ink"
          : "btn shrink-0 px-3 py-1 text-sm"
      }
    >
      {added ? "✓ Added" : "+ Add"}
      <span className="sr-only">
        {added ? `: ${itemTitle(item)} is on your ballot. Press to remove it.` : ` ${itemTitle(item)}`}
      </span>
    </button>
  );
}
