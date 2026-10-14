# TownHall AI — Technical Requirements v2 (Ground-Up Rebuild)

| | |
|---|---|
| **Version** | 2.0 |
| **Date** | October 13, 2026 |
| **Implements** | [PRD v2](TownHall_AI_PRD_v2.md) |
| **Data policy** | [data-sourcing-policy.md](data-sourcing-policy.md) |
| **Replaces** | v1 TRD and the v1 codebase (Vite SPA + Express + SQLite) |

---

## 1. Why rebuild, and what each decision fixes

The v1 code evaluation (Oct 13, 2026) found fixable-but-structural problems. The rebuild addresses them at the foundation instead of patching:

| v1 problem | v2 answer |
|---|---|
| Voter login is email-only; seeded `password123` accounts in prod | Managed auth (Clerk): email magic link / passkeys, no app-managed passwords; no demo accounts exist |
| No admin bootstrap; unverified candidates shown | Roles in auth claims (`voter`, `candidate`, `admin`), admin assigned out-of-band; voter queries only return `status = published` |
| Conversation IDOR | Every conversation row has an owner (user id or signed anonymous session id); all reads/writes filtered by owner in the data layer |
| No rate limiting on paid AI endpoints | Per-user and per-IP rate limits (Upstash Redis) + daily AI spend cap + Vercel BotID on chat |
| SQLite + uploads on ephemeral disk | Neon Postgres (+PostGIS) and private Vercel Blob |
| Ad-hoc `ALTER TABLE` migrations | Drizzle schema + versioned SQL migrations, run in CI before deploy |
| Fake hash chain | Real chain: `hash = sha256(prev_hash ‖ canonical_json(entry))`, monotonic sequence per subject, nightly verifier job |
| Everything stuffed into the prompt; unbounded history; JSON parse failures | Retrieval over chunked sources, windowed history + compaction, structured outputs for all machine-read responses, prompt caching |
| Blocked topics enforced by prompt only | Pre-classification step (structured output) decides blocked/allowed before the chat call; deterministic redirect response |
| Alignment score falls back to "general knowledge"; mislabeled as voter match | Score is `100` by construction for public-seed profiles; computed only from fetched, cited public record otherwise; `Pending` on retrieval failure; Values Match is a separate model and UI |
| Candidate text injected into scoring prompt | Untrusted content always passed as delimited documents, never as instructions; output schema-constrained |
| No tests, lint, CI; plain JS | TypeScript strict, ESLint, Vitest, Playwright, AI eval suite, GitHub Actions |
| Deployment churn (Vercel + Railway + dead `api/`) | One Next.js app on Vercel; one deploy target |

---

## 2. Architecture

```
                     ┌───────────────────────── Vercel ─────────────────────────┐
 Voter / Candidate ─▶│ Next.js 16 App Router (React Server Components + Route Handlers) │
 / Admin browser     │   ├─ UI (voter, candidate admin, platform admin)                │
                     │   ├─ Server Actions / Route Handlers  (zod-validated)            │
                     │   ├─ AI services  ──────────────▶ Claude API (@anthropic-ai/sdk) │
                     │   ├─ Workflows (Vercel Workflow): ingestion, verification,       │
                     │   │     alignment scoring, summaries, analytics rollups          │
                     │   └─ Cron: hash-chain verifier, source re-check                  │
                     └──────┬──────────────┬──────────────┬───────────────┬─────────────┘
                            │              │              │               │
                     Neon Postgres    Vercel Blob    Upstash Redis     Clerk
                     (+PostGIS)       (private)      (rate limits)     (auth, roles)
                            │
                  US Census Geocoder (address → districts) + local GIS boundaries
```

