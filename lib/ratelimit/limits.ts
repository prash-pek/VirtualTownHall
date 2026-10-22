/** Initial limits from TRD v2 §10. */
export const limits = {
  chatPerSession: { tokens: 20, window: "10 m" },
  chatPerIp: { tokens: 60, window: "1 h" },
  uploadsPerCandidate: { tokens: 10, window: "1 d" },
  scoringPerCandidate: { tokens: 1, window: "10 m" },
  /** Address lookups hit the Census geocoder; generous for real use, tight enough to stop scraping. */
  ballotLookupPerIp: { tokens: 30, window: "1 h" },
  /** Beta password guesses: plenty for typos, far too few to guess a decent password. */
  betaUnlockPerIp: { tokens: 10, window: "15 m" },
} as const satisfies Record<string, { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }>;

export type LimitName = keyof typeof limits;
