# Issue sweep verification: US House District 6 (or-us-house-6), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` and `pipeline/VERIFIER.md`. Each URL fetched once, all its items checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Andrea Salinas (D, incumbent) | 23 | 10 T1 (incl. 1 vote), 13 T2 | 19 | 3 | 1 | 3 |
| David Russ (R) | 7 | 7 T2 | 5 | 2 | 0 | 21 |

## Balance
Salinas has a campaign issues page, a House office press-release archive, a committee release and a Clerk roll call, so
coverage is broad and includes dated T1 material. Russ has a single-page campaign site (all 7 items from one URL), no
T1/T3 material found, and 21 gaps (6 searched with nothing found, 15 not searched under the low-coverage rule). The
disparity reflects what exists, not unequal effort for the searched issues, but the gap list is long; Russ's 15
"not searched" issues are a documented rule, not a finding of absence. A later sweep could look at his Oregon voters'
guide statement. Spot-search `"David Russ" Oregon 6th congressional district 2026` found a voters' guide entry, FEC
listing and rating pages, but no issue material beyond what is already captured.
Salinas spot-search found only listings and the official House page; nothing missed.

## Corrections
- andrea-salinas-i8: excerpt extended to "...used by any data center with more than 1 megawatt of power capacity" so the
  statement's 1 MW threshold is supported.
- andrea-salinas-i14: trailing period removed from the excerpt (page continues past "Act").
- andrea-salinas-i21 (Feb 2025 tariffs statement): the page text contains her phrase "Republican Rip Off". The statement
  stays neutral and attributed ("Salinas said they would hurt working families in her district"; dated 2025-02-01); the
  excerpt was trimmed to the verbatim, neutral portion "will hurt working families in my district."
- david-russ-i2: statement dropped the "stopping subsidies" clause, which was not in the excerpt.
- david-russ-i5: statement now attributes "illegal border crossers" to Russ's own wording. The excerpt keeps his
  spelling "aide".

## Rejections
- andrea-salinas-i15 (April 2026 Social Security and Medicare quote): the excerpt is a truncated clause ending in a comma;
  the claim about retiring with dignity is outside it, and the quote that follows on the page is partisan. Retry with a
  full neutral sentence.

## Identity checks (for review in /ops)
- Neither campaign domain (andreasalinasfororegon.com, RussIsForUS.com) is confirmed by a T1/T3 page I could reach.
  Salinas's site says "Andrea Salinas for Oregon" and "your Congresswoman" but gives no district; Russ's says "David Russ
  For Congress" with no district or year. Searches show Salinas (D, incumbent) and Russ (R, Dundee mayor) are the OR-6
  nominees. The oregonvotes.gov voters' guide page redirected, so it could not confirm Russ's site. Items accepted on the
  strength of the sites' self-identification, but the T2 domains should be confirmed before publishing.
- Salinas campaign pages are undated; statements do not imply a date.
- Older items (i19, Sept 2024) are dated in the statement.

## Retry next week
- andrea-salinas-i15: re-collect with a full neutral sentence.
- Confirm both campaign domains via the Oregon voters' guide or Ballotpedia.
- Salinas gaps: transportation, small-business, agriculture.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Andrea Salinas | 99.7k | 38 |
| Collector, David Russ | 87.2k | 16 |
| Verifier, both | 83.2k | 23 |
| Total | 270.1k | 77 |

Orchestrator note: both campaign domains (AndreaSalinasForOregon.com, RussIsForUS.com) are confirmed by the 2026
Voters' Pamphlet (VP_G26-Book8) as recorded in `website_verified_via` in each verified candidate file.
