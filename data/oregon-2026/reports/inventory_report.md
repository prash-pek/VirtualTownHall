# Inventory Report: Oregon General Election, Nov 3, 2026

Built 2026-10-13 by the inventory collector. Output: `data/oregon-2026/inventory.json` (validated with `node -e "JSON.parse(...)"`).
Every race, candidate and measure in the inventory comes from a Tier 1 (official) document. No T3 source was used to add a contest, and no contest is marked `unconfirmed`.

## Counts

| Level | Races | Candidates | Measures |
|---|---|---|---|
| Federal (US Senate + US House 1–6) | 7 | 18 | 0 |
| Statewide (Governor) | 1 | 3 | 0 (none on ballot) |
| State Senate | 15 | 32 | n/a |
| State House | 60 | 114 | n/a |
| State judicial (Circuit Court) | 7 | 12 | n/a |
| County (incl. 3 District Attorney races) | 18 | 35 | 0 |
| City | 71 | 194 | 12 |
| School district | 0 | 0 | 5 |
| Special district (SWCD, PUD, fire) | 20 | 30 | 6 |
| **Total** | **199** | **438** | **23** |

Races by county area: statewide/legislative/federal 83, Clackamas 40, Washington 34, Multnomah 33, Marion 4, and one each in Deschutes, Lane, Curry, Jefferson and Lake (circuit court or DA). Jurisdictions: 148.

- 68 races are uncontested: the number of candidates is no greater than the number of seats (`"unopposed": true`).
- 3 races have no candidate filed (`"no_candidate_filed": true`): Tualatin SWCD Zone 3, Barlow Mayor, and Barlow Council Position 1.
- 7 races use ranked choice voting (`"ranked_choice": true`): Multnomah Chair, Commissioner D2, Auditor and Sheriff; Portland Auditor and Council Districts 3 and 4 (3 seats each).
- 3 Washington County races are labeled runoffs from the May primary: Commissioner At-Large, Commissioner D4, and Beaverton Council Position 1.
- Incumbency: 93 candidates are marked true, 151 false and 194 null. A value of null means no source I read states the candidate's incumbency.

## Key findings
- **No statewide measures** are on the November 3, 2026 ballot. SOS Directive 2026-09 says so explicitly ("There are no statewide measures on the November 3, 2026, General Election ballot"), and it also lists no statewide nonpartisan or appellate-court contests.
- **Governor**: the official ballot statement has 3 candidates: Brett Smith (Pacific Green), Tina Kotek (Dem, WF) and Christine Drazan (Rep, Lib).
- **Metro regional government**: no Metro contests or measures appear on the November lists of Multnomah, Washington or Clackamas counties. The May 2026 Metro races evidently did not go to a runoff.
- **Portland**: Auditor (Simone Rede, unopposed), Council District 3 (21 candidates) and District 4 (12 candidates), plus Measure 26-267 (participatory budgeting charter amendment, by initiative petition).

