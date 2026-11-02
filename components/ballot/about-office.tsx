import { Citation } from "@/components/ballot/sourced";
import type { OfficeDescription } from "@/lib/ballot/offices";
import type { Incumbency } from "@/lib/ballot/incumbency";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function IncumbencyLine({ value }: { value: Incumbency }) {
  switch (value.kind) {
    case "running":
      return (
        <>
          <span className="font-semibold text-ink">
            {value.names.length > 1 ? "Incumbents running: " : "Incumbent running: "}
          </span>
          {value.names.join(", ")}
        </>
      );
    case "open":
      return value.holder ? (
        <>
          <span className="font-semibold text-ink">No incumbent is running. </span>
          The seat is currently held by {value.holder.name} (
          <ExternalLink href={value.holder.sourceUrl}>source</ExternalLink>).
        </>
      ) : (
        <span className="font-semibold text-ink">No incumbent is running.</span>
      );
    case "note":
      return <>{value.text}</>;
    case "unknown":
      return <>We haven&apos;t confirmed whether an incumbent is running.</>;
  }
}

/** "About this office": a general description of the office type, and who holds the seat. */
export function AboutOffice({
  description,
  incumbency,
}: {
  description: OfficeDescription | null;
  incumbency: Incumbency | null;
}) {
  if (!description && !incumbency) return null;
  return (
    <section aria-label="About this office" className="flex max-w-3xl flex-col gap-2 border-l-2 border-gold pl-4">
      {description && (
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {description.text}{" "}
          <Citation excerpt={null} publisher={description.sourceName} sourceUrl={description.sourceUrl} />
        </p>
      )}
      {incumbency && (
        <p className="text-[15px] text-ink-soft">
          <IncumbencyLine value={incumbency} />
        </p>
      )}
    </section>
  );
}
