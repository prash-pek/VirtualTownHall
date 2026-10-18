"use client";

import { useState } from "react";

import { useAsk } from "./ask-context";

type Answer = {
  side: string;
  label: string;
  answer: string;
  sourceIds: number[];
  /** False when the side's sources don't directly address the question; it may still cite something related. */
  covered?: boolean;
  sources: { n: number; url: string | null; publisher: string | null }[];
};
type Round = { question: string; responses: Answer[]; sig?: string };

const errors: Record<string, string> = {
  rate_limited: "That's a lot of questions at once. Give it a minute and try again.",
  no_content: "We don't have sources for this one yet.",
  unavailable: "Questions aren't switched on yet.",
  paused: "We've paused questions for a little while because of heavy use. Please try again later.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/** A prefilled email so a voter (or a candidate) can flag an answer that looks wrong. */
function reportHref(itemKey: string, question: string) {
  const page = typeof window === "undefined" ? "" : window.location.href;
  const body = `Item: ${itemKey}\nPage: ${page}\nQuestion: ${question}\n\nWhat looks wrong:\n`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent("Report a mistake")}&body=${encodeURIComponent(body)}`;
}

const noAnswer = (a: Answer) => a.answer.startsWith("No answer was produced");
/** An answer with no citations is the "our sources don't cover this" case (the prompt requires empty sourceIds). */
const uncovered = (a: Answer) => a.sourceIds.length === 0 && !noAnswer(a);
/** Not covered directly, but the answer points to the closest related source. */
const related = (a: Answer) => a.covered === false && a.sourceIds.length > 0;

/**
 * Ask one question; every candidate (or YES and NO) answers from our sources, side by side. For a race,
 * `sides` lets the voter pick which candidates to ask. That choice stays in this component: it is never
 * stored or sent anywhere but the question itself.
 */
export function DiscussionPanel({
  itemKey,
  starters,
  topics = [],
  sides = [],
  layout = "page",
}: {
  itemKey: string;
  starters: string[];
  /** Issues this item has published sources on, offered as "Ask about" prompts. */
  topics?: { id: string; label: string }[];
  sides?: { id: string; label: string }[];
  /** "sidebar": a narrow column beside the cards, so answers always stack. */
  layout?: "page" | "sidebar";
}) {
  // On a race page the selection is shared with the candidate cards (AskProvider); elsewhere it's local.
  const shared = useAsk();
  // Nobody is selected to start: the voter picks who they want to hear from.
  const [local, setLocal] = useState<string[]>([]);
  const selected = shared?.selected ?? local;
  const setSelected = shared?.setSelected ?? setLocal;
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
          // The server only uses the last 3 rounds, and only ones it signed.
          history: rounds.slice(-3).map((r) => ({
            question: r.question,
            responses: r.responses.map(({ side, answer, sourceIds }) => ({ side, answer, sourceIds })),
            sig: r.sig,
          })),
        }),
      });
      const data = (await res.json()) as { responses?: Answer[]; sig?: string; error?: string };
      if (!res.ok || !data.responses) {
        setError(errors[data.error ?? ""] ?? "Something went wrong. Please try again.");
        return;
      }
      setRounds((r) => [...r, { question: q.trim(), responses: data.responses!, sig: data.sig }]);
      setQuestion("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Repeated "not covered" answers read as noise; show them as one line instead.
  const grouped = (r: Round) => r.responses.filter(uncovered).length >= 2;
  const toggle =
    shared?.toggle ??
    ((id: string) =>
      setLocal((cur) =>
        cur.includes(id)
          ? cur.filter((x) => x !== id)
          : sides.filter((s) => s.id === id || cur.includes(s.id)).map((s) => s.id),
      ));

  // Equal columns for 2 or 3 sides on desktop; 4 or more stack as equal cards. Phones always stack. Never tabs.
  const cols = (n: number) =>
    layout === "sidebar" ? "" : n === 2 ? "sm:grid-cols-2" : n === 3 ? "sm:grid-cols-3" : "";
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
          {sides.length > 0 ? "Ask the candidates" : "Ask both sides"}
        </h2>
        <p className="note mt-1">
          Answers come only from the sources on this page. If they don&apos;t cover something, you&apos;ll hear that.
        </p>
      </div>

      {sides.length >= 2 && (
        <fieldset className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <legend className="side-label float-left">Who you&apos;re asking</legend>
            <span className="flex gap-3 text-sm">
              <button type="button" className="link" onClick={() => setSelected(sides.map((s) => s.id))}>
                Everyone
              </button>
              <button type="button" className="link" onClick={() => setSelected([])}>
                Clear
              </button>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sides.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.id)}
                  className={`min-h-10 px-3 text-left text-sm ${
                    on
                      ? "border-2 border-ink bg-paper font-semibold"
                      : "border border-dashed border-line-strong bg-cream text-ink-soft hover:border-ink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {selected.length === 0 && <p className="note">Pick who you&apos;d like to hear from, then ask away.</p>}
        </fieldset>
      )}

      {rounds.length > 0 && (
        <p className="note border-l-2 border-line pl-3">
          Written by AI from the sources on this page. It won&apos;t tell you how to vote.
        </p>
      )}

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
                    {related(a) && <p className="note">Not covered directly. Closest related source:</p>}
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
            {contactEmail && (
              <p className="text-sm text-muted">
                Something look wrong?{" "}
                <a className="link" href={reportHref(itemKey, r.question)}>
                  Report a mistake
                </a>
              </p>
            )}
          </div>
        );
      })}

      {/* Mounted from the start so screen readers announce new answers when they arrive. */}
      <p aria-live="polite" className="sr-only">
        {!busy && rounds.length > 0 ? `Answers to "${rounds[rounds.length - 1]!.question}" are below.` : ""}
      </p>

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
                    className="size-1.5 bg-muted motion-safe:animate-pulse"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {topics.length > 0 && !busy && (
        <div className="flex flex-col gap-2">
          <p className="side-label">Ask about</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void ask(`What have they said about ${t.label.toLowerCase()}?`)}
                disabled={busy || (sides.length > 0 && selected.length === 0)}
                className="chip"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {rounds.length === 0 && !busy && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              disabled={busy || (sides.length > 0 && selected.length === 0)}
              className="chip"
            >
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
    </section>
  );
}
