import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiscussionPanel } from "@/components/ballot/discussion-panel";
import { EndorsedBy } from "@/components/ballot/endorsed-by";
import { PreviewBanner, Sourced } from "@/components/ballot/sourced";
import { WalkPosition, YourChoice } from "@/components/ballot/walk-through";
import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCatalog } from "@/lib/ballot/catalog";
import { getMeasureDetail, type Endorsement, type MeasureArgument } from "@/lib/ballot/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = (await getCatalog()).measures.find((x) => x.slug === slug);
  return { title: m ? `Measure ${m.number} · TownHall AI` : "TownHall AI" };
}

const kindLabel: Record<string, string> = { argument: "Argument", rebuttal: "Rebuttal" };

export default async function MeasurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const measure = (await getCatalog()).measures.find((m) => m.slug === slug);
  if (!measure) notFound();
  const preview = hasRole(await getSession(), "admin");
  const d = await getMeasureDetail(slug, preview);
  // Explanations are neutral even when collection filed them under a side; they never sit under YES or NO.
  const neutral = d?.arguments.filter((a) => a.kind === "explainer") ?? [];
  const endorsed = (s: "yes" | "no") => d?.endorsements.filter((e) => e.side === s) ?? [];
  const side = (s: "yes" | "no") => d?.arguments.filter((a) => a.side === s && a.kind !== "explainer") ?? [];

  return (
    <main className="page">
      <WalkPosition itemKey={measure.key} />
      <div>
        <p className="eyebrow">
          Measure {measure.number} · {measure.jurisdiction}
        </p>
        <h1 className="title mt-1">{measure.title}</h1>
        <div className="title-rule" />
      </div>

      {!d ? (
        <p className="card text-muted">
          The plain-language summary, what YES and NO do, and arguments on both sides appear here once they pass review.
        </p>
      ) : (
        <>
          {d.draft && <PreviewBanner />}
          {d.summary && (
            <section className="flex flex-col gap-2">
              <h2 className="eyebrow">Summary</h2>
              <p className="text-lg leading-relaxed">{d.summary}</p>
            </section>
          )}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <h2 className="eyebrow">A YES vote</h2>
              <p className="mt-2">{d.yesMeans ?? "Not stated in the sources we checked."}</p>
            </div>
            <div className="card">
              <h2 className="eyebrow">A NO vote</h2>
              <p className="mt-2">{d.noMeans ?? "Not stated in the sources we checked."}</p>
            </div>
          </section>
          {d.fiscalImpact && (
            <section className="flex flex-col gap-2">
              <h2 className="eyebrow">Fiscal impact</h2>
              <p>{d.fiscalImpact}</p>
            </section>
          )}
          {neutral.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="eyebrow">Explained by official sources</h2>
              <ul className="flex flex-col gap-3">
                {neutral.map((a, n) => (
                  <li key={n}>
                    <Sourced item={a} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="grid gap-4 sm:grid-cols-2">
            <Side title="For (YES)" items={side("yes")} endorsements={endorsed("yes")} />
            <Side title="Against (NO)" items={side("no")} endorsements={endorsed("no")} />
          </section>
          {d.ballotLabel && (
            <details className="note">
              <summary className="cursor-pointer">Official ballot title</summary>
              <p className="mt-2">{d.ballotLabel}</p>
            </details>
          )}
          {d.fullTextUrl && (
            <a href={d.fullTextUrl} className="link text-sm" target="_blank" rel="noopener noreferrer">
              Full text of the measure
            </a>
          )}
        </>
      )}

      <DiscussionPanel
        itemKey={measure.key}
        starters={["What would this change for me?", "How much will it cost?", "Who supports and opposes it, and why?"]}
      />
      <YourChoice
        itemKey={measure.key}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
    </main>
  );
}

function Side({
  title,
  items,
  endorsements,
}: {
  title: string;
  items: MeasureArgument[];
  endorsements: Endorsement[];
}) {
  return (
    <div className="card flex flex-col gap-3">
      <h2 className="eyebrow">{title}</h2>
      {items.length === 0 ? (
        <p className="note">No arguments on this side were found in the sources we checked.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((a, n) => (
            <li key={n} className="flex flex-col gap-1">
              <p className="note">
                {kindLabel[a.kind] ?? a.kind}
                {a.author ? ` · ${a.author}` : ""}
              </p>
              <Sourced item={a} />
            </li>
          ))}
        </ul>
      )}
      <EndorsedBy endorsements={endorsements} />
    </div>
  );
}
