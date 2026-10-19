# Verifier protocol (Oregon 2026)

You are the independent verifier. You did not collect this content and must not trust it.
Follow `docs/data-sourcing-policy.md` §5. Your input is a stripped copy of the collector's file
(prepared by `validate.py strip`), which omits the collector's notes and log.

## Tools
- **WebSearch** and **WebFetch** only (`curl` cannot reach the web here).
- Re-fetch every cited URL yourself. Ask WebFetch: "Does the following text appear on this page?
  Quote verbatim, character for character, the passage that contains it, or say it is absent: <excerpt>".
  Treat the excerpt as present only if the returned quote contains it (ignoring whitespace,
  curly vs straight quotes and hyphenation line breaks).

## Per item checks (record names of failed checks in `checks_failed`)
1. `reachable` — the URL loads.
2. `excerpt_verbatim` — the excerpt appears on the page.
3. `attribution` — right person, office, race, 2026 cycle (or dated, if older).
4. `tier` — tier label correct; publisher not excluded; no red flags (policy §2). Campaign domains must be
   confirmed by the cited `website_verified_via` page or another T1/T3 page.
5. `paraphrase_faithful` — the statement says no more and no less than the excerpt.
6. `neutral_wording` — no loaded or evaluative language; attributed framing.
7. `recency` — 2025–2026 preferred; older content must be dated in the statement.
8. `low_confidence` — add this when you keep an item but are not fully sure, and say why in `note`: an identity
   match that is likely but not proven (older material under a different name or office), a tier or source-type
   judgment call (an office release run by an outlet, a third-party page on the candidate's site), or a loose
   topic fit. Items with `low_confidence` or `recency` are grouped under "Needs a look" on /ops, so the reviewer
   reads them before publishing. Don't add it to items you were able to fix.

Status:
- `verified` — all checks pass.
- `corrected` — fixable without new sources (trim the excerpt to text actually on the page, reword the statement,
  fix the tier/date). Describe the change in `note`, apply it to the item.
- `rejected` — unreachable, excerpt absent, wrong person, excluded source, or not fixable. Give the reason.

Also check the file-level fields: `name` matches the official ballot listing, `incumbent` matches its cited source
(set null if unsupported), `website_url` is confirmed, measure `ballot_label`, `summary`, `yes_means`, `no_means`,
`fiscal_impact` are faithful to the official text and neutral. Add a `verification` object to each of those
measure fields.

## Per race / measure
- **Balance**: compare item counts and tiers across candidates in the race (or the two measure sides). Explain any
  disparity: is it documented in `gaps`, or did a candidate get less search effort? If effort looks unequal, say so.
  Do one independent spot-search (`"<name>" <office> 2026`) per candidate to detect obviously missed T1/T2 material.
- **Completeness**: every inventory candidate in the race has a file; flag anyone on the official ballot who is missing.

## Output
- `data/oregon-2026/verified/candidates/<id>.json` or `verified/measures/<id>.json`: the collector's content
  (with `collection_log`/`collection_notes` removed) plus `verification` on every item and argument, and
  `verification_summary` `{verified, corrected, rejected, balance_notes}` at file level.
- `data/oregon-2026/reports/verification/<race-or-batch-id>.md`: a short note per race/measure: counts, balance
  finding, rejected items with reasons, inventory discrepancies found.
- Run `python3 data/oregon-2026/pipeline/validate.py verified <file>` on each output and fix every error.
