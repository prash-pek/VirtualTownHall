# TownHall AI v2 — Handover

**Date:** October 13, 2026 · **Branch:** `v2` · **Repo:** https://github.com/prash-pek/VirtualTownHall

This document hands TownHall AI v2 over to a new Claude project. Start any new chat by pointing it here.

---

## 1. Where things stand

| Item | Status |
|---|---|
| v1 codebase (`main`) | Working hackathon app: Vite/React frontend on Vercel, Express/SQLite backend on Railway. **Reference only**; it will be replaced. |
| v1 code evaluation | Done (§4). Verdict: real security and robustness gaps. We chose a ground-up rebuild. |
| PRD v2 | Written: [TownHall_AI_PRD_v2.md](TownHall_AI_PRD_v2.md) |
| TRD v2 (rebuild) | Written: [TownHall_AI_TRD_v2.md](TownHall_AI_TRD_v2.md) |
| Data sourcing policy | Written: [data-sourcing-policy.md](data-sourcing-policy.md) |
| Oregon seed data schema | Written: [../data/oregon-2026/README.md](../data/oregon-2026/README.md) |
| Oregon ballot inventory | **Done (first pass):** [inventory.json](../data/oregon-2026/inventory.json) has 148 jurisdictions, 199 races, 438 candidates, 23 measures, all from T1 sources; details in [inventory_report.md](../data/oregon-2026/reports/inventory_report.md). **Known gaps:** outside the Portland metro only Marion County is covered; no ZIP mappings; 194 candidates have unknown incumbency; some OCR'd names need checking. **The verifier must double-check:** "no statewide measures" (agent cites SOS Directive 2026-09) and "no statewide judicial contests". |
| Candidate/measure collection + verification | Not started. Next step for the data pipeline thread. |
| v2 app code | Not started. |

---

## 2. What we're building

A civic platform for the **Oregon general election on November 3, 2026**:
- Voters see their **exact ballot** (candidates and ballot measures) from their address.
- They chat with AI about each option and compare options against their own priorities.
- **Candidates are the primary customers.** They can claim their profile, add materials and control their AI representation.
- For this first election, profiles are **seeded from verified public sources**.

## 3. Decisions made (don't reopen without the owner)

1. **Rebuild from the ground up:**
   - Next.js 16 App Router + TypeScript on Vercel
   - Neon Postgres + PostGIS, with Drizzle
   - Clerk, Vercel Blob, Upstash rate limits, Vercel Workflow
   - Claude via `@anthropic-ai/sdk`, default model `claude-opus-5-5`
2. **Region:** every contest on any Oregon ballot. Portland metro is the priority: Multnomah, Washington and Clackamas counties, Metro, and the City of Portland.
3. **Scope:** candidates **and** ballot measures.
4. **Candidate platform stays the main focus.** The first round of profiles is seeded from public sources. Every item carries a source URL, a verbatim excerpt and a source tier.
5. **Alignment score** = how consistent a profile is with the public record.
   - Public-seed profiles score **100% by construction**.
   - Claimed profiles are re-scored and typically land below 100%.
   - If the public-record search fails, the score shows **"Pending"**. It never falls back to the model's general knowledge.
   - It is never presented as a match with the voter.
6. **AI voice:**
   - Unclaimed profiles: **third person** ("Based on public statements, Jane Doe…").
   - First-person persona only for claimed and verified candidates.
7. **Ballot measures:** a neutral explainer that always presents YES and NO with sources and **never recommends a vote**.
8. **Values Match:** the voter answers priority questions, and each candidate and measure side is compared to those answers. It is separate from the Alignment Score, calculated deterministically in code, and shows per-statement reasoning and sources.
9. **Equal treatment:** every candidate in a race and both sides of every measure get identical collection effort. An admin reviews content before publish.
10. **No demo data:** all v1 demo data (the fictional characters and the Trump/Sanders personas) is removed.
11. **Data pipeline:** collector and verifier are separate agents.
    - The verifier independently re-fetches each source and confirms the excerpt verbatim.
    - It checks attribution, neutrality and balance.
    - It rejects AI-generated, fake or look-alike sources.

## 4. v1 evaluation summary (why we're rebuilding)

Scores (1–5):

| Area | Score |
|---|---|
| Architecture | 3 |
| Code quality | 3 |
| Correctness | 2 |
| Security | 1.5 |
| AI integration | 2.5 |
| Tests | 1 |
| Features | 3.5 |

Top issues, each fixed by design in TRD v2 §1:
- **Voter login:** email only, no password.
- **Demo accounts:** `password123` seeded in production, with credentials printed in the logs.
- **Real-politician personas** with hard-coded alignment scores.
- **No rate limiting** on paid Claude calls.
- **Data loss:** SQLite and uploads sit on Railway's temporary disk.
- **Candidate visibility:** unverified candidates are shown to voters, and there's no admin bootstrap.
- **Conversation access:** anyone with a conversation ID can read or post to it.
- **Alignment score mislabelled** as a voter "Match", with a general-knowledge fallback.
- **Prompt handling:** unbounded prompt history and documents stuffed into the prompt; topic-extraction JSON parsing fails silently.
- **Audit trail:** the hash chain isn't a real chain.
- **Tooling:** no tests, lint or CI; dead `api/` folder and broken Docker files.

## 5. Suggested threads for the Claude project

