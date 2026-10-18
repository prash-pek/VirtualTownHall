# News-outlet endorsements, Oregon November 2026

Feeds the collapsed "Endorsed by" dropdown (spec: endorsements are shown, never scored into Alignment).
Pamphlet-listed endorsers live on each candidate/measure record (`endorsements` field, pipeline thread);
this folder holds press slates only, keyed by the same inventory ids.

- `outlets/wweek.json`: Willamette Week fall 2026 slate (46 picks, published 2026-10-14)
- `outlets/mercury.json`: Portland Mercury November 2026 slate (29 picks, published 2026-10-14)
- `outlets/oregonian.json`: The Oregonian/OregonLive editorial board November 2026 slate (13 picks, articles 2026-09-26 to 2026-10-14). oregonlive.com blocks our fetchers, so Prash pasted the pages (2026-10-18); verified in `reports/verification-2026-10-18-oregonian.md`
- `sources/`: page text as fetched 2026-10-15 (Oregonian: as pasted 2026-10-18); every excerpt is verbatim from these (`python3 -I check_excerpts.py`)
- `reports/verification-2026-10-15.md`: verifier rulings (all 75 checked)
- `COLLECTOR.md`: schema and rules

Ranked-choice races carry `rank`. Honorable mentions are not recorded.

## Outlets checked with no 2026 general slate (as of 2026-10-15)
Portland Tribune/Pamplin, East Oregonian, Baker City Herald, Bend Bulletin (editorials, no picks yet).
Not reachable: Statesman Journal (paywall). The Oregonian blocks our fetchers; its slate was added from pasted pages.
Parties: no official Oregon Republican Party slate found (site unreachable) and no DPO list, so both are left out.
