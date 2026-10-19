# Issue sweep verification: Oregon Senate 26 (or-senate-26), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget; each item checked against its source in one fetch per URL (the four Legislature PDFs were downloaded and read with pdftotext, as WebFetch cannot read them).
New items import as drafts; they show in /ops for review before anything is published. Only Helfrich and Bassett were verified in this batch; other SD 26 candidates, if any, are handled by another verifier.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Jeff Helfrich | 11 | 4 T1, 2 T2, 5 T3 | 4 | 7 | 0 | 10 |
| Nicole Bassett | 6 | 6 T2 | 6 | 0 | 0 | 15 |

Helfrich tier count: T1 = i3, i4, i7, i10 (4); T2 = i1, i2 (2); T3 = i5, i6, i8, i9, i11 (5).

### Balance
Helfrich's items come from his legislative record (press releases, a testimony letter) plus outlet items; Bassett has only her campaign site, with 9 of her 15 gaps marked "not searched (low coverage)". The spread is partly material and partly search depth: Bassett got less search depth, and no T1 or T3 items. A later sweep should search news and Legislature-adjacent sources for her. Voters' Pamphlet items for both are already in their earlier verified candidate files.

### Corrections
- jeff-helfrich-i2: page text is first person ("I am pro-life and pro-Second Amendment"). Statement reworded to "says he is pro-life and pro-Second Amendment" style attribution.
- jeff-helfrich-i5, i6: the Columbia Gorge News page (2025-01-20, updated 2025-01-22) is credited to "Office of Rep. Jeff Helfrich", not a reporter. The words are his office statement. Statements now say a statement from his office, published by the outlet. Tier left T3, but this is candidate-office text; reviewer may prefer T2.
- jeff-helfrich-i8: page is a "Rep. Jeffrey Helfrich (R-Hood River) media release" dated 2026-09-09, no reporter byline. Statement now says the outlet published a media release from his office, and calls it a five-part package (the page's wording).
- jeff-helfrich-i9 (Gorge Radio): page carries no date. The text refers to a 35-day short session and "last year's gas tax increase"; no year is stated, so none was added. The line is the reporter's indirect speech ("his goal is to make sure maintenance and preservation of roads come first in whatever the Oregon Department of Transportation receives"). Statement now says it is an undated report and attributes the paraphrase to the outlet. Kept, not rejected, because the statement now flags the missing date; the reviewer may reject it as undated.
- jeff-helfrich-i10: the letter is addressed to "Co-Chairs, Vice Co-Chairs and Committee Members" and does not name budget committees. Reworded. Dated February 14, 2024.
- jeff-helfrich-i11 (JPR): the article is an Oregon Capital Chronicle report (Julia Shumway) republished by JPR, 2024-05-17. Statement now credits that. The excerpt, including the inner quotes around 'complete faith', was rechecked verbatim; the sentence continues "in the vote-by-mail system". The page's condition ("Unless I hear a specific plan to prevent similar delays") is now reflected. Shortened to fit the 40-word limit; "blindly" is dropped from the statement but remains in the excerpt.

### Rejections
None.

### Specific checks
- Legislature PDFs (i3, i4, i7, i10): all four excerpts present verbatim in the pdftotext output. Dates match: Feb 3, 2023; Feb 19, 2024; Sep 4, 2024; Feb 14, 2024. i4 is issued by the House Republican Leader and names HB 4036 in the same quote. i7 is a joint release with Reps. Diehl and Reschke; the quote is Helfrich's. i3 and i4 and i7 are T1 official legislative publications.
- Gorge Radio, Columbia Gorge News and JPR items: checked as above. Outlet paraphrase is now attributed to the outlet (i9) and press-release text to his office (i5, i6, i8).
- Bassett: all six excerpts present verbatim on bassettfororegon.com. The page names her as the State Senate District 26 candidate. Domain is the `website_url` in her candidate file, `website_verified_via` the 2026 Voters' Pamphlet PDF; I did not re-open the pamphlet this run. i1 sits in a list under "Keeping Rural Communities Livable" (alongside rural hospitals, affordable housing); statement says only that the site lists it.

### Identity checks
- Helfrich: HelfrichforOregon.com is the `website_url` in his candidate file, confirmed via the pamphlet. The priorities page does not name the office; identity rests on the domain and the file. Legislature items name Rep. Jeff Helfrich (R-Hood River), HD 52. Incumbent flag in his candidate file is null; not changed.
- Bassett: match as above.

## Retry next week
- Bassett: search for news coverage, a legislative or local record, and issues marked "not searched (low coverage)".
- Helfrich: confirm the Gorge Radio piece's date; look for 2026 campaign-period positions and the 10 gapped issues.
- Both: Legislature or ballot-measure positions if available.

## Token use
Verifier (Sonnet): about 85,000 tokens and 20 tool calls (estimate). Collectors: about 90,000 tokens each on average (see round 3 ledger).
