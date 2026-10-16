# Verification report: Portland-metro local measures (batch 'measures-metro')

Verifier: Sonnet, 2026-10-16. Primary sources: county voters' pamphlet extracts (Multnomah, Washington, Clackamas). Excerpts were machine-checked against column-aware page text, then sponsor, side and pamphlet order were checked by reading the pages. T3 KATU quotes were confirmed by fetching the articles. No .gov host was reachable, so items sourced only to .gov pages (city resolutions, staff reports, legislative testimony) could not be verified and were dropped or replaced with pamphlet text.

All 16 files pass 'validate.py verified'.

Totals: counts below are items kept as verified / corrected / rejected (arguments plus endorsements).

| Measure | verified | corrected | rejected |
|---|---|---|---|
| banks-34-352 | 0 | 0 | 0 |
| burlington-water-district-26-269 | 0 | 1 | 0 |
| canby-3-642 | 0 | 1 | 1 |
| canby-3-643 | 0 | 1 | 2 |
| estacada-3-638 | 2 | 0 | 0 |
| forest-grove-34-353 | 0 | 0 | 1 |
| gladstone-sd-3-644 | 18 | 1 | 0 |
| hillsboro-sd-1j-34-355 | 18 | 0 | 0 |
| king-city-34-354 | 2 | 0 | 1 |
| monitor-rfpd-3-640 | 2 | 0 | 0 |
| north-clackamas-sd-3-639 | 7 | 0 | 0 |
| portland-26-267 | 19 | 1 | 1 |
| reynolds-sd-7-26-268 | 13 | 0 | 0 |
| troutdale-26-265 | 2 | 2 | 0 |
| troutdale-26-266 | 6 | 6 | 0 |
| wilsonville-3-641 | 36 | 0 | 0 |

## banks-34-352
- Pass 0, fixed 0, dropped 0.
- Balance: 0 YES / 0 NO; the pamphlet (WC-55) states no arguments in favor or opposition were filed. Both gaps documented.

## burlington-water-district-26-269
- Pass 0, fixed 1, dropped 0.
- Fixed: y1 source URL changed to the pamphlet (M-103).
- Balance: 0 YES arguments / 0 NO arguments filed (M-103). The only item is the district's official explanatory statement, placed on the yes side; the no side has none. One-sided by default of filings.

## canby-3-642
- Pass 0, fixed 1, dropped 1.
- Fixed: yes item replaced by pamphlet explanatory-statement explainer.
- Dropped: canby-3-642-y1: council resolution on city website, not in the pamphlet and not fetchable (.gov); not a filed argument
- Balance: 0 YES / 0 NO filed arguments (pamphlet: no arguments in favor/opposition filed). One neutral explainer on the yes side only; no counterpart on the no side.

## canby-3-643
- Pass 0, fixed 1, dropped 2.
- Fixed: fiscal_impact rewritten from pamphlet text.
- Dropped: canby-3-643-y1: city staff report is on a .gov host, cannot be verified; staff report is not a filed argument
- Dropped: canby-3-643-y2: city information page, .gov, unverifiable; advocacy-style copy rather than neutral official text
- Balance: 0 YES / 0 NO filed arguments. One neutral explainer on the yes side; none on no.

## estacada-3-638
- Pass 2, fixed 0, dropped 0.
- Balance: 1 YES / 0 NO. Pamphlet states no arguments in opposition were filed.

## forest-grove-34-353
- Pass 0, fixed 0, dropped 1.
- Dropped: forest-grove-34-353-y1: legislative testimony by the police chief (.gov host), not a filed pamphlet argument and unverifiable
- Balance: 0 YES / 0 NO; both gaps documented (pamphlet WC-56).

## gladstone-sd-3-644
- Pass 18, fixed 1, dropped 0.
- Fixed: title corrected: "Increase Accountability" -> "Increase Accessibility" (matches ballot caption).
- Balance: 6 of 11 filed YES arguments itemized (cap 6); 4 of 4 NO arguments itemized. Pamphlet carries 11 yes vs 4 no; the cap leaves 5 yes arguments unlisted. Endorsements: 5 yes sponsors, 4 no sponsors.

