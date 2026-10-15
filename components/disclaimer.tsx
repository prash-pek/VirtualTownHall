/** Rendered by the root layout so it can't be omitted from any page (TRD v2 §10). */
export function Disclaimer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <p className="mx-auto max-w-3xl">
        TownHall AI is nonpartisan and does not endorse candidates or measures. AI answers are based only on cited
        public sources and may be incomplete. Not legal or voting advice. Check your official ballot on{" "}
        <a className="underline" href="https://sos.oregon.gov/voting/Pages/myvote.aspx" rel="noopener noreferrer">
          Oregon My Vote
        </a>
        .
      </p>
    </footer>
  );
}
