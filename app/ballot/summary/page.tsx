import type { Metadata } from "next";

import { StepBar } from "@/components/ballot/walk-through";
import { BallotSummary } from "@/components/ballot/ballot-summary";
import { getCatalog } from "@/lib/ballot/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My ballot summary · TownHall AI" };

export default async function SummaryPage() {
  const catalog = await getCatalog();
  return (
    <>
      <StepBar current="summary" />
      <main className="page">
        <div>
          <p className="eyebrow">Oregon General Election · November 3, 2026</p>
          <h1 className="title mt-1">Your ballot summary</h1>
          <div className="title-rule" />
          <p className="mt-3 text-muted">Keep this next to your paper ballot while you fill it out.</p>
        </div>
        <BallotSummary catalog={catalog} />
        <section className="no-print flex flex-col gap-2 border border-line bg-paper p-5">
          <h2 className="section-title">Returning your ballot</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>Sign the return envelope. An unsigned ballot isn&apos;t counted.</li>
            <li>Official drop boxes close at 8 p.m. on Tuesday, November 3, 2026.</li>
            <li>
              Mailing it? Check the mailing deadline, find a drop box and track your ballot on{" "}
              <a
                className="link"
                href="https://sos.oregon.gov/voting/Pages/myvote.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Oregon My Vote
              </a>
              .
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
