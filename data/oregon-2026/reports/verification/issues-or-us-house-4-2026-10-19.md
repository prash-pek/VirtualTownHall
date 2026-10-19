# Issue sweep verification: US House District 4 (or-us-house-4), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` and `pipeline/VERIFIER.md`. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Val Hoyle (D, incumbent) | 14 | 12 T1, 2 T3 | 13 | 1 | 0 | 7 |
| Monique DeSpain (R) | 17 | 15 T2, 2 T3 | 17 | 0 | 0 | 8 |
| Justin Filip (Pacific Green) | 18 | 18 T2 | 18 | 0 | 0 | 7 |

## Balance
All three got the same issue list and stop rules. Differences come from what exists:
- Hoyle's House site has dedicated issue pages and press releases (T1), plus two news items.
- DeSpain's single campaign issues page covers 15 issues; OPB (Sept 2026) supplied 2 more.
- Filip's platform page and homepage cover 18 issues; no T1 or T3 coverage was found for him.
- Candidates are balanced in item count (14/17/18). Filip has no non-campaign sources; DeSpain and Filip rely on T2 self-published material, Hoyle on T1.

Spot-searches run for all three. Nothing obviously missed: results were primary-race coverage (OPB May 2026,
Oregon Capital Chronicle) and campaign-announcement pieces, none about the swept issues' positions.

## Corrections
- val-hoyle-i14 (KOIN, Vote at Home Act): excerpt trimmed to the text on the page (no trailing period; sentence continues
  "by giving eligible voters the option to vote by mail"). Statement reworded because the sentence does not name Hoyle or
  the chamber; the article separately says she introduced the House version in 2025.

## Rejections
None.

## Identity checks (for review in /ops)
- Filip: the page text does not say "Oregon 4th District"; the header image filename and "justin4OR" handle suggest it.
  The Ballot Brief (candidate page) links justin4congress.com as his campaign site and lists him as the 2026 Pacific Green
  nominee for OR-4. Ballotpedia's OR-04 page does not list him, so his 2026 ballot status is worth confirming against the
  Oregon Secretary of State list before publishing. Accepted.
- DeSpain: moniqueforcongress.com footer reads "Paid For By Monique For Congress"; her site reports the May 2026 GOP
  nomination. Accepted.
- Hoyle i11 and DeSpain i8/i9 share one OPB/KLCC article (2026-09-21); quotes attributed correctly (DeSpain i8 is from her campaign ad).

## Retry next week
- None blocked. Hoyle gaps (cost-of-living, public-safety, gun-policy, energy) could be revisited; the search showed 2026 primary coverage mentioning economy.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Val Hoyle | 109.6k | 41 |
| Collector, Monique DeSpain | 95.7k | 22 |
| Collector, Justin Filip | 80.8k | 16 |
| Verifier, all three | 83.6k | 29 |
| Total | 369.7k | 108 |

Orchestrator note: Filip is on our inventory for or-us-house-4, which comes from the official ballot lists (T1).
