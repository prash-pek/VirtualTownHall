import Link from "next/link";

import { HowItWorks } from "@/components/how-it-works";
import { defaultState, usStates } from "@/lib/ballot/states";

export default function Home() {
  return (
    <main className="page gap-10 py-16">
      <div>
        <p className="eyebrow">Oregon General Election · November 3, 2026</p>
        <h1 className="mt-2 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Get ready to fill out your Oregon ballot
        </h1>
        <div className="title-rule" />
        <p className="mt-4 text-lg text-muted">
          Go through your ballot one race and measure at a time, with sources for everything we show. Finish with a
          summary of your own choices to fill out your paper ballot from. We never tell you how to vote.
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
        <p className="note">We use your address once to find your ballot, then throw it away.</p>
      </form>
      <Link href="/ballot" className="link self-start">
        Just browse
      </Link>
    </main>
  );
}
