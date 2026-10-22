import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AskJump, AskProvider, AskToggle } from "@/components/ballot/ask-context";
import { AboutOffice } from "@/components/ballot/about-office";
import { CandidateCard, CandidateList } from "@/components/ballot/candidate-list";
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
import { raceIncumbency } from "@/lib/ballot/incumbency";
import { issueLabel, topIssues } from "@/lib/ballot/issues";
import { describeOffice } from "@/lib/ballot/offices";
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
        <AboutOffice
          description={describeOffice(race.office, race.jurisdiction, race.jurisdictionSlug)}
          incumbency={raceIncumbency(race.slug, race.candidates)}
        />
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
              {/* Every profile is built from public sources until candidates can claim theirs (phase 2), so the
                  note covers every card at once instead of a badge on each. */}
              <p className="note">
                Listed in the same order as the official filings. Every profile is from the public record only.
              </p>
              <CandidateList candidates={profiles.map((p) => ({ slug: p.slug, name: p.name }))}>
                {profiles.map((c) => (
                  <CandidateEntry key={c.slug} c={c} canAsk={canAsk} />
                ))}
              </CandidateList>
            </section>
            <YourChoice
              itemKey={race.key}
              label={itemTitle(race)}
              options={race.candidates.map((c) => ({ value: c.slug, label: c.name }))}
              ranking={
                race.rankedChoice ? (
                  <Shortlist itemKey={race.key} candidates={race.candidates} ranked seats={race.seats} />
                ) : undefined
              }
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
const shownPositions = 2;

function CandidateEntry({ c, canAsk }: { c: CandidateProfile; canAsk: boolean }) {
  const intro = c.bio[0];
  const highlights = c.positions.slice(0, shownPositions);
  const more = [...c.positions.slice(shownPositions), ...c.bio.slice(1), ...c.votingRecord];
  // The pamphlet occupation is the candidate's own words, so it wins over the filing's occupation field.
  const occupation = c.pamphletBackground?.occupation ?? c.occupation;
  const links = [
    c.officialUrl && { href: c.officialUrl, text: "Official page" },
    c.websiteUrl && { href: c.websiteUrl, text: "Campaign website" },
  ].filter((l): l is { href: string; text: string } => !!l);
  return (
    <CandidateCard
      slug={c.slug}
      name={c.name}
      meta={[c.party ?? "No party listed", c.incumbent ? "Incumbent" : null, occupation].filter(Boolean).join(" · ")}
      actions={canAsk ? <AskToggle id={c.slug} name={c.name} /> : undefined}
    >
      {c.pamphletBackground !== undefined && (
        <PamphletBackground background={c.pamphletBackground} pamphletUrl={c.pamphletUrl} />
      )}
      {intro ? (
        <Sourced item={intro} className="text-[15px] leading-relaxed text-ink-soft" />
      ) : (
        <p className="note">Nothing else published on this candidate yet.</p>
      )}
      {highlights.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {highlights.map((p, n) => (
            <li key={n} className="text-[15px] text-ink-soft">
              {issueLabel(p.topic) && <span className="font-semibold text-ink">{issueLabel(p.topic)}: </span>}
              <Sourced item={p} className="inline" />
            </li>
          ))}
        </ul>
      )}
      {more.length > 0 && (
        <details>
          <summary className="link cursor-pointer py-1 text-sm">
            More on {c.name} ({more.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2.5">
            {more.map((i, n) => (
              <li key={n}>
                <Sourced item={i} className="text-[15px] text-ink-soft" />
              </li>
            ))}
          </ul>
        </details>
      )}
      <EndorsedBy endorsements={c.endorsements} />
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {links.map((l) => (
          <a key={l.text} href={l.href} className="link" target="_blank" rel="noopener noreferrer">
            {l.text}
          </a>
        ))}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Candidate profile: ${c.name}`)}`}
            className="link note"
          >
            Are you this candidate? Let us know
          </a>
        )}
      </p>
    </CandidateCard>
  );
}
