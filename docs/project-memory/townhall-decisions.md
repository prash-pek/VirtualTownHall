---
name: townhall-decisions
description: Owner decisions for TownHall AI v2 that must not be reopened without Prash
metadata:
  type: project
  modified: 2026-10-15T05:32:16.382Z
---

Target: Oregon general election, 2026-11-03. All Oregon contests; Portland metro (Multnomah, Washington, Clackamas, Metro, City of Portland) is priority. Candidates and ballot measures.

- Ground-up rebuild: Next.js 16 App Router + TS on Vercel; Neon Postgres + PostGIS; Drizzle; Clerk; Vercel Blob; Upstash rate limits; Vercel Workflow; Claude via @anthropic-ai/sdk, default model claude-opus-5-5.
- Candidates are primary customers; first-round profiles seeded only from public sources, each item with source URL, verbatim excerpt, tier.
- Alignment score = consistency with public record: 100% by construction for public-seed, recomputed for claimed, "Pending" on retrieval failure, never general-knowledge fallback, never shown as voter match.
- Voice: third person for unclaimed; first-person persona only for claimed+verified.
- Measures: neutral explainer, always YES and NO with sources, never recommends a vote.
- Values Match: separate from alignment, deterministic in code, per-statement reasons and sources.
- Equal collection effort per candidate and per measure side; admin review before publish.
- All v1 demo data removed.
- Data pipeline: collector and verifier are separate agents; verifier re-fetches sources and confirms excerpts verbatim.

**Why:** Set by Prash in docs/HANDOVER.md §3 (2026-10-13).
**How to apply:** Don't reopen these unless Prash asks. Related: [[townhall-repo-and-specs]].

2026-10-14: Prash chose to build the **full TRD** (all 7 phases in order), not a reduced launch cut for Nov 3. Don't re-propose a scope cut unless asked.

2026-10-15 (Prash): Ballot UX = voter-curated "My ballot". Address auto-suggests races/measures (via Census geocoder district layers, no own PostGIS boundary maps needed); voters can add/remove any Oregon race or measure. "We don't need to be the arbiters" of what someone can vote on — no eligibility verification. Built and live via PR #7 (2026-10-15); PRD/TRD bumped to 2.1 to match.

2026-10-15 (Prash, voter UX thread): Use case = voter at their kitchen table with an Oregon mail-in ballot: enter address, check ballot, optional evaluation quiz, walk each race/measure in ballot order with chat, record own choice, finish on a printable summary to fill the paper ballot. No cross-cutting "issues" layer and no top 3 (races and measures only). Names: "Alignment" = voter quiz vs candidate positions/measure sides; "Reflection score" = profile vs candidate's own public record (was Alignment score; unclaimed show "Public record only"). No red or blue in the UI; YES/NO and parties never color-coded; choices never preselected; choices stay in browser unless voter opts in. Claimed candidates choose first or third person; unclaimed = third. Voter-to-voter discussion deferred. Flow doc: /mnt/project-files/townhall/ux/voter-happy-path.md.
