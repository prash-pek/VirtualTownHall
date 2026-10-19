import Link from "next/link";

import { PublishEverythingForm, PublishNowForm, PublishRaceForm, StatusTag } from "@/components/ops/review";
import { getQueue } from "@/lib/review/queue";

import { requireAdminPage } from "./admin-gate";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";
// "Publish everything" publishes a few hundred subjects one transaction at a time.
export const maxDuration = 300;

export default async function OpsHome() {
  await requireAdminPage();
  const q = await getQueue();
  const done = (xs: { status: string }[]) => xs.filter((x) => x.status === "published").length;
  const candidates = q.races.flatMap((r) => r.candidates);
  const isDraft = (s: string) => s === "draft" || s === "in_review";
  // Everything voters can't see yet, so it's listed first instead of buried in the race list.
  const toPublish = [
    ...q.measures
      .filter((m) => isDraft(m.status))
      .map((m) => ({
        kind: "measure" as const,
        slug: m.slug,
        context: `Measure ${m.number} · ${m.jurisdiction}`,
        name: m.title,
        detail: "Not yet published",
        button: "Publish",
        needsLook: 0,
      })),
    ...q.races.flatMap((r) =>
      r.candidates
        .filter((c) => isDraft(c.status) || (c.status === "published" && c.pending > 0))
        .map((c) => ({
          kind: "candidate" as const,
          slug: c.slug,
          context: r.label,
          name: c.name,
          detail:
            (c.status === "published" ? `${c.pending} new to review` : `Not yet published · ${c.items} sourced items`) +
            (c.needsLook > 0 ? ` · ${c.needsLook} need a look` : ""),
          button: c.status === "published" ? `Publish ${c.pending} new` : "Publish",
          needsLook: c.needsLook,
        })),
    ),
  ];
  // Low-confidence items get read first: candidates with flagged items move to the top, in ballot order.
  const flaggedFirst = [...toPublish.filter((t) => t.needsLook > 0), ...toPublish.filter((t) => !(t.needsLook > 0))];
  const flaggedCount = toPublish.filter((t) => t.needsLook > 0).length;

  return (
    <main className="page">
      <div>
        <p className="eyebrow">Platform admin</p>
        <h1 className="title mt-1">Review queue</h1>
        <div className="title-rule" />
      </div>
      <p className="note">
        Voters see a measure or candidate only after it&apos;s published here. Publishing includes every item on it that
        you haven&apos;t hidden. Every change is recorded in the audit log.{" "}
        <Link href="/ops/costs" className="link">
          Claude usage and costs
        </Link>
        {" · "}
        <Link href="/ops/gaps" className="link">
          Questions our sources couldn&apos;t answer
        </Link>
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">
          Still to publish <span className="note">{toPublish.length}</span>
        </h2>
        {flaggedCount > 0 && (
          <p className="note">
            {flaggedCount} at the top have items the verifier flagged as low confidence. Open those first; the rest
            looked fine to the verifier.
          </p>
        )}
        {toPublish.length === 0 ? (
          <p className="card text-muted">Nothing waiting. Everything with content is published.</p>
        ) : (
          <ul className="card flex flex-col p-0">
            {flaggedFirst.map((t, n) => (
              <li
                key={`${t.kind}-${t.slug}`}
                className={`flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0 ${n === flaggedCount && n > 0 ? "border-t-2 border-t-line" : ""}`}
              >
                <div>
                  <p className="eyebrow">{t.context}</p>
                  <Link href={`/ops/${t.kind}s/${t.slug}`} className="font-medium hover:text-olive">
                    {t.name}
                  </Link>
                  <p className="note">
                    {t.detail} ·{" "}
                    <Link href={`/ops/${t.kind}s/${t.slug}`} className="link">
                      Review
                    </Link>
                  </p>
                </div>
                <PublishNowForm kind={t.kind} slug={t.slug} label={t.button} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <PublishEverythingForm
        count={
          q.measures.filter((m) => m.status !== "published").length +
          candidates.filter((c) => c.status !== "published" || c.pending > 0).length
        }
      />

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
          // A published candidate with new drafts (a weekly issue sweep) still needs publishing.
          const toPublish = r.candidates.filter((c) => c.status !== "published" || c.pending > 0).length;
          const allPublished = toPublish === 0;
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
                <PublishRaceForm race={r.slug} count={toPublish} allPublished={allPublished} />
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
                      <p className="note">
                        {c.items} sourced items
                        {c.status === "published" && c.pending > 0 && ` · ${c.pending} new to review`}
                        {c.needsLook > 0 && ` · ${c.needsLook} need a look`}
                      </p>
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
