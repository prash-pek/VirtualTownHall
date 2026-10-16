import Link from "next/link";
import { notFound } from "next/navigation";

import { PublishForm, ReviewItems, StatusTag } from "@/components/ops/review";
import { getCandidateReview, getQueue } from "@/lib/review/queue";

import { requireAdminPage } from "../../admin-gate";

export const dynamic = "force-dynamic";

export default async function CandidateReview({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const [r, q] = await Promise.all([getCandidateReview(slug), getQueue()]);
  if (!r) notFound();
  const { candidate: c, items } = r;
  const at = q.candidates.findIndex((x) => x.slug === slug);
  const next = q.candidates.slice(at + 1).find((x) => x.status !== "published");

  return (
    <main className="page">
      <Link href="/ops" className="link text-sm">
        ← Review queue
      </Link>
      <div>
        <p className="eyebrow">{[c.office, c.districtLabel].filter(Boolean).join(", ")}</p>
        <h1 className="title mt-1">{c.name}</h1>
        <div className="title-rule" />
        <p className="note mt-2">
          {[c.party, c.incumbent ? "Incumbent" : null, c.occupation].filter(Boolean).join(" · ")}
          {c.websiteUrl && (
            <>
              {" · "}
              <a href={c.websiteUrl} className="link" target="_blank" rel="noopener noreferrer">
                {c.websiteUrl}
              </a>
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusTag status={c.status} />
        <PublishForm kind="candidate" slug={c.slug} published={c.status === "published"} />
        <Link href={`/races/${c.raceSlug}`} className="link text-sm">
          See the voter page
        </Link>
        {next && (
          <Link href={`/ops/candidates/${next.slug}`} className="link text-sm">
            Next to review →
          </Link>
        )}
      </div>
      {c.gaps.length > 0 && (
        <section className="card flex flex-col gap-1">
          <h2 className="eyebrow">Collection gaps (not shown to voters)</h2>
          <ul className="note list-disc pl-5">
            {c.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      )}
      <h2 className="font-display text-xl font-semibold">Sourced items</h2>
      <ReviewItems kind="candidate" items={items} />
      <h2 className="font-display text-xl font-semibold">Endorsements</h2>
      <ReviewItems kind="endorsement" items={r.endorsements} />
    </main>
  );
}
