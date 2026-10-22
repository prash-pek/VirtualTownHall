import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AskJump } from "@/components/ballot/ask-context";
import { DiscussionPanel } from "@/components/ballot/discussion-panel";
import { BetaUnlock } from "@/components/beta-unlock";
import { NotReady } from "@/components/ballot/not-ready";
import { EndorsedBy } from "@/components/ballot/endorsed-by";
import { PreviewBanner, Sourced } from "@/components/ballot/sourced";
import { StepBar, WalkPosition, YourChoice } from "@/components/ballot/walk-through";
import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCatalog } from "@/lib/ballot/catalog";
import { betaLocked } from "@/lib/beta-lock-status";
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
  const [d, locked] = await Promise.all([getMeasureDetail(slug, preview), betaLocked()]);
  // Explanations are neutral even when collection filed them under a side; they never sit under YES or NO.
  const neutral = d?.arguments.filter((a) => a.kind === "explainer") ?? [];
  const endorsed = (s: "yes" | "no") => d?.endorsements.filter((e) => e.side === s) ?? [];
  const side = (s: "yes" | "no") => d?.arguments.filter((a) => a.side === s && a.kind !== "explainer") ?? [];

  return (
    <>
      <StepBar current="items" itemKey={measure.key} />
      <main className="page lg:max-w-6xl">
        <WalkPosition itemKey={measure.key} />
        <div>
          <p className="eyebrow">
            Measure {measure.number} · {measure.jurisdiction}
          </p>
          <h1 className="title mt-1">{measure.title}</h1>
          <div className="title-rule" />
        </div>

        {/* Same layout as race pages: on phones the ask box comes first; on desktop it stays in view beside the details. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start">
          <aside
            id="ask"
            aria-label="Ask both sides"
            className="scroll-mt-4 lg:sticky lg:top-4 lg:order-2 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
          >
            {/* Same test the discussion endpoint uses: something official or an argument must be published. */}
            {d &&
            (d.summary || d.yesMeans || d.noMeans || d.fiscalImpact || d.arguments.length || d.endorsements.length) ? (
              locked ? (
                <BetaUnlock
                  next={`/measures/${slug}`}
                  intro="To ask questions, enter the beta password you were given. You can read everything on this page without it."
                />
              ) : (
                <DiscussionPanel
                  itemKey={measure.key}
                  layout="sidebar"
                  starters={[
                    "What would this change for me?",
                    "How much will it cost?",
                    "Who supports and opposes it, and why?",
                  ]}
                />
              )
            ) : (
              <NotReady />
            )}
          </aside>
          <div className="flex flex-col gap-6 lg:order-1">
            {!d ? (
              <p className="border border-dashed border-line-strong bg-paper p-5 text-muted">
                The plain-language summary, what YES and NO do, and arguments on both sides appear here once they pass
                review.
              </p>
            ) : (
              <>
                {d.draft && <PreviewBanner />}
                {d.summary && (
                  <section aria-labelledby="plain" className="border border-line bg-paper p-5">
                    <h2 id="plain" className="eyebrow">
                      In plain words
                    </h2>
                    <p className="mt-2 text-lg leading-relaxed">{d.summary}</p>
                  </section>
                )}
                <section aria-labelledby="vote-does" className="flex flex-col gap-3">
                  <h2 id="vote-does" className="section-title">
                    What your vote does
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <VoteMeans side="YES" text={d.yesMeans} />
                    <VoteMeans side="NO" text={d.noMeans} />
                  </div>
                </section>
                {d.fiscalImpact && (
                  <section aria-labelledby="fiscal" className="flex gap-3 border border-line bg-paper p-5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      aria-hidden
                      className="mt-0.5 size-6 shrink-0 text-muted"
                    >
                      <circle cx="12" cy="12" r="8.5" />
                      <path d="M14.5 9.2c-.5-.9-1.4-1.4-2.5-1.4-1.5 0-2.6.8-2.6 2s1.1 1.7 2.6 2.1 2.6.9 2.6 2.1-1.1 2-2.6 2c-1.2 0-2.1-.5-2.6-1.4M12 6.3v1.5M12 16.2v1.5" />
                    </svg>
                    <div>
                      <h2 id="fiscal" className="eyebrow">
                        Fiscal impact
                      </h2>
                      <p className="mt-1.5">{d.fiscalImpact}</p>
                    </div>
                  </section>
                )}
                {neutral.length > 0 && (
                  <section aria-labelledby="neutral" className="flex flex-col gap-2">
                    <h2 id="neutral" className="eyebrow">
                      Explained by official sources
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {neutral.map((a, n) => (
                        <li key={n}>
                          <Sourced item={a} className="text-ink-soft" />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section aria-labelledby="arguments" className="flex flex-col gap-3">
                  <h2 id="arguments" className="section-title">
                    Arguments filed
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Side title="In favor (YES)" items={side("yes")} endorsements={endorsed("yes")} />
                    <Side title="In opposition (NO)" items={side("no")} endorsements={endorsed("no")} />
                  </div>
                </section>
                {d.ballotLabel && (
                  <details className="note">
                    <summary className="cursor-pointer py-1">Official ballot title</summary>
                    <p className="mt-2">{d.ballotLabel}</p>
                  </details>
                )}
                {d.fullTextUrl && (
                  <a href={d.fullTextUrl} className="link text-sm" target="_blank" rel="noopener noreferrer">
                    Full text of the measure ↗
                  </a>
                )}
              </>
            )}

            <YourChoice
              itemKey={measure.key}
              label={`Measure ${measure.number}: ${measure.title}`}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>
        </div>
        <AskJump targetId="ask" />
      </main>
    </>
  );
}

/** YES and NO get identical cards: same border, same weight. Never color-coded. */
function VoteMeans({ side, text }: { side: "YES" | "NO"; text: string | null }) {
  return (
    <div className="border border-t-[3px] border-line border-t-ink bg-paper p-5">
      <h3 className="side-label">A {side} vote</h3>
      <p className="mt-2 text-[15.5px] leading-relaxed">{text ?? "Not stated in the sources we checked."}</p>
    </div>
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
    <div
      className={`flex flex-col gap-3 p-5 ${items.length === 0 ? "border border-dashed border-line-strong bg-cream" : "border border-line bg-paper"}`}
    >
      <h3 className="side-label">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[15px] text-ink-soft">No arguments on this side were found in the sources we checked.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((a, n) => (
            <li key={n} className="flex flex-col gap-1 border-l-2 border-line pl-3">
              <p className="text-[12.5px] font-semibold text-muted">
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
