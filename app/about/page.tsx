import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About · TownHall AI" };

export default function AboutPage() {
  return (
    <main className="page">
      <div>
        <h1 className="title">Why TownHall AI</h1>
        <div className="title-rule" />
      </div>
      <div className="flex max-w-2xl flex-col gap-5 text-[17px] leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold">
        <p>
          AI is changing the world fast. Most of that energy goes into making more money, building more products and
          selling more things.
        </p>
        <p>
          We think the same technology can do something better. It can help people take part in the structures that were
          here long before AI: elections, local government, the places where we decide how our neighborhoods, our region
          and our country work.
        </p>
        <p>
          Life keeps getting busier, and most of us have less time than ever for civic life. So we asked one question:
          how can we use the technology we have to make it easier to be an informed citizen?
        </p>
        <p>
          That&apos;s TownHall AI. It brings candidates, races and measures closer to voters. You ask the questions, see
          what each side has actually said, and make up your own mind. We never tell you how to vote.
        </p>

        <section className="flex flex-col gap-3">
          <h2>Where we&apos;re starting</h2>
          <p>
            We&apos;re starting close to home, with the November 2026 election in Portland, Oregon. We want to find out
            if people need this and if it makes a difference. If it does, we&apos;ll grow from here, one election at a
            time, toward a simple goal: putting technology to work for civic life.
          </p>
        </section>

        <hr className="my-3 border-line" />

        <section className="flex flex-col gap-3">
          <h2>How we find sources</h2>
          <p>
            Every answer comes from a source we&apos;ve collected and checked ahead of time. We don&apos;t search the
            web while you ask, and the AI doesn&apos;t answer from what it happens to know.
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              We start with official records: voters&apos; pamphlets, election filings, measure text and voting records.
            </li>
            <li>Then the candidates&apos; own words, from their campaign websites and official pages.</li>
            <li>
              Then local reporting, from outlets like OPB, Willamette Week and the Portland Mercury, plus published
              endorsements.
            </li>
            <li>
              Each week we look for where every candidate stands on common issues, like housing, homelessness, taxes and
              energy.
            </li>
            <li>
              A second check confirms each source says what we say it does, and a person reviews it before it goes live.
            </li>
          </ul>
          <p>
            Some outlets, including The Oregonian, block automated reading, so we include their reporting only when
            someone adds it by hand. When our sources don&apos;t cover your question, we say so and point you to the
            candidate&apos;s own pages so you can look for yourself. If something looks wrong, use &ldquo;Report a
            mistake&rdquo; under any answer.
          </p>
        </section>

        <p>
          <Link href="/ballot" className="link">
            Start on your ballot
          </Link>
        </p>

        <hr className="my-3 border-line" />

        <p className="text-[15px] text-muted">
          TownHall AI is built by{" "}
          <a className="link" href="https://outsetinno.com" rel="noopener noreferrer">
            Outset Innovation
          </a>
          , an agency in Portland, Oregon that brings creative solutions to complicated problems.
        </p>
      </div>
    </main>
  );
}
