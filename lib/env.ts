import { z } from "zod";

/**
 * Server env. Provider values come from `vercel env pull` (Neon, Clerk and Upstash marketplace
 * integrations); nothing is hand-copied. Optional here so the app builds before provisioning;
 * each module checks what it needs when it's first used.
 */
const serverEnv = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  // The Neon integration on Vercel was connected with the prefix STORAGE1.
  STORAGE1_DATABASE_URL: z.string().min(1).optional(),
  STORAGE1_DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  // Names the Vercel Marketplace "Upstash for Redis" integration injects.
  KV_REST_API_URL: z.url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export const env = serverEnv.parse(process.env);

/** Auth is wired only once both Clerk keys exist; until then every protected surface denies. */
export function clerkEnabled(): boolean {
  return Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

/** Upstash REST credentials under either naming scheme, or null when Redis isn't provisioned. */
export function redisConfig(): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** Pooled Postgres URL for the app. */
export function databaseUrl(): string | undefined {
  return env.DATABASE_URL ?? env.STORAGE1_DATABASE_URL;
}

/** Direct (unpooled) Postgres URL for migrations and bulk imports; falls back to the pooled one. */
export function databaseUrlUnpooled(): string | undefined {
  return env.DATABASE_URL_UNPOOLED ?? env.STORAGE1_DATABASE_URL_UNPOOLED ?? databaseUrl();
}
