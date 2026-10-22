import "server-only";

import { cookies } from "next/headers";

import { BETA_COOKIE, betaPassword, hasValidBetaCookie } from "@/lib/beta-lock";

/** True while the beta lock is on and this browser hasn't entered the password yet. */
export async function betaLocked(): Promise<boolean> {
  const password = betaPassword();
  if (!password) return false;
  return !(await hasValidBetaCookie((await cookies()).get(BETA_COOKIE)?.value, password));
}
