import type { Metadata } from "next";

import { StepBar } from "@/components/ballot/walk-through";
import { BallotSummary } from "@/components/ballot/ballot-summary";
import { SignInButton } from "@clerk/nextjs";
import { getSession } from "@/lib/auth/session";
import { getCatalog } from "@/lib/ballot/catalog";
import { clerkEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your votes · TownHall AI" };

export default async function SummaryPage() {
  const [catalog, session] = await Promise.all([getCatalog(), getSession()]);
  return (
    <>
      <StepBar current="summary" />
      <main className="page">
        <div>
          {/* The site header doesn't print, so a printed copy carries its own name. */}
          <p className="mb-4 hidden items-center gap-2 font-display text-lg font-semibold print:flex">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, print only */}
            <img src="/logo.svg" alt="" width={22} height={22} />
            TownHall AI
          </p>
          <p className="eyebrow">Oregon General Election · November 3, 2026</p>
          <h1 className="title mt-1">Your votes</h1>
          <div className="title-rule" />
          <p className="mt-3 text-muted">
            Ask any last questions, then fill out your paper ballot. If you missed a race, you can add it at the bottom
            of the page.
          </p>
        </div>
        <BallotSummary catalog={catalog} />
        {clerkEnabled() && !session && (
          <section className="no-print flex flex-wrap items-center justify-between gap-3 border border-line bg-paper p-5">
            <div className="max-w-md">
              <h2 className="font-display text-xl font-semibold">Need to come back to this later?</h2>
              <p className="mt-1 text-[15px] text-ink-soft">
                Sign in and we&apos;ll keep your ballot list, so you can pick up where you left off. Your choices stay
                on this device either way.
              </p>
            </div>
            <SignInButton mode="redirect">
              <button className="btn">Sign in</button>
            </SignInButton>
          </section>
        )}
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
