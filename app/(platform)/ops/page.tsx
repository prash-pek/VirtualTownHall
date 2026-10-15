import Link from "next/link";

import { StatusTag } from "@/components/ops/review";
import { getQueue } from "@/lib/review/queue";

import { requireAdminPage } from "./admin-gate";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";

export default async function OpsHome() {
  await requireAdminPage();
  const q = await getQueue();
  const done = (xs: { status: string }[]) => xs.filter((x) => x.status === "published").length;

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
          Candidates{" "}
          <span className="note">
            {done(q.candidates)} of {q.candidates.length} published
          </span>
        </h2>
        <p className="note">{q.candidatesWithoutContent} more candidates have no verified content yet.</p>
        <ul className="card flex flex-col p-0">
          {q.candidates.map((c) => (
            <li
              key={c.slug}
              className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="eyebrow">{c.race}</p>
                <Link href={`/ops/candidates/${c.slug}`} className="font-medium hover:text-olive">
                  {c.name}
                </Link>
                <p className="note">{c.items} sourced items</p>
              </div>
              <StatusTag status={c.status} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