## hillsboro-sd-1j-34-355
- Pass 18, fixed 0, dropped 0.
- Balance: 6 of 10 filed YES arguments itemized (cap 6), 2 of 2 NO arguments (both by one sponsor). Multnomah pamphlet prints none; Washington pamphlet WC-60 to WC-65. Yes side has 10 filed vs 2 no.

## king-city-34-354
- Pass 2, fixed 0, dropped 1.
- Dropped: king-city-34-354-n1: a council candidate's pamphlet candidate statement (WC-19), not a filed argument on the measure
- Balance: 0 YES / 1 NO. No argument in favor was filed (WC-57).

## monitor-rfpd-3-640
- Pass 2, fixed 0, dropped 0.
- Balance: 1 YES / 0 NO. Pamphlet states no arguments in opposition were filed.

## north-clackamas-sd-3-639
- Pass 7, fixed 0, dropped 0.
- Balance: 5 YES / 0 NO. No argument in opposition appears in the pamphlet pages; none filed.

## portland-26-267
- Pass 19, fixed 1, dropped 1.
- Fixed: y1 statement reworded to flag satirical tone; endorsement e1 (Max Steele) dropped.
- Dropped: portland-26-267-e1: sponsor of the sarcastic argument printed under "in favor"; the stance is ambiguous, so listing the person as a yes endorser could misstate their position
- Balance: 6 of 15 YES and 6 of 15 NO arguments itemized (cap 6 each). Yes endorsements: 1 sponsor (Yes on Your 2 Cents PDX furnished all but one yes argument); no endorsements: 7 sponsors. The yes side is concentrated in a single sponsor. y1 (Max Steele) is satirical. No explanatory statement was filed.

## reynolds-sd-7-26-268
- Pass 13, fixed 0, dropped 0.
- Balance: 6 of 6 filed YES arguments itemized; 0 NO (pamphlet M-99: none filed).

## troutdale-26-265
- Pass 2, fixed 2, dropped 0.
- Fixed: Reordered: filed pamphlet argument first; explainer source pointed to pamphlet.
- Balance: 0 YES filed arguments / 1 NO filed argument (M-93). The yes side has only the city explanatory statement and a T3 mayor quote; an imbalance in filed arguments, not in treatment.

## troutdale-26-266
- Pass 6, fixed 6, dropped 0.
- Fixed: NO items reordered: three filed pamphlet arguments first, then explainer, then KATU quotes.
- Balance: 0 YES filed arguments / 3 NO filed arguments (M-95 to M-96). The yes side has only the explainer and two T3 resident quotes; the no side also has the explainer and two T3 quotes from one speaker.

## wilsonville-3-641
- Pass 36, fixed 0, dropped 0.
- Balance: 6 of 19 YES and 6 of 21 NO arguments itemized (cap 6); sponsors of the first 12 filed arguments on each side listed (12 yes, 12 no endorsements), same treatment both sides.

## Cross-cutting notes
- Gladstone title said 'Increase Accountability'; the ballot caption says 'Increase Accessibility' (fixed).
- Canby 3-642/3-643 yes items were city-website documents; replaced by sentences from the official explanatory statement in the county pamphlet. 3-643 fiscal_impact rewritten from pamphlet text.
- Portland 26-267: the first yes argument (Max Steele) is satirical but printed under 'Argument in Favor'; kept on the yes side with a statement that flags the tone, and its sponsor was not listed as an endorser. The yes side is almost entirely one sponsor (Yes on Your 2 Cents PDX).
- Measures with no filed argument on one or both sides: Banks 34-352, Forest Grove 34-353, Canby 3-642, Canby 3-643 (none either side); Burlington 26-269 (none; one explainer); King City 34-354, Troutdale 26-265 and 26-266, Estacada 3-638 (opposition) and Monitor 3-640 (opposition), Reynolds 26-268, North Clackamas 3-639 (no argument in opposition); Troutdale 26-265 and 26-266 and King City have no yes argument.
- Hillsboro 34-355: the Spanish-language yes argument (y2) is a translation of the school board's argument (y1); both were filed separately and both count toward the cap.
