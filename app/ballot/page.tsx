import type { Metadata } from "next";

import { StepBar } from "@/components/ballot/walk-through";
import { BallotBuilder } from "@/components/ballot/ballot-builder";
import { getSession } from "@/lib/auth/session";
import { getCatalog } from "@/lib/ballot/catalog";
import { defaultState, isStateCode } from "@/lib/ballot/states";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your ballot · TownHall AI" };

export default async function BallotPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string; state?: string }>;
}) {
  const [catalog, session, { address, state }] = await Promise.all([getCatalog(), getSession(), searchParams]);
  return (
    <>
      <StepBar current="ballot" />
      <main className="page">
        <div>
          <p className="eyebrow">Your ballot</p>
          <h1 className="title mt-1">Check your ballot</h1>
          <div className="title-rule" />
          <p className="mt-3 text-muted">
            Grab your paper ballot. Does this list match it? Take off anything extra and add anything that&apos;s
            missing.
          </p>
        </div>
        <BallotBuilder
          catalog={catalog}
          signedIn={session !== null}
          initialAddress={address?.slice(0, 200) ?? ""}
          initialState={isStateCode(state) ? state : defaultState}
        />
      </main>
    </>
  );
}
