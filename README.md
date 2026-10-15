# TownHall AI v2

A nonpartisan guide to the Oregon general election on November 3, 2026. A voter enters an address and sees every candidate and measure on their exact ballot, with sources for everything shown.

Start with [docs/HANDOVER.md](docs/HANDOVER.md). The product and technical specs are [docs/TownHall_AI_PRD_v2.md](docs/TownHall_AI_PRD_v2.md) and [docs/TownHall_AI_TRD_v2.md](docs/TownHall_AI_TRD_v2.md). The v1 hackathon app is kept on the `v1` branch for reference.

## Stack

Next.js 16 (App Router, TypeScript strict) on Vercel · Neon Postgres + PostGIS with Drizzle · Clerk · Upstash Redis rate limits · Vercel Blob · Vercel Workflow · Claude via `@anthropic-ai/sdk`.

## Layout

```
app/                 routes: (voter), (candidate)/admin, (platform)/ops, api/
components/          shared UI (layout-level disclaimer)
lib/db/              Drizzle schema (TRD §3) and client
lib/auth/            roles and guards
lib/ratelimit/       Upstash limits (TRD §10)
lib/seed/            inventory.json schema and integrity checks
scripts/             migrate, import-inventory
drizzle/             SQL migrations (generated; 0000 and 0002 are hand-written)
data/oregon-2026/    seed corpus, owned by the data pipeline
tests/unit/          Vitest
```

## Local development

```bash
npm install
vercel link                     # project: townhall-ai-v2
vercel env pull .env.local      # DATABASE_URL, Clerk and Upstash keys
npm run db:migrate
npm run seed:inventory          # imports data/oregon-2026/inventory.json as draft
npm run dev
```

The app is served at the root of townhallai.outsetinno.com; old `/townhallai/...` links redirect to the root.

The app builds and runs without provider keys. `/api/health` reports what is configured. Until Clerk keys exist, `/admin` and `/ops` return 503.

Any Postgres 16+ with PostGIS works locally, for example `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgis/postgis:17-3.5`.

## Database

- Edit `lib/db/schema.ts`, then `npm run db:generate` and commit the new file in `drizzle/`.
- On Vercel, `vercel-build` runs `scripts/predeploy.ts` first: for production deployments only (the `main` branch), it applies migrations and re-runs the inventory import against Neon. Feature-branch previews never migrate the shared database.
- The Neon integration is connected with the prefix `STORAGE1`, so the app reads `DATABASE_URL` or `STORAGE1_DATABASE_URL` (see `lib/env.ts`).
- `audit_log` is append-only, enforced by a trigger.
- Seed imports are idempotent upserts by slug. They never change the `status` of an existing row, so re-running after admin review is safe.

## Auth

Roles (`voter`, `candidate`, `admin`) live in Clerk `publicMetadata.role` and are set out of band. In the Clerk dashboard, open **Sessions → Customize session token** and add:

```json
{ "metadata": "{{user.public_metadata}}" }
```

Pages and route handlers call `requireRole()`. Candidate-scoped data must go through `canManageCandidate()`.

## Checks

`npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`. CI also applies migrations to a PostGIS service container and imports the inventory twice.
