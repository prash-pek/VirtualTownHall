import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { redisConfig } from "@/lib/env";

import { limits, type LimitName } from "./limits";

let redis: Redis | undefined;
const limiters = new Map<LimitName, Ratelimit>();

function getLimiter(name: LimitName): Ratelimit {
  let limiter = limiters.get(name);
  if (!limiter) {
    const config = redisConfig();
    if (!config) throw new Error("Upstash Redis is not configured");
    redis ??= new Redis(config);
    const { tokens, window } = limits[name];
    limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), prefix: `rl:${name}` });
    limiters.set(name, limiter);
  }
  return limiter;
}

/** Fails closed: if Redis isn't configured the call throws rather than allowing unlimited use. */
export async function checkLimit(name: LimitName, key: string) {
  const { success, remaining, reset } = await getLimiter(name).limit(key);
  return { success, remaining, reset };
}
