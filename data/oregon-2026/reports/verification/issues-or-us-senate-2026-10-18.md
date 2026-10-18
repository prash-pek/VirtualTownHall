# Issue sweep verification: US Senate (or-us-senate), 2026-10-18

Protocol: `pipeline/ISSUE_SWEEP.md` with the token-budget rules. Collectors and verifiers on Sonnet, at most 3 at once.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Jeff Merkley (D) | 15 | 10 T1, 5 T2 | 14 | 1 | 0 | 8 |
| David Brock Smith (R) | 8 | 6 T2, 2 T3 | 8 | 0 | 0 | 18 |
| Chris Henry (Progressive) | 29 | 28 T2, 1 T3 | 28 | 1 | 0 | 4 |
| Gary Lyndon Dye (Libertarian) | 3 | 3 T3 | 3 | 0 | 0 | 28 |

## Balance
All four got the same issue list, the same skip rule (issues already covered are not searched again) and the same
early stop (6 empty searches in a row). Differences come from what exists, not from effort:
- Henry's campaign site has a long, detailed platform; one fetch covered most issues.
- Merkley's senate.gov and campaign pages cover many issues; he also already had 8 items.
- Brock Smith's campaign issues page covers 6 issues; news coverage found 2 more. Early stop left 18 gaps.
- Dye has no campaign website and almost no 2026 coverage. His 3 items come from a 2024 KATU profile of his US House
  primary run, and each statement says so.

Spot-searches: identity searches were run for Henry and Dye (below). No separate spot-search for Merkley or Brock Smith
this week (token budget); both have confirmed campaign sites.

## Corrections
- jeff-merkley-i5 (ICE and CBP Constitutional Accountability Act): topic changed from public-safety to immigration.
- chris-henry-i22 (2022 LWV Portland guide): statement reworded to match the excerpt ("does not support any
  restrictions or limitations on a woman's right to choose"); stays dated 2022.

## Identity checks (for review in /ops)
- chris-henry-i22: the 2022 LWV page lists Chris Henry, Progressive, Oregon City, former co-chair of the Pacific Green
  Party. Third-party listings show the same person as the 2026 Progressive nominee. Accepted.
- gary-lyndon-dye-i1..i3: KATU's 2024 profile is of "Gary Dye (R)", US House District 3. 2026 listings (Ballotpedia)
  describe the Libertarian Senate nominee as an engineer; KATU describes the same career (refining, utility gas
  measurement). Matched on occupation only, no city or age to compare. Accepted, but worth a look before publishing.

## Retry next week
- david-brock-smith veterans: his oregonlegislature.gov release on the Roseburg veterans' home is a PDF WebFetch could
  not read.
- jeff-merkley cost-of-living: two budget.senate.gov pages returned 404.

## Token use (from agent completion notices)
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Merkley | 111.2k | 48 |
| Collector, Brock Smith | 92.5k | 28 |
| Collector, Henry | 90.7k | 23 |
| Collector, Dye | 67.7k | 11 |
| Verifier, Brock Smith | 59.5k | 8 |
| Verifier, Merkley | 64.5k | 19 |
| Verifier, Henry and Dye | 70.9k | 11 |
| Total | 557k | 148 |
