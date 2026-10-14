# Verification: Marion County local measures (Nov 3, 2026)

Verifier run 2026-10-14. Inputs: stripped collector files for 24-525 to 24-531. Each source was re-fetched with WebFetch. Main source: Marion County voters' pamphlet (VP), `https://www.co.marion.or.us/CO/elections/Documents/VoterRegistrationNumbers/2026/November%203%202026%20General%20Election%20VP_FINAL_ONLINEVER.pdf`. Its machine-readable text (118,524 chars) ends on p.38. The index lists "Measures & Arguments" as pp.36-45, so pp.39-45 could not be read by the verifier either.

All 9 argument items are kind `explainer` and all are on the YES side. Each comes from official ballot-title summary or explanatory-statement text, not from filed arguments or press. No NO-side items exist for any measure.

| Measure | Items V/C/R | Field corrections | Official explainer / filed argument / press (YES; NO) |
|---|---|---|---|
| aurora-24-525 | 0/1/0 | none | 1/0/0; 0/0/0 |
| mt-angel-fire-district-24-526 | 1/0/0 | ballot_label + title | 1/0/0; 0/0/0 |
| silverton-24-527 | 1/0/0 | summary | 1/0/0; 0/0/0 |
| silver-falls-sd-4j-24-528 | 1/0/0 | none | 1/0/0; 0/0/0 |
| mt-angel-monitor-fire-district-24-529 | 2/0/0 | none | 2/0/0; 0/0/0 |
| gates-rfpd-24-530 | 1/0/0 | no_means | 1/0/0; 0/0/0 |
| stayton-fire-district-24-531 | 2/0/0 | none | 2/0/0; 0/0/0 |

No items were rejected.

## Per measure
- **24-525 Aurora charter**: y1 was corrected because the excerpt dropped an en dash ("current form – strong mayor"). VP p.36 confirms "NO ARGUMENTS WERE FILED IN SUPPORT OF OR IN OPPOSITION TO THIS MEASURE". The imbalance is explained by that notice.
- **24-526 Mt. Angel dissolution**: The official caption is "Dissolution of Mt. Angel Fire District Contingent Other Measures", so ballot_label and title were corrected to match. The summary is faithful. Note that the ballot summary gives dissolution as "effective December 31, 2026", while the explanatory statement gives January 1, 2027 for the new district. Fiscal figures are confirmed ($1.97/$1,000; no bonded debt). Arguments are not on the readable pages.
- **24-527 Silverton charter**: The summary was corrected because the Mayor section is repealed *and incorporated* into "Mayor's Function at Council Meetings". VP p.37 says no arguments were filed for either side.
- **24-528 Silver Falls SD bond**: All fiscal figures are confirmed: $87,040,000 bonds; $10,210,000 OSCIM grant; about $97,250,000 total; about $1.88/$1,000 at the FY2026 rate; existing bond paid off in 2027; 26-year maturity. **Balance concern:** VP p.38 prints "NO ARGUMENTS WERE FILED IN SUPPORT OF THIS MEASURE" directly above the 24-528 heading. That notice covers the support side only, so an argument *in opposition* was probably filed (likely VP p.39 or later). It could not be read. NO-side coverage may be missing.
- **24-529 Mt. Angel-Monitor formation**: Both items are verified verbatim in the explanatory statement, which is "based on information provided by the Mt. Angel Fire District". Fiscal details are confirmed: $1.97/$1,000; first levied 2027-28, with collection from November 2027; "higher than the existing permanent tax rate of each district" (the existing rates are not stated numerically); no bonded debt.
- **24-530 Gates RFPD levy**: no_means was corrected. The June 2027 expiry of the current levy appears only in The Canyon Weekly (T3), not in the official text. All revenue figures are confirmed. The official question says "Beginning June 1, 2027" but the summary says "July 1, 2027"; the inconsistency is in the source.
- **24-531 Stayton Fire levy**: All items and fiscal figures are confirmed ($1,459,638 to $1,609,290; $212/yr at $200,000 AV). The county's explanatory statement PDF is not machine-readable.

## Contingency (24-526 / 24-529 / Clackamas 3-640)
The contingency is described accurately. The 24-526 summary takes effect only if the Monitor dissolution and the 24-529 formation both pass. The 24-529 summary takes effect only if both dissolution measures pass. The explanatory statements say the measures take effect only if "all three related measures are approved". The official Marion texts do not cite measure numbers. The Clackamas County election page lists 3-640 as "Dissolution of Monitor RFPD Contingent Other Measures", which supports the `contingent_on` links.

## Pamphlet arguments: completeness gaps
- 24-525 and 24-527: none filed (confirmed, VP pp.36-37).
- 24-528: an opposition argument was probably filed (inferred from the support-only notice on VP p.38). It is not in the collected data. The URL is the VP above, about p.39. The page is not machine-readable via WebFetch, so this needs manual confirmation.
- 24-526, 24-529, 24-530, 24-531: unknown. Their measure pages fall after p.38 in the VP, and the Clackamas VP text (`https://docs.clackamas.us/documents/drupal/03f4f9db-a1ab-4a1f-9ce1-16059d49a513`) is truncated at p.C-33. Someone needs to read VP pp.39-45 manually.

## Inventory discrepancies
- `silver-falls-sd-4j-24-528.source_url` and `monitor-rfpd-3-640.source_url` (docs.clackamas.us) return only an 818-character accommodation notice with no machine-readable measure text. The Marion results page has readable per-measure documents (`https://www.co.marion.or.us/CO/elections/Results/Pages/November-3-2026-Gubernatorial-General-Election.aspx`). The 24-529 Clackamas doc is readable.
- The inventory title for 24-526 is correct ("...Contingent Other Measures"); the raw file had omitted the suffix.
- Marion lists 24-531's district as "Stayton Rural Fire Protection District" on its results page and as "Stayton Fire District" in the pamphlet.
- No missing measures: all seven Marion 24-5xx measures in the inventory have files.
