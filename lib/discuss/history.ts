import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import type { SideAnswer } from "./pack";

export type Round = { question: string; responses: SideAnswer[] };
export type SignedRound = Round & { sig?: string };

/**
 * Earlier answers come back from the browser so follow-ups have context. They are replayed to Claude as
 * its own words, so an edited answer could make TownHall appear to say something our sources don't. We
 * sign every answer we return and drop any earlier round whose signature doesn't match.
 */
function key(apiKey: string) {
  const secret = process.env.DISCUSS_HISTORY_SECRET;
  // Without a dedicated secret, derive one from the API key: it is already secret and server-only.
  return secret || createHash("sha256").update(`townhall-discuss-history\0${apiKey}`).digest();
}

function payload(itemKey: string, r: Round) {
  return JSON.stringify([itemKey, r.question, r.responses.map((a) => [a.side, a.answer, a.sourceIds])]);
}

export function signRound(apiKey: string, itemKey: string, r: Round) {
  return createHmac("sha256", key(apiKey)).update(payload(itemKey, r)).digest("base64url");
}

/** Keeps only rounds we signed for this item, unchanged. */
export function verifiedHistory(apiKey: string, itemKey: string, history: SignedRound[]): Round[] {
  return history.flatMap(({ sig, ...r }) => {
    if (!sig) return [];
    const want = Buffer.from(signRound(apiKey, itemKey, r));
    const got = Buffer.from(sig);
    return want.length === got.length && timingSafeEqual(want, got) ? [r] : [];
  });
}
