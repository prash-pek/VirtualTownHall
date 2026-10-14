# Verification report: Multnomah County candidates (Nov 3, 2026)

Verifier run 2026-10-14. Races: `multnomah-county-chair`, `multnomah-county-commissioner-d2`, `multnomah-county-auditor`, `multnomah-county-sheriff`, `or-circuit-court-4-pos-2`, `-pos-14`, `-pos-6`. 17 candidate files. All outputs pass `validate.py verified`.

**Totals: 158 items. 151 verified, 7 corrected, 0 rejected.**

**Tier rule used for official office pages (mcso.us, multco.us/board and similar):** biographical facts are T1 (government publication), and the official's own stated priorities or quotes are T2 (policy §1 lists incumbents' official office pages as T2). The collector followed the same rule, and it is applied the same way across all files.

**Completeness:** every candidate on the ballot content (RCV) and ballot directive PDFs has a file, and no file is for someone who isn't on the ballot. Official names match.

## multnomah-county-chair
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| shannon-singleton | 11 | 2 | 0 |
| julia-brim-edwards | 12 | 0 | 0 |
| sharon-meieran | 12 | 1 | 0 |

- **Corrections:**
  - Singleton p1: the statement included content from item p2, so it was reworded to match its own excerpt.
  - Singleton p6: removed "drug", which the excerpt says only as "possession".
  - Meieran p1: extended the excerpt to the full sentence, which includes "spends money without specific goals".
- **T2 domains:**
  - shannonsingleton.org and JuliaBrim-Edwards.com are printed in the pamphlet.
  - Meieran's pamphlet prints fixmultco.com, which blocks fetching, and her filing lists SharonforChair.com.
  - Her T2 items cite fix-multco.com, a different domain. It is confirmed by an OPB (T3, 2026-06-09) link to "her plan", and the site credits her, so T2 is kept.
- **Balance:** comparable. Each candidate has T1 pamphlet items, T2 campaign-site items and two or three T3 items.
- **Missed material:** Portland Mercury, 2026-03-10, "Inside the race for county chair". It covers Singleton and Brim-Edwards and predates Meieran's entry.

## multnomah-county-commissioner-d2
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| bruce-broussard | 6 | 0 | 0 |
| herman-greene | 7 | 0 | 0 |
| bri-williams | 5 | 0 | 0 |
| serena-cruz | 9 | 0 | 0 |
| nathan-ong-norris | 0 | 4 | 0 |
| nabil-zaghloul | 4 | 0 | 0 |
| tony-robertson | 8 | 0 | 0 |

- **Corrections:** in all four Ong Norris items, the surname was changed from "Norris" to "Ong Norris". The ballot lists "Nathan Ong Norris" and the Mercury refers to him as "Ong Norris". p2 was also reworded with the article's context ("preserve, improve, and expand").
- **Balance (a source-access disparity, not a candidate disparity):**
  - The pamphlet PDFs (full and large-print) can only be read up to the start of Greene's statement.
  - The individual statement PDFs for Broussard, Greene, Williams, Ong Norris and Zaghloul are scans with no machine-readable text.
  - Cruz and Robertson have readable individual statements, so they have T1 positions.
  - Williams, Ong Norris and Zaghloul have only T3 items (Portland Mercury, 2026-09-26).
  - The verifier hit the same truncation. The disparity is recorded in each file's `gaps`, and search effort looks equal.
- **Gap text fixed (Broussard):** the gap said the Mercury "reports no specific policy positions". The article doesn't say that; it covers only his background. The gap has been reworded.
- **Missed material:** none found by the spot-searches. Zaghloul's campaign website, which the Mercury mentions, is still unconfirmed in any T1 or T3 source.

## multnomah-county-auditor (unopposed)
- nicole-pexton: 9 verified, 0 corrected, 0 rejected.
- All items are T1 (candidate filing and pamphlet statement). pextonforauditor.com is confirmed by the filing.
- No 2026 T3 coverage exists. `incumbent: false` is supported: the county page names Jennifer McGuirk as the current Auditor.

## multnomah-county-sheriff (unopposed)
- nicole-morrisey-odonnell: 8 verified, 0 corrected, 0 rejected.
- Sources are the mcso.us profile (last modified 2025-12-23) and an MCSO release dated 2026-03-19.
- The 2026 pamphlet statement can't be read. The candidate filings on multco.us are only DPSST eligibility letters.

## or-circuit-court-4-pos-2
- diane-sykes: 2 verified, 0 corrected, 0 rejected.
- laura-maurer-rowan: 2 verified, 0 corrected, 0 rejected.
- **Incumbency:** the ballot directive (T1) lists no incumbent, and WW reports Judge Nan Waller is leaving the seat. `incumbent` is changed from null to false, with the ballot directive as `incumbent_source_url`.
- **Endorsement and polling content:** all items are descriptive bio facts. WW's evaluative wording ("law-and-order side of the ledger") is not used, and neither is the polling in the 2026-05-19 article.
- **Same-name check (Sykes):** both sources are about the Multnomah race. No content about the federal 7th Circuit judge was used.
- **Balance:** equal.
- **Missed material:** oregonvotes.gov military-guide candidate pages appear in search results but now redirect to the SOS elections home page, so they can't be reached.

## or-circuit-court-4-pos-14
- elizabeth-savage: 2 verified, 0 corrected, 0 rejected.
- joseph-hagedorn: 2 verified, 0 corrected, 0 rejected.
- **Incumbency:** the ballot directive lists no incumbent, and WW reports Judge Amy Holmes Hehn is leaving. `incumbent` is set to false for both.
- **Endorsement content:** descriptive facts only. WW's "of good repute" and its opinion on Hagedorn's fit for the bench are omitted.
- **Balance:** equal.

## or-circuit-court-4-pos-6 (unopposed)
- sonia-montalbano: 2 verified, 0 corrected, 0 rejected.
- **Position 6 confirmed:** the ballot directive lists "Sonia A Montalbano Incumbent" for Position 6.
- The Governor's release (2026-08-03) gives the vacancy as Judge Leslie Bottomly's seat but no position number. `incumbent_source_url` now points to the ballot directive.
- A KBOO segment exists. KBOO is community radio and isn't on the T3 list, so it was not added.

## Inventory discrepancies
None. Race membership, names and the unopposed flags match the official ballot content and ballot directive. The inventory note "current D2 commissioner is Shannon Singleton" matches multco.us/board.
