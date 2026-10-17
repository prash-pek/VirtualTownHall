"use client";

import { useEffect, useState } from "react";

import { readShortlists, writeShortlist } from "@/lib/ballot/storage";
import type { BallotKey } from "@/lib/ballot/types";

/**
 * Shortlist and rank, under "Your call" on a race page. For a ranked-choice race (Portland) the order is the
 * order the voter will mark their ballot; for any race it's the few they're still weighing. Nothing is
 * preselected, and it stays in this browser.
 */
export function Shortlist({
  itemKey,
  candidates,
}: {
  itemKey: BallotKey;
  candidates: { slug: string; name: string }[];
}) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    void Promise.resolve(readShortlists()[itemKey] ?? []).then((l) =>
      setList(l.filter((s) => candidates.some((c) => c.slug === s))),
    );
  }, [itemKey, candidates]);

  const save = (next: string[]) => {
    setList(next);
    writeShortlist(itemKey, next);
  };
  const move = (i: number, by: -1 | 1) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x!);
    save(next);
  };
  const name = (slug: string) => candidates.find((c) => c.slug === slug)?.name ?? slug;
  const rest = candidates.filter((c) => !list.includes(c.slug));

  if (candidates.length < 2) return null;
  return (
    <details open={list.length > 0} className="group border-t border-line pt-3">
      <summary className="flex min-h-10 cursor-pointer items-center gap-2 text-[15px] font-semibold">
        <span aria-hidden className="text-muted transition-transform group-open:rotate-90">
          ▸
        </span>
        Shortlist or rank {list.length > 0 && <span className="font-normal text-muted">({list.length})</span>}
      </summary>
      <div className="mt-2 flex flex-col gap-3">
        <p className="note">
          Still deciding between a few? Add them here. In a ranked-choice race, put them in the order you&apos;ll mark
          your ballot.
        </p>
        {list.length > 0 && (
          <ol className="flex flex-col gap-1.5" aria-label="Your shortlist, in order">
            {list.map((slug, i) => (
              <li key={slug} className="flex min-h-11 items-center gap-3 border border-ink bg-paper px-3">
                <span className="flex size-6 shrink-0 items-center justify-center bg-ink text-xs font-semibold text-cream">
                  {i + 1}
                </span>
                <span className="flex-1 text-[15px] font-semibold">{name(slug)}</span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    className="size-9 border border-line-strong text-sm hover:border-ink disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Move ${name(slug)} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="size-9 border border-line-strong text-sm hover:border-ink disabled:opacity-30"
                    disabled={i === list.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Move ${name(slug)} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="min-h-9 px-2 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
                    onClick={() => save(list.filter((s) => s !== slug))}
                    aria-label={`Take ${name(slug)} off your shortlist`}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
        {rest.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rest.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => save([...list, c.slug])}
                className="min-h-10 border border-dashed border-line-strong bg-cream px-3 text-sm hover:border-ink"
              >
                <span aria-hidden>+ </span>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
