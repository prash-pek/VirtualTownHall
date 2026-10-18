import type { Metadata } from "next";

import { Contact, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy · TownHall AI" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="October 18, 2026">
      <p>
        TownHall AI is run by Outset Innovation. We built it to help you get through your ballot, not to learn how you
        vote. This page says what happens to the information you give us.
      </p>

      <section>
        <h2>Your address</h2>
        <p>
          We use your address only to look up which races and measures are likely on your ballot. To do that we send it
          to the U.S. Census Bureau&apos;s address lookup. We don&apos;t store your address.
        </p>
      </section>

      <section>
        <h2>Your ballot and your choices</h2>
        <ul>
          <li>
            Your choices (who or what you lean toward) stay in your browser on this device. We never receive them.
          </li>
          <li>
            Your ballot list (which races and measures you added) also stays in your browser, unless you sign in. If you
            sign in, we save that list to your account so you can pick up later. It doesn&apos;t include your choices.
          </li>
          <li>We don&apos;t collect, sell or share how anyone plans to vote.</li>
        </ul>
      </section>

      <section>
        <h2>Questions you ask</h2>
        <p>
          When you ask a question, we send it with our sources to Anthropic, the company that makes the Claude AI model,
          to write the answers. Anthropic doesn&apos;t use it to train its models. We don&apos;t keep the text of your
          questions or the answers. We keep only counts of how much AI each question used, so we can watch our costs.
        </p>
      </section>

      <section>
        <h2>Signing in</h2>
        <p>
          Sign-in is optional and handled by Clerk. If you sign in, Clerk keeps your email address and sign-in details,
          and we keep your saved ballot list. You can ask us to delete your account and everything tied to it.
        </p>
      </section>

      <section>
        <h2>Technical information</h2>
        <p>
          Like most websites, our hosting provider (Vercel) handles basic request information such as your IP address.
          We use IP addresses for a short time to limit how many questions one connection can ask. We don&apos;t use ads
          or advertising trackers.
        </p>
      </section>

      <section>
        <h2>Who it&apos;s for</h2>
        <p>TownHall AI is meant for voters 18 and older.</p>
      </section>

      <section>
        <h2>Questions or deletion requests</h2>
        <p>
          Email <Contact />. If this page changes, we&apos;ll update the date at the top.
        </p>
      </section>
    </LegalPage>
  );
}
