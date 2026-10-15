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
  const remove = (key: BallotKey) => setItems((cur) => cur.filter((k) => k !== key));

  async function suggest(addr: string, st: StateCode) {
    setStatus("Looking up your districts…");
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
            ? "We couldn't find that address. Check the state, or add the city and ZIP code. You can also add items yourself below."
            : data.error === "rate_limited"
              ? "Too many lookups. Please try again later, or add items yourself below."
              : "Address lookup isn't available right now. You can still add items yourself below.",
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
        `Added ${suggested.length} items for ${data.matchedAddress}. Remove anything that isn't on your paper ballot.`,
      );
    } catch {
      setStatus("Address lookup isn't available right now. You can still add items yourself below.");
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
          <button className="btn">Suggest my ballot</button>
        </form>
        <p className="note">We use your address once to suggest your ballot, then throw it away.</p>
        {status && (
          <p role="status" className="border-l-2 border-gold bg-gold-soft px-3 py-2">
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
        {!loaded ? null : mine.length === 0 ? (
          <p className="card text-muted">Nothing here yet. Enter your address above, or add items below.</p>
        ) : (
          <ol className="card flex flex-col p-0">
            {mine.map((i, n) => (
              <ItemRow
                key={i.key}
                item={i}
                index={n + 1}
                action={
                  <button onClick={() => remove(i.key)} className="note px-2 hover:text-ink">
                    Remove<span className="sr-only"> {itemTitle(i)}</span>
                  </button>
                }
              />
            ))}
          </ol>
        )}
        {nearby.length > 0 && (
          <div className="card flex flex-col gap-2">
            <p className="eyebrow">May apply to you</p>
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
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={itemHref(first)} className="btn-primary">
              This matches my ballot →
            </Link>
            <Link href="/ballot/summary" className="link text-sm">
              Go to my summary
            </Link>
          </div>
        )}
        {!signedIn && mine.length > 0 && (
          <p className="note">Saved in this browser. Sign in to keep your list across devices.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">+ Add an item</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by office, candidate, measure number or place"
          aria-label="Search races and measures"
          className="input w-full"
        />
        {!query.trim() && (
          <button onClick={() => setBrowseAll((v) => !v)} className="link self-start text-sm">
            {browseAll ? "Hide the full list" : `Browse all ${all.length} races and measures`}
          </button>
        )}
        {query.trim() && results.length === 0 && <p className="note">No matches.</p>}
        {results.length > 0 && (
          <ul className="card flex flex-col p-0">
            {results.map((i) => (
              <ItemRow
                key={i.key}
                item={i}
                action={
                  items.includes(i.key) ? (
                    <span className="note px-2">Added</span>
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
        {index !== undefined && <span className="w-6 shrink-0 text-right text-sm text-muted">{index}.</span>}
        <div>
          <p className="eyebrow">{isRace(item) ? item.jurisdiction : `Measure · ${item.jurisdiction}`}</p>
          <Link href={itemHref(item)} className="font-medium hover:text-olive">
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
    <button onClick={onClick} className="btn shrink-0 px-2 py-0.5 text-sm">
      + Add
    </button>
  );
}
