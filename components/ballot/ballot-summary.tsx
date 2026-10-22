"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readBallot, readChoices, readShortlists } from "@/lib/ballot/storage";
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
  const [state, setState] = useState<{
    ballot: BallotKey[];
    choices: Record<string, Choice>;
    shortlists: Record<string, string[]>;
  } | null>(null);
  useEffect(() => {
    void Promise.resolve({
      ballot: inBallotOrder(readBallot(), catalog),
      choices: readChoices(),
      shortlists: readShortlists(),
    }).then(setState);
  }, [catalog]);
  if (!state) return null;

  const items = state.ballot.flatMap((k) => byKey.get(k) ?? []);
  if (items.length === 0) {
    return (
      <p className="border border-dashed border-line-strong bg-paper p-5">
        Your ballot is empty so far.{" "}
        <Link href="/ballot" className="link">
          Build your ballot
        </Link>{" "}
        first.
      </p>
    );
  }
  const shortlistOf = (i: CatalogItem) =>
    isRace(i) ? (state.shortlists[i.key] ?? []).flatMap((slug) => i.candidates.find((c) => c.slug === slug) ?? []) : [];
  const open = items.filter((i) => choiceLabel(i, state.choices[i.key]) === null && shortlistOf(i).length === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`no-print flex flex-wrap items-center gap-2.5 border px-4 py-3 ${
          open === 0 ? "border-[#d5dcc3] bg-olive-soft" : "border-line bg-paper"
        }`}
      >
        {open === 0 && (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
            className="size-5 text-olive"
          >
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        )}
        <span className={`text-[15px] font-semibold ${open === 0 ? "text-olive" : ""}`}>
          {open === 0 ? "You've made a call on everything." : `${open} left to decide.`}
        </span>
      </div>
      <ol className="flex flex-col border border-line bg-paper">
        {items.map((i, n) => {
          const label = choiceLabel(i, state.choices[i.key]);
          return (
            <li
              key={i.key}
              className="relative flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0 hover:bg-cream has-[a:focus-visible]:bg-cream"
            >
              <div className="flex gap-3">
                <span className="w-6 shrink-0 text-right text-sm text-muted">{n + 1}.</span>
                <div>
                  <p className="text-[12.5px] text-muted">
                    {isRace(i) ? i.jurisdiction : `Measure · ${i.jurisdiction}`}
                  </p>
                  {/* The whole row is the link: its ::after covers the row, other links sit above it. */}
                  <Link
                    href={itemHref(i)}
                    className="font-semibold after:absolute after:inset-0 after:content-[''] hover:text-olive focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ink"
                  >
                    {itemTitle(i)}
                  </Link>
                </div>
              </div>
              <div className="shrink-0 text-right">
                {label ? (
                  <p className="font-display text-lg font-semibold">{label}</p>
                ) : shortlistOf(i).length === 0 ? (
                  <>
                    <p className="border border-dashed border-line-strong px-2 py-0.5 text-sm font-semibold text-ink-soft">
                      Not sure yet
                    </p>
                    <Link href={itemHref(i)} className="no-print link relative z-10 text-sm">
                      Go back
                    </Link>
                  </>
                ) : null}
                {isRace(i) && shortlistOf(i).length > 0 && (
                  <div className={label ? "mt-1" : ""}>
                    <p className="text-[12.5px] text-muted">Your shortlist</p>
                    <ol className="text-[15px] font-semibold">
                      {shortlistOf(i).map((c, r) => (
                        <li key={c.slug}>
                          {r + 1}. {c.name}
                        </li>
                      ))}
                    </ol>
                    {shortlistOf(i).length >= 2 && (
                      <Link
                        href={`${itemHref(i)}?ask=${shortlistOf(i)
                          .map((c) => c.slug)
                          .join(",")}#ask`}
                        className="no-print link relative z-10 text-sm"
                      >
                        Ask your shortlist
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="no-print">
        Missing a race?{" "}
        <Link href="/ballot" className="link">
          Find it and add it to your ballot
        </Link>
        .
      </p>
      <p className="note">These are your notes, not a vote. They stay on this device and we never see them.</p>
      {/* Only on paper: who made this, so a printed copy explains itself. */}
      <p className="hidden border-t border-line pt-3 text-sm print:block">
        Made with TownHall AI · townhallai.outsetinno.com
      </p>
    </div>
  );
}
