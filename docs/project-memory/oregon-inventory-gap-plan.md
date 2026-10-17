---
name: oregon-inventory-gap-plan
description: Plan and rules for filling gaps in the Oregon 2026 ballot inventory; read before any new data pull
metadata:
  type: project
  modified: 2026-10-15T15:19:15.479Z
---

On 2026-10-14 Prash asked how to fill the gaps in the first-pass Oregon inventory (`data/oregon-2026/inventory.json` on branch v2) using third-party sources that can be validated. The plan is in `/mnt/project-files/townhall/data/inventory-gap-sources.md`. As of 2026-10-15 it is NOT in the repo or in docs/data-sourcing-policy.md.

Core rule: third-party (T3) sources such as Ballotpedia and Vote411 are used only to discover contests and to cross-check them. A contest, candidate or boundary enters the inventory only when an official (T1) source confirms it. T3-only items get status `unconfirmed` and are not published. When sources disagree, the official one wins and the disagreement is logged.

Gaps found in the first-pass review (2026-10-14):
- No local contests outside Portland metro (Marion has county-level races only, no city races).
- ZIP codes are empty. Replace ZIP mapping with official boundary maps (Census TIGER, Metro RLIS, county GIS).
- Incumbency is null for 194 of 438 candidates.
- "No statewide measures" rests on one SOS directive read from a multco.us copy. Confirm it on sos.oregon.gov.
- About 6 names came from scanned PDFs and need checking against the printed ballots.
- The generator script and source snapshots were never committed.

**Why:** the sourcing policy demands T1 confirmation for ballot contents, and inaccurate data is the main risk Prash raised.
**How to apply:** any data-pipeline thread pulling more Oregon data should follow the gap plan file and propose its "Spec updates". See [[oregon-data-pipeline]].
