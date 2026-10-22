import type { PamphletBackground as Background } from "@/lib/db/schema";

const rows: { key: keyof Omit<Background, "other" | "source">; label: string }[] = [
  { key: "occupation", label: "Occupation" },
  { key: "occupationalBackground", label: "Occupational background" },
  { key: "educationalBackground", label: "Educational background" },
  { key: "priorGovernmentalExperience", label: "Prior governmental experience" },
];

/** Readers land on the page the statement is on. */
const pageLink = (b: Background) => `${b.source.url}#page=${b.source.page}`;

/**
 * The candidate's own background lines from their voters' pamphlet statement, word for word, as an
 * at-a-glance headline. Nothing here is summarized or ranked. When no statement was found we say so.
 */
export function PamphletBackground({
  background,
  pamphletUrl,
}: {
  background: Background | null;
  pamphletUrl: string | null;
}) {
  if (!background)
    return (
      <p className="note border border-line bg-cream px-3.5 py-2.5">
        No voters&apos; pamphlet statement found for this candidate, so there is no background from them to show.
        {pamphletUrl && (
          <>
            {" "}
            <a href={pamphletUrl} className="link" target="_blank" rel="noopener noreferrer">
              Check the pamphlet
            </a>
          </>
        )}
      </p>
    );
  const lines = [
    ...rows.flatMap((r) => (background[r.key] ? [{ label: r.label, text: background[r.key]! }] : [])),
    ...(background.other ?? []).filter((o) => o.text),
  ];
  return (
    <div className="border border-line bg-cream px-3.5 py-3">
      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(9rem,12rem)_1fr]">
        {lines.map((l) => (
          <div key={l.label} className="contents">
            <dt className="text-[12.5px] font-semibold tracking-[0.06em] text-muted uppercase sm:pt-0.5">{l.label}</dt>
            <dd className="text-[15px] leading-snug text-ink-soft">{l.text}</dd>
          </div>
        ))}
      </dl>
      <p className="note mt-3 border-t border-line pt-2">
        In their own words, from their statement in the{" "}
        <a href={pageLink(background)} className="link" target="_blank" rel="noopener noreferrer">
          {background.source.title}, page {background.source.page}
        </a>
        .
      </p>
    </div>
  );
}
