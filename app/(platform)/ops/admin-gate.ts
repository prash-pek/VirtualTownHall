import "server-only";

import { redirect } from "next/navigation";

import { AuthError } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";

/** Sends anyone who isn't a platform admin back to the home page. */
export async function requireAdminPage() {
  try {
    return await requireRole("admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/");
    throw e;
  }
}
