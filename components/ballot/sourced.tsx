import type { SourcedItem } from "@/lib/ballot/content";

/** One sourced statement: what we say, the verbatim excerpt, and where it came from. */
export function Sourced({ item }: { item: SourcedItem }) {
  return (
    <div className="flex flex-col gap-1">
      <p>
        {item.statement} {item.draft && <span className="preview-tag">Not yet reviewed</span>}
      </p>
      {(item.excerpt || item.sourceUrl) && (
        <details className="note">
          <summary className="cursor-pointer select-none">Source{item.publisher ? `: ${item.publisher}` : ""}</summary>
          {item.excerpt && (
            <blockquote className="mt-1 border-l-2 border-line pl-3 italic">“{item.excerpt}”</blockquote>
          )}
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              className="link mt-1 inline-block break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.sourceUrl}
            </a>
          )}
        </details>
      )}
    </div>
  );
}

export function PreviewBanner() {
  return (
    <p className="no-print border-l-2 border-warn bg-gold-soft px-3 py-2 text-sm">
      <strong>Admin preview.</strong> Items marked “Not yet reviewed” are hidden from voters until they&apos;re
      published in the review queue.
    </p>
  );
}
