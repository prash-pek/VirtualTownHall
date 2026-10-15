"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { skipped, undecided, type BallotKey, type Choice } from "@/lib/ballot/types";
import { readBallot, readChoices, writeBallot, writeChoice } from "@/lib/ballot/storage";

const hrefFor = (key: BallotKey) =>
  key.startsWith("race:") ? (`/races/${key.slice(5)}` as const) : (`/measures/${key.slice(8)}` as const);

type Option = { value: Choice; label: string };

/** Position in the voter's ballot ("Item 3 of 14") with Previous and Next. */
export function WalkPosition({ itemKey }: { itemKey: BallotKey }) {
  const [ballot, setBallot] = useState<BallotKey[] | null>(null);
  useEffect(() => {
    void Promise.resolve(readBallot()).then(setBallot);
  }, []);
  if (!ballot) return <div className="h-6" />;
  const at = ballot.indexOf(itemKey);
  if (at < 0) {
    return (
      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/ballot" className="link text-sm">
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
  return (
    <nav className="no-print flex items-center justify-between gap-3 text-sm">
      {prev ? (
        <Link href={hrefFor(prev)} className="link">
          ← Previous
        </Link>
      ) : (
        <Link href="/ballot" className="link">
          ← Your ballot
        </Link>
      )}
      <span className="eyebrow">
        Item {at + 1} of {ballot.length}
      </span>
    </nav>
  );
}

/** "Your choice for this item": the voter picks; nothing is preselected. Stored in this browser only. */
export function YourChoice({ itemKey, options }: { itemKey: BallotKey; options: Option[] }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ballot, setBallot] = useState<BallotKey[]>([]);
  useEffect(() => {
    void Promise.resolve([readChoices()[itemKey] ?? null, readBallot()] as const).then(([c, b]) => {
      setChoice(c);
      setBallot(b);
    });
  }, [itemKey]);

  const at = ballot.indexOf(itemKey);
  const next = at >= 0 ? ballot[at + 1] : undefined;
  const pick = (value: Choice) => {
    setChoice(value);
    writeChoice(itemKey, value);
  };
  const all: Option[] = [...options, { value: undecided, label: "Undecided" }, { value: skipped, label: "Skip" }];

  return (
    <section className="no-print card flex flex-col gap-3 border-ink">
      <h2 className="eyebrow">Your choice for this item</h2>
      <div role="radiogroup" aria-label="Your choice" className="flex flex-wrap gap-2">
        {all.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={choice === o.value}
            onClick={() => pick(o.value)}
            className={choice === o.value ? "btn-primary px-3 py-1.5" : "btn px-3 py-1.5"}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="note">Only you see this. It stays in this browser and goes on your summary.</p>
      <div className="flex flex-wrap items-center gap-3">
        {next ? (
          <Link href={hrefFor(next)} className="btn-primary">
            Next item →
          </Link>
        ) : (
          <Link href="/ballot/summary" className="btn-primary">
            {at >= 0 ? "See my summary →" : "Go to my summary →"}
          </Link>
        )}
      </div>
    </section>
  );
}
