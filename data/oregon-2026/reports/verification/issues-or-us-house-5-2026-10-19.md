# Issue sweep verification: US House District 5 (or-us-house-5), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` with the token-budget rules. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Janelle S Bynum (D, incumbent) | 19 | 12 T1, 5 T2, 2 T3 | 15 | 4 | 0 | 9 |
| Patti Adair (R) | 8 | 8 T2 | 7 | 1 | 0 | 16 |
| Andrea Townsend (Pacific Green) | 0 | none | 0 | 0 | 0 | 30 |

## Balance
Same issue list, skip rule and early stop for all three. The disparity is documented in `gaps`:
- Bynum is the incumbent with bynum.house.gov press releases and issue pages plus a campaign site (domain matches `website_url` in her candidate file).
- Adair has a campaign site (PattiForCongress.com) with one priorities page and a home page; nothing else found. 5 issues "nothing found", 11 "not searched (low coverage)".
- Townsend has no campaign website (`website_url` null); 6 empty searches triggered the early stop (5 nothing found, 25 not searched).

Spot-searches:
- `"Janelle Bynum" Oregon 5th district 2026`: OPB, Oregon Capital Chronicle voter guide, KGW/KATU, oregonvotes.gov voters' guide entry. Confirms incumbent; the Voters' Pamphlet statement and press (OPB 2026-04-29) were not fetched and could add T1/T3 material.
- `"Andrea Townsend" Oregon US House 5th district 2026`: ballot listings only (Multnomah ballot content, The Ballot Brief, BallotReady, GoodParty unclaimed profile, ivoterguide). Confirms she is the Pacific Green candidate on the 2026 ballot; no campaign site found. Not fetched, so ivoterguide/BallotReady may hold positions.
- `"Patti Adair" Oregon US House 2026`: Ballotpedia, BallotReady, Oregon Capital Chronicle, OPB primary result. Confirms Republican nominee. Not fetched; news coverage (OPB, Capital Chronicle) may hold T3 positions on issues she is gapped on.

## Corrections
- janelle-bynum-i11: statement reworded. Excerpt is only her quote; the vote on H.R. 7567 is on the page but outside the excerpt. Now attributes the quote in the release on her vote.
- janelle-bynum-i12: statement trimmed to what the excerpt supports (Rivergrove Water District pipe replacement). Mt. Angel reservoir claim dropped; it is on the page but not in the excerpt.
- janelle-bynum-i14: published_at corrected from 2025-06-26 (repost date on bynum.house.gov) to 2025-06-24 (KTVZ article date).
- janelle-bynum-i18: removed "because of tariffs"; the quoted sentence does not mention tariffs. Now says it was in a release responding to President Trump's tariff announcement.
- patti-adair-i4: excerpt trimmed to the confirmed text ("...impacts data centers have on air quality"); the fetch quote was cut at a length limit. Statement trimmed to match. The page reportedly continues with water quality and electricity costs.

## Rejections
None.

## Identity checks
- Bynum: all items on bynum.house.gov or janellebynum.com (OR-05 named); i14 and i19 are third-party outlets (KTVZ, KOIN) listed on her official pages. No concerns.
- Adair: PattiForCongress.com domain matches her candidate file. The home page does not name a district; the OR-5 link rests on search results (Oregon Capital Chronicle, OPB) identifying her as the OR-5 Republican nominee and Deschutes County Commissioner. No concerns.
- Townsend: no items, nothing to identity-check. Search listings show a prior-cycle (2024) candidacy for the same district.
- Tier note: bynum.house.gov items are T1 for consistency with earlier weeks; the policy table lists incumbents' official office pages under T2 (decision pending in /ops).
- patti-adair-i7: topic is childcare but the content is the Child Tax Credit; mapping is loose.
- janelle-bynum-i6: based on a release headline only on her official issues page, not the release itself.
- janelle-bynum-i17: 2024 campaign release, dated in the statement.

## Retry next week
- andrea-townsend: all issues. Check ivoterguide / BallotReady / Voters' Pamphlet statement and look for a campaign site.
- patti-adair: the 11 low-coverage issues plus homelessness, addiction-mental-health, gun-policy, water, wildfire; try OPB / Capital Chronicle coverage. Recheck the full data-center sentence.
- janelle-bynum: addiction-mental-health, childcare, gun-policy, transportation, technology, social-services, social-security-medicare, civil-rights, foreign-policy.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Janelle Bynum | 121.6k | 59 |
| Collector, Andrea Townsend | 70.7k | 13 |
| Collector, Patti Adair | 82.4k | 16 |
| Verifier, all three | 89.8k | 30 |
| Total | 364.5k | 118 |
