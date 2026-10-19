# Issue sweep verification: US House District 1 (or-us-house-1), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` with the token-budget rules. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Suzanne Bonamici (D, incumbent) | 22 | 13 T1, 9 T2 | 18 | 4 | 0 | 5 |
| Barbara J Kahl (R) | 7 | 7 T2 | 7 | 0 | 0 | 20 |

## Balance
Both got the same issue list, skip rule and early stop. The disparity is documented in `gaps`:
- Bonamici is the incumbent with a large bonamici.house.gov archive plus a campaign priorities page; one fetch of the
  priorities page covered 9 issues.
- Kahl has a single campaign platform page (all 7 items come from it). No news, Voters' Pamphlet or office pages were
  used, and the early stop left 14 issues "not searched (low coverage)" and 6 "nothing found". Her coverage is thinner
  than effort alone explains; a second pass on other sources is worth doing.

Spot-searches:
- `"Suzanne Bonamici" Oregon 1st congressional district 2026`: listings/Wikipedia only; confirms incumbent and Nov 3 race.
- `"Barbara Kahl" Oregon congress 2026`: Wikipedia, BallotReady, Oregon Capital Chronicle voter guide (she did not respond
  to its questionnaire), forecasts. No T1/T2 positions missed; not fetched, so BallotReady may hold T3 positions.

## Corrections
- bonamici-i3: statement reworded; the excerpt is about the Project Turnkey Act, not the whole package.
- bonamici-i13: statement reworded to "ICE and CBP" and "federal child care programs" as on the page.
- bonamici-i19: statement trimmed to what the excerpt supports (food benefits); the "largest Medicaid cut" quote is on the page but was not in the excerpt.
- bonamici-i22: statement uses the Clerk's title "One Big Beautiful Act"; totals 215-214 confirmed.

## Rejections
None.

## Identity checks
- Bonamici: all items on her own sites or bonamici.house.gov, OR-01 named. Campaign domain confirmed by the Voters'
  Pamphlet in her candidate file. No concerns.
- Kahl: platform page headed "Dr. Barbara Kahl for U.S. Congress, Oregon's 1st Congressional District, 2026". Domain
  confirmed by the Voters' Pamphlet in her candidate file. No concerns.
- Tier note: bonamici.house.gov items are labelled T1, as for earlier house.gov/senate.gov items; the policy table lists
  official office pages for incumbents under T2. Left as is for consistency, worth a decision in /ops.
- bonamici-i18 is a 2021 item (a house.gov summary of a KOIN article); dated in the statement.

## Retry next week
- barbara-kahl: all gapped issues; check Voters' Pamphlet, BallotReady, local news for a second source.
- suzanne-bonamici: cost-of-living, addiction-mental-health, wildfire, infrastructure, civil-rights.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Suzanne Bonamici | 105.9k | 46 |
| Collector, Barbara Kahl | 79.0k | 17 |
| Verifier, both | 84.1k | 25 |
| Total | 269.0k | 88 |
