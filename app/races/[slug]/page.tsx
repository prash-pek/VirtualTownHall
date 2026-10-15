import Link from "next/link";
import { notFound } from "next/navigation";

import { getCatalog } from "@/lib/ballot/catalog";

export const dynamic = "force-dynamic";

export default async function RacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = (await getCatalog()).races.find((r) => r.slug === slug);
  if (!race) notFound();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Link href="/ballot" className="text-sm hover:underline">
        ← My ballot
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {race.office}
          {race.districtLabel ? `, ${race.districtLabel}` : ""}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{race.jurisdiction}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {race.candidates.map((c) => (
          <li key={c.name} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {[c.party, c.incumbent ? "Incumbent" : null].filter(Boolean).join(" · ") || "No party listed"}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Names and parties are from official filings. Sourced candidate profiles appear here once they pass review.
      </p>
    </main>
  );
}
