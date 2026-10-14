# Verification: Portland City Council District 3 (`portland-council-d3`)

Verified 2026-10-14 by an independent verifier working from stripped inputs, without access to `raw/`. Every cited URL was re-fetched. I ran one spot-search per candidate (`"<name>" Portland City Council District 3 2026`).

## Counts (bio + positions; no voting records in this race)

| # | Candidate | Items | Verified | Corrected | Rejected | T1 | T3 | Profile note |
|---|---|---|---|---|---|---|---|---|
| 1 | John Sweeney | 5 | 5 | 0 | 0 | 0 | 5 | pamphlet scan unreadable; both AUD-120s unreadable |
| 2 | Tom Sollitt | 5 | 5 | 0 | 0 | 1 | 4 | pamphlet scan unreadable |
| 3 | Larry Kelly | 9 | 8 | 1 | 0 | 7 | 2 | |
| 4 | Tiffany Koyama Lane (inc.) | 7 | 6 | 1 | 0 | 2 | 5 | pamphlet scan unreadable; AUD-120 unreadable |
| 5 | Ali Beaudoin | 6 | 6 | 0 | 0 | 2 | 4 | non-filer (*) |
| 6 | Heart Free Pham | 4 | 4 | 0 | 0 | 2 | 2 | non-filer (*) |
| 7 | Terry Parker | 3 | 3 | 0 | 0 | 0 | 3 | pamphlet scan unreadable; AUD-120 unreadable |
| 8 | Martin Ward | 11 | 11 | 0 | 0 | 8 | 3 | |
| 9 | Joel Corcoran | 11 | 10 | 1 | 0 | 9 | 2 | |
| 10 | Darren McCormick | 3 | 2 | 1 | 0 | 1 | 2 | non-filer (*) |
| 11 | Angelita Morillo (inc.) | 14 | 13 | 1 | 0 | 11 | 3 | |
| 12 | Steve Novick (inc.) | 13 | 12 | 1 | 0 | 11 | 2 | |
| 13 | Patrick Hilton | 11 | 11 | 0 | 0 | 9 | 2 | |
| 14 | Matthias Hallett | 9 | 9 | 0 | 0 | 8 | 1 | |
| 15 | Kellie Torres | 7 | 7 | 0 | 0 | 2 | 5 | pamphlet scan unreadable |
| 16 | Kimberly Tucker | 3 | 3 | 0 | 0 | 1 | 2 | non-filer (*); reported withdrawn |
| 17 | Cristal Otero | 11 | 11 | 0 | 0 | 9 | 2 | |
| 18 | Guy Frankenstein | 4 | 4 | 0 | 0 | 1 | 3 | non-filer (*) |
| 19 | Keir Legree | 8 | 8 | 0 | 0 | 5 | 3 | |
| 20 | Esther Leon | 10 | 10 | 0 | 0 | 8 | 2 | |
| 21 | Kenneth (Kent) R Landgraver III | 7 | 7 | 0 | 0 | 6 | 1 | |

Total: 166 items, of which 160 were verified, 6 corrected and 0 rejected.

## Corrections
- `larry-kelly-p3`: removed a trailing period from the excerpt. The source continues with a comma.
- `joel-corcoran-p1`: changed the excerpt's "Establish" to lowercase "establish" to match the source, where it comes mid-sentence.
- `steve-novick-p1`: extended the excerpt and statement to say which budgets are meant: the "$1.45 million apiece" budgets the council voted itself.
- `tiffany-koyama-lane-p2`: the statement said only "the project". It now names the Moda Center renovation, which the Mercury identifies in the preceding sentence.
- `darren-mccormick-b1`: the statement said McCormick "describes himself" as a researcher, administrator and writer. The Mercury attributes that description to his LinkedIn profile, and the statement now says so.
- `angelita-morillo-b2`: the passage on her council page is first person, so the statement now says she describes herself this way.

## File-level checks
- **Names and ballot order.** The Multnomah ballot content (RCV, dated 2026-09-22) lists 21 printed names. The order and spellings match inventory exactly, including "Esther Leon" and "Kenneth (Kent) R Landgraver III". OPB and portland.gov print "León". The files use "Esther Leon" as the name, with "Esther León" as a name variant.
- **Incumbency.** portland.gov/council lists Morillo, Novick and Koyama Lane for District 3, so `incumbent: true` is confirmed for those three. No other District 3 candidate appears on that page, so `false` is confirmed for the other 18.
- **Pronouns.**
  - Stated on the council pages: Koyama Lane She/Her, Morillo She/They, Novick He/Him. The files are consistent with these.
  - Not stated in any pamphlet statement or AUD-120 form. For the remaining candidates, the files use the pronouns the Mercury and OPB use.
  - The council pages' boilerplate "their term" is not a pronoun statement.
