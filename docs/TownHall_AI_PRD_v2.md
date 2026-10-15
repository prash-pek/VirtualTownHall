# TownHall AI — Product Requirements v2

| | |
|---|---|
| **Version** | 2.0 |
| **Date** | October 13, 2026 |
| **Supersedes** | PRD v1.0 (Feb 28, 2026) — v1 remains the reference for anything not changed here |
| **Target** | November 3, 2026 US general (midterm) election, one launch region |
| **Launch region** | Oregon — every contest on any Oregon ballot; Portland metro (Multnomah, Washington, Clackamas, Metro, City of Portland) is the priority focus |
| **Technical spec** | [TownHall_AI_TRD_v2.md](TownHall_AI_TRD_v2.md) (ground-up rebuild) |
| **Data policy** | [data-sourcing-policy.md](data-sourcing-policy.md) |

---

## 1. What changed from v1

| Area | v1 | v2 |
|---|---|---|
| Scope | Candidates only | Candidates **and ballot measures** (propositions, referendums, bond/levy questions) |
| Candidate content | Candidates upload their own materials | Same platform model, but **first round is seeded from public sources**; candidates can later claim their profile and add their own materials |
| Alignment score | Uploaded context vs. public record | Same definition. Public-seeded profiles score **100% by construction**; claimed profiles are re-scored and will typically land below 100% |
| Voter decision help | Chat with candidate personas | Adds a **Values Match** (voter priorities vs. candidate/measure positions) and a **neutral issue explainer** chat for measures |
| Geography | Seeded ZIP list per candidate | Real elections, races and jurisdictions for the launch region |
| Security | MVP-grade | Hardened for public launch (see §8) |

The core platform model is unchanged: **candidates are the primary customers**, owning and controlling their AI representation. Public seeding is how we bootstrap supply for the first election.

---

## 2. Profile lifecycle

```
public_seed  ──(candidate claims + verified)──▶  claimed
```

### 2.1 Public-seeded profiles (`profile_source = public_seed`)
- Created by the platform from publicly available information: official campaign site, official voter guide / candidate statement, voting record (incumbents), public interviews and debates.
- **Every context item stores its source URL and retrieval date.** No unsourced claims.
- **Every candidate in a race is seeded by the same pipeline at the same time** — equal treatment is a neutrality requirement.
- Seeded content is reviewed by a platform admin before it goes live.
- **Alignment score = 100%**, displayed as "100% · Sourced entirely from public record". It is not computed by a model; it is true by definition because the profile *is* the public record.
- **AI voice: third person.** "Based on public statements, Jane Doe supports…" with citations. The AI does not speak *as* a real person who has not consented to it.
- Profile shows an "Unclaimed — sourced from public record" badge and a "Are you this candidate? Claim this profile" link.

### 2.2 Claimed profiles (`profile_source = candidate`)
- Candidate proves identity, admin approves, candidate takes over the profile.
- Candidate gets the full v1 admin panel: uploads, manual context, persona config, blocked topics, kill switch, donation link, analytics.
- Seeded public-record items stay in the audit trail as the baseline; the candidate may deactivate them, and that is visible in the public audit view.
- **AI voice: first-person persona** with the v1 persistent disclaimer.
- **Alignment score is recomputed** on every context change by comparing the candidate's active context against the public record. Because candidates add framing, new positions or omit things, this will typically be < 100%. Per-topic discrepancies are shown.

### 2.3 Alignment score rules
- Measures **profile consistency with the public record**. It is **never** labelled or presented as a match with the voter.
- If public-record retrieval fails, the score is **not computed** (shown as "Pending"), rather than falling back to model general knowledge.
- Candidate-supplied text is treated as data in the scoring prompt (delimited, not instructions).

---

## 3. Ballot measures (new)

### 3.1 Data
Each measure: election, jurisdiction, measure number/letter, short title, official ballot label, plain-language summary, what a YES vote does, what a NO vote does, fiscal impact, official full text link, arguments for, arguments against, rebuttals (if published), source URLs, last-updated date.

Primary sources in priority order: official state/county voter guide → legislative analyst / fiscal office → official argument authors → reputable nonpartisan explainers (e.g. Ballotpedia).

### 3.2 Issue Explainer chat
- A neutral explainer, **not a persona**. It represents the measure, not any side.
- Must always present both YES and NO perspectives with the strongest argument each side makes.
- Must cite sources for factual claims; when the sources don't cover a question, say so.
- **Must not recommend a vote**, even when asked directly. It can help the voter reason against their own stated priorities ("You said X matters to you; supporters argue…, opponents argue…").
- Same disclaimer pattern: "AI-generated explanation based on official and public sources. Not legal or voting advice."

---

## 4. Values Match (new)

