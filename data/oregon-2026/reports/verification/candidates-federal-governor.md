# Verification: federal races and Governor (Oregon, Nov 3 2026)

Verifier run 2026-10-14. Inputs: stripped collector files for 21 candidates. Every cited URL was re-fetched with WebFetch, and each candidate got one spot-search. All 21 outputs pass `validate.py verified`.

**Totals: 197 verified, 6 corrected, 0 rejected.** Every item is T1 (Voters' Pamphlet Books 4, 8, 13 and 17, plus house.gov, senate.gov, clerk.house.gov, oregonlegislature.gov, the Blue Book and deschutescounty.gov).

## Per race

| Race | Candidate | verified / corrected / rejected |
|---|---|---|
| or-us-senate | Jeff Merkley (D) | 12 / 0 / 0 |
| | David Brock Smith (R) | 8 / 0 / 0 |
| | Chris Henry (Prog) | 10 / 0 / 0 |
| | Gary Lyndon Dye (L) | 0 / 0 / 0 (empty) |
| or-us-house-1 | Suzanne Bonamici (D) | 11 / 1 / 0 |
| | Barbara J Kahl (R) | 8 / 0 / 0 |
| or-us-house-2 | Cliff Bentz (R) | 12 / 0 / 0 |
| | Chris Beck (D) | 9 / 0 / 0 |
| or-us-house-3 | Maxine E Dexter (D) | 10 / 2 / 0 |
| | Loran Ayles (R) | 0 / 0 / 0 (empty) |
| or-us-house-4 | Val Hoyle (D) | 11 / 1 / 0 |
| | Monique DeSpain (R) | 8 / 0 / 0 |
| | Justin Filip (PG) | 8 / 0 / 0 |
| or-us-house-5 | Janelle S Bynum (D) | 12 / 0 / 0 |
| | Patti Adair (R) | 10 / 0 / 0 |
| | Andrea Townsend (PG) | 0 / 0 / 0 (empty) |
| or-us-house-6 | Andrea Salinas (D) | 11 / 1 / 0 |
| | David Russ (R) | 8 / 1 / 0 |
| or-governor | Tina Kotek (D) | 10 / 0 / 0 |
| | Christine Drazan (R) | 10 / 0 / 0 |
| | Brett Smith (PG) | 9 / 0 / 0 |

### Corrections
- **bonamici-b4, hoyle-b5, salinas-b4, dexter-b5:** excerpt ended with a period, but on the official page the sentence continues. Trimmed to the text that is on the page.
- **dexter-p2:** the statement said "priorities for working families", but the pamphlet introduces this list with "I will continue fighting for:". Reworded.
- **russ-p5:** the statement said "such matters", which left "these things" undefined. Extended the excerpt and reworded the statement to name the items from the preceding sentence (manufacturing, forest and agricultural management, markets, infrastructure and energy).

## Voting records
- **House.** I re-fetched both votes on clerk.house.gov. Every listed vote is correct.
  - Roll call 190 (July 3, 2025): motion to concur in the Senate amendment to H.R. 1, One Big Beautiful Bill Act; 218-214. Bentz Aye. Bonamici, Dexter, Hoyle (OR), Bynum and Salinas No.
  - Roll call 23 (January 22, 2025): S. 5, Laken Riley Act, On Passage; 263-156. Bentz and Bynum Yea. Bonamici, Dexter, Hoyle and Salinas Nay.
- **Senate.** I re-fetched both votes on senate.gov.
  - Vote 372 (July 1, 2025): H.R. 1 passage; 50-50, with the Vice President voting Yea. Merkley Nay.
  - Vote 7 (January 20, 2025): S. 5 passage; 64-35. Merkley Nay.
- **Selection neutrality.**
  - The same two bills are used for all seven federal incumbents. The selection is consistent across incumbents, and no race has two incumbents, so there is no within-race asymmetry.
  - The selection is not slanted toward one party's members: Bynum's crossover Yea on S. 5 is shown.
  - However, two votes, both on 2025 Republican-majority priorities (budget/tax and immigration), make a narrow sample that captures mostly party-line positions.
  - Recommendation for the collector (no votes added here): add one or two votes on other subjects, such as an appropriations or shutdown vote, or a bipartisan bill like the Farm Bill or Fix Our Forests Act, which Bentz's own pamphlet statement cites.
- **Non-federal records.** No state or local votes were collected for any challenger or for Kotek (Brock Smith, Drazan, Beck, Adair, Russ). This is documented in each file's gaps and applies equally to everyone.

## Incumbency and file-level checks
- **Incumbency:** every `incumbent` value matches its cited source.
  - The pamphlet occupation lines confirm the federal incumbents.
  - The Blue Book governor biography confirms Kotek, which also supports Drazan = false.
- **Names and parties:** names, parties and nominating parties match the pamphlets.
- **Websites:** all campaign websites are confirmed in the pamphlet statements. Bentz and Hoyle list none ("furnished by Cliff Bentz for Congress" / "Friends of Val Hoyle"), so null is correct for both.
- **Minor gap-wording issue:** Bynum's gap says her House page does not state her district, but the page refers to "Oregon's Fifth".

## Empty files (Dye, Ayles, Townsend)
- The pamphlet asterisk ("chose not to submit") is confirmed for all three.
- Spot-searches returned only Wikipedia, excluded aggregators (theballotbrief, bluevoterguide), ivoterguide, ballotready and prediction markets.
- For Ayles, Ballotpedia (re-fetched) lists no website, biography or themes.
- No T1/T2 material or campaign site was missed.

## Same-name risk
- **Chris Henry:** all items come from the 2026 pamphlet statement of the Progressive/Pacific Green nominee (chrishenry.org, progparty.org email).
- **Brett Smith:** all items come from the 2026 pamphlet statement of the Pacific Green governor nominee. OPB (2026-07-23) identifies him as a Molalla resident who ran for CD5 in 2024 as the Independent Party nominee, and it links brett-smith.us.
- No item belongs to another person.

## Missed material (T3, all races)
The collector used only T1 sources, the same way for every candidate. Spot-searches show substantial reputable 2026 coverage that was collected for no one:
- **Governor:** OPB and Willamette Week reports on the October 1 and October 7, 2026 debates; OPB profiles of Brett Smith (2026-07-23, 2026-09-16).
- **US Senate:** OPB profiles of Brock Smith (2026-03-04, 2026-05-22).
- **CD2:** OPB on Beck and rural health care (2026-09-30).
- **CD1, CD4, CD5:** Oregon Capital Chronicle and OPB primary coverage.

Treatment is equal, so this is not a balance violation, but the profiles are thinner than the sources allow.

## Completeness and inventory
- The pamphlet candidate lists match the inventory exactly in all eight races:
  - Senate: 4 candidates.
  - CD1–CD6: 2 / 2 / 2 / 3 / 3 / 2 candidates.
  - Governor: 3 candidates. OPB also says Smith is the only third-party candidate on the ballot.
- No candidate on the ballot is missing, and the inventory includes no one who is not on the ballot.
- No inventory discrepancies found.
