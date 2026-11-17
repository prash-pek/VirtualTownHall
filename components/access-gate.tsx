import Link from "next/link";

import type { AppAccess } from "@/lib/auth/app-access";
import { signInUrl } from "@/lib/auth/urls";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/**
 * Shown where a voter would start (address box, ask box) when they can't use TownHall yet:
 * a sign-in prompt when signed out, a friendly note when signed in without access.
 */
export function AccessGate({
  access,
  next,
  intro = "TownHall AI is open to a small group of testers right now. Look around as much as you like. To look up your ballot and ask questions, sign in with the account you were invited with.",
}: {
  access: Exclude<AppAccess, "ok">;
  next: string;
  intro?: string;
}) {
  if (access === "no-access") return <NoAccessNote />;
  const href = `${signInUrl}?redirect_url=${encodeURIComponent(next)}`;
  return (
    <div className="card flex flex-col gap-3">
      <p className="eyebrow">Private beta</p>
      <p className="text-[15.5px] leading-relaxed text-ink-soft">{intro}</p>
      <a href={href} className="btn-primary self-start">
        Sign in
      </a>
    </div>
  );
}

export function NoAccessNote() {
  return (
    <div className="card flex flex-col gap-3">
      <p className="eyebrow">Private beta</p>
      <p className="font-medium">You don&apos;t have access to TownHall AI yet</p>
      <p className="text-[15.5px] leading-relaxed text-ink-soft">
        You&apos;re signed in, but this account isn&apos;t on the tester list. You can still read every page.
        {contactEmail ? (
          <>
            {" "}
            If you were invited, write to{" "}
            <a className="link" href={`mailto:${contactEmail}?subject=${encodeURIComponent("TownHall AI access")}`}>
              {contactEmail}
            </a>{" "}
            and we&apos;ll add you.
          </>
        ) : null}
      </p>
      <Link href="/" className="link self-start">
        Back to the home page
      </Link>
    </div>
  );
}
