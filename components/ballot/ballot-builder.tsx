"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { defaultState, isStateCode, usStates, type StateCode } from "@/lib/ballot/states";
import { readBallot, writeBallot } from "@/lib/ballot/storage";
import {
  inBallotOrder,
  isRace,
  itemHref,
  itemTitle,
  sanitizeBallot,
  type BallotKey,
  type Catalog,
  type CatalogItem,
} from "@/lib/ballot/types";

function searchText(item: CatalogItem) {
  const parts = isRace(item)
    ? [item.office, item.districtLabel, ...item.candidates.map((c) => c.name)]
    : ["measure", item.number, item.title];
  return [...parts, item.jurisdiction].join(" ").toLowerCase();
}

/** Step 2 of the voter flow: check the suggested list against the paper ballot. */
export function BallotBuilder({
  catalog,
  signedIn,
  initialAddress,
  initialState,
}: {
  catalog: Catalog;
  signedIn: boolean;
  initialAddress: string;
  initialState: StateCode;
}) {
  const all = useMemo(() => [...catalog.races, ...catalog.measures], [catalog]);
  const byKey = useMemo(() => new Map<string, CatalogItem>(all.map((i) => [i.key, i])), [all]);
  const order = (keys: readonly string[]) => inBallotOrder(keys, catalog);

  const [items, setItems] = useState<BallotKey[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [state, setState] = useState<StateCode>(initialState);
  const [nearbyKeys, setNearbyKeys] = useState<BallotKey[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [browseAll, setBrowseAll] = useState(false);
  const [looking, setLooking] = useState(false);
  const [removed, setRemoved] = useState<CatalogItem | null>(null);
  const autoLookedUp = useRef(false);

  // Load: the browser copy, merged with the profile copy when signed in.
  useEffect(() => {
    const local = readBallot();
    const load: Promise<BallotKey[]> = signedIn
      ? fetch("/api/me/ballot")
          .then((r) => (r.ok ? r.json() : { items: [] }))
          .then((d: { items: unknown }) => [...sanitizeBallot(d.items), ...local])
          .catch(() => local)
      : Promise.resolve(local);
    void load.then((next) => {
      setItems(inBallotOrder(next, catalog));
      setLoaded(true);
    });
  }, [signedIn, catalog]);

  // Save on every change once loaded.
  useEffect(() => {
    if (!loaded) return;
    writeBallot(items);
    if (signedIn) {
      void fetch("/api/me/ballot", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }
  }, [items, loaded, signedIn]);

  const add = (keys: BallotKey[]) => setItems((cur) => order([...cur, ...keys]));
  const remove = (key: BallotKey) => {
    setItems((cur) => cur.filter((k) => k !== key));
    setRemoved(byKey.get(key) ?? null);
  };

  // The undo toast after Remove clears itself after a few seconds.
  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(null), 6000);
    return () => clearTimeout(t);
  }, [removed]);

  async function suggest(addr: string, st: StateCode) {
    setStatus("Looking up your districts…");
    setLooking(true);
    try {
      const res = await fetch("/api/ballot/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: addr, state: st }),
      });
      const data = (await res.json()) as {
        matchedAddress?: string;
        covered?: boolean;
        suggested?: unknown;
        nearby?: unknown;
        error?: string;
      };
      if (!res.ok) {
        setStatus(
          data.error === "address_not_found"
            ? "We couldn't find that address. Try adding the city and ZIP, or add your races yourself below."
            : data.error === "rate_limited"
              ? "That's a lot of lookups at once. Give it a minute, or add your races yourself below."
              : "Address lookup isn't working right now. You can still add your races yourself below.",
        );
        return;
      }
      if (data.covered === false) {
        setStatus(
          `Found ${data.matchedAddress}. We only have Oregon races and measures so far, so there's nothing to suggest yet.`,
        );
        return;
      }
      const suggested = sanitizeBallot(data.suggested);
      add(suggested);
      setNearbyKeys(sanitizeBallot(data.nearby));
      setStatus(
        `Found ${suggested.length} races and measures for ${data.matchedAddress}. Check them against your paper ballot.`,
      );
    } catch {
      setStatus("Address lookup isn't working right now. You can still add your races yourself below.");
    } finally {
      setLooking(false);
    }
  }

  useEffect(() => {
    if (loaded && initialAddress && !autoLookedUp.current) {
      autoLookedUp.current = true;
      void suggest(initialAddress, initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, after the saved ballot loads
  }, [loaded]);

  const mine = items.flatMap((k) => byKey.get(k) ?? []);
  const nearby = nearbyKeys.flatMap((k) => (items.includes(k) ? [] : (byKey.get(k) ?? [])));
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return browseAll ? all : [];
    return all.filter((i) => searchText(i).includes(q));
  }, [all, query, browseAll]);
  const first = mine[0];
  // Catalog order is ballot order, so consecutive items with the same jurisdiction form one group.
  const groups = mine.reduce<{ name: string; start: number; items: { item: CatalogItem; n: number }[] }[]>(
    (acc, item, n) => {
      const last = acc.at(-1);
      if (last && last.name === item.jurisdiction) last.items.push({ item, n: n + 1 });
      else acc.push({ name: item.jurisdiction, start: n + 1, items: [{ item, n: n + 1 }] });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="eyebrow">Where do you live?</h2>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (address.trim()) void suggest(address.trim(), state);
          }}
        >
          <label htmlFor="address" className="sr-only">
            Your address
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, ZIP"
            autoComplete="street-address"
            className="input flex-1"
          />
          <label htmlFor="state" className="sr-only">
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(isStateCode(e.target.value) ? e.target.value : defaultState)}
            autoComplete="address-level1"
            className="input"
          >
            {usStates.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <button className="btn" disabled={looking}>
            Suggest my ballot
          </button>
        </form>
        <p className="note">We don&apos;t store your address. We just use it to find the races you can vote in.</p>
        {status && (
          <p
            role="status"
            className="border border-line border-l-[3px] border-l-gold bg-gold-soft px-4 py-3 text-[15px]"
          >
            {status}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Your ballot</h2>
          {mine.length > 0 && <span className="note">{mine.length} items</span>}
        </div>
        <p className="note">
          In the same order as the printed Oregon ballot. Hold your paper ballot next to the screen and remove anything
          that isn&apos;t on yours. Check it on{" "}
          <a
            className="link"
            href="https://sos.oregon.gov/voting/Pages/myvote.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            Oregon My Vote
          </a>
          .
        </p>
        {!loaded || (looking && mine.length === 0) ? (
          <div aria-hidden className="flex flex-col gap-2 border border-line bg-paper p-4">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="flex items-center gap-3 py-1.5">
                <span className="skeleton h-4 w-6" />
                <span className="skeleton h-4 flex-1" />
                <span className="skeleton h-8 w-20" />
              </div>
            ))}
          </div>
        ) : mine.length === 0 ? (
          <p className="border border-dashed border-line-strong bg-paper p-5 text-muted">
            Nothing here yet. Enter your address above, or add items below.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((g) => (
              <section key={`${g.name}-${g.start}`} aria-label={g.name} className="flex flex-col gap-1.5">
                <h3 className="side-label text-muted">{g.name}</h3>
                <ol start={g.start} className="flex flex-col border border-line bg-paper">
                  {g.items.map(({ item: i, n }) => (
                    <ItemRow
                      key={i.key}
                      item={i}
                      index={n}
                      action={
                        <button onClick={() => remove(i.key)} className="btn shrink-0 px-3 py-1 text-sm">
                          Remove<span className="sr-only"> {itemTitle(i)}</span>
                        </button>
                      }
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
        {removed && (
          <div
            role="status"
            className="no-print fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-md items-center justify-between gap-3 bg-ink px-4 py-3 text-sm text-cream shadow-lg"
          >
            <span>Removed {itemTitle(removed)}.</span>
            <button
              type="button"
              className="min-h-9 shrink-0 font-semibold underline decoration-gold decoration-2 underline-offset-4"
              onClick={() => {
                add([removed.key]);
                setRemoved(null);
              }}
            >
              Undo
            </button>
          </div>
        )}
        {nearby.length > 0 && (
          <div className="flex flex-col gap-2 border border-dashed border-line-strong bg-paper p-4">
            <h3 className="side-label">May apply to you</h3>
            <p className="note">
              Local districts in your county. We can&apos;t tell from an address whether you&apos;re in them, so add the
              ones on your paper ballot.
            </p>
            <ul className="flex flex-col">
              {nearby.map((i) => (
                <ItemRow key={i.key} item={i} action={<AddButton onClick={() => add([i.key])} />} />
              ))}
            </ul>
          </div>
        )}
        {first && (
          <div className="no-print sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-4 py-3 sm:mx-0 sm:border">
            <span className="text-sm">
              <strong>{mine.length}</strong> {mine.length === 1 ? "item" : "items"} on your ballot
              <Link href="/ballot/summary" className="link ml-3 hidden sm:inline">
                See your votes
              </Link>
            </span>
            <Link href={itemHref(first)} className="btn-primary">
              This matches my ballot →
            </Link>
          </div>
        )}
        {!signedIn && mine.length > 0 && (
          <p className="note">Saved in this browser. Sign in to keep your list across devices.</p>
        )}
      </section>

      <section className="flex flex-col gap-3 border border-line bg-paper p-5">
        <h2 className="section-title">Add an item</h2>
        <div className="relative">
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
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by office, candidate, measure number or place"
            aria-label="Search races and measures"
            className="input w-full pl-10"
          />
        </div>
        {!query.trim() && (
          <button onClick={() => setBrowseAll((v) => !v)} className="link self-start text-sm">
            {browseAll ? "Hide the full list" : `Browse all ${all.length} races and measures`}
          </button>
        )}
        {query.trim() && results.length === 0 && <p className="note">No matches.</p>}
        {results.length > 0 && (
          <ul className="flex flex-col border border-line">
            {results.map((i) => (
              <ItemRow
                key={i.key}
                item={i}
                action={
                  items.includes(i.key) ? (
                    <span className="px-2 text-sm font-semibold text-olive">Added</span>
                  ) : (
                    <AddButton onClick={() => add([i.key])} />
                  )
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ItemRow({ item, index, action }: { item: CatalogItem; index?: number; action: React.ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <div className="flex gap-3">
        {index !== undefined && (
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-semibold text-muted">{index}.</span>
        )}
        <div>
          {/* In the grouped list the group heading already names the jurisdiction. */}
          {index === undefined ? (
            <p className="text-[12.5px] text-muted">
              {isRace(item) ? item.jurisdiction : `Measure · ${item.jurisdiction}`}
            </p>
          ) : (
            !isRace(item) && <p className="text-[12.5px] text-muted">Measure</p>
          )}
          <Link href={itemHref(item)} className="font-semibold hover:text-olive">
            {itemTitle(item)}
          </Link>
          {isRace(item) && item.candidates.length > 0 && (
            <p className="note">{item.candidates.map((c) => c.name).join(", ")}</p>
          )}
        </div>
      </div>
      {action}
    </li>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn shrink-0 px-3 py-1 text-sm">
      + Add
    </button>
  );
}
