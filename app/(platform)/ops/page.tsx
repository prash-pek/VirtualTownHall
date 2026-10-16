import Link from "next/link";

import { PublishRaceForm, StatusTag } from "@/components/ops/review";
import { getQueue } from "@/lib/review/queue";

import { requireAdminPage } from "./admin-gate";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";

export default async function OpsHome() {
  await requireAdminPage();
  const q = await getQueue();
  const done = (xs: { status: string }[]) => xs.filter((x) => x.status === "published").length;
  const candidates = q.races.flatMap((r) => r.candidates);

  return (
    <main className="page">
      <div>
        <p className="eyebrow">Platform admin</p>
        <h1 className="title mt-1">Review queue</h1>
        <div className="title-rule" />
      </div>
      <p className="note">
        Voters see a measure or candidate only after it&apos;s published here. Publishing includes every item on it that
        you haven&apos;t hidden. Every change is recorded in the audit log.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">
          Measures{" "}
          <span className="note">
            {done(q.measures)} of {q.measures.length} published
          </span>
        </h2>
        <ul className="card flex flex-col p-0">
          {q.measures.map((m) => (
            <li
              key={m.slug}
              className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="eyebrow">
                  Measure {m.number} · {m.jurisdiction}
                </p>
                <Link href={`/ops/measures/${m.slug}`} className="font-medium hover:text-olive">
                  {m.title}
                </Link>
                <p className="note">
                  {m.yes} for · {m.no} against · {m.neutral} neutral
                </p>
              </div>
              <StatusTag status={m.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">
          Races{" "}
          <span className="note">
            {done(candidates)} of {candidates.length} candidates published
          </span>
        </h2>
        <p className="note">
          {q.candidatesWithoutContent} more candidates have no verified content yet. &ldquo;Publish all&rdquo; publishes
          every candidate listed under that race; each one is recorded in the audit log.
        </p>
        {q.races.map((r) => {
          const published = done(r.candidates);
          const allPublished = published === r.candidates.length;
          return (
            <details key={r.slug} className="card p-0" open={!allPublished}>
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="font-medium">{r.label}</span>{" "}
                  <span className="note">
                    {published} of {r.candidates.length} published
                    {r.withoutContent > 0 && ` · ${r.withoutContent} without content`}
                  </span>
                </span>
                <PublishRaceForm race={r.slug} count={r.candidates.length - published} allPublished={allPublished} />
              </summary>
              <ul className="flex flex-col border-t border-line">
                {r.candidates.map((c) => (
                  <li
                    key={c.slug}
                    className="flex items-start justify-between gap-3 border-b border-line px-4 py-2 last:border-b-0"
                  >
                    <div>
                      <Link href={`/ops/candidates/${c.slug}`} className="font-medium hover:text-olive">
                        {c.name}
                      </Link>
                      <p className="note">{c.items} sourced items</p>
                    </div>
                    <StatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>
    </main>
  );
}
