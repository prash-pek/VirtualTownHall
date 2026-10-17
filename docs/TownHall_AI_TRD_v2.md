# TownHall AI — Technical Requirements v2 (Ground-Up Rebuild)

| | |
|---|---|
| **Version** | 2.3 |
| **Date** | October 15, 2026 (2.1: voter-curated My ballot, as-built foundation details; 2.2: walk-through, summary, verified-content import, Reflection score and Alignment names; 2.3: review queue and publish as built, per-item discussion, endorsements, candidate platform moved to phase 2) |
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
- `races` (id, election_id, jurisdiction_id, slug, office, district_label, seats nullable (null when the filing doesn't state it), partisan, ranked_choice, ballot_order)
- `ballot_measures` (id, election_id, jurisdiction_id, slug, number, title, ballot_label, summary, yes_means, no_means, fiscal_impact, full_text_url, ballot_order, status)
- `measure_arguments` (id, measure_id, side `yes|no`, kind `argument|rebuttal|explainer`, author, statement, excerpt, source_id, status)

### 3.2 Candidates
- `candidates` (id, race_id, slug, name, party, incumbent, ballot_order, occupation, website_url, profile_source `public_seed|candidate`, owner_user_id nullable, claimed_at, is_verified, is_paused, donation_url, persona_config jsonb, status `draft|in_review|published|withdrawn`)
- `candidate_items` (id, candidate_id, kind `bio|position|voting_record|upload_chunk|manual`, topic, statement, excerpt, source_id nullable, upload_id nullable, is_active, content_hash, status)
- `uploads` (id, candidate_id, blob_key, filename, mime, size, sha256, extracted_text_status)
- `blocked_topics` (id, candidate_id, topic, redirect_message, redirect_url, is_active)
- `claims` (id, candidate_id, user_id, evidence jsonb, status `pending|approved|rejected`, reviewed_by)

### 3.3 Sources & verification (shared by candidates and measures)
- `sources` (id, url, canonical_url, publisher, tier `T1|T2|T3`, published_at, retrieved_at, content_sha256, archived_blob_key, red_flags jsonb)
- `verifications` (id, subject_type, subject_id, status `verified|corrected|rejected`, checks_failed text[], note, verifier `agent|admin`, model, created_at) — append-only history per item
- `ingestion_runs` (id, scope, started_at, finished_at, stats jsonb, report_md)

- `endorsements` (2026-10-16): endorser, endorser_type, rank, statement, verbatim excerpt, source, date, status; attached to a candidate or to one side of a measure (check constraint), unique by content hash. Imported from pamphlet endorsers on verified records and from outlet slates (`data/oregon-2026/endorsements/outlets`); published with their subject.

### 3.4 Scores & values
- `alignment_scores` (id, candidate_id, score nullable, basis `public_seed_identity|computed`, status `ok|pending|failed`, discrepancies jsonb, rationale, model, computed_at) — latest row is current
- `values_statements` (id, topic, text, display_order)
- `position_mappings` (id, subject_type `candidate|measure_yes|measure_no`, subject_id, statement_id, stance -2..2, rationale, source_id, status)
- `voter_values` (user_id, statement_id, answer -2..2, weight 0..3)

### 3.5 Users, conversations, analytics, audit
- Users live in Clerk; `profiles` (user_id, role, zip, address_hash, jurisdiction_ids, interest_tags, ballot_items) mirrors what the app needs. `ballot_items` is the voter's own "My ballot": an ordered list of `race:<slug>` / `measure:<slug>` keys (max 300). Raw addresses are never stored.
- `conversations` (id, subject_type `candidate|measure`, subject_id, owner_user_id nullable, anon_session_id nullable, CHECK exactly one owner, summary, topic_tags, message_count, ended_at)
- `messages` (id, conversation_id, role, content, citations jsonb, blocked_topic_id nullable, model, input_tokens, output_tokens, created_at) — a table, not a JSON blob
- `ai_calls` (id, route, model, effort, input/output/cache tokens, latency_ms, stop_reason, refusal_category, cost_usd, created_at)
- `audit_log` (id, subject_type, subject_id, seq, action, actor_id, payload jsonb, prev_hash, hash, created_at; UNIQUE(subject_type, subject_id, seq)); append-only, enforced by a trigger that rejects UPDATE and DELETE (migration 0002) in addition to app-role grants

---

## 4. My ballot (voter-curated)

The voter owns their ballot list. An address gives a suggested starting point; the voter adds or removes any Oregon race or measure. We do not verify eligibility or limit what a voter can follow.

1. Voter enters an address and picks a state (default Oregon) on `/` or `/ballot`, or skips it and browses. Any US address is accepted; the state is appended when the address doesn't already end with a state or ZIP. For states without ballot data yet, the API returns `covered: false` and no suggestions.
2. `POST /api/ballot/suggest` calls the **US Census Geocoder** (`geographies/onelineaddress`, benchmark `Public_AR_Current`, vintage `Current_Current`, all layers). Layer names carry a vintage prefix, so they are matched by suffix. We read county, incorporated place, congressional district, state senate and house districts, and school districts.
3. Those are matched to our `jurisdictions` by type and name (`lib/ballot/districts.ts`, unit-tested): the state, the county, "City of <place>", `or-cd/sd/hd-N`, school districts by normalized name, and county-wide "other" jurisdictions such as the circuit court. Races and measures in matched jurisdictions are **suggested** and added to the list.
4. Special districts in the voter's county are returned as **"may apply"**, because Census has no maps for them. The voter adds the ones they want with one tap.
5. Browse and search cover every race and measure in the election, so anything can be added by hand.
6. The list is kept in browser storage, and also in `profiles.ballot_items` when signed in (merged on sign-in).
7. Always link to the official Oregon "My Vote" page as the authoritative ballot check.

No PostGIS boundary layers are needed for suggestions. `jurisdictions.boundary` stays in the schema for later use (e.g. council-district maps). The address is used for the lookup and discarded; it is not logged or stored. The lookup is rate-limited per IP (`ballotLookupPerIp`, 30/hour, fails closed).


### 4.1 Walk-through and summary (as built, 2026-10-15)
- **Ballot order**: races sort by level (federal, state, state senate, state house, county, county-wide other such as courts, metro, city, school, special district), keeping inventory order within a level; then measures by level and number (`lib/ballot/order.ts`). The saved list is always kept in that order.
- **Choices**: `townhall:choices` in browser storage, a map of item key → candidate slug, `yes`, `no`, `undecided` or `skip`. Nothing is preselected. No server copy; an opt-in `profiles.ballot_choices` comes later.
- **Content visibility**: item pages show only `published` candidates, items, measures and arguments. Admins see drafts too, marked "Not yet reviewed" (`lib/ballot/content.ts`).
- **Verified-content import**: `npm run seed:verified` loads `data/oregon-2026/verified/**` into `sources`, `candidate_items`, `measure_arguments` and `verifications` (verifier = agent), as `draft`. It is idempotent: sources are keyed by canonical URL, and items and arguments by content hash (`measure_arguments` gained `content_hash` and `topic`). Rejected items are skipped. `candidates.gaps` and `ballot_measures.gaps` keep the collector's gap notes. Runs in `predeploy` after the inventory import.
- **Look**: cream `#FAFAF7`, charcoal `#1F2328`, gold `#D97706`, olive `#4D5B2F`, amber for warnings; Playfair Display and DM Sans (self-hosted via @fontsource). No red or blue.
---

## 5. AI architecture

### 5.1 Configuration
- One module `lib/ai/models.ts` holds model id, effort and max tokens per route. Default model: **`claude-opus-5-5`**, with effort tuned per route (e.g. `low` for classification, `medium` for chat, `high` for verification and scoring). Changing a model is a config change, not a code change. Exception as built: the per-item discussion runs on `claude-sonnet-5-5` (§5.4).
- Every request enables server-side refusal fallbacks (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) and checks `stop_reason` before reading content.
- Chat responses stream to the browser. Long background calls stream server-side and use `finalMessage()`.
- Prompt caching: stable prefix = system prompt + subject corpus; volatile turn content after the cache breakpoint. Verify via `cache_read_input_tokens` in `ai_calls`.
- Everything a program reads (classifications, scores, mappings, verifier results) uses structured outputs validated with zod. No regex/JSON scraping of prose.
- Every call is logged to `ai_calls`.

### 5.2 Services

| Service | Trigger | Input | Output |
|---|---|---|---|
| `discuss` (built) | voter question on an item page | the item's visible record as a numbered source pack (cached) + last 3 rounds | `{responses: [{side, answer, sourceIds[]}]}`, one per candidate or YES/NO |
| `classifyTurn` (phase 2) | each voter message | message + subject's blocked topics + taxonomy | `{blocked_topic_id?, topics[], is_abusive}` |
| `summarize` | conversation end | transcript | `{summary, positions_discussed[]}` |
| `mapValues` | ingestion / item change | items + values statements | `position_mappings[]` (admin-reviewed) |
| `scoreAlignment` (Reflection, phase 2) | claimed-profile context change (debounced) | candidate's active items + fetched public record | `{score, discrepancies[], rationale}` |
| `collect` | ingestion workflow | race/measure + policy | raw items with sources |
| `verify` | after collect | item + freshly fetched source text | verification result |

### 5.3 Voice rules
- Every candidate in phase 1: **third person** ("Based on public statements, Jane Doe…"). The candidate's name is never used as the speaker.
- Claimed and verified candidate choosing first person: phase 2, with the persistent PRD disclaimer.
- Measures: "The case for YES" and "The case for NO", each attributed to its sources; neutral official background is available to both; never recommends a vote (enforced by prompt + eval suite).
- All modes: answer only from provided documents; say so when the documents don't cover the question; no polling or predictions; endorsements only as the endorser's attributed opinion.

### 5.4 Per-item discussion (as built, 2026-10-16)
- `lib/discuss/pack.ts` numbers every visible source for the item (official background, then each side's statements and endorsements) into one deterministic text block; `lib/discuss/run.ts` sends it as a cached system block with one structured-output call (`output_config.format`, zod) and `effort: low`. Model and effort come from `DISCUSS_MODEL` (default `claude-sonnet-5-5`, chosen 2026-10-16 after the discussion cost and quality eval: same quality as Opus 5.5 at half the cost) and `DISCUSS_EFFORT` (default `low`).
- The server keeps exactly one answer per side in ballot order and drops citations to sources that don't exist. Usage and cost go to `ai_calls` (route `discuss`).
- Not streamed, and refusal fallbacks are not enabled yet (both §5.1 defaults); add them if latency or refusals show up in `ai_calls`.
- Needs `TOWNHALL_API_PROD` (production) or `TOWNHALL_ANTHROPIC_API_KEY` (preview and dev), or `ANTHROPIC_API_KEY`, in Vercel; without it the route returns `unavailable` and the panel says the discussion isn't switched on.

### 5.5 Grounding
- Context is the subject's `candidate_items` / measure records, passed as `document` blocks with `citations: {enabled: true}`. Citations map back to `sources` for the UI's source chips.
- Retrieval: Postgres full-text + topic filter selects the top items for the turn (a subject's verified corpus is small; embeddings are a later optimization if needed).
- History: last N turns verbatim plus a running summary; hard cap on input tokens per call.

### 5.6 Untrusted content
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

## 7. Reflection score (was "Alignment score")

Stored in `alignment_scores` (table name kept). Voter-facing name: **Reflection score**, how faithfully a profile reflects the candidate's own public record.


- `public_seed` profile: insert `alignment_scores{score: 100, basis: public_seed_identity, status: ok}`. No model call.
- Claimed profile: on active-context change (debounced 10 min), the workflow loads the public-record corpus (the original verified seed items + fresh collection), runs `scoreAlignment`, and stores score + per-topic discrepancies. On retrieval failure: `status: pending`, and the UI shows "Pending".
- UI: public-seed profiles show "Public record only" instead of a number; claimed profiles show the Reflection score. Never shown as a match with the voter.

## 8. Alignment (was "Values Match")

- Evaluation statements are generated from the voter's own ballot items (where its candidates differ, what each measure changes), about 10–15, with per-statement importance (low/medium/high → weight). Only reviewed and published statements and mappings are used. No ideology labels.

- Deterministic scoring in code (no model at request time):
  `match(subject) = Σ_s weight_s · (1 − |answer_s − stance_s| / 4) / Σ_s weight_s` over statements where both exist, with coverage (`statements_covered / statements_answered`) shown beside it.
- Measures: compute for the YES and NO sides; display "Your answers line up more with YES/NO", with per-statement reasoning and sources.
- Low coverage (< 50%) displays "Not enough public information" instead of a number.

---

## 9. API surface (route handlers / server actions)

Voter (anonymous allowed unless noted):
- `POST /api/ballot/suggest` {address} → {matchedAddress, suggested[], nearby[]} ballot keys (rate-limited per IP; address not stored)
- `GET` / `PUT /api/me/ballot` (signed-in) → the voter's saved ballot keys
- Pages: `/` (Start: address and state), `/ballot` (check your ballot; `?address=&state=` runs a lookup), `/races/:slug` and `/measures/:slug` (walk-through item pages with "Item N of M", Previous/Next and "Your choice"), `/ballot/summary` (printable summary)
- `GET /api/races/:slug`, `/api/candidates/:slug`, `/api/measures/:slug`
- `POST /api/discuss` {itemKey, question, history[]} → `{responses[]}` with each side's answer and cited sources (rate-limited per IP; nothing stored)
- (Phase 2) `POST /api/conversations` and `/api/conversations/:id/messages|end` for saved conversations
- `PUT /api/me/values` (signed-in) / client-side storage for anonymous
- (Phase 2) `GET /api/candidates/:slug/audit` → public timeline

Candidate (role `candidate`, owner of the candidate) — all phase 2:
- `POST /api/claims` (any signed-in user) → claim request
- CRUD `/api/admin/items`, `/api/admin/uploads` (Blob client upload with size/type limits), `/api/admin/persona`, `/api/admin/blocked-topics`, `POST /api/admin/pause`
- `GET /api/admin/analytics`

Platform (role `admin`):
- Built: `/ops` review queue, `/ops/measures/:slug` and `/ops/candidates/:slug` review pages, and server actions to publish or unpublish a subject with its non-hidden items and endorsements, or hide/restore one item. Each change appends to the hash-chained `audit_log` in the same transaction.
- Later: claims approval (phase 2), ingestion runs, AI usage.

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
- Done (2026-10-15): v2 replaced the repo root on `main`, which is production. The v1 code is archived on the `v1` branch. The app is served at the root of townhallai.outsetinno.com (no basePath; old `/townhallai/*` URLs redirect). Migrations and the inventory import run in `predeploy` for production deploys only.

## 13. Build phases

1. **Foundation**: Next.js app, Vercel project, Neon/Clerk/Upstash provisioned, Drizzle schema + migrations, auth roles, CI.
2. **Ballot core**: elections/jurisdictions/races/measures, Oregon seed import, voter-curated My ballot (Census-geocoder suggestions, browse and add, saved list), race and measure pages.
Phase 1 (voters), in order:
3. **Content & review** (built 2026-10-16): admin review queue, publish flow, audit chain.
4. **Per-item discussion** (built 2026-10-16): one call answers for every side; "Endorsed by" lists.
5. **Alignment**: evaluation statements, mappings, Alignment UI.
7. **Hardening**: eval suite green, e2e green, load test, security headers, launch checklist.

Phase 2 (candidates join): **6. Candidate platform** (claim flow, uploads, persona and first-person voice, blocked topics, pause, analytics) and the **Reflection score**.

## 14. Open technical questions

1. ~~Boundary data coverage for school/special districts~~ Resolved 2026-10-15: school districts come from Census layers statewide; special districts are offered as "may apply" in the voter's county, and voters add what they want.
2. (Phase 2) Retrieval: is Postgres full-text enough for claimed candidates with large uploads, or add pgvector embeddings in phase 6?
3. Should anonymous voters' evaluation answers be storable server-side via an opt-in anonymous profile?
4. Spend cap level and alert channel.
