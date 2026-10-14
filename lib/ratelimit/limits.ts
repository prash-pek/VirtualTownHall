/** Initial limits from TRD v2 §10. */
export const limits = {
  chatPerSession: { tokens: 20, window: "10 m" },
  chatPerIp: { tokens: 60, window: "1 h" },
  uploadsPerCandidate: { tokens: 10, window: "1 d" },
  scoringPerCandidate: { tokens: 1, window: "10 m" },
} as const satisfies Record<string, { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }>;

export type LimitName = keyof typeof limits;
