# Issue sweep verification: Multnomah County Commissioner D2 (multnomah-county-commissioner-d2), 2026-10-20

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget; each item checked against its source in one fetch per URL. Six pages were fetched: the Portland Mercury profile page (covers Williams and Greene), Willamette Week, KATU, OPB, serenacruz.com and tonyrobertson.org.
New items import as drafts; they show in /ops for review before anything is published. Items marked `low_confidence` appear under "Needs a look".

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Bri Williams | 1 | 1 T3 | 1 | 0 | 0 | 23 |
| Bruce Broussard | 0 | none | 0 | 0 | 0 | 25 |
| Herman Greene | 1 | 1 T3 | 0 | 0 | 1 | 24 |
| Nabil Zaghloul | 15 | 15 T3 | 13 | 2 | 0 | 15 |
| Nathan Ong Norris | 0 | none | 0 | 0 | 0 | 25 |
| Serena Cruz | 11 | 11 T2 | 11 | 0 | 0 | 12 |
| Tony Robertson | 4 | 4 T2 | 3 | 1 | 0 | 18 |

### Balance
The spread is large: Cruz (11, campaign issues page) and Zaghloul (15, but all from 2024 City Council coverage) against Robertson 4, Williams 1, Greene 0 usable, and Broussard and Ong Norris 0. Much of it is material, since Broussard, Ong Norris and Greene have no campaign issue pages or interviews that the sweep could find (Greene's collector stopped early after 6 empty searches). Williams has only a one-line Mercury mention. Zaghloul's count is not comparable: none of his items are about the 2026 race. Several gaps are "not searched (low coverage)" (Broussard, Ong Norris, Williams, Greene), so search depth was unequal; a later sweep should look for campaign sites, forum questionnaires and news for these four. Broussard and Ong Norris have verified files with 0 items and their gaps copied through.

### Corrections
- nabil-zaghloul-i3 (OPB): the excerpt is a fragment of a longer sentence ("...so before creating new levies or taxes,"). Statement now quotes "We are the second highest-taxed municipality behind New York City" instead of saying "Portland is", and notes the sentence continues.
- nabil-zaghloul-i6 (WW): removed the clause "while saying it is not about targeting the homeless community"; it is not in the excerpt and was not confirmed on the page. Statement now reads that he said the city needs to enforce the law when individuals refuse placements and services over and over.
- tony-robertson-i4: statement referred to "behavioral health access"; page heading is "maximize access to behavioral health services". Reworded to match.

### Rejections
- herman-greene-i1 (gun-policy, Portland Mercury, 2026-09-26): the quote is present ("I have spent years working in violence prevention, supporting young people, and standing with families impacted by gun violence and crisis."), but it describes his past work. His answer states no gun-policy position (his answer is on holistic homelessness and public-safety responses, prevention and eviction prevention). Rejected as `paraphrase_faithful`; not fixable without a new source. Greene is left with 0 items.

### Specific checks
- Williams i1: excerpt present in her "Why she's running" section. The page's wording is "she also wants the county to invest more heavily in behavioral health services"; the statement attributes it to the Mercury profile, so it is reporter paraphrase, not her words.
- Zaghloul: all 15 excerpts present (WW 2024-09-25: i1, i5, i6, i10; KATU 2024-10-16: i2, i4, i7, i8, i9, i14, i15; OPB 2024-10-02: i3, i11, i12, i13). Every statement names the year (2024) and the earlier race (Portland City Council District 2); none of the pages mentions 2026. WW says he is "Director of Multnomah County's Bienestar de la Familia program". KATU names no job title (only nearly three decades of county service). OPB lists "Director for Social Service Programs at Multnomah County" and does not name Bienestar. All 15 carry `low_confidence` because the pages are 2024 and none ties him to the 2026 District 2 county race; the 2026 Mercury profile already in his candidate file (b1) supplies the Bienestar title and 32 years of county service. KATU i8: "This will include" refers to a plan in the preceding sentence; statement says "his approach".
- Cruz: all 11 excerpts present verbatim on serenacruz.com/issues, a page headed for Multnomah County Commissioner (District 2). Domain is the `website_url` in her candidate file, confirmed via the voters' pamphlet. i4, i5 and i10 are fragments of longer sentences; statements stay within the fragment. i7 (Moda Center): thin topic fit as infrastructure (a remark that it is an investment opportunity, no policy), kept with `low_confidence`.
- Robertson: all four excerpts present on tonyrobertson.org/priorities under the headings "move forward on housing & homelessness" (i1), "strengthening our economy" (i2, i3) and "maximize access to behavioral health services" (i4). The statements say only what the page says (descriptions of conditions, not pledges). The page does not name Multnomah County or District 2; the domain is the `website_url` in his candidate file, confirmed via the County voters' pamphlet statement (T1), so tier T2 stands.

### Identity checks
- Zaghloul: see above. Likely the same person (name, Multnomah County program director, 2026 Mercury profile), but not proven on the KATU and OPB pages.
- Cruz and Robertson: campaign domains confirmed via the pamphlet; Cruz's page names the office.
- Williams and Greene: the Mercury page is the 2026 District 2 candidate profile and names the office.
- Not re-checked this run: the candidate-file `website_url` pamphlet pages, and `incumbent` flags (all false in candidate files).

## Retry next week
- Broussard, Ong Norris: campaign sites, forums, news (all searches returned nothing or were not run).
- Greene: search for a stated gun-policy or public-safety position beyond the Mercury Q&A.
- Williams: look for a campaign site or other 2026 items; only one item.
- Zaghloul: find a 2026 source (campaign site, forum) that restates these positions, or a page tying the 2024 candidate to the current one; recheck KATU and OPB identity.
- Cruz: infrastructure (Moda Center item is thin); the 6 empty gaps (public-safety, childcare, gun-policy, water, immigration, elections-democracy).
- Robertson: the 6 empty gaps, and a page naming the office.

## Token use
Verifier (Sonnet): about 100,000 tokens and 25 tool calls (estimate). Collectors: about 80,000 tokens each on average (see round 3 ledger).
