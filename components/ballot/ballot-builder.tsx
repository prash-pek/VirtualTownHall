"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  sanitizeBallot,
  type BallotKey,
  type Catalog,
  type CatalogMeasure,
  type CatalogRace,
} from "@/lib/ballot/types";

const storageKey = "townhall:ballot";

type Item = CatalogRace | CatalogMeasure;

function readLocal(): BallotKey[] {
  try {
    return sanitizeBallot(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
  } catch {
    return [];
  }
}

function writeLocal(items: BallotKey[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Private mode or storage disabled: the ballot still works for this visit.
  }
}

function itemTitle(item: Item) {
  return "office" in item
    ? `${item.office}${item.districtLabel ? `, ${item.districtLabel}` : ""}`
    : `Measure ${item.number}: ${item.title}`;
}

function itemHref(item: Item) {
  return "office" in item ? (`/races/${item.slug}` as const) : (`/measures/${item.slug}` as const);
}

function searchText(item: Item) {
  const parts =
    "office" in item
      ? [item.office, item.districtLabel, ...item.candidates.map((c) => c.name)]
      : [item.number, item.title];
  return [...parts, item.jurisdiction].join(" ").toLowerCase();
}

export function BallotBuilder({
  catalog,
  signedIn,
  initialAddress,
}: {
  catalog: Catalog;
  signedIn: boolean;
  initialAddress: string;
}) {
  const byKey = useMemo(
    () => new Map<string, Item>([...catalog.races, ...catalog.measures].map((i) => [i.key, i])),
    [catalog],
  );
  const [items, setItems] = useState<BallotKey[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [lookup, setLookup] = useState<{ matchedAddress: string; nearby: BallotKey[] } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const autoLookedUp = useRef(false);

  // Load: the browser copy, merged with the profile copy when signed in.
  useEffect(() => {
    const local = readLocal();
    const load: Promise<BallotKey[]> = signedIn
      ? fetch("/api/me/ballot")
          .then((r) => (r.ok ? r.json() : { items: [] }))
          .then((d: { items: unknown }) => sanitizeBallot([...sanitizeBallot(d.items), ...local]))
          .catch(() => local)
      : Promise.resolve(local);
    void load.then((next) => {
      setItems(next);
      setLoaded(true);
    });
  }, [signedIn]);

  // Save on every change once loaded.
  useEffect(() => {
    if (!loaded) return;
    writeLocal(items);
    if (signedIn) {
      void fetch("/api/me/ballot", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }
  }, [items, loaded, signedIn]);

  const add = (keys: BallotKey[]) => setItems((cur) => sanitizeBallot([...cur, ...keys]));
  const remove = (key: BallotKey) => setItems((cur) => cur.filter((k) => k !== key));

  async function suggest(addr: string) {
    setStatus("Looking up your districts…");
    try {
      const res = await fetch("/api/ballot/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      const data = (await res.json()) as {
        matchedAddress?: string;
        suggested?: unknown;
        nearby?: unknown;
        error?: string;
      };
      if (!res.ok) {
        setStatus(
          data.error === "address_not_found"
            ? "We couldn't find that address. Try including the city and ZIP code, or browse below."
            : data.error === "rate_limited"
              ? "Too many lookups. Please try again later, or browse below."
              : "Address lookup isn't available right now. You can still browse below.",
        );
        return;
      }
      const suggested = sanitizeBallot(data.suggested);
      add(suggested);
      setLookup({ matchedAddress: data.matchedAddress ?? addr, nearby: sanitizeBallot(data.nearby) });
      setStatus(`Added ${suggested.length} items for ${data.matchedAddress}. Remove anything that doesn't apply.`);
    } catch {
      setStatus("Address lookup isn't available right now. You can still browse below.");
    }
  }

  useEffect(() => {
    if (loaded && initialAddress && !autoLookedUp.current) {
      autoLookedUp.current = true;
      void suggest(initialAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, after the saved ballot loads
  }, [loaded]);

  const mine = items.flatMap((k) => byKey.get(k) ?? []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...catalog.races, ...catalog.measures];
    return (q ? all.filter((i) => searchText(i).includes(q)) : all).slice(0, 40);
  }, [catalog, query]);
  const nearby = (lookup?.nearby ?? []).flatMap((k) => (items.includes(k) ? [] : (byKey.get(k) ?? [])));

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (address.trim()) void suggest(address.trim());
          }}
        >
          <label htmlFor="address" className="sr-only">
            Your Oregon address
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, ZIP"
            autoComplete="street-address"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
            Suggest my ballot
          </button>
        </form>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Optional. We use your address once to suggest races and don&apos;t store it.
        </p>
        {status && <p role="status">{status}</p>}
        {nearby.length > 0 && (
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-sm font-medium">Local districts in your county that may apply to you:</p>
            <ul className="flex flex-col gap-1">
              {nearby.map((i) => (
                <ItemRow key={i.key} item={i} action={<AddButton onClick={() => add([i.key])} />} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">My ballot</h2>
        {!loaded ? null : mine.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            Nothing here yet. Enter your address above, or add races and measures below.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {mine.map((i) => (
              <ItemRow
                key={i.key}
                item={i}
                action={
                  <button
                    onClick={() => remove(i.key)}
                    aria-label={`Remove ${itemTitle(i)}`}
                    className="rounded px-2 text-slate-500 hover:text-red-600"
                  >
                    ×
                  </button>
                }
              />
            ))}
          </ul>
        )}
        {!signedIn && mine.length > 0 && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Saved in this browser. Sign in to keep it across devices.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Add races and measures</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by office, candidate, measure or place"
          aria-label="Search races and measures"
          className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <ul className="flex flex-col gap-1">
          {results.map((i) => (
            <ItemRow
              key={i.key}
              item={i}
              action={
                items.includes(i.key) ? (
                  <span className="px-2 text-sm text-slate-500">Added</span>
                ) : (
                  <AddButton onClick={() => add([i.key])} />
                )
              }
            />
          ))}
        </ul>
        {results.length === 40 && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Showing the first 40. Search to narrow it down.
          </p>
        )}
      </section>
    </div>
  );
}

function ItemRow({ item, action }: { item: Item; action: React.ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 dark:border-slate-900">
      <div>
        <Link href={itemHref(item)} className="font-medium hover:underline">
          {itemTitle(item)}
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {item.jurisdiction}
          {"candidates" in item && item.candidates.length > 0 && ` · ${item.candidates.map((c) => c.name).join(", ")}`}
        </p>
      </div>
      {action}
    </li>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-md border border-slate-300 px-2 py-0.5 text-sm dark:border-slate-700">
      + Add
    </button>
  );
}
