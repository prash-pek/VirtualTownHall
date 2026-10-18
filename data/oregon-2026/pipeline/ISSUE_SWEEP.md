# Issue sweep protocol (weekly)

Set 2026-10-18 (Prash). Voters ask about anything (data centers, homelessness, water), so every candidate in a
race is swept on the same fixed issue list each week, and the discussion can answer from what we find. Answers
still come only from reviewed sources: nothing here runs while a voter is asking.

Follow `COLLECTOR.md` (tools, content rules, excluded sources, "nothing from model knowledge") and
`docs/data-sourcing-policy.md`. Only what differs is written here. Run on Sonnet, at most 3 agents at once, one
candidate per agent (RUNNING.md).

## Inputs
- The candidate id and race (from `inventory.json`).
- `data/oregon-2026/issues.json`: the issue list. Skip issues whose `levels` exclude the office
  (federal = US Senate / US House; state = statewide offices and the legislature; local = everything else).
- What we already have, so you don't collect it twice: `verified/candidates/<id>.json` and, from earlier weeks,
  `verified/issues/<id>.json`.
- Optional extra topics from /ops ("Questions our sources couldn't answer"), passed by the orchestrator. Run them
  the same way as an issue, tag the items with the closest issue id, and run them for every candidate in the race.

## Steps (the same for every candidate in the race)
1. **Campaign issues page (T2)**, once: only if the candidate file has a confirmed `website_url`. Fetch its
   issues or priorities page and take what maps to the issue list.
2. **Per issue**: skip it if the candidate already has 2 or more items on that topic (log `already covered`).
   Otherwise run one WebSearch `"<full name>" <issue search terms>` and at most one WebFetch of the best result.
   Prefer, in order: official records (senate.gov / house.gov roll calls, oregonlegislature.gov votes, the
   office's own .gov pages; congress.gov blocks fetches), the confirmed campaign site, then the T3 outlets in
   COLLECTOR.md step 5. Recent (2025 to 2026) first; date anything older in the statement.
3. Votes go in `voting_record` ("Merkley voted yes on S. 123, the ..., per the Senate roll call of
   2025-06-12."). Everything else goes in `positions`. News reporting is attributed to the outlet
   ("OPB reported in 2026 that Smith said ..."), never written as the candidate's own words.

Stop rules: at most 2 items per issue per sweep and 40 per candidate per sweep. Spread across issues rather than
stacking one. An issue with nothing found goes in `gaps` as `"<issue id>: nothing found (<date>)"`.

## Output
`data/oregon-2026/raw/issues/<candidate-id>.json`. On a later week, add to the same file: append the date to
`sweeps`, append new items, and replace this week's gap lines.

```json
{
  "id": "jeff-merkley",
  "name": "Jeff Merkley",
  "race_id": "or-us-senate",
  "sweeps": ["2026-10-18"],
  "positions": [ ITEM ],
  "voting_record": [ ITEM ],
  "gaps": ["water: nothing found (2026-10-18)"],
  "collection_log": [{ "step": "2", "issue": "water", "query_or_url": "...", "result": "used|nothing relevant|already covered|blocked" }]
}
```

ITEM is the same as in `README.md`, with `topic` set to an issue id from `issues.json` (never `custom:`), item
ids `<candidate-id>-i<n>` numbered on from the file's highest, and `swept_at` (YYYY-MM-DD).

Run `python3 data/oregon-2026/pipeline/validate.py raw <file>` and fix every error.

## Verify and import
1. `validate.py strip raw/issues/<id>.json /tmp/<id>.json`, then a separate Sonnet verifier follows `VERIFIER.md`
   on that copy and writes `verified/issues/<id>.json` (same shape, `verification` on every item,
   `verification_summary`). Report: `reports/verification/issues-<race-id>-<date>.md`, including the balance check
   across the race.
2. `validate.py verified verified/issues/*.json`.
3. Merge to `main`. The deploy's `seed:verified` imports new items as drafts. Prash reviews and publishes them in /ops.
