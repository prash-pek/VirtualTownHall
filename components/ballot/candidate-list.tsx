"use client";

import { createContext, useContext, useState } from "react";

type Collapse = {
  closed: Set<string>;
  toggle: (slug: string) => void;
  open: (slug: string) => void;
};

const CollapseContext = createContext<Collapse | null>(null);

/** Races with more candidates than this start with every card folded. */
const foldAbove = 4;

const cardId = (slug: string) => `candidate-${slug}`;

/**
 * The candidate list on a race page: a jump bar that stays in view (one chip per candidate, plus "Collapse
 * all" / "Expand all"), and the cards, each of which folds down to its name line. Lives only in this page.
 */
export function CandidateList({
  candidates,
  children,
}: {
  candidates: { slug: string; name: string }[];
  children: React.ReactNode;
}) {
  // A crowded race (Portland council has 20+) starts folded to a list of names; small races start open.
  const [closed, setClosed] = useState<Set<string>>(
    () => new Set(candidates.length > foldAbove ? candidates.map((c) => c.slug) : []),
  );
  const toggle = (slug: string) =>
    setClosed((cur) => {
      const next = new Set(cur);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  const open = (slug: string) =>
    setClosed((cur) => {
      const next = new Set(cur);
      next.delete(slug);
      return next;
    });
  const allClosed = candidates.every((c) => closed.has(c.slug));
  const jump = (slug: string) => {
    open(slug);
    // After the card opens, bring its top just under the jump bar.
    requestAnimationFrame(() => document.getElementById(cardId(slug))?.scrollIntoView({ block: "start" }));
  };

  return (
    <CollapseContext.Provider value={{ closed, toggle, open }}>
      {candidates.length > 1 && (
        <nav
          aria-label="Jump to a candidate"
          className="no-print sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-1.5 border-b border-line bg-cream px-1 py-2"
        >
          {candidates.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => jump(c.slug)}
              className="min-h-8 border border-line-strong bg-paper px-2.5 text-[13.5px] hover:border-ink"
            >
              {c.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setClosed(allClosed ? new Set() : new Set(candidates.map((c) => c.slug)))}
            className="link ml-auto min-h-8 px-1 text-[13.5px]"
          >
            {allClosed ? "Expand all" : "Collapse all"}
          </button>
        </nav>
      )}
      <ul className="grid gap-3">{children}</ul>
    </CollapseContext.Provider>
  );
}

/** One candidate card. The name line always shows; the button beside the name folds the rest away. */
export function CandidateCard({
  slug,
  name,
  meta,
  actions,
  children,
}: {
  slug: string;
  name: string;
  /** Party, incumbent, occupation: stays visible when folded. */
  meta: React.ReactNode;
  /** E.g. the "Ask" toggle: stays visible when folded. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const c = useContext(CollapseContext);
  const isOpen = !c?.closed.has(slug);
  const bodyId = `${cardId(slug)}-body`;
  return (
    <li id={cardId(slug)} className="scroll-mt-14 border border-line bg-paper">
      <div className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => c?.toggle(slug)}
          className="group flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <span aria-hidden className={`mt-1.5 text-sm text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>
            ▸
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[20px] leading-tight font-semibold group-hover:text-olive">
              {name}
            </span>
            <span className="mt-0.5 block text-[13.5px] text-muted">{meta}</span>
          </span>
        </button>
        {actions}
      </div>
      {isOpen && (
        <div id={bodyId} className="flex flex-col gap-2.5 border-t border-line px-4 pt-3 pb-4">
          {children}
        </div>
      )}
    </li>
  );
}
