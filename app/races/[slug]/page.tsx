import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AskJump, AskProvider, AskToggle } from "@/components/ballot/ask-context";
import { DiscussionPanel } from "@/components/ballot/discussion-panel";
import { BetaUnlock } from "@/components/beta-unlock";
import { NotReady } from "@/components/ballot/not-ready";
import { PamphletBackground } from "@/components/ballot/pamphlet-background";
import { EndorsedBy } from "@/components/ballot/endorsed-by";
import { Shortlist } from "@/components/ballot/shortlist";
import { PreviewBanner, Sourced } from "@/components/ballot/sourced";
import { StepBar, WalkPosition, YourChoice } from "@/components/ballot/walk-through";
import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCatalog } from "@/lib/ballot/catalog";
import { betaLocked } from "@/lib/beta-lock-status";
import { getRaceProfiles, type CandidateProfile } from "@/lib/ballot/content";
import { issueLabel, topIssues } from "@/lib/ballot/issues";
import { itemTitle } from "@/lib/ballot/types";

export const dynamic = "force-dynamic";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = (await getCatalog()).races.find((r) => r.slug === slug);
  return { title: race ? `${itemTitle(race)} · TownHall AI` : "TownHall AI" };
}

export default async function RacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  const [{ slug }, { ask }] = await Promise.all([params, searchParams]);
  const race = (await getCatalog()).races.find((r) => r.slug === slug);
  if (!race) notFound();
  const preview = hasRole(await getSession(), "admin");
  const [profiles, locked] = await Promise.all([getRaceProfiles(slug, preview), betaLocked()]);

  const sides = profiles.map((p) => ({ id: p.slug, label: p.name }));
  // Questions can only be answered from published sources, so the ask box waits until something is published.
  const canAsk = profiles.some(
    (p) => p.bio.length || p.positions.length || p.votingRecord.length || p.endorsements.length,
  );
  // "Ask about": the issues this race has sources on, most widely covered first.
  const topics = topIssues(profiles.map((p) => ({ topics: [...p.positions, ...p.votingRecord].map((i) => i.topic) })));

  return (
    <AskProvider sides={sides} initial={ask?.slice(0, 2000).split(",")}>
      <StepBar current="items" itemKey={race.key} />
      <main className="page lg:max-w-6xl">
        <WalkPosition itemKey={race.key} />
        <div>
          <p className="eyebrow">{race.jurisdiction}</p>
          <h1 className="title mt-1">{itemTitle(race)}</h1>
          <div className="title-rule" />
        </div>
        {preview && profiles.some((p) => p.draft) && <PreviewBanner />}
        {/* Phones: the ask box comes first. Desktop: cards on the left, the ask box stays in view on the right. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start">
          <aside
            id="ask"
            aria-label="Ask the candidates"
            className="scroll-mt-4 lg:sticky lg:top-4 lg:order-2 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
          >
            {canAsk && locked ? (
              <BetaUnlock
                next={`/races/${slug}`}
                intro="To ask questions, enter the beta password you were given. You can read everything on this page without it."
              />
            ) : canAsk ? (
              <DiscussionPanel
                itemKey={race.key}
                sides={sides}
                layout="sidebar"
                topics={topics}
                starters={["What are their top priorities?", "What experience do they bring?"]}
              />
            ) : (
              <NotReady />
            )}
          </aside>
          <div className="flex flex-col gap-6 lg:order-1">
            <section aria-labelledby="candidates" className="flex flex-col gap-3">
              <h2 id="candidates" className="section-title">
                The candidates
              </h2>
              <ul className="grid gap-4">
                {profiles.map((c) => (
                  <CandidateCard key={c.slug} c={c} canAsk={canAsk} />
                ))}
              </ul>
              <p className="note">Listed in the same order as the official filings.</p>
            </section>
            <YourChoice
              itemKey={race.key}
              label={itemTitle(race)}
              options={race.candidates.map((c) => ({ value: c.slug, label: c.name }))}
            >
              <Shortlist itemKey={race.key} candidates={race.candidates} />
            </YourChoice>
          </div>
        </div>
        {canAsk && <AskJump targetId="ask" />}
      </main>
    </AskProvider>
  );
}

/** How many positions show on the card before "More". Enough to compare at a glance without long scrolling. */
const shownPositions = 3;

function CandidateCard({ c, canAsk }: { c: CandidateProfile; canAsk: boolean }) {
  const intro = c.bio[0];
  const highlights = c.positions.slice(0, shownPositions);
  const more = [...c.positions.slice(shownPositions), ...c.bio.slice(1), ...c.votingRecord];
  return (
    <li className="flex flex-col gap-3 border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[22px] leading-tight font-semibold">{c.name}</h3>
          <p className="mt-0.5 text-[13.5px] text-muted">
            {/* The pamphlet block below shows their occupation in their own words, so it isn't repeated here. */}
            {[
              c.party ?? "No party listed",
              c.incumbent ? "Incumbent" : null,
              c.pamphletBackground?.occupation ? null : c.occupation,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Every profile is built from public sources until candidates can claim theirs (phase 2), so every
              card carries the same tag. Showing it on some cards and not others reads as unequal treatment. */}
          <span className="badge">Public record only</span>
          {canAsk && <AskToggle id={c.slug} name={c.name} />}
        </div>
      </div>
      {c.pamphletBackground !== undefined && (
        <PamphletBackground background={c.pamphletBackground} pamphletUrl={c.pamphletUrl} />
      )}
      {intro ? (
        <Sourced item={intro} className="text-[15px] leading-relaxed text-ink-soft" />
      ) : (
        <p className="note">Nothing published on this candidate yet.</p>
      )}
      {highlights.length > 0 && (
        <div className="flex flex-col gap-2 border-l-2 border-line pl-3">
          <p className="side-label text-muted">Where they stand</p>
          <ul className="flex flex-col gap-2">
            {highlights.map((p, n) => (
              <li key={n} className="text-[15px] text-ink-soft">
                {issueLabel(p.topic) && <span className="font-semibold text-ink">{issueLabel(p.topic)}: </span>}
                <Sourced item={p} className="inline" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {more.length > 0 && (
        <details>
          <summary className="link cursor-pointer py-1 text-sm">
            More on {c.name} ({more.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {more.map((i, n) => (
              <li key={n}>
                <Sourced item={i} className="text-[15px] text-ink-soft" />
              </li>
            ))}
          </ul>
        </details>
      )}
      <EndorsedBy endorsements={c.endorsements} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {c.officialUrl && (
          <a href={c.officialUrl} className="link" target="_blank" rel="noopener noreferrer">
            Official page
          </a>
        )}
        {c.websiteUrl && (
          <a href={c.websiteUrl} className="link" target="_blank" rel="noopener noreferrer">
            Campaign website
          </a>
        )}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Candidate profile: ${c.name}`)}`}
            className="link note"
          >
            Are you this candidate? Let us know
          </a>
        )}
      </div>
    </li>
  );
}
