const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

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
      <p className="mx-auto mt-2 flex max-w-3xl flex-wrap gap-x-4 gap-y-1">
        <a className="link" href="/about">
          About
        </a>
        <a className="link" href="/privacy">
          Privacy
        </a>
        <a className="link" href="/terms">
          Terms
        </a>
        {contactEmail && (
          <a className="link" href={`mailto:${contactEmail}?subject=${encodeURIComponent("Report a mistake")}`}>
            Report a mistake
          </a>
        )}
      </p>
    </footer>
  );
}
