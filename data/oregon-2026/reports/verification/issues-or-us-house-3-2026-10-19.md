# Issue sweep verification: US House District 3 (or-us-house-3), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` with the token-budget rules. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Maxine E Dexter (D, incumbent) | 21 | 12 T1, 9 T2 | 18 | 3 | 0 | 5 |
| Loran Ayles (R) | 0 | none | 0 | 0 | 0 | 30 |

## Balance
Both got the same issue list, skip rule and early stop (6 empty searches in a row). The disparity is documented in `gaps`:
- Dexter is the incumbent with detailed dexter.house.gov issue pages and press releases, plus a campaign site (domain
  confirmed by the Voters' Pamphlet in her candidate file) with a long "How I'll Lead" list per issue.
- Ayles has no confirmed campaign website (`website_url` null in his candidate file). Searches returned only listings;
  6 empty searches triggered the early stop, leaving 24 issues "not searched (low coverage)" and 6 "nothing found".

Spot-searches:
- `"Maxine Dexter" Oregon 3rd congressional district 2026`: only profile/odds pages and her own sites; nothing T1/T2 missed that matters.
- `"Loran Ayles" Oregon US House 2026`: Ballotpedia, BallotReady, Wikipedia, ivoterguide, results/odds pages. Confirms he is the
  Republican nominee in OR-3. These were not fetched (search snippets only), so Ballotpedia/ivoterguide may hold T3 positions.

## Corrections
- maxine-dexter-i11: trailing period removed from the excerpt (the page continues ", and close persistent wage gaps").
- maxine-dexter-i13: trailing period removed from the excerpt (sentence continues on the page).
- maxine-dexter-i17: statement reworded; "encouraged" is not in the quoted text. Now: in opening remarks at a May 15, 2025
  hearing, Dexter said the Senate version of the Fix Our Forests Act provides crucial funding to support community-led
  wildfire resilience plans.

## Rejections
None.

## Identity checks
- Dexter: all 21 items are on her own sites or dexter.house.gov, OR-03 named. No concerns.
- Tier note: dexter.house.gov items are labelled T1 as in the earlier senate.gov items; the policy table lists official
  office pages for incumbents under T2. Left as is for consistency, worth a decision in /ops.
- maxine-dexter-i21: roll-call number not checked; the statement attributes the vote to her press release.
- Ayles: no items, nothing to identity-check.

## Retry next week
- loran-ayles: all issues. Check Ballotpedia / ivoterguide / Voters' Pamphlet statement for any T1/T3 material and a campaign site.
- maxine-dexter: cost-of-living, childcare, transportation, technology, local-business.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Maxine Dexter | 109.6k | 44 |
| Collector, Loran Ayles | 76.1k | 15 |
| Verifier, both | 84.5k | 28 |
| Total | 270.2k | 87 |
