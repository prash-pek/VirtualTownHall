# Verification: Forest Grove, Gaston, Sherwood (v2), 2026-10-15

Pamphlet: Washington County Nov 3 2026 voters' pamphlet. The fetch tool returns only 119,746 characters of page text (Forest Grove WC-11 to WC-13 and Gaston WC-14 are included; the text ends in Portland District 4). Retries at offsets 90000, 100000, 120000 and 180000, with and without `?inline`, returned nothing past that point, so the Sherwood section (WC-34) cannot be read. The county's certified-candidate PDFs (Forest Grove, Gaston, Sherwood) and the Sherwood candidate filings have no machine-readable text, so printed ballot names could not be checked there.

Result: 61 items checked: 52 verified, 8 corrected, 1 rejected. Per-race counts below are verified/corrected/rejected.

## Forest Grove mayor
- Wenzl 8/0/0. Unopposed. Incumbent true (Elections page; Meet the Council). Balanced, nothing to compare.

## Forest Grove council (7 candidates, 3 seats)
- Martinez 8/1/0 (p3 reworded: the pamphlet says "the camps" under a homelessness heading).
- Valenzuela 7/0/0, Knight 7/0/0, Pereyda 5/0/0.
- Hiefield 5/3/0 (p2, p3, p4 excerpts were cut mid-word; extended to the sentence end, p3 statement adds the affordability clause).
- Mejia 0/0/0 and LePari 0/0/0: confirmed non-filers (absent from WC-11 to WC-13).
- Incumbency: Martinez and Valenzuela true (Elections page, Meet the Council, News-Times). Others false; Marshall is not running.
- Websites: only Hiefield's, confirmed by the pamphlet-printed address.
- Balance: pamphlet filers have 5 to 8 items; the two non-filers have none. The non-filer gap is real, but the "no press coverage" gaps were wrong. Missed material (see below).

## Gaston mayor
- Martin 6/0/0 (only Gaston filer in the pamphlet; his statement confirms he is the sitting mayor seeking re-election). Glavan 0/0/0 (non-filer; no site or press in spot search).
- Pamphlet name is "William Martin" ("Wiliam" in its furnished-by line); the Blue Book says "Bill Martin"; added name_variants. The inventory's "William E Martin" is unverifiable (certified PDF unreadable).

## Gaston council pos 4 / 5 / 6
- Hoodenpyl, Benson, Howard each 0/0/0: unopposed, not in the pamphlet, no site or press found. Incumbency kept null (the Blue Book has no council roster; none reachable). Source-access/non-filer gap, applied equally.

## Sherwood mayor and council
- Rosener 2/1/0, Giles 2/1/0, Mays 2/1/1, Scott 0/1/0.
- Corrections: all four roster items (b1) had excerpts rebuilt from cells in a different order; replaced with the contiguous verbatim spans ("Mayor Tim Rosener Term: 2 years, expires January 2027", etc.).
- Rejected: keith-mays-b4 (Pamplin Media article on EWS North America is undated and unbylined in the retrievable text and is from about 2022; fails T3 and recency). Mays's occupation reset to null, since the city page only says local trade-sector business owner.
- Incumbent true for all four (roster with terms expiring January 2027).
- Balance: no pamphlet item for any of the four (access gap, equal). Scott has the thinnest profile because his city page has no bio, not because of effort.

## Missed material (collector effort)
- Hiefield campaign site (T2, domain confirmed via pamphlet): /issues has positions on sustainability, economic development, housing and community health; /meet_mallory has a bio. The collector's gap "fetched text had no issue positions" only looked at the home page.
- Forest Grove News-Times (bylined Nick LaMora): candidate roster 2026-09-03 and council Q&A 2026-09-25 (https://forestgrovenewstimes.com/2026/09/25/qa-candidates-for-forest-grove-city-council-on-local-business-police-bond/). Six of seven council candidates, including non-filers Mejia and LePari, answered. News in the Grove also has questionnaires (Pereyda, Valenzuela, Knight). This is the only position material available for Mejia and LePari. Their gaps ("no press coverage", "no public information on positions") were wrong and were corrected in the files; no items were added.
- Sherwood city page bios state Rosener's software-engineer/small-business background and Giles's healthcare product-management career (not collected). Gap text for Rosener corrected.
- No other T1/T2/T3 material found for Gaston or Sherwood candidates in spot searches (goodparty.org results are excluded aggregators).

## Inventory discrepancies
- None on candidate membership: all 17 inventory candidates have files and the News-Times roster (7 council candidates, unopposed mayor) matches. The name "William E Martin" and the Gaston and Sherwood ballot spellings could not be confirmed from the unreadable certified PDFs.
- Forest Grove Elections page is stale ("filing period has not yet opened") but its incumbent list agrees with Meet the Council.
