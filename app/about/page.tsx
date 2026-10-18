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
          We think the same technology can do something better. It can help people take part in the structures that
          were here long before AI: elections, local government, the places where we decide how our neighborhoods, our
          region and our country work.
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

        <p>
          <Link href="/ballot" className="link">
            Start on your ballot
          </Link>
        </p>
      </div>
    </main>
  );
}
