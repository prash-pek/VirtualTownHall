# Issue sweep verification: Clackamas County Commissioner, Position 2 (clackamas-county-commissioner-pos-2), 2026-10-20

Protocol: `pipeline/ISSUE_SWEEP.md` and `pipeline/VERIFIER.md`. New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers (kept) | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Mark Shull | 10 | 3 T1, 7 T3 | 8 | 2 | 0 | 12 |
| Paul Savas (incumbent) | 11 kept of 12 | 1 T2, 5 T1, 5 T3 | 10 | 1 | 1 | 11 |

Low-confidence flags (kept, listed under "Needs a look"): mark-shull-i10, paul-savas-i4.

## Balance
Same issue list and early-stop rule for both. Savas has a campaign site, a county commissioner page and recent news; Shull has no campaign site on file, so his items come from the OPB questionnaire and the county voters' pamphlet. Savas has 2-3 more items largely because of those extra sources, not less effort on Shull.
Spot-searches (`"Mark Shull" Clackamas County commissioner 2026`, `"Paul Savas" Clackamas County commissioner 2026`) turned up the county's Nov 3 ballot listing, the OPB/KOIN primary coverage and the pamphlet, which were already used. No obviously missed T1/T2 material.
Missed material to consider next week: Savas's pamphlet column has items not collected (data center moratorium "to protect farmland, water, and neighborhoods", 968 affordable housing units, recovery campus). Shull's pamphlet column lists senior property tax relief, no tolls on I-205 and land-use reform; only the veteran and business lines were collected.

## PDF checks (OPB questionnaires and county PDFs)
WebFetch returned only compressed binary for all three PDFs (OPB Shull, OPB Savas, the Nov 3 2026 pamphlet) and the 2024 candidate sheet. The saved PDFs were read with pdftotext instead. Each excerpt was found verbatim (ligature glyphs for "ffi/fi/ff" repaired; curly versus straight quotes ignored). The pamphlet lists Position 2 as Shull (left) and Savas (right), and the sheet is headed "Commissioner, Position 4, Mark Shull".

## Data center moratorium attribution
In the pamphlet, "Passed a moratorium on data centers to protect farmland, water, and neighborhoods" is in Savas's column. Shull's column and his OPB answers do not mention data centers. No Shull item attributes it to him. Savas's own item on the topic (paul-savas-i9) is an OPB report of Aug 5 2026.

## Corrections
- mark-shull-i8: statement said he is "an advocate for veterans", which is in the next sentence, not the excerpt. Reworded to the excerpt (decorated combat veteran, former small-business owner who met payroll and created local jobs).
- mark-shull-i9: statement called him a "former small-business owner", which is not in the excerpt. Reworded to the excerpt (advocate for taxpayers, veterans, working families and local businesses).
- paul-savas-i8: the page bullet ends "...protects investments in infrastructure and limits debt"; the collector's excerpt stopped mid-bullet. Excerpt and statement extended.

## Rejections
- paul-savas-i10 (KOIN, June 18 2015, Portland Tribune): the quote exists, but it is 11 years old, answers a question about a possible state building moratorium over wastewater capacity, and states no position on water. Rejected for recency and relevance.

## Identity and confidence checks (for review in /ops)
- mark-shull-i10: the 2024 sheet is for Position 4 (he was the sitting commissioner); the bio (Lt Col, Bronze Star, Shull Design and Development, commissioner since Jan 2021) matches the 2026 pamphlet, so identity is sound. Flagged low_confidence because the sheet has no publication date on its face (PDF metadata says Sept 2024), it is two years old and from a different race, and a candidate-furnished sheet hosted by the county is a T1 judgment call. The statement is dated to 2024.
- paul-savas-i4: self-reported vote on the vehicle registration fee in an OPB questionnaire; undated ("a few years ago"), not backed by a board record. Statement is attributed ("says he voted"). Kept in voting_record; flagged low_confidence.
- paul-savas-i1: campaign domain confirmed by the Nov 2026 county pamphlet (printed in his statement) and a Feb 2026 re-election launch post.
- paul-savas-i6: Sept 2023 county release, dated in the statement; kept, older than the preferred window.
- paul-savas-i7, i8: county commissioner page is undated; statements say "lists", not a date.
- Some third-party pages mislabel Shull's 2026 run as Position 4; the county ballot listing places both candidates in Position 2.

## Retry next week
- Collect the uncollected pamphlet items above (T1) for both candidates.
- Savas: a dated board record or news item on the vehicle registration fee vote, to replace the self-report.
- Both: water, environment and energy for Shull found nothing; infrastructure, technology, labor, social-services, civil-rights and elections-democracy were not searched for Shull (low coverage).

## Token use (from agent completion notices)
Verifier: about 100k tokens, 25 tool calls (estimated, about $0.55).
