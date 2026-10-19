/**
 * Which verified items should get a human look before publishing. The verifier marks doubt it can't settle
 * from the source (a likely-but-unproven identity match, a tier judgment call, a loose topic fit) with the
 * `low_confidence` check, and old or undated material fails `recency`. Both stay doubtful after a correction.
 */
export const LOW_CONFIDENCE_CHECKS: readonly string[] = ["low_confidence", "recency"];

export function needsALook(checksFailed: readonly string[] | null | undefined): boolean {
  return (checksFailed ?? []).some((c) => LOW_CONFIDENCE_CHECKS.includes(c));
}
