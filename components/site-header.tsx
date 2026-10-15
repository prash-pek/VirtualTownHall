import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { clerkEnabled } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="font-semibold">
          TownHall AI
        </Link>
        {clerkEnabled() && (
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        )}
      </div>
    </header>
  );
}
