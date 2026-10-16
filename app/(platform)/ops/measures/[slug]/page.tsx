import Link from "next/link";
import { notFound } from "next/navigation";

import { PublishForm, ReviewItems, StatusTag } from "@/components/ops/review";
import { getMeasureReview, getQueue } from "@/lib/review/queue";

import { requireAdminPage } from "../../admin-gate";

export const dynamic = "force-dynamic";

export default async function MeasureReview({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const [r, q] = await Promise.all([getMeasureReview(slug), getQueue()]);
  if (!r) notFound();
  const { measure: m, items } = r;
  const at = q.measures.findIndex((x) => x.slug === slug);
  const next = q.measures.slice(at + 1).find((x) => x.status !== "published");
  const fields: [string, string | null][] = [
    ["Summary", m.summary],
    ["A YES vote", m.yesMeans],
    ["A NO vote", m.noMeans],
    ["Fiscal impact", m.fiscalImpact],
    ["Official ballot title", m.ballotLabel],
  ];

  return (
    <main className="page">
      <Link href="/ops" className="link text-sm">
        ← Review queue
      </Link>
      <div>
        <p className="eyebrow">Measure {m.number}</p>
        <h1 className="title mt-1">{m.title}</h1>
        <div className="title-rule" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusTag status={m.status} />
        <PublishForm kind="measure" slug={m.slug} published={m.status === "published"} />
        <Link href={`/measures/${m.slug}`} className="link text-sm">
          See the voter page
        </Link>
        {next && (
          <Link href={`/ops/measures/${next.slug}`} className="link text-sm">
            Next to review →
          </Link>
        )}
      </div>
      <dl className="card flex flex-col gap-3">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="eyebrow">{label}</dt>
            <dd className={value ? "" : "text-muted"}>{value ?? "Missing"}</dd>
          </div>
        ))}
        {m.fullTextUrl && (
          <a href={m.fullTextUrl} className="link text-sm" target="_blank" rel="noopener noreferrer">
            Full text
          </a>
        )}
      </dl>
      {m.gaps.length > 0 && (
        <section className="card flex flex-col gap-1">
          <h2 className="eyebrow">Collection gaps (not shown to voters)</h2>
          <ul className="note list-disc pl-5">
            {m.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      )}
      <h2 className="font-display text-xl font-semibold">Sourced items</h2>
      <ReviewItems kind="measure" items={items} />
      <h2 className="font-display text-xl font-semibold">Endorsements</h2>
      <ReviewItems kind="endorsement" items={r.endorsements} />
    </main>
  );
}
