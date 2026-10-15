import Link from "next/link";

import { defaultState, usStates } from "@/lib/ballot/states";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed */}
        <img src="/logo.svg" alt="" width={40} height={40} />
        TownHall AI
      </h1>
      <p className="text-lg text-slate-700 dark:text-slate-300">
        Oregon General Election, November 3, 2026. Enter your address for a suggested ballot, then add or remove any
        race or measure you want to follow, with sources for everything we show.
      </p>
      <form action="/ballot" method="get" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="address" className="sr-only">
          Your address
        </label>
        <input
          id="address"
          name="address"
          required
          minLength={5}
          maxLength={200}
          placeholder="Street address, city, ZIP"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <label htmlFor="state" className="sr-only">
          State
        </label>
        <select
          id="state"
          name="state"
          defaultValue={defaultState}
          autoComplete="address-level1"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {usStates.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900"
        >
          Build my ballot
        </button>
      </form>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        We don&apos;t store your address. Or{" "}
        <Link href="/ballot" className="underline">
          browse every Oregon race and measure
        </Link>
        .
      </p>
    </main>
  );
}
