import type { Metadata } from "next";

import { Contact, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms · TownHall AI" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="October 18, 2026">
      <p>By using TownHall AI you agree to these terms. They&apos;re short, so please read them.</p>

      <section>
        <h2>What TownHall AI is</h2>
        <p>
          A free, nonpartisan tool from Outset for learning about the candidates and measures on your Oregon ballot.
          It&apos;s for information only. It isn&apos;t voting, legal or financial advice, and it never tells you how to
          vote.
        </p>
      </section>

      <section>
        <h2>AI answers can be wrong</h2>
        <p>
          Answers are written by AI from the public sources linked on each page. We work to keep them accurate, but they
          can miss things or get things wrong. Check the linked sources, and check your official ballot and voters&apos;
          pamphlet before you vote. Answers are not statements by the candidates or campaigns.
        </p>
        <p>
          The races and measures we suggest for your address are a best guess. Your official ballot is the final word.
        </p>
      </section>

      <section>
        <h2>Found a mistake?</h2>
        <p>
          Tell us at <Contact />. We review every report and correct or remove anything we can&apos;t support with a
          source.
        </p>
      </section>

      <section>
        <h2>Fair use</h2>
        <ul>
          <li>Don&apos;t scrape the site or use automated tools to send questions.</li>
          <li>Don&apos;t try to make the AI say false things about candidates, or pass off its answers as theirs.</li>
          <li>Don&apos;t try to break, overload or get around the limits on the service.</li>
        </ul>
        <p>We may limit or block access that breaks these rules.</p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          TownHall AI is provided as is, without warranties of any kind. To the extent the law allows, Outset isn&apos;t
          liable for any loss that comes from using it or relying on it.
        </p>
      </section>

      <section>
        <h2>Other things</h2>
        <ul>
          <li>Source material belongs to its publishers. We show short quotes and link to the original.</li>
          <li>Our privacy page explains what happens to your information.</li>
          <li>These terms follow Oregon law. We may update them; the date at the top shows when.</li>
          <li>TownHall AI is for people 18 and older.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
