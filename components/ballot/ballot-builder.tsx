"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { defaultState, isStateCode, usStates, type StateCode } from "@/lib/ballot/states";
import { readBallot, writeBallot } from "@/lib/ballot/storage";
import {
  inBallotOrder,
  itemHref,
  itemTitle,
  sanitizeBallot,
  type BallotKey,
  type Catalog,
  type CatalogItem,
} from "@/lib/ballot/types";

import { AddItems } from "./add-items";
import { AddButton, ItemRow } from "./item-row";

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
  const [possibleKeys, setPossibleKeys] = useState<BallotKey[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [removed, setRemoved] = useState<CatalogItem | null>(null);
  const autoLookedUp = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
        zip?: boolean;
        suggested?: unknown;
        possible?: unknown;
        nearby?: unknown;
        error?: string;
      };
      if (!res.ok) {
        setStatus(
          data.error === "address_not_found"
            ? "We couldn't find that address. Try adding the city and ZIP, or add your races yourself below."
            : data.error === "zip_not_found"
              ? "We couldn't find that ZIP in Oregon. Try your street address, or add your races yourself below."
              : data.error === "beta_locked"
                ? "Enter the beta password above to look up your ballot. You can still add your races yourself below."
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
      const possible = sanitizeBallot(data.possible);
      setNearbyKeys(sanitizeBallot(data.nearby));
      setPossibleKeys(possible);
      setStatus(
        data.zip && possible.length > 0
          ? `Found ${suggested.length} races and measures for all of ${data.matchedAddress}. Your ZIP crosses district lines, so pick the rest below, or enter your street address for an exact match.`
          : `Found ${suggested.length} races and measures for ${data.matchedAddress}. Check them against your paper ballot.`,
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
  const possible = possibleKeys.flatMap((k) => (items.includes(k) ? [] : (byKey.get(k) ?? [])));
  const first = mine[0];
  // Catalog order is ballot order, so consecutive items in the same ballot section form one group.
  const groups = mine.reduce<{ name: string; start: number; items: { item: CatalogItem; n: number }[] }[]>(
    (acc, item, n) => {
      const last = acc.at(-1);
      if (last && last.name === item.group) last.items.push({ item, n: n + 1 });
      else acc.push({ name: item.group, start: n + 1, items: [{ item, n: n + 1 }] });
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
            placeholder="ZIP code or street address"
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
        <p className="note">A ZIP is quickest. A street address gets an exact match. We don&apos;t store either.</p>
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
          . Missing something?{" "}
          <button type="button" className="link" onClick={() => searchRef.current?.focus()}>
            Search to add it
          </button>
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
            Nothing here yet. Enter your ZIP or address above, or add items below.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((g) => (
              <section
                key={`${g.name}-${g.start}`}
                aria-labelledby={`group-${g.start}`}
                className="border border-line bg-paper"
              >
                <h3
                  id={`group-${g.start}`}
                  className="flex items-baseline justify-between gap-3 border-b border-line bg-cream px-4 py-2.5"
                >
                  <span className="side-label">{g.name}</span>
                  <span className="text-[12.5px] text-muted">{g.items.length}</span>
                </h3>
                <ol start={g.start} className="flex flex-col">
                  {g.items.map(({ item: i, n }) => (
                    <ItemRow
                      key={i.key}
                      item={i}
                      index={n}
                      showPlace={new Set(g.items.map(({ item }) => item.jurisdiction)).size > 1}
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
        {possible.length > 0 && (
          <div className="flex flex-col gap-2 border border-dashed border-line-strong bg-paper p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="side-label">Depends on your street</h3>
              <button type="button" onClick={() => add(possible.map((i) => i.key))} className="link text-sm">
                Add all of these
              </button>
            </div>
            <p className="note">
              Your ZIP is split between these districts. Add the ones on your paper ballot, or enter your street address
              above for an exact match.
            </p>
            <ul className="flex flex-col">
              {possible.map((i) => (
                <ItemRow key={i.key} item={i} action={<AddButton onClick={() => add([i.key])} />} />
              ))}
            </ul>
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

      <AddItems all={all} added={items} onAdd={(key) => add([key])} onRemove={remove} inputRef={searchRef} />
    </div>
  );
}
