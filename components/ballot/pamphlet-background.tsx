import { Citation } from "@/components/ballot/sourced";
import type { PamphletBackground as Background } from "@/lib/db/schema";

const rows: { key: keyof Omit<Background, "occupation" | "other" | "source">; label: string }[] = [
  { key: "occupationalBackground", label: "Background" },
  { key: "educationalBackground", label: "Education" },
  { key: "priorGovernmentalExperience", label: "Prior government" },
];

/** Readers land on the page the statement is on. */
const pageLink = (b: Background) => `${b.source.url}#page=${b.source.page}`;

/**
 * The candidate's own background lines from their voters' pamphlet statement, word for word, as a compact
 * headline with one source link like every other claim on the site. Occupation is shown in the card header.
 * Nothing here is summarized or ranked. When no statement was found we say so in one line.
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
      <p className="note">
        No voters&apos; pamphlet statement found for this candidate.
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
  if (lines.length === 0) return null;
  return (
    <div className="text-[14.5px] leading-snug text-ink-soft">
      <dl className="grid gap-x-3 gap-y-1 sm:grid-cols-[8.5rem_1fr]">
        {lines.map((l, n) => (
          <div key={l.label} className="contents">
            <dt className="font-semibold text-ink">{l.label}</dt>
            <dd>
              {l.text}
              {/* One source for the whole block, after its last line. */}
              {n === lines.length - 1 && (
                <>
                  {" "}
                  <Citation
                    excerpt={null}
                    publisher={`${background.source.title}, page ${background.source.page}`}
                    sourceUrl={pageLink(background)}
                  />
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
