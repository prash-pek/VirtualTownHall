import Link from "next/link";
import { notFound } from "next/navigation";

import { getCatalog } from "@/lib/ballot/catalog";

export const dynamic = "force-dynamic";

export default async function MeasurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const measure = (await getCatalog()).measures.find((m) => m.slug === slug);
  if (!measure) notFound();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Link href="/ballot" className="text-sm hover:underline">
        ← My ballot
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Measure {measure.number}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{measure.jurisdiction}</p>
      </div>
      <p className="text-lg">{measure.title}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        A neutral explainer with what a YES and a NO vote mean, with sources, appears here once it passes review.
      </p>
    </main>
  );
}
