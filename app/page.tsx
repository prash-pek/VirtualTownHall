export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">TownHall AI</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300">
        Oregon General Election, November 3, 2026. Enter your address to see every candidate and measure on your ballot,
        with sources for everything we show.
      </p>
      <p className="rounded-md border border-dashed border-slate-300 p-4 text-slate-600 dark:border-slate-700 dark:text-slate-400">
        Ballot lookup is coming soon.
      </p>
    </main>
  );
}