### 2.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript (strict) | Shared types from DB schema to UI |
| App | Next.js 16 App Router on Vercel (Node.js runtime, Fluid Compute) | Single deployable; streaming chat over the Node runtime |
| UI | Tailwind CSS + shadcn/ui | Port v1's visual design language; WCAG 2.1 AA |
| DB | Neon Postgres via Vercel Marketplace, PostGIS extension | Drizzle ORM + drizzle-kit migrations |
| Auth | Clerk via Vercel Marketplace | Magic link + passkeys; roles in `publicMetadata`; anonymous voters get a signed session cookie |
| Files | Vercel Blob (private) | Candidate uploads; served only via signed URLs to the owner/admin |
| Rate limit | Upstash Redis via Marketplace (`@upstash/ratelimit`) | Sliding windows per user / IP / route |
| Bot protection | Vercel BotID on chat + upload endpoints | |
| Background work | Vercel Workflow | Durable, retryable steps for ingestion and scoring |
| AI | Claude API through the official `@anthropic-ai/sdk` | Needed for server tools (web search/fetch), citations and refusal fallbacks |
| Validation | zod | Every request body, every AI structured output |
| Observability | Vercel logs/traces + structured AI call log table | Token usage, latency, refusals, cost per route |

Provisioning (phase 0): `vercel link`, then install Neon, Clerk and Upstash through `vercel integration add …`, then `vercel env pull`. No provider keys are hand-copied.

### 2.2 Repo layout

```
app/
  (voter)/            landing, ballot, race/[id], candidate/[id], measure/[id], chat/[id], values
  (candidate)/admin/  dashboard, profile, context, persona, topics, analytics, audit, claim
  (platform)/ops/     review-queue, candidates, measures, claims, ingestion, ai-usage
  api/                route handlers (chat streaming, uploads, webhooks)
lib/
  db/                 drizzle schema, migrations, queries (owner-scoped helpers)
  ai/                 client, model config, prompts/, services/ (one file per AI capability)
  ballot/             address lookup, district resolution
  audit/              hash-chain append + verify
  auth/               role guards
  ratelimit/
workflows/            ingest-oregon, verify-items, alignment-score, conversation-summary
data/oregon-2026/     seed corpus (collector/verifier output) — imported, never hand-edited in DB
tests/                unit (vitest), e2e (playwright), evals/
```

---

## 3. Data model (Postgres)

All ids are UUIDv7. All tables have `created_at`, `updated_at`. `status` columns gate voter visibility.

### 3.1 Geography & ballot
- `elections` (id, slug, name, date, state)
- `jurisdictions` (id, slug, name, type, parent_id, boundary `geometry(MultiPolygon, 4326)` nullable, census_geoid nullable)
- `races` (id, election_id, jurisdiction_id, slug, office, district_label, seats, partisan, ballot_order)
- `ballot_measures` (id, election_id, jurisdiction_id, slug, number, title, ballot_label, summary, yes_means, no_means, fiscal_impact, full_text_url, ballot_order, status)
- `measure_arguments` (id, measure_id, side `yes|no`, kind `argument|rebuttal|explainer`, author, statement, excerpt, source_id, status)

### 3.2 Candidates
- `candidates` (id, race_id, slug, name, party, incumbent, occupation, website_url, profile_source `public_seed|candidate`, owner_user_id nullable, claimed_at, is_verified, is_paused, donation_url, persona_config jsonb, status `draft|in_review|published|withdrawn`)
- `candidate_items` (id, candidate_id, kind `bio|position|voting_record|upload_chunk|manual`, topic, statement, excerpt, source_id nullable, upload_id nullable, is_active, content_hash, status)
- `uploads` (id, candidate_id, blob_key, filename, mime, size, sha256, extracted_text_status)
- `blocked_topics` (id, candidate_id, topic, redirect_message, redirect_url, is_active)
- `claims` (id, candidate_id, user_id, evidence jsonb, status `pending|approved|rejected`, reviewed_by)

### 3.3 Sources & verification (shared by candidates and measures)
- `sources` (id, url, canonical_url, publisher, tier `T1|T2|T3`, published_at, retrieved_at, content_sha256, archived_blob_key, red_flags jsonb)
- `verifications` (id, subject_type, subject_id, status `verified|corrected|rejected`, checks_failed text[], note, verifier `agent|admin`, model, created_at) — append-only history per item
- `ingestion_runs` (id, scope, started_at, finished_at, stats jsonb, report_md)