| Thread | Goal | Depends on |
|---|---|---|
| **Foundation** | TRD phase 1: Next.js scaffold, Vercel project, Neon/Clerk/Upstash provisioning, Drizzle schema + migrations, roles, CI | — |
| **Oregon data pipeline** | Finish inventory → candidate + measure collectors → independent verifier → reports | Policy + schema docs |
| **Ballot lookup** | Census geocoder + Portland-area boundary layers (council districts, Metro, school/special districts) in PostGIS | Foundation schema |
| **AI services + evals** | classifyTurn, candidate chat (both voices), measure explainer, summaries, alignment, values mapping; eval suite (neutrality, grounding, voice, injection, verifier accuracy) | Foundation |
| **Voter UI** | Landing, My Ballot, race/candidate/measure pages, chat, Values Match | Ballot lookup, AI services |
| **Candidate + admin UI** | Claim flow, uploads, persona, blocked topics, pause, analytics; platform review queue | Foundation, data pipeline |

Each thread should end with a **"Spec updates"** section listing exact PRD/TRD edits, so the documents stay the source of truth.

## 6. Re-running the Oregon data pipeline

Stages (all output goes under `data/oregon-2026/`, per its README):

1. **Inventory**
   - Official (T1) sources only.
   - Covers federal, statewide, judicial, legislative and statewide measures; then all Portland-metro county, Metro, city, school and special-district contests; then the rest of Oregon on a best-effort basis.
   - Output: `inventory.json` + `reports/inventory_report.md`.
2. **Collect**
   - One file per candidate in `raw/candidates/`, one per measure in `raw/measures/`.
   - Run in parallel batches by jurisdiction.
   - Identical effort per candidate in a race.
   - Measures start from the official Voters' Pamphlet: explanatory statement, fiscal impact, and arguments for and against.
3. **Verify**
   - A separate agent that never sees the collector's reasoning.
   - Re-fetches every URL, confirms each excerpt verbatim, and checks tier, red flags, attribution, paraphrase faithfulness, neutral wording and recency.
   - Runs a balance check per race and per measure.
   - Writes `verified/…` + `reports/verification_report.md`.
4. **Admin review** happens in the v2 app (TRD §6). The verified JSON is imported as `draft`.

---

## 7. Project instructions (paste into the Claude project's custom instructions)

```
You are working on TownHall AI, a civic platform for the Oregon general election on November 3, 2026. Voters see their exact ballot (candidates and ballot measures), chat with AI about each option, and compare options against their own priorities. Candidates are the platform's primary customers: they can claim their profile, add materials, and control their AI representation.

Repo: https://github.com/prash-pek/VirtualTownHall (branch v2). Start from docs/HANDOVER.md.

Source of truth:
- docs/TownHall_AI_PRD_v2.md: product requirements
- docs/TownHall_AI_TRD_v2.md: technical requirements for the ground-up rebuild
- docs/data-sourcing-policy.md: rules for collecting and verifying public information
- data/oregon-2026/README.md: seed data schema; data/oregon-2026/inventory.json: official contest list

Decisions already made (don't reopen unless I ask):
- Ground-up rebuild: Next.js 16 App Router + TypeScript on Vercel; Neon Postgres + PostGIS; Drizzle; Clerk; Vercel Blob; Upstash rate limits; Vercel Workflow; Claude via @anthropic-ai/sdk, default model claude-opus-5-5. v1 (Vite + Express + SQLite on main) is reference only.
- Region: all Oregon contests; Portland metro (Multnomah, Washington, Clackamas, Metro, City of Portland) is the priority.
- First round of candidate profiles is seeded from public sources only. Every item has a source URL, a verbatim excerpt and a source tier. Public-seed profiles show a 100% "Alignment with public record" score by construction. Claimed profiles are re-scored and typically land below 100%. If the public-record search fails, the score shows "Pending", never a general-knowledge fallback.
- Unclaimed profiles: the AI speaks about the candidate in the third person. First-person persona only for claimed, verified candidates.
- Ballot measures: neutral explainer chat. It always presents YES and NO with sources and never recommends a vote.
- Values Match is separate from the Alignment Score. It is computed deterministically and shows per-statement reasoning and sources.
- Every candidate in a race and both sides of every measure get identical collection effort.
- All v1 demo data (fictional characters, Trump/Sanders personas) is removed.
- Data pipeline: collector and verifier are separate agents. The verifier independently re-fetches sources, confirms excerpts verbatim, checks attribution, neutrality and balance, and rejects AI-generated, fake or look-alike sources.

Working style: concise and concrete. When a thread's output changes a decision or the spec, end with a "Spec updates" section listing exact edits to the PRD/TRD so I can sync the documents.
```

## 8. Kickoff prompt (first thread)

```
Let's kick off the TownHall AI v2 rebuild. Read docs/HANDOVER.md on the v2 branch of https://github.com/prash-pek/VirtualTownHall, then the PRD v2, TRD v2 and data-sourcing policy it links.

1. Give me a short readback (10 bullets max) of what we're building and the key constraints, so I can confirm we're aligned.
2. Propose how to split the work into parallel threads in this project, starting from HANDOVER.md §5. For each thread: goal, inputs it needs, outputs/handoff artifacts, dependencies on other threads, and a ready-to-paste opening prompt.
3. Flag any gaps, contradictions or risky assumptions in the PRD/TRD that we should resolve before building, especially neutrality, legal/election-law disclaimers, and data accuracy.
```