- **Campaign websites.** Each website is confirmed in the cited source:
  - Printed in the pamphlet statement: Ward, Corcoran, Morillo, Novick, Hilton, Hallett, Otero, Legree, Leon.
  - Given on the 2026 AUD-120 form: Sollitt, Pham, Torres, Tucker, Frankenstein.
  - The null websites (Sweeney, Kelly, Koyama Lane, Beaudoin, Parker, McCormick, Landgraver) are consistent with the readable sources. For Sweeney, Koyama Lane and Parker, "no website" cannot be confirmed because their statements are unreadable.
- **Sollitt's form.** The URL slug says `sollitt-tom-2020-aud-120-form`, but the document is the 2026 AUD-120 for Councilor District 3 (started 2026-07-17). portland.gov's 2026 page links it for Sollitt.

## Thin profiles: non-filer or source-access gap
- **Non-filers.** The county pamphlet index marks Beaudoin, Pham, McCormick, Tucker and Frankenstein with an asterisk. The legend reads: "Candidates who did not file a candidate statement for the Voters' Pamphlet have an asterisk (*) by their names." These gaps are confirmed.
- **Source-access gap.** Sweeney, Sollitt, Koyama Lane, Parker and Torres have pamphlet pages listed (M-53 to M-58), but the collector could not read their statements. I confirmed that the full pamphlet PDF's text is 104,260 characters and ends around page M-33, before the Portland section.
  - The MOO guide page (`multco.us/info/military-overseas-online-voters-guide-...`) no longer links individual statements; it links only the full pamphlet. Its canonical URL drops "online".
  - A pattern-built statement URL for Sweeney failed to fetch, so I could not independently confirm that the individual statements are scans.
  - The unreadable AUD-120s (Sweeney amended and original, Koyama Lane, Parker, Morillo, Novick) were each confirmed as having no candidate-field text.

## Balance finding
- **The disparity is explained, not unequal effort.** Item counts range from 3 (Parker, McCormick, Tucker) to 14 (Morillo). The thin profiles are all either non-filers or candidates with unreadable pamphlet statements.
- **The same T3 search was applied evenly.** Every candidate who appears in the Mercury, OPB or Tribune pieces has items from them. The Tribune's "did not respond" list (Sollitt, Pham, Parker, McCormick, Kelly, Frankenstein) matches the gaps exactly.
- **The three incumbents got comparable treatment.** Each has a T1 council page item, and none has a council voting record collected.
- **Missed material:**
  - Corcoran and Ward both answered the Tribune Q&A, but no items were taken from their answers. Both are already well covered by T1 sources.
  - Sollitt has a BikePortland interview dated 2026-02-20 that was not used. It is the most useful unused 2026 T3 source for an under-covered candidate.
  - Morillo has a Willamette Week article dated 2026-01-07 that was not used.
  - Dated 2024 OPB and KATU candidate profiles exist for Sweeney, Parker, Pham, Hilton, Otero and Landgraver. The collector appears to have excluded 2024 sources for every candidate alike, so this is not unequal effort. Using them, dated, would help the thin profiles for Parker and Pham.

## Withdrawal: Kimberly Tucker
The Portland Tribune (2026-10-13) reports: "Kimberly Tucker withdrew her campaign due to personal circumstances." She remains on the certified ballot:
- She is 16th of 21 on Multnomah's certified ballot content (dated 2026-09-22).
- portland.gov lists her among the qualified District 3 candidates. The city certified candidates on 2026-09-03.
- The city's withdrawals table names only Brandon Mullen, Genevieve Rose Greenwood and Rebekah Morgan.

Her file reports the withdrawal (b3, attributed to the Tribune) and has a gap noting she is still on the ballot. This is correct.

## Inventory discrepancies
- **Certified write-in not in inventory.** portland.gov's "Certified Write-In Candidates" table lists Michael A. Johnson for Councilor District 3 (AUD-141). He is not printed on the ballot and is not in inventory.
- **Seat count.** The ballot content shows "Contest Total: 1" for this contest, while inventory has `seats: 3`. The figure is most likely a count of contests, not seats, so I did not change anything, but it should be cross-checked against the City Elections Officer statement.
- **No other discrepancies.** All 21 inventory candidates have verified files, and no one on the printed ballot is missing.