## Sources used (all T1)
- **Secretary of State Directive 2026-09** (2026-09-03), including the Candidate Ballot Statement for all federal, state, legislative, circuit-court and DA contests. Hosted at multco.us/file/ballot_directive_-_november_3,_2026_general/download.
- **SOS "Offices Open, Nov 3 2026"** (rev. 2026-07-02): district geography and vacancy notes.
- **Multnomah County Elections**: Ballot Content report and RCV Ballot Content report (both dated 2026-09-22), the candidate filings page, the measure filings page, and the city certified-candidate PDFs. Board roster from multco.us/board.
- **Washington County Elections**: current-election page, city and SWCD certification letters (scanned PDFs, OCR'd and spot-checked visually), the Nov 2026 voters' pamphlet, and the City of Portland Elections Officer statement (2026-09-03).
- **Clackamas County Elections**: Nov 3 2026 election page, county candidate filings, city and SWCD certification letters (OCR), and the county voters' pamphlet index. Board, sheriff, clerk and treasurer roster from clackamas.us/bcc.
- **Marion County**: Nov 3 2026 voters' pamphlet (composite sample ballot and measures).
- **Incumbency**: oregonlegislature.gov Senate and House rosters; Oregon Blue Book (US Senators, US Representatives, Governor); portland.gov/council.

## Coverage gaps
1. **Rest of Oregon, local contests.** Only Marion County's county-level races (Commissioner Positions 1 and 2, Treasurer) and its measures (24-525 through 24-531) are included. Marion **city** races (Salem, Keizer, Woodburn, etc.) are **not** included, because the pamphlet's two-column sample ballot text could not be reliably assigned to cities. No other county's local races or measures are inventoried: Lane, Deschutes, Jackson, Linn, Benton, Douglas, Josephine, Yamhill, Polk, Columbia, Clatsop and the rest. Lane County's elections page in search results looked stale.
2. **Seat counts are unknown** for North Plains City Council and Johnson City Council (`seats: null`).
3. **ZIP codes** are empty for every jurisdiction, because no official ZIP-to-district mapping was read.
4. **Incumbency is null** for most city, SWCD and PUD candidates, Multnomah Auditor and Sheriff, Portland Auditor, the DAs, Marion County candidates, and the Clackamas Justice of the Peace.
5. **Clackamas commissioner incumbency**: Savas and Helm are marked incumbent because clackamas.us/bcc lists them as sitting commissioners. That page does not give position numbers, so the match to Positions 2 and 4 is inferred.
6. **Name spellings to verify against the printed ballots**:
   - Lake Oswego: "Neil Tunmore" on the certified list vs "Niel" in the Clackamas pamphlet index.
   - Molalla: "KC Bisenius" vs the city letter's "Kevin 'K.C.' Bisenius".
   - Rivergrove: "David M Dull" / "Doug McLean" in the pamphlet vs "David Dull" / "Douglas McLean" in the city letter.
   - Marion County: "Samual A Brentano"; "Maria Hinojos Pressy" (sample ballot) vs "Pressey" (her pamphlet statement).
   - The Marion sample ballot also prints the Governor candidate as "Brent Smith", but the SOS statement says "Brett Smith". The inventory uses the SOS spelling.
7. **The Mt. Angel–Monitor Fire District director race** (5 seats) depends on formation measure 24-529 and dissolution measures 24-526 and 3-640.
8. **Candidate positions were not collected.** That is out of scope for this stage.

## Unconfirmed contests
None. Every contest in the inventory was taken directly from a T1 document.

## Red flags encountered
- **Stale official document**: a multco.us search result titled "Federal Offices … US Senator … Jo Rae Perkins" (`multco.us/file/candidates_and_ballot_measures/download`) is an old-cycle file. It was not used.
- **Auto-generated or third-party summary sites** turned up in search: theballotbrief.com (says its own entries are unverified), bluevoterguide.org (partisan guide), and thegreenpapers.com (pre-primary snapshots). The Green Papers lists **6 Governor candidates**, but the official statement has **3**. None of these sites were used.
- **Spam on an official site's search page**: a clackamas.us site-search URL containing an injected spam query ("flip your cash now … Amsiga.com") appeared in search results. It was ignored. This is a reminder to use only direct official page paths, not search-result URLs on official domains.
- **Labeling error on an official page**: the Washington County current-election page labels the Wilsonville certification link as "City of Tualatin". The document itself is Wilsonville's and was used as such.
- **Typos in official text**: the Marion County sample ballot contains typos ("Democraft", "Indepenent", "Republcian", "Familes", "Libertarians"). Party labels were normalized; names are recorded as printed, with notes.

## Method notes
- Candidate IDs are `firstname-lastname` slugs. Parenthetical nicknames and single-letter initials are dropped, and multi-word surnames are kept (e.g. `jeremy-beausoleil-smith`, `sue-rieke-smith`, `rw-smith`). There were no ID collisions.
- For partisan candidates, `party` is the first party printed on the ballot. Cross-nominations are in `nominating_parties`.
- Measure IDs are `<jurisdiction>-<number>` (e.g. `portland-26-267`, `hillsboro-sd-1j-34-355`).
- The generator script and downloaded source copies are kept in the session scratchpad only, not in the repo.
