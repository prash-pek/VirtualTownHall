"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readBallot, readChoices } from "@/lib/ballot/storage";
import {
  inBallotOrder,
  isRace,
  itemHref,
  itemTitle,
  skipped,
  undecided,
  type BallotKey,
  type Catalog,
  type CatalogItem,
  type Choice,
} from "@/lib/ballot/types";

function choiceLabel(item: CatalogItem, choice: Choice | undefined): string | null {
  if (!choice || choice === undecided) return null;
  if (choice === skipped) return "Skipped";
  if (isRace(item)) return item.candidates.find((c) => c.slug === choice)?.name ?? null;
  return choice === "yes" ? "Yes" : choice === "no" ? "No" : null;
}

/** Step 5: the cheat sheet the voter fills their paper ballot from, in ballot order. */
export function BallotSummary({ catalog }: { catalog: Catalog }) {
  const byKey = useMemo(
    () => new Map<string, CatalogItem>([...catalog.races, ...catalog.measures].map((i) => [i.key, i])),
    [catalog],
  );
  const [state, setState] = useState<{ ballot: BallotKey[]; choices: Record<string, Choice> } | null>(null);
  useEffect(() => {
    void Promise.resolve({ ballot: inBallotOrder(readBallot(), catalog), choices: readChoices() }).then(setState);
  }, [catalog]);
  if (!state) return null;

  const items = state.ballot.flatMap((k) => byKey.get(k) ?? []);
  if (items.length === 0) {
    return (
      <p className="border border-dashed border-line-strong bg-paper p-5">
        Your ballot is empty.{" "}
        <Link href="/ballot" className="link">
          Build your ballot
        </Link>{" "}
        first.
      </p>
    );
  }
  const open = items.filter((i) => choiceLabel(i, state.choices[i.key]) === null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border border-line bg-paper px-4 py-3">
        <span className={`text-[15px] font-semibold ${open === 0 ? "text-olive" : ""}`}>
          {open === 0 ? "Every item has a choice." : `${open} still undecided.`}
        </span>
        <button onClick={() => window.print()} className="link text-sm">
          Print a copy
        </button>
      </div>
      <ol className="flex flex-col border border-line bg-paper">
        {items.map((i, n) => {
          const label = choiceLabel(i, state.choices[i.key]);
          return (
            <li
              key={i.key}
              className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="flex gap-3">
                <span className="w-6 shrink-0 text-right text-sm text-muted">{n + 1}.</span>
                <div>
                  <p className="text-[12.5px] text-muted">
                    {isRace(i) ? i.jurisdiction : `Measure · ${i.jurisdiction}`}
                  </p>
                  <p className="font-semibold">{itemTitle(i)}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                {label ? (
                  <p className="font-display text-lg font-semibold">{label}</p>
                ) : (
                  <>
                    <p className="border border-dashed border-line-strong px-2 py-0.5 text-sm font-semibold text-ink-soft">
                      Undecided
                    </p>
                    <Link href={itemHref(i)} className="no-print link text-sm">
                      Go back
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="note">
        Your choices are stored only in this browser. They&apos;re your own notes: we never see them, and they
        don&apos;t submit a vote.
      </p>
    </div>
  );
}
