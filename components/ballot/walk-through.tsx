"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { skipped, undecided, type BallotKey, type Choice } from "@/lib/ballot/types";
import { readBallot, readChoices, writeBallot, writeChoice } from "@/lib/ballot/storage";

const hrefFor = (key: BallotKey) =>
  key.startsWith("race:") ? (`/races/${key.slice(5)}` as const) : (`/measures/${key.slice(8)}` as const);

type Option = { value: Choice; label: string };

function useBallot() {
  const [ballot, setBallot] = useState<BallotKey[] | null>(null);
  useEffect(() => {
    void Promise.resolve(readBallot()).then(setBallot);
  }, []);
  return [ballot, setBallot] as const;
}

type Step = "ballot" | "items" | "summary";

/**
 * The step bar under the header, from /ballot on (not on the homepage). Done = filled number, current = gold
 * underline. Phones show only the current step's label.
 */
export function StepBar({ current, itemKey }: { current: Step; itemKey?: BallotKey }) {
  const [ballot] = useBallot();
  const at = itemKey && ballot ? ballot.indexOf(itemKey) : -1;
  const first = ballot?.[0];
  const steps: { id: Step; label: string; href?: Route | ReturnType<typeof hrefFor> }[] = [
    { id: "ballot", label: "Ballot", href: "/ballot" },
    {
      id: "items",
      label: at >= 0 && ballot ? `Items · ${at + 1} of ${ballot.length}` : "Items",
      href: first ? hrefFor(first) : undefined,
    },
    { id: "summary", label: "Summary", href: "/ballot/summary" },
  ];
  const currentIndex = steps.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Progress" className="no-print border-b border-line bg-paper px-4">
      <ol className="mx-auto flex max-w-3xl gap-1">
        {steps.map((s, i) => {
          const done = i < currentIndex;
          const here = i === currentIndex;
          const body = (
            <>
              <span
                className={`inline-flex size-[18px] shrink-0 items-center justify-center text-[11px] font-semibold ${
                  done ? "bg-ink text-cream" : here ? "border border-ink" : "border border-line-strong"
                }`}
              >
                {i + 1}
              </span>
              <span className={here ? "" : "hidden sm:inline"}>{s.label}</span>
            </>
          );
          return (
            <li
              key={s.id}
              aria-current={here ? "step" : undefined}
              className={`flex flex-1 border-b-2 text-[13px] ${
                here ? "border-gold font-semibold" : done ? "border-ink" : "border-line text-muted"
              }`}
            >
              {s.href && !here ? (
                <Link href={s.href} className="flex min-h-10 flex-1 items-center gap-1.5 pt-2.5 pb-2 hover:text-olive">
                  {body}
                </Link>
              ) : (
                <span className="flex min-h-10 flex-1 items-center gap-1.5 pt-2.5 pb-2">{body}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Position in the voter's ballot ("Item 3 of 14") with Previous and Next. */
export function WalkPosition({ itemKey }: { itemKey: BallotKey }) {
  const [ballot, setBallot] = useBallot();
  if (!ballot) return <div className="h-10" />;
  const at = ballot.indexOf(itemKey);
  if (at < 0) {
    return (
      <div className="no-print flex items-center justify-between gap-3 text-sm">
        <Link href="/ballot" className="link py-2.5">
          ← Your ballot
        </Link>
        <button
          className="btn px-3 py-1 text-sm"
          onClick={() => {
            const next = [...ballot, itemKey];
            writeBallot(next);
            setBallot(next);
          }}
        >
          + Add to my ballot
        </button>
      </div>
    );
  }
  const prev = ballot[at - 1];
  const next = ballot[at + 1];
  return (
    <nav aria-label="Ballot items" className="no-print flex items-center justify-between gap-3 text-sm">
      <Link href={prev ? hrefFor(prev) : "/ballot"} className="link py-2.5">
        {prev ? "← Previous" : "← Your ballot"}
      </Link>
      <span className="eyebrow">
        Item {at + 1} of {ballot.length}
      </span>
      <Link href={next ? hrefFor(next) : "/ballot/summary"} className="link py-2.5">
        {next ? "Next →" : "Summary →"}
      </Link>
    </nav>
  );
}

/** "Your choice for this item": the voter picks; nothing is preselected. Stored in this browser only. */
export function YourChoice({ itemKey, label, options }: { itemKey: BallotKey; label: string; options: Option[] }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [saved, setSaved] = useState(false);
  const [ballot, setBallot] = useState<BallotKey[]>([]);
  useEffect(() => {
    void Promise.resolve([readChoices()[itemKey] ?? null, readBallot()] as const).then(([c, b]) => {
      setChoice(c);
      setBallot(b);
    });
  }, [itemKey]);

  const at = ballot.indexOf(itemKey);
  const prev = at > 0 ? ballot[at - 1] : undefined;
  const next = at >= 0 ? ballot[at + 1] : undefined;
  const pick = (value: Choice) => {
    setChoice(value);
    setSaved(true);
    writeChoice(itemKey, value);
  };
  const all: Option[] = [...options, { value: undecided, label: "Undecided" }, { value: skipped, label: "Skip" }];

  return (
    <>
      <section
        aria-labelledby={`choice-${itemKey}`}
        className="no-print flex flex-col gap-3 border border-ink bg-paper p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id={`choice-${itemKey}`} className="font-display text-[22px] font-semibold">
            Your choice for this item
          </h2>
          {saved && <p className="text-[13.5px] font-semibold text-olive">Saved in this browser</p>}
        </div>
        <fieldset className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
          <legend className="sr-only">{label}</legend>
          {all.map((o) => {
            const on = choice === o.value;
            const secondary = o.value === undecided || o.value === skipped;
            return (
              <label
                key={o.value}
                className={`flex min-h-12 cursor-pointer items-center gap-2.5 bg-paper px-3.5 py-3 ${
                  on
                    ? "border-2 border-ink"
                    : `border ${secondary ? "border-dashed border-line-strong" : "border-line-strong"}`
                }`}
              >
                <input
                  type="radio"
                  name={`pick-${itemKey}`}
                  checked={on}
                  onChange={() => pick(o.value)}
                  className="size-[18px] accent-ink"
                />
                <span className={`text-[15px] ${on ? "font-semibold" : secondary ? "text-ink-soft" : ""}`}>
                  {o.label}
                </span>
              </label>
            );
          })}
        </fieldset>
        <p className="note">Only you see this. It stays in this browser and goes on your summary.</p>
      </section>
      <nav aria-label="Ballot items, bottom" className="no-print flex flex-wrap justify-between gap-3">
        <Link href={prev ? hrefFor(prev) : "/ballot"} className="btn">
          {prev ? "← Previous" : "← Your ballot"}
        </Link>
        <Link href={next ? hrefFor(next) : "/ballot/summary"} className="btn-primary">
          {next ? "Next item →" : at >= 0 ? "See my summary →" : "Go to my summary →"}
        </Link>
      </nav>
    </>
  );
}
