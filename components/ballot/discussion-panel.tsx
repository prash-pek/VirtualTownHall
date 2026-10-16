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

/** Ask one question; every candidate (or YES and NO) answers from our sources, side by side. */
export function DiscussionPanel({ itemKey, starters }: { itemKey: string; starters: string[] }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemKey,
          question: q.trim(),
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

  return (
    <section className="no-print card flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Ask every side</h2>
        <p className="note">
          Ask a question and each side answers from the sources on this page. When the sources don&apos;t cover
          something, it says so.
        </p>
      </div>

      {rounds.map((r, i) => (
        <div key={i} className="flex flex-col gap-3">
          <p className="border-l-2 border-gold pl-3 font-medium">{r.question}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {r.responses.map((a) => (
              <div key={a.side} className="flex flex-col gap-2 border border-line bg-cream p-3">
                <p className="eyebrow">{a.label}</p>
                <p className="text-sm leading-relaxed">{a.answer}</p>
                {a.sources.length > 0 && (
                  <p className="note flex flex-wrap gap-x-2">
                    Sources:
                    {a.sources.map((s) =>
                      s.url ? (
                        <a
                          key={s.n}
                          href={s.url}
                          className="link"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.publisher ?? s.url}
                        >
                          [{s.n}]
                        </a>
                      ) : (
                        <span key={s.n} title={s.publisher ?? undefined}>
                          [{s.n}]
                        </span>
                      ),
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {rounds.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button key={s} onClick={() => void ask(s)} disabled={busy} className="btn px-3 py-1 text-sm">
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
        <button className="btn-primary" disabled={busy || question.trim().length < 2}>
          {busy ? "Asking every side…" : "Ask"}
        </button>
      </form>
      {error && (
        <p role="alert" className="border-l-2 border-warn bg-gold-soft px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <p className="note">AI-generated from the cited sources. It never recommends a vote. Not voting advice.</p>
    </section>
  );
}
