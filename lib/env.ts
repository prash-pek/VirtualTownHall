import { z } from "zod";

/**
 * Server env. Provider values come from `vercel env pull` (Neon, Clerk and Upstash marketplace
 * integrations); nothing is hand-copied. Optional here so the app builds before provisioning;
 * each module checks what it needs when it's first used.
 */
const serverEnv = z.object({
  DATABASE_URL: z.url().optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export const env = serverEnv.parse(process.env);

/** Auth is wired only once both Clerk keys exist; until then every protected surface denies. */
export function clerkEnabled(): boolean {
  return Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
