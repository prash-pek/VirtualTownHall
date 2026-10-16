---
name: oregon-pipeline-paused
description: Oregon 2026 data collection is paused by Prash (2026-10-14) to save credits until the core platform is stable
metadata:
  type: project
  modified: 2026-10-15T05:19:40.880Z
---

Prash paused the Oregon data pipeline on 2026-10-14 at 23:16 UTC: "pausing oregon data collection because its burning through my credits, lets bring that back once we have a stable platform to fill with data and focus on core build first".

At the pause, the measures were 23/23 verified and candidates were 206/438 raw and 126/438 verified. Data was on branch claude/oregon-data-pipeline-cm37lk; PR #3 merged to main 2026-10-15.

**Why:** credits; core build comes first.
**How to apply:** don't start Oregon collectors or verifiers until Prash says to resume. The exact resume point is in /mnt/project-files/townhall/progress/oregon-data-pipeline.md. See [[progress-docs-for-resets]] and [[townhall-repo-and-specs]].

Audit 2026-10-15: the data is usable and fits main's schema. Before more collection, the priorities are the verified/ importer and a neutral measure display (only 3/23 measures have both sides; sponsor rationale is filed as a YES explainer). PR #3 now targets main.

Token efficiency (Prash, 2026-10-15: "It's crushing my usage"):
- DEFAULT (Prash approved 2026-10-15): collectors and verifiers run on Sonnet, at most 3 in parallel. A test showed Sonnet used fewer tokens per candidate than Opus at every step, with comparable quality (the verifier caught the one miss). Rules are in pipeline/RUNNING.md.
- Extract pamphlet statements with a script once direct .gov access exists.
- Don't subscribe threads to PR activity while the Vercel bot spams edits; I unsubscribed from PR #3.
- Keep all 3 news-domain searches in step 5 (Prash, 2026-10-15: "Keep it at 3 checks for accuracy"). The cost rules are in data/oregon-2026/pipeline/RUNNING.md.

Status 2026-10-15 (PR #3 MERGED to main as 65094ef; resume on a fresh branch from main): measures 23/23 verified; candidates 219/438 raw, 135/438 verified (1006 items, 13 empty). Prash wants the build finished first, tested on the existing data, before data capture resumes.

On resume (Prash, 2026-10-15): first run a quick A/B test on the same candidates, comparing the direct pamphlet read (pipeline/pamphlet_extract.py) with an agent reading the PDF. Compare tokens and quality, then let Prash decide quality vs cost. The direct read needs the cloud environment's network settings to allow the county and SOS .gov hosts.

Resume rule (Prash, 2026-10-15, vision thread): resume after phase 3 publishing works; Portland metro first (plus metro legislative districts); collect only what phase 1 shows voters, both measure sides. Details in the pipeline progress file. See [[townhall-product-vision]].

Oregon collection RESUMED (Prash, 2026-10-15 19:46 UTC), Portland metro only (plus covering legislative districts, phase-1 fields), BEFORE further build: Foundation stays paused (publishing ~80% done on its branch) until the Portland data is in, then finishes publishing and builds per-item discussion against that complete ballot. Overrides the earlier "PAUSED until Prash says resume" and "after publishing works" lines.

Status 2026-10-16: Portland metro DONE. 346/438 candidates verified (all metro), 23/23 measures verified, 16 metro measures with pamphlet args both sides where filed, pamphlet endorsements on 148 candidates. Data PR #14 MERGED to main 2026-10-16 (d5bb29e). Rest of Oregon (92 candidates) waits for Prash.
