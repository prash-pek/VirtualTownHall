"use client";

import { useId, useState } from "react";

import type { SourcedItem } from "@/lib/ballot/content";

/** The shared <Citation>: a real button after the claim that opens the verbatim excerpt, publisher and link inline. */
export function Citation({
  excerpt,
  publisher,
  sourceUrl,
  label = "Source",
}: {
  excerpt: string | null;
  publisher: string | null;
  sourceUrl: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!excerpt && !sourceUrl) return null;
  return (
    <>
      <button
        type="button"
        className="cite"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${label}${publisher ? `: ${publisher}` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <span id={id} className="mt-2 block border border-line bg-paper px-3.5 py-3 text-sm">
          {excerpt && <span className="block italic">“{excerpt}”</span>}
          <span className="mt-1.5 block text-[12.5px] text-muted">
            {publisher ?? "Source"}
            {sourceUrl && (
              <>
                {" · "}
                <a href={sourceUrl} className="link" target="_blank" rel="noopener noreferrer">
                  Open source ↗
                </a>
              </>
            )}
          </span>
        </span>
      )}
    </>
  );
}

/** One sourced statement: what we say, then its citation. */
export function Sourced({ item, className = "" }: { item: SourcedItem; className?: string }) {
  return (
    <p className={className}>
      {item.statement} {item.draft && <span className="preview-tag">Not yet reviewed</span>}
      <Citation excerpt={item.excerpt} publisher={item.publisher} sourceUrl={item.sourceUrl} />
    </p>
  );
}

export function PreviewBanner() {
  return (
    <p className="no-print flex items-start gap-2.5 border border-warn bg-gold-soft px-4 py-3 text-[14.5px]">
      <span className="preview-tag mt-0.5 shrink-0">Preview</span>
      <span>
        <strong>Admin preview.</strong> Items marked “Not yet reviewed” are hidden from voters until they&apos;re
        published in the review queue.
      </span>
    </p>
  );
}
