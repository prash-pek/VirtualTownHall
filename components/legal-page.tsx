/** Shared layout for the privacy and terms pages: plain text, one column, easy to read. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="page">
      <div>
        <h1 className="title">{title}</h1>
        <div className="title-rule" />
        <p className="note mt-2">Last updated {updated}</p>
      </div>
      <div className="flex max-w-2xl flex-col gap-5 text-[16px] leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Contact() {
  return contactEmail ? (
    <a className="link" href={`mailto:${contactEmail}`}>
      {contactEmail}
    </a>
  ) : (
    <>the contact address on this site</>
  );
}
