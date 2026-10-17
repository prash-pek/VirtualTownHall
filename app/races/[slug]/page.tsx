import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiscussionPanel } from "@/components/ballot/discussion-panel";
import { EndorsedBy } from "@/components/ballot/endorsed-by";
import { PreviewBanner, Sourced } from "@/components/ballot/sourced";
import { StepBar, WalkPosition, YourChoice } from "@/components/ballot/walk-through";
import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCatalog } from "@/lib/ballot/catalog";
import { getRaceProfiles, type CandidateProfile } from "@/lib/ballot/content";
import { itemTitle } from "@/lib/ballot/types";

export const dynamic = "force-dynamic";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = (await getCatalog()).races.find((r) => r.slug === slug);
  return { title: race ? `${itemTitle(race)} · TownHall AI` : "TownHall AI" };
}

export default async function RacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = (await getCatalog()).races.find((r) => r.slug === slug);
  if (!race) notFound();
  const preview = hasRole(await getSession(), "admin");
  const profiles = await getRaceProfiles(slug, preview);

  return (
    <>
      <StepBar current="items" itemKey={race.key} />
      <main className="page">
        <WalkPosition itemKey={race.key} />
        <div>
          <p className="eyebrow">{race.jurisdiction}</p>
          <h1 className="title mt-1">{itemTitle(race)}</h1>
          <div className="title-rule" />
        </div>
        {preview && profiles.some((p) => p.draft) && <PreviewBanner />}
        <section aria-labelledby="candidates" className="flex flex-col gap-3">
          <h2 id="candidates" className="section-title">
            The candidates
          </h2>
          <ul className="grid gap-4">
            {profiles.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </ul>
          <p className="note">
            Candidates are listed in the order the filing source lists them. Names and parties are from official
            filings.
          </p>
        </section>
        <DiscussionPanel
          itemKey={race.key}
          sides={profiles.map((p) => ({ id: p.slug, label: p.name }))}
          starters={[
            "What are their top priorities?",
            "Where do they stand on housing and homelessness?",
            "What experience do they bring?",
          ]}
        />
        <YourChoice
          itemKey={race.key}
          label={itemTitle(race)}
          options={race.candidates.map((c) => ({ value: c.slug, label: c.name }))}
        />
      </main>
    </>
  );
}

function CandidateCard({ c }: { c: CandidateProfile }) {
  const intro = c.bio[0];
  const details = [...c.bio.slice(1), ...c.positions, ...c.votingRecord];
  return (
    <li className="flex flex-col gap-3 border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[22px] leading-tight font-semibold">{c.name}</h3>
          <p className="mt-0.5 text-[13.5px] text-muted">
            {[c.party ?? "No party listed", c.incumbent ? "Incumbent" : null, c.occupation].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="badge">{c.claimed ? "Claimed and verified" : "Public record only"}</span>
      </div>
      {intro ? (
        <Sourced item={intro} className="text-[15px] leading-relaxed text-ink-soft" />
      ) : (
        <p className="note">We haven&apos;t published a sourced profile for this candidate yet.</p>
      )}
      {details.length > 0 && (
        <details>
          <summary className="link cursor-pointer py-1 text-sm">
            Positions and record ({c.positions.length + c.votingRecord.length}), more background ({c.bio.length - 1})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {details.map((i, n) => (
              <li key={n}>
                <Sourced item={i} className="text-[15px] text-ink-soft" />
              </li>
            ))}
          </ul>
        </details>
      )}
      <EndorsedBy endorsements={c.endorsements} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
