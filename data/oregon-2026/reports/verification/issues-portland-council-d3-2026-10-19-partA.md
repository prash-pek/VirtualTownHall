# Issue sweep verification: Portland City Council District 3, Part A (portland-council-d3), 2026-10-19

Protocol: `pipeline/VERIFIER.md` and `pipeline/ISSUE_SWEEP.md` (verify and import). Part A covers 10 of the race's
candidates; another verifier covers the rest. Each URL was fetched once and all its items checked in that call (the three
Sollitt PDFs redirect to squarespace static hosting and were read with pdftotext).
**The per-candidate independent spot-search was skipped to save budget** (one search was run to check Martin Ward's identity).
New items import as drafts for review in /ops.

| Candidate | New items | Tiers (as collected) | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Larry Kelly | 0 | none | 0 | 0 | 0 | 23 |
| Tom Sollitt | 13 | 13 T2 | 10 | 3 | 0 | 14 |
| John Sweeney | 15 | 15 T3 | 14 | 1 | 0 | 12 |
| Tiffany Koyama Lane | 11 | 11 T1 | 9 | 2 | 0 | 15 |
| Ali Beaudoin | 4 | 4 T3 | 4 | 0 | 0 | 22 |
| Heart Free Pham | 7 | 7 T3 | 7 | 0 | 0 | 19 |
| Terry Parker | 9 | 9 T3 | 5 | 4 | 0 | 18 |
| Martin Ward | 4 | 4 T3 | 3 | 1 | 0 | 18 |
| Darren McCormick | 0 | none | 0 | 0 | 0 | 26 |
| Angelita Morillo | 13 | 12 T2, 1 T3 | 12 | 1 | 0 | 11 |

## Balance
- Same issue list and stop rules for all. Counts follow what exists: Koyama Lane and Morillo are sitting councilors with
  an office wins page and a detailed platform; Sollitt posted three long questionnaire responses; Sweeney, Pham, Parker and
  Ward rest mostly on 2022 or 2024 OPB/KATU/KOIN questionnaires; Kelly and McCormick produced nothing (gaps copied through).
- Uneven accepted counts: Sweeney 15, Sollitt 13, Morillo 13, Koyama Lane 11, Parker 9, Pham 7, Beaudoin 4, Ward 4, Kelly 0,
  McCormick 0. Kelly (23 gaps, 5 "nothing found", rest "not searched (low coverage)") and McCormick (26 gaps) are consistent with the early-stop
  rule for low-coverage candidates; I did not re-run searches (spot-search skipped), so missed material is not ruled out.
- Race-wide balance belongs with the Part B report (11 further candidates in this 21-candidate race).
- Many Sweeney, Pham, Parker and Ward items are 2022 or 2024 and say so in the statement. Only Sollitt, Morillo, Koyama Lane,
  Beaudoin and one Sweeney item are 2026 sources.

## Corrections
- tom-sollitt-i4: statement said "decision"; page says "discussion" about increasing or reducing camp-removal funding. Reworded.
- tom-sollitt-i10: excerpt extended to the next sentence, which holds the housing supply and transportation cost clause the statement uses.
- tom-sollitt-i12: page says bureaus could use flexible dollars for prevention and "that could include" lighting, barriers, etc.; statement and excerpt fixed.
- john-sweeney-i2: the Mercury narrates this itself (not a Sweeney quote) and ties it to a 2001 Multnomah ESD record. Statement now attributes it to the outlet and gives the timing.
- tiffany-koyama-lane-i5: excerpt extended to "data center non-disclosure agreements (NDAs)".
- tiffany-koyama-lane-i11: excerpt cut off before "civilian responders for property and vehicle crimes reports"; extended; statement names the co-sponsors count and fuller list.
- terry-parker-i4: published_at set to 2024-10-16 (KATU page date).
- terry-parker-i5: restored "compassionate" in the quoted phrase.
- terry-parker-i8: the old excerpt was a fragment that did not show any permitting proposal; replaced with the page's "first step is to further streamline the permitting and inspection processes".
- terry-parker-i9: excerpt extended; the page says purchasing power erodes due to inflation while incomes are reduced by new and increased taxes.
- martin-ward-i3: the sentence continues "but they're not always debilitated by them"; excerpt and statement extended.
- angelita-morillo-i13: the "not addressing root causes" claim is a separate sentence outside the excerpt; statement trimmed to the excerpt.

## Rejections
None. Judgment calls to review:
- **Sollitt and Portland Civic Lab.** Three of his sources are PDFs on tomforpdx.com titled "Portland Civic Lab voters' guide: review and
  clarifications for Tom Sollitt". Civic Lab is an AI-summary site and not T3, but the cited content is Sollitt's own written
  responses on his own (T1-confirmed) campaign domain, so the items were kept as T2 and the statements say "questionnaire
  response on his campaign site". If /ops prefers to treat anything bearing the Civic Lab name as unusable, items i1, i2, i4-i9, i13 are the ones affected
  (i3 and i10 are from his LWV VOTE411 PDF, i11 and i12 from his Oregonian PDF).
- No item rests on student papers, OpGov.News, iVoterGuide, DSA, 350PDX, bluevoterguide, Sway or quiverquant.

## Identity and domain checks (for review in /ops)
- **Sollitt domain.** tomforpdx.com is not listed on the Portland Mercury page, but the candidate file's `website_verified_via` is a City Auditor T1 form, accepted.
- **Morillo domain.** angelitaforportland.com is not on the Mercury page; candidate file `website_verified_via` is the Multnomah County voters' pamphlet (T1), accepted.
  The platform page's section headings appear offset from their bullets; items are worded by bullet text and the first-term/second-term labels, not the topic headings. Topic labels for i7-i9, i12 may not match the page's headings.
- **John Sweeney.** OPB 2024 D3 profile lists a retired mechanical designer and Portland Parks supervisor; the 2022 OPB governor profile lists "Director, Multnomah ESD, Portland Parks Supervisor". The Mercury 2026 guide also cites the ESD board. Identity judged the same person; the 2022 items (i8-i15) are an older campaign and are dated in the statements.
- **Martin Ward.** 2024 OPB mayoral profile and 2026 city register D3 filing share the name; nothing in the sources states they are the same person beyond the name and the Wikipedia/OPB trail. Moderate confidence. A city ballot statement was reported to place him under D3 and D4 in different spots; confirm his district.
- **Heart Free Pham, Terry Parker, Martin Ward:** items are from 2024 questionnaires (all say so in the statements); candidacy in 2026 D3 not independently re-checked here.
- Koyama Lane wins page is undated (footer copyright 2018-2026); statements say "lists" and do not imply a date.
- Sweeney i7 (DEI) excerpt comes from his answer on increasing housing supply; the statement omits that context but not its meaning.

## Retry next week
- Kelly and McCormick: no content; try voters' pamphlet statements, KGW/KATU/KOIN/OPB questionnaires and campaign sites.
- Beaudoin and Ward: only 4 items each; look for campaign-site or pamphlet coverage of housing, transportation, and taxes.
- Pham, Parker: 2026 sources (OPB 2026 guide, Mercury, pamphlet) to supplement 2024 answers.

## Token use
Verifier (part A, Sonnet): about 124,000 tokens and 41 tool calls. Collectors for all 21 D3 candidates: about 1.8M tokens total (see round 3 ledger).
