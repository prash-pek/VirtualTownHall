import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { clerkEnabled } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed */}
          <img src="/logo.svg" alt="" width={24} height={24} />
          TownHall AI
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/ballot" className="flex min-h-10 items-center text-sm font-medium hover:text-olive">
            My ballot
          </Link>
          {clerkEnabled() && (
            <>
              <Show when="signed-out">
                <SignInButton mode="redirect">
                  <button className="btn min-h-10 px-3 py-1 text-sm">Sign in</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