- Voter answers a short set of priority questions (e.g. 8–12 statements on a 5-point agree/disagree scale plus importance weighting), drawn from the predefined topic taxonomy.
- Each candidate's positions and each measure's YES/NO outcomes are mapped to the same statements, with citations, by the seeding pipeline and admin-reviewed.
- Output: per race, how closely each candidate matches the voter's stated priorities; per measure, which side aligns better with those priorities. **Always shows the reasoning and sources**, per statement.
- Framed as "how these options compare to the priorities you entered", never "you should vote for".
- Values Match is a distinct concept and UI from the Alignment Score.
- Answers are stored only for logged-in voters; anonymous voters' answers stay in the browser.

---

## 5. Voter experience

1. Landing → enter address (or ZIP, with district disambiguation when a ZIP spans districts).
2. **My Ballot**: every race and measure on their ballot, in ballot order.
3. Optional Values Match quiz → match indicators appear on the ballot.
4. Race → candidate cards (badge: Claimed & Verified / Unclaimed public record; alignment score) → profile → chat.
5. Measure → summary, YES/NO effects, fiscal impact, arguments, sources → Issue Explainer chat.
6. Conversation summary at end (v1).
7. Key dates and official links (registration deadline, early voting, polling place lookup on the official state site).

---

## 6. Data sourcing pipeline

Two independent roles, run as separate agents so the checker never grades its own work: a **collector** gathers sourced items, a **verifier** re-fetches every source and checks accuracy, attribution, neutrality and balance against [data-sourcing-policy.md](data-sourcing-policy.md). Only verifier-approved items reach the admin review queue.


1. Load the region's ballot: elections, races, candidates, measures (official sources).
2. For each candidate/measure: Claude with web search gathers positions/arguments → structured items, each with source URL, quote/excerpt and retrieval date.
3. Map to topic taxonomy and Values Match statements.
4. Admin review queue → publish. Every publish writes an audit log entry with content hashes.
5. Re-run on demand; diff shown in review queue.

---

## 7. Data model changes

New tables:
- `elections` (id, name, date, region)
- `jurisdictions` (id, name, type: state/county/city/district, parent_id)
- `jurisdiction_zips` (jurisdiction_id, zip) — plus address-level lookup when available
- `races` (id, election_id, jurisdiction_id, office, seats, ballot_order)
- `ballot_measures` (id, election_id, jurisdiction_id, number, title, ballot_label, summary, yes_means, no_means, fiscal_impact, full_text_url, ballot_order, profile fields for audit)
- `measure_arguments` (id, measure_id, side: yes/no, kind: argument/rebuttal, text, author, source_url)
- `values_statements` (id, topic, text)
- `position_mappings` (subject_type, subject_id, statement_id, stance, rationale, source_url)
- `constituent_values` (constituent_id, statement_id, answer, weight)
- `users` with role `admin` (platform admin bootstrap)

Changed:
- `candidates`: + `race_id`, `profile_source` (`public_seed` | `candidate`), `claimed_at`, `website_url`; seeded candidates have no usable password until claimed.
- `candidate_contexts`: + `source_type` (`public_record` | `candidate_upload` | `manual`), `source_url`, `retrieved_at`.
- `conversations`: `candidate_id` → `subject_type` (`candidate` | `measure`) + `subject_id`; history windowed.
- `audit_logs`: generalized to `subject_type`/`subject_id`; true hash chain (each hash includes the previous hash).

---

## 8. Public-launch hardening (P0)

- Voter auth with password or email magic link (v1 is email-only).
- No demo seeds or default passwords in production. All v1 demo data (fictional characters and the real-politician personas) is removed; the only seed data is the verified Oregon public record.
- Platform-admin bootstrap; only verified/admin-approved profiles are visible to voters.
- Rate limiting on chat, summary, upload and scoring endpoints; per-IP and per-user.
- Conversation ownership checks.
- Persistent database and file storage (no ephemeral disk).
- CORS restricted to the app origin; security headers.
- Remove dead deployment code (`api/`, broken compose/Dockerfile) and duplicate admin pages.
- Smoke tests for the critical paths: ballot lookup, candidate chat, measure chat, claim flow, admin publish.

---

## 9. Neutrality & legal

- Equal treatment: every candidate in a race and both sides of every measure go through the same pipeline and the same UI.
- Every factual claim shown or said by the AI is traceable to a cited source.
- No vote recommendations anywhere in the product.
- Persistent AI disclaimers (v1 §10) on candidate chats; explainer disclaimer on measure chats.
- Unclaimed profiles clearly labelled; claim path available to every candidate.
- Link to official election sources for deadlines and polling places; we don't host authoritative logistics data ourselves.

---

## 10. Open questions

1. ~~Launch region~~ — decided: Oregon, Portland-metro focus.
2. ~~Ballot data source~~ — decided: collector + verifier agents from official sources (see data-sourcing-policy.md), admin-reviewed.
3. Claim verification method: email from the official campaign domain, filing records, or manual admin check.
4. Do measure "argument authors" (official YES/NO committees) get a claim path like candidates?
