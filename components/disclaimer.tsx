/** Rendered by the root layout so it can't be omitted from any page (TRD v2 §10). */
export function Disclaimer() {
  return (
    <footer className="border-t border-line px-4 py-6 text-sm text-muted">
      <p className="mx-auto max-w-3xl">
        TownHall AI is nonpartisan and doesn&apos;t endorse anyone. Answers come from public sources and can miss
        things. Not legal or voting advice. Double-check your ballot at{" "}
        <a className="link" href="https://sos.oregon.gov/voting/Pages/myvote.aspx" rel="noopener noreferrer">
          Oregon My Vote
        </a>
        .
      </p>
    </footer>
  );
}
