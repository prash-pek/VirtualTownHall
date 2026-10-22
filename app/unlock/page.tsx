import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { betaPassword, safeNext } from "@/lib/beta-lock";

export const metadata: Metadata = {
  title: "Private beta · TownHall AI",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errors = {
  wrong: "That password didn't match. Check with the person who invited you and try again.",
  slow: "Too many tries. Please wait about 15 minutes and try again.",
} as const;

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  if (!betaPassword()) redirect(next as Parameters<typeof redirect>[0]);
  const message = error === "wrong" || error === "slow" ? errors[error] : null;

  return (
    <main className="page max-w-md">
      <div>
        <p className="eyebrow">Private beta</p>
        <h1 className="title mt-2">Welcome, neighbor</h1>
        <div className="title-rule" />
      </div>
      <p className="text-[17px] leading-relaxed text-ink-soft">
        TownHall AI is open to a small group of testers right now. Enter the password you were given and we&apos;ll
        remember this browser, so you only need to do it once.
      </p>
      <form method="post" action="/api/unlock" className="card flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="beta-password" className="font-medium">
          Password
        </label>
        <input
          id="beta-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="input"
          aria-describedby={message ? "beta-error" : undefined}
          aria-invalid={message ? true : undefined}
        />
        {message && (
          <p id="beta-error" role="alert" className="text-sm font-medium text-warn">
            {message}
          </p>
        )}
        <button type="submit" className="btn-primary self-start">
          Continue
        </button>
      </form>
      <p className="note">Don&apos;t have a password? TownHall AI opens to everyone soon.</p>
    </main>
  );
}
