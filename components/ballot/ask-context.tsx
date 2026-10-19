"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";

type Side = { id: string; label: string };
type AskState = {
  sides: Side[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  toggle: (id: string) => void;
};

const AskContext = createContext<AskState | null>(null);

/**
 * Who the voter is asking on a race page. Shared by the ask box and the "Ask" toggle on each candidate
 * card, so picking from either place updates both. Lives only in this page; never stored or sent
 * anywhere except with the question itself.
 */
export function AskProvider({
  sides,
  initial,
  children,
}: {
  sides: Side[];
  initial?: string[];
  children: React.ReactNode;
}) {
  // Everyone is selected to start, unless a link (e.g. "Ask your shortlist") names who to ask.
  const [selected, setSelected] = useState<string[]>(() => {
    const named = (initial ?? []).filter((id) => sides.some((s) => s.id === id));
    return named.length > 0 ? named : sides.map((s) => s.id);
  });
  // Keep the filing order, whatever order the voter clicked in.
  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : sides.filter((s) => s.id === id || cur.includes(s.id)).map((s) => s.id),
    );
  return <AskContext.Provider value={{ sides, selected, setSelected, toggle }}>{children}</AskContext.Provider>;
}

export const useAsk = () => useContext(AskContext);

/** The "Ask" toggle on a candidate card. */
export function AskToggle({ id, name }: { id: string; name: string }) {
  const ask = useAsk();
  if (!ask || ask.sides.length < 2) return null;
  const on = ask.selected.includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? "Asking" : "Ask"} ${name}`}
      onClick={() => ask.toggle(id)}
      className={`no-print inline-flex min-h-9 shrink-0 items-center gap-1.5 px-3 text-sm ${
        on ? "border-2 border-ink font-semibold" : "border border-line-strong text-ink-soft hover:border-ink"
      }`}
    >
      <span aria-hidden>{on ? "✓" : "+"}</span>
      {on ? "Asking" : "Ask"}
    </button>
  );
}

/**
 * On phones the ask box sits at the top of the page. Once it scrolls away, this small button brings it back.
 * Hidden on desktop, where the ask box stays in view beside the cards.
 */
export function AskJump({ targetId }: { targetId: string }) {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setAway(!!e && !e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);
  if (!away) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const el = document.getElementById(targetId);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        el?.querySelector<HTMLInputElement>("input[type=text], input:not([type])")?.focus({ preventScroll: true });
      }}
      className="no-print fixed right-4 bottom-4 z-20 inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-sm font-semibold text-cream shadow-lg lg:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="size-4">
        <path d="M4 5h16v11H9l-4 3v-3H4z" />
      </svg>
      Ask a question
    </button>
  );
}
