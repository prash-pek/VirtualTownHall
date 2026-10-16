import type { Endorsement } from "@/lib/ballot/content";

const groupLabel: Record<string, string> = {
  outlet: "News outlets",
  organization: "Organizations",
  party: "Parties",
  official: "Officials",
  person: "Individuals",
};

/** Collapsed "Endorsed by" list (one line closed). Shown as a public record, never scored. */
export function EndorsedBy({ endorsements }: { endorsements: Endorsement[] }) {
  if (endorsements.length === 0) return <p className="note">Endorsed by: none on record in the sources we checked.</p>;
  const groups = Map.groupBy(endorsements, (e) => groupLabel[e.endorserType] ?? "Others");
  return (
    <details className="border-t border-line pt-2">
      <summary className="link cursor-pointer text-sm">Endorsed by ({endorsements.length})</summary>
      <div className="mt-2 flex flex-col gap-3">
        {[...groups].map(([label, list]) => (
          <div key={label}>
            <p className="eyebrow">{label}</p>
            <ul className="mt-1 flex flex-col gap-2">
              {list.map((e, n) => (
                <li key={n} className="text-sm">
                  <span className="font-medium">{e.endorser}</span>
                  {e.rank ? ` · ranked #${e.rank}` : ""}
                  {e.draft && <span className="preview-tag ml-2">Not yet reviewed</span>}
                  {e.excerpt && <span className="note block italic">“{e.excerpt}”</span>}
                  {e.sourceUrl && (
                    <a href={e.sourceUrl} className="link note" target="_blank" rel="noopener noreferrer">
                      {e.publisher ?? "Source"}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="note">Endorsements are the endorsers&apos; own opinions, listed as published.</p>
      </div>
    </details>
  );
}
