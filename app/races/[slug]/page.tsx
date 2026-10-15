import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewBanner, Sourced } from "@/components/ballot/sourced";
import { WalkPosition, YourChoice } from "@/components/ballot/walk-through";
import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCatalog } from "@/lib/ballot/catalog";
import { getRaceProfiles, type CandidateProfile } from "@/lib/ballot/content";
import { itemTitle } from "@/lib/ballot/types";

export const dynamic = "force-dynamic";

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
    <main className="page">
      <WalkPosition itemKey={race.key} />
      <div>
        <p className="eyebrow">{race.jurisdiction}</p>
        <h1 className="title mt-1">{itemTitle(race)}</h1>
        <div className="title-rule" />
      </div>
      {preview && profiles.some((p) => p.draft) && <PreviewBanner />}
      <ul className="grid gap-4">
        {profiles.map((c) => (
          <CandidateCard key={c.slug} c={c} />
        ))}
      </ul>
      <p className="note">
        Candidates are listed in the order the filing source lists them. Names and parties are from official filings.
      </p>
      <YourChoice itemKey={race.key} options={race.candidates.map((c) => ({ value: c.slug, label: c.name }))} />
    </main>
  );
}

function CandidateCard({ c }: { c: CandidateProfile }) {
  const intro = c.bio[0];
  const details = [...c.bio.slice(1), ...c.positions, ...c.votingRecord];
  return (
    <li className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold">{c.name}</h2>
          <p className="note">
            {[c.party ?? "No party listed", c.incumbent ? "Incumbent" : null, c.occupation].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="eyebrow border border-line px-2 py-0.5">
          {c.claimed ? "Claimed and verified" : "Public record only"}
        </span>
      </div>
      {intro ? (
        <Sourced item={intro} />
      ) : (
        <p className="note">We haven&apos;t published a sourced profile for this candidate yet.</p>
      )}
      {details.length > 0 && (
        <details>
          <summary className="link cursor-pointer text-sm">
            Positions and record ({c.positions.length + c.votingRecord.length}), more background ({c.bio.length - 1})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {details.map((i, n) => (
              <li key={n}>
                <Sourced item={i} />
              </li>
            ))}
          </ul>
        </details>
      )}
      {c.websiteUrl && (
        <a href={c.websiteUrl} className="link text-sm" target="_blank" rel="noopener noreferrer">
          Campaign website
        </a>
      )}
    </li>
  );
}
