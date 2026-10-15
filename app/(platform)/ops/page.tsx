import { redirect } from "next/navigation";

import { AuthError } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";

// Role checks need the request; never prerender these.
export const dynamic = "force-dynamic";

export default async function OpsHome() {
  try {
    await requireRole("admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/");
    throw e;
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Platform admin</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">The review queue arrives in phase 3.</p>
    </main>
  );
}
