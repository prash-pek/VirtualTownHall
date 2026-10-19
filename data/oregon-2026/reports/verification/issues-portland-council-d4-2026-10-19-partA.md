# Issue sweep verification: Portland City Council District 4, Part A (portland-council-d4), 2026-10-19

Protocol: `pipeline/VERIFIER.md` and `pipeline/ISSUE_SWEEP.md` (verify and import). Part A covers 6 of the 12 candidates;
another verifier covers the other 6. Each URL was fetched once and all its items checked in that call.
**The per-candidate independent spot-search was skipped to save budget** (one targeted search was run for Cronlund's
domain, below). New items import as drafts for review in /ops.

| Candidate | New items | Tiers (as collected) | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Matt Schulte | 5 | 5 T2 | 4 | 1 | 0 | 18 |
| Jeremy Beausoleil Smith | 12 | 10 T2, 2 T3 | 7 | 3 | 2 | 11 |
| John J Goldsmith | 3 | 3 T3 | 0 | 0 | 3 | 24 |
| Mitch Green | 16 | 13 T2, 2 T1, 1 T3 | 13 | 3 | 0 | 6 |
| Olivia Clark | 15 | 7 T2, 3 T1, 5 T3 | 13 | 2 | 0 | 10 |
| Jayne Cronlund | 15 | 9 T2, 6 T3 | 6 | 0 | 9 | 15 |

## Balance
- Same issue list and stop rules for all. Counts track what exists: Green and Clark are sitting councilors with
  .gov pages and detailed sites; Schulte's single About page covered five issues; Goldsmith has no campaign website
  (Portland Mercury says so) and only one student-paper profile, so almost everything is gapped.
- After verification the accepted counts are uneven: Green 16, Clark 15, Beausoleil Smith 10, Cronlund 6, Schulte 5,
  Goldsmith 0. Two causes are source rejections, not effort: Cronlund's T2 items (domain) and Goldsmith's items (tier).
  Both are fixable with new sources (below). The other 6 candidates are in Part B; the race-wide balance note belongs there.
- Check on effort: Goldsmith gapped 24 issues and Schulte 18, consistent with the early-stop rule for low-coverage
  candidates; I did not re-run searches to confirm nothing was missed (spot-search skipped).

## Corrections
- matt-schulte-i1: excerpt was cut off mid-sentence. Extended to the full bullet; the statement now says the page names
  continuity of care as the issue identified by a PSU/Pathways report and the HSD director (Street Roots interview).
- jeremy-beausoleil-smith-i1: trailing period removed from excerpt; statement now names the real section (Infrastructure
  for All, under Fight Rising Costs) rather than "transportation section".
- jeremy-beausoleil-smith-i3: excerpt extended to include the "2050" clause the statement relies on.
- jeremy-beausoleil-smith-i5: trailing period removed (sentence continues on the page).
- mitch-green-i4: page says Green co-sponsored the Fair Wage Code ordinance; "sponsored" reworded.
- mitch-green-i6: page says he co-sponsored the May 8, 2025 sidewalks resolution with Smith, Clark and Zimmerman; "led" is
  unsupported. Reworded.
- mitch-green-i14: the May 14, 2026 sentence is the office release's narration, not a quote from Green, and "failed" is
  the release's word. Reattributed to the office; loaded word kept out of the statement.
- olivia-clark-i14: statement now attributes the sentence to her council office update.
- olivia-clark-i15: excerpt lacked "distressing", which the statement uses. Extended to the full sentence (page has "(ICE)").
  Statement says the office described the overreach as distressing.

## Rejections
- john-goldsmith-i1, i2, i3: only source is The Cardinal Times (Lincoln High School student newspaper, 2026-10-13,
  Isaac Phillips and Sirena Chen). The quote is on the page, but a student publication is not on the COLLECTOR T3
  list and is not a named outlet with the editorial standards that `docs/data-sourcing-policy.md` section 1 requires for T3.
  The three items also reuse one line of priorities. Rejected on `tier`.
- jeremy-beausoleil-smith-i4, i12 (OpGov.News interview, 2026-04-30): quotes are on the page, but OpGov.News is not on
  the T3 list; the page labels the article "Opinion", says the site is "in active development" and that AI summaries
  may be incomplete, and has a "Member Voices" section. Not accepted as T3. Rejected on `tier`.
- jayne-cronlund-i1, i4, i5, i6, i7, i9, i11, i12, i14 (all T2, jayneforaflourishingportland.com/plan): all nine excerpts
  are on the page, but the domain is unconfirmed (VERIFIER check 4). See identity checks.

## Identity and domain checks (for review in /ops)
- **Cronlund domain.** Her Voters' Pamphlet statement (multco.us PDF) lists `jayneforaflourishingfuture.com`, which is the
  candidate file's `website_url` (the collector found it does not resolve). The cited site is
  `jayneforaflourishingportland.com`. No T1/T3 page found names that domain: Willamette Week, Portland Tribune and Portland
  Mercury list no Cronlund website, and a search returned nothing. The site's own page names "Jayne Cronlund for City of
  Portland District 4" and gives the contact email friendsofjayneportland@gmail.com, which matches the pamphlet email, so it
  is probably hers, but this is circumstantial and the policy needs a T1/T3 link. Marked rejected on `tier`. Her six T3
  items (Willamette Week, Portland Tribune, Portland Mercury) are verified. The candidate file's `website_url` should be
  re-checked: the pamphlet domain may be a typo or redirect that resolves later.
- **Schulte domain.** Candidate file `website_url` is `https://mattschulte.org`, but the cited site is
  `mattschulte.wordpress.com`. Portland Mercury (2026-09-11) lists `https://mattschulte.wordpress.com/` as his website, so
  the cited domain is confirmed by a T3 page and his T2 items stand. The candidate file's `website_url` looks wrong or stale.
- Schulte's page is undated and the text shows no "2026"; attribution rests on the site title naming District 4.
- Olivia Clark site: the only unusual text is a site-builder notice about a newsletter form storage option. It was treated
  as page content and not acted on.
- Mitch Green: all three .gov/T3 items checked against the pages; i15's veterans call is not dated on the page (letter is
  dated 2025-12-14).
- Goldsmith: per Portland Mercury he has no campaign website; his `website_url` (johngoldsmith4pdx.net) was not
  checked by this verifier.

## Retry next week
- Cronlund: find a T1/T3 page naming `jayneforaflourishingportland.com` (or whichever domain is correct); the nine T2
  items can then be restored.
- Goldsmith: search the T3 outlets in COLLECTOR step 5 (OPB, Oregonian, WW, Mercury, Tribune, KGW/KOIN/KPTV/KATU) and
  his voters' pamphlet statement for a replacement source.
- Beausoleil Smith homelessness and taxes: replace the OpGov.News items with a listed T3 outlet.

## Token use
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Matt Schulte | 82.7k | 22 |
| Collector, Jeremy Beausoleil Smith | 91.1k | 22 |
| Collector, John Goldsmith | 90.6k | 24 |
| Collector, Mitch Green | 90.5k | 25 |
| Collector, Olivia Clark | 103.8k | 35 |
| Collector, Jayne Cronlund | 99.0k | 26 |
| Verifier, part A | 103.5k | 37 |
| Total | 661.2k | 191 |
