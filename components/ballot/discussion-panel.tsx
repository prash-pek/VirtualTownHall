"use client";

import { useState } from "react";

type Answer = {
  side: string;
  label: string;
  answer: string;
  sourceIds: number[];
  sources: { n: number; url: string | null; publisher: string | null }[];
};
type Round = { question: string; responses: Answer[] };

const errors: Record<string, string> = {
  rate_limited: "You've asked a lot of questions in a short time. Please try again later.",
  no_content: "There isn't reviewed material on this item yet, so there's nothing to discuss from.",
  unavailable: "The discussion isn't switched on yet.",
};

const noAnswer = (a: Answer) => a.answer.startsWith("No answer was produced");
/** An answer with no citations is the "our sources don't cover this" case (the prompt requires empty sourceIds). */
const uncovered = (a: Answer) => a.sourceIds.length === 0 && !noAnswer(a);

/**
 * Ask one question; every candidate (or YES and NO) answers from our sources, side by side. For a race,
 * `sides` lets the voter pick which candidates to ask. That choice stays in this component: it is never
 * stored or sent anywhere but the question itself.
 */
export function DiscussionPanel({
  itemKey,
  starters,
  sides = [],
}: {
  itemKey: string;
  starters: string[];
  sides?: { id: string; label: string }[];
}) {
  const [selected, setSelected] = useState<string[]>(() => sides.map((s) => s.id));
  const [rounds, setRounds] = useState<Round[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim() || busy || (sides.length > 0 && selected.length === 0)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemKey,
          question: q.trim(),
          ...(selected.length < sides.length ? { sides: selected } : {}),
          history: rounds.map((r) => ({
            question: r.question,
            responses: r.responses.map(({ side, answer, sourceIds }) => ({ side, answer, sourceIds })),
          })),
        }),
      });
      const data = (await res.json()) as { responses?: Answer[]; error?: string };
      if (!res.ok || !data.responses) {
        setError(errors[data.error ?? ""] ?? "Something went wrong. Please try again.");
        return;
      }
      setRounds((r) => [...r, { question: q.trim(), responses: data.responses! }]);
      setQuestion("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Repeated "not covered" answers read as noise; show them as one line instead.
  const grouped = (r: Round) => r.responses.filter(uncovered).length >= 2;
  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : sides.filter((s) => s.id === id || cur.includes(s.id)).map((s) => s.id),
    );

  // Equal columns for 2 or 3 sides on desktop; 4 or more stack as equal cards. Phones always stack. Never tabs.
  const cols = (n: number) => (n === 2 ? "sm:grid-cols-2" : n === 3 ? "sm:grid-cols-3" : "");
  const asking =
    sides.length > 0
      ? sides.filter((s) => selected.includes(s.id))
      : [
          { id: "yes", label: "YES" },
          { id: "no", label: "NO" },
        ];

  return (
    <section
      aria-labelledby={`discuss-${itemKey}`}
      className="no-print flex flex-col gap-4 border border-line bg-paper p-5"
    >
      <div>
        <p className="eyebrow">Discussion</p>
        <h2 id={`discuss-${itemKey}`} className="mt-1 font-display text-[22px] leading-tight font-semibold">
          Ask every side
        </h2>
        <p className="note mt-1">
          Ask a question and each side answers from the sources on this page. When the sources don&apos;t cover
          something, it says so.
        </p>
      </div>

      {rounds.map((r, i) => {
        const shown = r.responses.filter((a) => !grouped(r) || !uncovered(a));
        return (
          <div key={i} className="flex flex-col gap-3">
            <p className="max-w-[85%] self-end bg-ink px-3.5 py-2.5 text-[15px] text-cream">
              <span className="sr-only">You asked: </span>
              {r.question}
            </p>
            {shown.length > 0 && (
              <div className={`grid gap-3 ${cols(shown.length)}`}>
                {shown.map((a) => (
                  <div key={a.side} className="flex flex-col gap-2 border border-line bg-cream p-4">
                    <p className="side-label">{a.label}</p>
                    {uncovered(a) ? (
                      <p className="text-[15px]">
                        <strong>Our sources don&apos;t cover this.</strong>{" "}
                        <span className="text-ink-soft">{a.answer}</span>
                      </p>
                    ) : (
                      <p className="text-[15px] leading-relaxed">{a.answer}</p>
                    )}
                    {a.sources.length > 0 && (
                      <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                        Sources:
                        {a.sources.map((s) =>
                          s.url ? (
                            <a
                              key={s.n}
                              href={s.url}
                              className="cite"
                              target="_blank"
                              rel="noopener noreferrer"
                              title={s.publisher ?? s.url}
                              aria-label={`Source ${s.n}${s.publisher ? `: ${s.publisher}` : ""}`}
                            >
                              {s.n}
                            </a>
                          ) : (
                            <span key={s.n} className="cite" title={s.publisher ?? undefined}>
                              {s.n}
                            </span>
                          ),
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {grouped(r) && (
              <p className="border border-dashed border-line-strong bg-cream p-4 text-[15px]">
                <strong>Our sources don&apos;t cover this</strong> for{" "}
                {r.responses
                  .filter(uncovered)
                  .map((a) => a.label)
                  .join("; ")}
                .
              </p>
            )}
          </div>
        );
      })}

      {busy && (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Waiting for answers</span>
          {asking.map((s) => (
            <div
              key={s.id}
              aria-hidden
              className="flex items-center justify-between border border-line bg-cream px-4 py-2.5"
            >
              <span className="side-label">{s.label}</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 animate-pulse bg-muted"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {sides.length > 2 && (
        <details className="border border-line bg-cream px-3.5 py-2">
          <summary className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
            {selected.length === sides.length
              ? `Asking all ${sides.length} candidates`
              : `Asking ${selected.length} of ${sides.length} candidates`}{" "}
            <span className="link">Choose</span>
          </summary>
          <div className="mt-2 flex gap-4 text-sm">
            <button type="button" className="link py-1" onClick={() => setSelected(sides.map((s) => s.id))}>
              Select all
            </button>
            <button type="button" className="link py-1" onClick={() => setSelected([])}>
              Clear
            </button>
          </div>
          <fieldset className="mt-2 grid gap-1 sm:grid-cols-2">
            <legend className="sr-only">Candidates to ask</legend>
            {sides.map((s) => (
              <label key={s.id} className="flex min-h-9 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-ink"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                {s.label}
              </label>
            ))}
          </fieldset>
        </details>
      )}

      {rounds.length === 0 && !busy && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button key={s} type="button" onClick={() => void ask(s)} disabled={busy} className="chip">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor={`q-${itemKey}`} className="sr-only">
          Your question
        </label>
        <input
          id={`q-${itemKey}`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder={rounds.length ? "Ask a follow-up" : "Ask your own question"}
          className="input flex-1"
        />
        <button
          className="btn-primary"
          disabled={busy || question.trim().length < 2 || (sides.length > 0 && selected.length === 0)}
        >
          {busy ? "Asking…" : "Ask"}
        </button>
      </form>
      {error && (
        <p role="alert" className="border border-warn bg-gold-soft px-4 py-3 text-[14.5px]">
          {error}
        </p>
      )}
      <p className="note">AI-generated from the cited sources. It never recommends a vote. Not voting advice.</p>
    </section>
  );
}
