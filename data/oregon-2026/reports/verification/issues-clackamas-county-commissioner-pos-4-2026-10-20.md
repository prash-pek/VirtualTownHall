# Issue sweep verification: Clackamas County Commissioner, Position 4 (clackamas-county-commissioner-pos-4), 2026-10-20

Protocol: `pipeline/ISSUE_SWEEP.md` and `pipeline/VERIFIER.md`. New items import as drafts and show in /ops for review.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Diana Helm (incumbent) | 9 | 4 T2, 5 T3 | 4 | 4 | 1 | 13 |
| R W Smith | 13 | 9 T2, 4 T3 | 5 | 6 | 2 | 10 |

Kept after verification: Helm 8 (4 T2, 4 T3), Smith 11 (7 T2, 4 T3). Items marked low_confidence (kept, shown under "Needs a look"): diana-helm-i7, rw-smith-i1, rw-smith-i9.

## Balance
Both candidates were on the same issue list. Both have the same OPB May 2026 questionnaire (4 questions: cost of living, AMR/CCSO, housing and homelessness, sanctuary), which gave Helm 4 T3 items and Smith 4 T3 items. Smith's campaign site is longer (data centers, homelessness, safety); Helm's is short (about section plus a few headings). The disparity comes from available material, not effort. Helm's gaps are documented (13 issues "nothing found"). Smith has 4 issues marked "not searched (low coverage)" in his gaps, which is a minor effort difference.

Spot-search ("Diana Helm" Clackamas County commissioner data center moratorium 2026; Smith race search): found Helm's OPB 2026-08-05 and KATU moratorium coverage (T3 material not yet collected) and the county general-election page. Nothing missed for Smith beyond The Ballot Brief summary of his site (third party, not needed).

## Corrections
- OPB questionnaire PDFs (diana-helm-i5..i8, rw-smith-i2, i4, i8, i10): the PDFs carry no date on the pages (file metadata 2026-05-04); the collector's published_at 2026-05-05 could not be confirmed, so set to null. Excerpts match the pdftotext output (ligature "ff"/"fi" artifacts ignored).
- rw-smith-i5: excerpt was truncated; page continues "and mental health challenges". Excerpt and statement extended.
- rw-smith-i7: excerpt ended before "over industrial development"; statement without it changed the meaning. Extended.

## Rejections
- diana-helm-i9 (OPB 2026-07-08, "Well, we can and we should."): the quote is verbatim and the context is data centers, but it is superseded. OPB 2026-08-05 reports Helm reversed and now wants a countywide moratorium through the 2027 session, and her voters' pamphlet says she "led the effort for a moratorium on large data centers". Showing the July line as her energy stance would mislead. Suggest collecting the Aug 5 OPB article or the pamphlet statement next sweep.
- rw-smith-i12 (social-services): "ensure families have access to the support they need" is a generic clause from the same sentence as i11, no position stated.
- rw-smith-i13 (elections-democracy): intro line on why he is running ("work openly and responsibly"), not a position on elections or democracy.

## Identity checks
- R W Smith: all items come from friendsofremysmith.org (candidate R.W. Smith, Clackamas County Commissioner, Position 4) or the OPB questionnaire for "Position 4 RW Smith". None concern Tootie Smith (Clackamas County Chair). Official ballot lists "R W Smith".
- Campaign domains: votedianahelm.com and friendsofremysmith.org are both printed in the Official Clackamas County November 3, 2026 Voters' Pamphlet (p. C-17). Confirmed.
- Smith's pamphlet statement matches his site on data centers and his intro line.

## Retry next week
- diana-helm energy/data centers: collect OPB 2026-08-05 and KATU moratorium coverage, or her pamphlet statement.
- The OPB questionnaire PDFs cannot be read by WebFetch as text; verified from the saved PDF with pdftotext. A dated article hosting them (OPB 2026-05-05 "Six candidates challenge appointee...") could supply published_at.

## Token use
Verifier: about 105k tokens, 25 tool calls (estimated, about $0.57).