### 3.4 Scores & values
- `alignment_scores` (id, candidate_id, score nullable, basis `public_seed_identity|computed`, status `ok|pending|failed`, discrepancies jsonb, rationale, model, computed_at) — latest row is current
- `values_statements` (id, topic, text, display_order)
- `position_mappings` (id, subject_type `candidate|measure_yes|measure_no`, subject_id, statement_id, stance -2..2, rationale, source_id, status)
- `voter_values` (user_id, statement_id, answer -2..2, weight 0..3)

### 3.5 Users, conversations, analytics, audit
- Users live in Clerk; `profiles` (user_id, role, zip, address_hash, interest_tags) mirrors what the app needs. Raw addresses are never stored — only resolved jurisdiction ids and a salted hash.
- `conversations` (id, subject_type `candidate|measure`, subject_id, owner_user_id nullable, anon_session_id nullable, CHECK exactly one owner, summary, topic_tags, message_count, ended_at)
- `messages` (id, conversation_id, role, content, citations jsonb, blocked_topic_id nullable, model, input_tokens, output_tokens, created_at) — a table, not a JSON blob
- `ai_calls` (id, route, model, effort, input/output/cache tokens, latency_ms, stop_reason, refusal_category, cost_usd, created_at)
- `audit_log` (id, subject_type, subject_id, seq, action, actor_id, payload jsonb, prev_hash, hash, created_at; UNIQUE(subject_type, subject_id, seq)); DB role used by the app has INSERT only on this table

---

## 4. Ballot lookup

1. Voter enters address (or ZIP).
2. **US Census Geocoder** (`geographies/onelineaddress`) returns lat/lon plus congressional district, state legislative districts, county and place.
3. Lat/lon is matched with PostGIS against local boundary layers we load for the Portland region: City of Portland council districts, Metro boundary, school districts, special districts (sources: portland.gov GIS, Oregon Metro RLIS, county GIS — recorded in `sources`).
4. Resolved jurisdiction ids → races + measures for the election, in ballot order.
5. ZIP-only: return the union of contests for jurisdictions intersecting the ZIP and show "Enter your full address to see your exact ballot" where contests differ.
6. Always link to the official Oregon "My Vote" page as the authoritative ballot check.

The address is used for the lookup and discarded; only the resolved jurisdiction set is kept (and only for signed-in voters who opt in).

---

## 5. AI architecture

### 5.1 Configuration
- One module `lib/ai/models.ts` holds model id, effort and max tokens per route. Default model: **`claude-opus-5-5`**, with effort tuned per route (e.g. `low` for classification, `medium` for chat, `high` for verification and scoring). Changing a model is a config change, not a code change.
- Every request enables server-side refusal fallbacks (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) and checks `stop_reason` before reading content.
- Chat responses stream to the browser. Long background calls stream server-side and use `finalMessage()`.
- Prompt caching: stable prefix = system prompt + subject corpus; volatile turn content after the cache breakpoint. Verify via `cache_read_input_tokens` in `ai_calls`.
- Everything a program reads (classifications, scores, mappings, verifier results) uses structured outputs validated with zod. No regex/JSON scraping of prose.
- Every call is logged to `ai_calls`.

### 5.2 Services

| Service | Trigger | Input | Output |
|---|---|---|---|
| `classifyTurn` | each voter message | message + subject's blocked topics + taxonomy | `{blocked_topic_id?, topics[], is_abusive}` |
| `candidateChat` | voter message | retrieved candidate items (as cited documents) + persona config + windowed history | streamed text with citations |
| `measureExplainer` | voter message | measure record + arguments (as cited documents) + history | streamed text with citations |
| `summarize` | conversation end | transcript | `{summary, positions_discussed[]}` |
| `mapValues` | ingestion / item change | items + values statements | `position_mappings[]` (admin-reviewed) |
| `scoreAlignment` | claimed-profile context change (debounced) | candidate's active items + fetched public record | `{score, discrepancies[], rationale}` |
| `collect` | ingestion workflow | race/measure + policy | raw items with sources |
| `verify` | after collect | item + freshly fetched source text | verification result |

