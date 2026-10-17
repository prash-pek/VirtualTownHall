import Link from "next/link";

import { HowItWorks } from "@/components/how-it-works";
import { defaultState, usStates } from "@/lib/ballot/states";

export default function Home() {
  return (
    <main className="page gap-10 py-16">
      <div>
        <p className="eyebrow">Oregon General Election · November 3, 2026</p>
        <h1 className="mt-2 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Talk to the candidates and measures affecting you this election
        </h1>
        <div className="title-rule" />
        <p className="mt-4 text-lg text-muted">
          We&apos;ve brought together publicly available information for all the races happening this cycle, so you can
          ask the questions that matter to you. We never tell you how to vote. We&apos;re here to make the process more
          personal.
        </p>
      </div>
      <HowItWorks />
      <form action="/ballot" method="get" className="card flex flex-col gap-3">
        <label htmlFor="address" className="eyebrow">
          Where do you live?
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="address"
            name="address"
            required
            minLength={5}
            maxLength={200}
            placeholder="Street address, city, ZIP"
            autoComplete="street-address"
            className="input flex-1"
          />
          <label htmlFor="state" className="sr-only">
            State
          </label>
          <select id="state" name="state" defaultValue={defaultState} autoComplete="address-level1" className="input">
            {usStates.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Start
          </button>
        </div>
        <p className="note">We don&apos;t store your address. We just use it to find the races you can vote in.</p>
      </form>
      <Link href="/ballot" className="link self-start">
        Or just look around
      </Link>
    </main>
  );
}
