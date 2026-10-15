import type { Metadata } from "next";

import { BallotBuilder } from "@/components/ballot/ballot-builder";
import { getCatalog } from "@/lib/ballot/catalog";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My ballot · TownHall AI" };

export default async function BallotPage({ searchParams }: { searchParams: Promise<{ address?: string }> }) {
  const [catalog, session, { address }] = await Promise.all([getCatalog(), getSession(), searchParams]);
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My ballot</h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          Choose the races and measures you want to explore. Your address can suggest a starting list. Add or remove
          anything; you decide what&apos;s on your page.
        </p>
      </div>
      <BallotBuilder catalog={catalog} signedIn={session !== null} initialAddress={address?.slice(0, 200) ?? ""} />
    </main>
  );
}
