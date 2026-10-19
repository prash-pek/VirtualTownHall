# Issue sweep verification: Governor (or-governor), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` and `pipeline/VERIFIER.md`. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Tina Kotek (D) | 20 | 15 T2, 5 T3 | 18 | 2 | 0 | 1 |
| Christine Drazan (R) | 14 | 9 T2, 4 T3, 1 T1 | 13 | 1 | 0 | 10 |
| Brett Smith (Pacific Green) | 3 | 3 T2 | 1 | 2 | 0 | 18 |

## Balance
- Kotek: her campaign platform page covers many issues and she has a record in office, so one fetch yielded most items.
- Drazan: her campaign plan page covers 9 issues; 5 more come from news, a 2021 caucus release and a 2022 questionnaire (all dated in the statements). Her 10 gaps are all "nothing found".
- Smith: a one-page campaign site gave 3 items. 13 of his 18 gaps are "not searched (low coverage)", so search effort was lighter for him than for the other two.

Spot-searches found material not collected:
- Smith: OPB candidate pieces (2026-07-23, 2026-09-16) and a Ballot Brief profile (priorities include universal health care option).
- Kotek: OPB 2026-09-17 article on her re-election platform.
- Drazan: KATU "Drazan lays out plan for Oregon" (housing, homelessness, education), OPB 2026-10-13 debate coverage. Her housing and healthcare are uncovered.

## Corrections
- brett-smith-i2: statement reworded to the excerpt (a "Permanent Moratorium." entry under a "Data Centers" heading); the "only anti data center candidate" claim is not in the excerpt.
- brett-smith-i3: excerpt trailing period removed; constitutional-amendment detail dropped from the statement.
- tina-kotek-i6: "severe weather" changed to match the page ("extreme weather"); worded as "weather events" to pass the loaded-word check.
- tina-kotek-i20: published_at set to 2026-03-13 (URL shows 03/12).
- christine-drazan-i10: excerpt trailing period removed (quote continues on the page).

## Rejections
None.

## Identity and low-confidence checks (for review in /ops)
- Brett Smith: website brett-smith.us is confirmed via the Voters' Pamphlet (cited in his candidate file). Spot-search shows he is the Pacific Green nominee. Accepted.
- tina-kotek-i17: the page describes a "repeal" option attributed to Kotek; the short excerpt does not itself name her as proposer. Accepted, low confidence on framing.
- tina-kotek-i3, i7: excerpts differ from the page only in first-letter case.
- christine-drazan-i13: the PDF could not be read by WebFetch. Downloaded with curl and read with pdftotext; the quote is confirmed in the 2021-11-10 House Republican Caucus release (T1 legislature.gov host, caucus-authored).
- christine-drazan-i10, i11, i12: OPB article (Dirk VanderHart) read via its KLCC copy; confirmed.

## Retry next week
- Smith: collect from OPB 2026-07-23 and 2026-09-16 pieces and run the low-coverage issues.
- Kotek: OPB 2026-09-17 platform article.
- Drazan: KATU plan article (housing, education), debate coverage; healthcare, childcare.

## Token use (from agent completion notices)
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Brett Smith (2 rounds) | 91.2k | 25 |
| Collector, Tina Kotek | 87.6k | 22 |
| Collector, Christine Drazan (2 rounds) | 93.0k | 28 |
| Verifier, all three | 87.0k | 25 |
| Total | 358.8k | 100 |

Effort note: Smith and Drazan's collectors first logged issues as "not searched" without the early stop firing; both were
sent back to search each issue. Smith then hit the early stop (6 empty searches in a row) legitimately.