### 5.3 Voice rules
- Public-seed candidate (`profile_source = public_seed`): **third person** ("Based on public statements, Jane Doe…"). The candidate's name is never used as the speaker.
- Claimed and verified candidate: first-person persona, persistent PRD disclaimer.
- Measures: neutral explainer. Must present YES and NO, must cite, must decline to recommend a vote (enforced by prompt + eval suite).
- All modes: answer only from provided documents; say so when the documents don't cover the question; no polling, predictions or endorsements.

### 5.4 Grounding
- Context is the subject's `candidate_items` / measure records, passed as `document` blocks with `citations: {enabled: true}`. Citations map back to `sources` for the UI's source chips.
- Retrieval: Postgres full-text + topic filter selects the top items for the turn (a subject's verified corpus is small; embeddings are a later optimization if needed).
- History: last N turns verbatim plus a running summary; hard cap on input tokens per call.

### 5.5 Untrusted content
- Candidate uploads, fetched web pages and voter messages are data. They're placed only inside document blocks or clearly delimited user content, never concatenated into system prompts.
- The alignment scorer and verifier only output schema-constrained JSON, so injected instructions can't change the output shape. Scores outside expected bounds or with missing citations are rejected.

---

## 6. Ingestion & verification pipeline

Mirrors the agent process used for the first Oregon seed, so the product can re-run it.

```
inventory (T1 only) → collect (per candidate / measure) → verify (independent) → admin review → publish
```

- **Collect**: Claude with `web_search` / `web_fetch` server tools; per-tier `allowed_domains` lists for T1; outputs items per [data-sourcing-policy.md](data-sourcing-policy.md) §3.
- **Verify** (separate call, separate prompt, no access to collector reasoning):
  1. Code re-fetches the URL, stores a content hash and an archived copy (Blob), and checks deterministically that the excerpt appears in the normalized page text. If it doesn't, the item is rejected before any model call.
  2. Code checks the domain against the tier allow-list, the exclusion list and look-alike detection (edit distance to known official/campaign domains).
  3. Model checks attribution, paraphrase faithfulness, neutral wording and recency, returning a structured verdict.
  4. Per-race / per-measure balance report (item counts per candidate by tier; both measure sides present).
- **Admin review queue**: verified items grouped by race/measure with the balance report; admins approve, edit (creates a `corrected` verification) or reject. Publishing writes audit entries.
- **Re-check cron**: weekly re-fetch of sources; changed or missing pages flag items for review.
- **Seed import**: `data/oregon-2026/verified/**` is imported by a script into `draft` status → review queue. The JSON corpus is the source of truth for the initial load.

---

## 7. Alignment score

- `public_seed` profile: insert `alignment_scores{score: 100, basis: public_seed_identity, status: ok}`. No model call.
- Claimed profile: on active-context change (debounced 10 min), the workflow loads the public-record corpus (the original verified seed items + fresh collection), runs `scoreAlignment`, and stores score + per-topic discrepancies. On retrieval failure: `status: pending`, and the UI shows "Pending".
- UI label: "Alignment with public record". Tooltip explains the 100% case. Never shown as a match with the voter.

## 8. Values Match

- Deterministic scoring in code (no model at request time):
  `match(subject) = Σ_s weight_s · (1 − |answer_s − stance_s| / 4) / Σ_s weight_s` over statements where both exist, with coverage (`statements_covered / statements_answered`) shown beside it.
- Measures: compute for the YES and NO sides; display "Your priorities align more with YES/NO", with per-statement reasoning and sources.
- Low coverage (< 50%) displays "Not enough public information" instead of a number.

---

## 9. API surface (route handlers / server actions)

Voter (anonymous allowed unless noted):
- `GET /api/ballot?address=` → contests for the resolved jurisdictions
- `GET /api/races/:slug`, `/api/candidates/:slug`, `/api/measures/:slug`
- `POST /api/conversations` {subject_type, subject_id} → owner-bound conversation
- `POST /api/conversations/:id/messages` → SSE stream (owner check, rate limit, BotID)
- `POST /api/conversations/:id/end` → summary
- `PUT /api/me/values` (signed-in) / client-side storage for anonymous
- `GET /api/candidates/:slug/audit` → public timeline

Candidate (role `candidate`, owner of the candidate):
- `POST /api/claims` (any signed-in user) → claim request
- CRUD `/api/admin/items`, `/api/admin/uploads` (Blob client upload with size/type limits), `/api/admin/persona`, `/api/admin/blocked-topics`, `POST /api/admin/pause`
- `GET /api/admin/analytics`

Platform (role `admin`):
- Review queue, publish/reject, claims approval, ingestion runs, AI usage.

All inputs are zod-validated. Errors use `{error: {code, message}}`.

## 10. Security & privacy

- Authorization in the data layer: query helpers take the session and add owner/role filters; route handlers can't fetch by bare id.
- Rate limits (initial): chat 20 msgs/10 min per user or anonymous session, 60/hour per IP; uploads 10/day per candidate; scoring 1 per 10 min per candidate; global daily AI spend cap with alerting.
- Security headers: CSP, HSTS, frame-ancestors none, referrer policy. Same-origin app, so no permissive CORS.
- Uploads: size ≤ 10 MB, MIME sniffing, PDF/DOCX/TXT only, text extraction in a workflow step, originals private.
- Secrets only in Vercel env (pulled via `vercel env pull`); none in the repo; `.env*` gitignored.
- Privacy: no raw addresses stored; anonymous chats excluded from analytics; analytics aggregated with a minimum group size of 10 before ZIP-level display; conversation retention 180 days.
- Disclaimers rendered by layout components (not per-message), so they can't be omitted.

## 11. Testing & quality

- **Unit** (Vitest): values-match math, hash chain, district resolution, rate-limit guards, authorization helpers.
- **E2E** (Playwright): ballot lookup → measure chat; candidate chat; claim flow; admin publish; blocked-topic redirect; pause.
- **AI evals** (`tests/evals/`), run in CI on prompt or model changes:
  - Neutrality: measure explainer never recommends a vote, even when pushed; equal treatment across sides (LLM judge + rules).
  - Grounding: answers cite, and decline when sources are silent.
  - Voice: public-seed profiles never use first person as the candidate.
  - Prompt injection: adversarial uploads/messages don't change behavior or scores.
  - Verifier: a labeled set of real, altered and fabricated items; target ≥ 99% rejection of fabricated excerpts.
- **CI** (GitHub Actions): typecheck, lint, unit, migrations against a Neon branch, e2e against the preview deployment, evals (on prompt changes).

## 12. Migration from v1

- **Port**: visual design and component patterns, chat UX, admin panel information architecture, prompt intent (grounding, disclaimer, kill switch).
- **Drop**: Express backend, SQLite, `api/`, Docker/compose files, Railway, all v1 seed data (fictional and real-politician personas), duplicate admin pages.
- v1 stays on `main` until v2 reaches parity; v2 is built on a `v2` branch in a `v2/` working tree or a fresh app directory, then replaces it.

## 13. Build phases

1. **Foundation**: Next.js app, Vercel project, Neon/Clerk/Upstash provisioned, Drizzle schema + migrations, auth roles, CI.
2. **Ballot core**: elections/jurisdictions/races/measures, Census geocoder + PostGIS boundaries, Oregon seed import, ballot UI.
3. **Content & review**: sources/verifications, admin review queue, publish flow, audit chain.
4. **Conversations**: classifyTurn, candidateChat (both voices), measureExplainer, summaries, rate limits, BotID.
5. **Scores**: alignment (identity + computed), values statements, mappings, Values Match UI.
6. **Candidate platform**: claim flow, uploads, persona, blocked topics, pause, analytics.
7. **Hardening**: eval suite green, e2e green, load test chat, security headers, launch checklist.

## 14. Open technical questions

1. Boundary data coverage for school/special districts outside the Portland metro: load statewide shapefiles, or fall back to ZIP-level union for those?
2. Retrieval: is Postgres full-text enough for claimed candidates with large uploads, or add pgvector embeddings in phase 6?
3. Should anonymous voters' Values Match answers be storable server-side via an opt-in anonymous profile?
4. Spend cap level and alert channel.
