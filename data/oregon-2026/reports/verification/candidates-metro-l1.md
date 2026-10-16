# Verification report: metro batch L1 (Senate 15, 16, 17, 19, 20, 24, 26; House 18, 25)

Verifier run 2026-10-15/16. Pamphlet items checked against the SOS extracts (Book12/13/14) by word-order match on the cited page and by reading the page layout; web items re-fetched with WebFetch. All 19 files pass `validate.py verified`.

Counts are items (bio+positions+voting_record) as verified/corrected/rejected, then endorsements.

Global findings:
- No candidate states pronouns in a source, except Kayse Jama's official page (He/Him/Él). Collector statements used gendered pronouns throughout (and `Her` for Jama in two items). All were neutralized to name or they; this accounts for most `corrected` items (note says so). Jama keeps he/him.
- Pamphlet excerpts: all 299 pamphlet items located on the cited book/page in the candidate's own column; endorsements all come from the candidate's own statement. Line-wrap/column interleave caused false misses only.
- Substantive corrections: Helfrich p3-p6 statements shifted against excerpts; Stroh p5/p6 swapped; Hutchison p9, Meek p4 (supporter quote), Bowman p10/v1, Niemeyer p4, Bassett p3, Staehely p1 overreach; Reynolds p4 outlet (Capital Chronicle story on portlandtribune.com); Kaufmann p6; Munoz p1; Finkle b1/p1 tier T2 to T3 (self-bylined newspaper piece, no campaign domain).
- Rejected: Staehely b1, b2 (Oregon Association of Nurseries reprint, unbylined trade-association site, not T3).
- Gaps claiming 'No campaign website confirmed/found' were removed where `website_url` is set and printed in the pamphlet.
- Incumbency: Bowman, Jama, Reynolds, Meek, Wagner supported by oregonlegislature.gov pages (true). Others null in files (inventory has `false`; not contradicted).
- Completeness: every inventory candidate in these races has a file and matches the SOS pamphlet candidate list (Senate 24 lists only Jama). Ballot names match (John A N Chee, Myrna A Munoz).

## or-senate-15
- Myrna A Munoz: items 1/9/0; endorsements 16/0/0
- Harold Hutchison: items 1/12/0; endorsements 0/0/0
- Balance: SD15: Munoz 10 items (9 T1 pamphlet, 1 T3 OPB) plus 16 pamphlet endorsements; Hutchison 13 items (all T1 pamphlet), none endorsements (his statement prints none). Item counts comparable and both rely on pamphlet. Spot search: Munoz has more T3 coverage not collected (WW 2026-05-21, 2026-06-13 on the Sollman primary upset); Hutchison has a carrd.co site (T2, listed in pamphlet) not fetched by the collector. Collector effort looks roughly equal; both gaps note pamphlet-only positions.

## or-senate-16
- Courtney Bangs: items 2/7/0; endorsements 20/0/0
- Rachel Armitage: items 5/5/0; endorsements 11/0/0
- Melisa Finkle: items 0/10/0; endorsements 0/0/0
- Balance: SD16: Bangs 9 items + 20 endorsements; Armitage 10 items + 11 endorsements; Finkle 10 items + 0 endorsements (her statement says she seeks none). Tiers mostly T1 pamphlet plus T3 voter guide/news for Bangs and Armitage. Finkle's only non-pamphlet source is a self-bylined Tillamook Headlight Herald piece (downgraded T2 to T3 with disclosure). Spot search found uncollected T3 coverage: Capital Chronicle 2025-07-08 (Bangs endorsement by Weber) and a Capital Chronicle profile of Armitage; Finkle has no campaign domain. Balance acceptable.

## or-senate-17
- John A N Chee: items 0/0/0; endorsements 0/0/0
- Lisa Reynolds: items 10/5/0; endorsements 17/0/0
- Balance: SD17: Chee 0 items (no pamphlet statement, marked with an asterisk in the SOS candidate list; Ballotpedia 2026 page has no bio, themes or survey; no website found); Reynolds 15 items + 17 endorsements. The disparity is documented in gaps and confirmed by independent search (Ballotpedia, BallotReady listings only). No evidence of unequal effort.

## or-senate-19
- Rob Wagner: items 8/6/0; endorsements 18/0/0
- Mary Dirksen: items 2/5/0; endorsements 5/0/0
- Balance: SD19: Wagner 14 items (T1 pamphlet and official page, T2 site, T3 Portland Tribune) + 18 endorsements; Dirksen 7 items (all T1 pamphlet) + 5 endorsements. Dirksen has no T2/T3 items: her site marydirksen.com and a oregonvotes.gov voters-guide page exist and were not fetched; Ballotpedia profile also not fetched (gap says so). Mild imbalance explained by challenger coverage; flagged as possible under-search for Dirksen.

## or-senate-20
- Michele Stroh: items 6/7/0; endorsements 4/0/0
- Mark Meek: items 2/7/0; endorsements 16/0/0
- Balance: SD20: Meek 9 items (T1 official page and pamphlet, T3 OPB 2025) + 16 endorsements; Stroh 13 items (T1 pamphlet, T2 votestroh.com, T3 OPB 2023, dated in the statement) + 4 endorsements. Comparable. Three Meek items are supporter quotes inside his pamphlet statement and are attributed as such. Stroh's pamphlet text attacks Meek; none of that was collected.

## or-senate-24
- Kayse Jama: items 9/4/0; endorsements 15/0/0
- Balance: SD24: only one candidate on the SOS candidate list for the 24th District (Jama); no comparison possible. 8 positions, 5 bio items, 15 endorsements.

## or-senate-26
- Nicole Bassett: items 5/8/0; endorsements 10/0/0
- Jeff Helfrich: items 5/9/0; endorsements 0/0/0
- Balance: SD26: Bassett 13 items (T1 pamphlet, T2 site, T3 Capital Chronicle voter guide) + 10 endorsements; Helfrich 14 items (T1 official page and pamphlet, T2 site, T3 Capital Chronicle 2025) + 0 endorsements (none printed in his statement). Equal effort; Helfrich pamphlet items p3-p6 had statements misaligned with excerpts and were corrected.

## or-house-18
- Amanda Staehely: items 4/9/2; endorsements 8/0/0
- Roy Kaufmann: items 4/7/0; endorsements 8/0/0
- Patrick Marnell: items 1/0/0; endorsements 0/0/0
- Balance: HD18: Staehely 12 items surviving (2 rejected) + 8 endorsements; Kaufmann 11 items (T1 pamphlet, T2 site) + 8 endorsements; Marnell 1 item (Ballotpedia 2020 run) and no statement or site (documented: asterisk in SOS list). Collector gaps for Staehely and Kaufmann wrongly claimed no website; removed. Spot search: KOIN has a Kaufmann feature (2025) that the collector could not fetch; Marnell absent from Ballotpedia 2026 listing but present in SOS candidate list.

## or-house-25
- Ben Bowman: items 5/11/0; endorsements 15/0/0
- Bob Niemeyer: items 5/4/0; endorsements 1/0/0
- Balance: HD25: Bowman 15 items (T1 official page/newsletter/pamphlet, T3 Ballotpedia 2022 survey dated in statement) + 15 endorsements; Niemeyer 9 items (T1 pamphlet, T3 Ballotpedia bio) + 1 endorsement (a pamphlet line naming 'Darrel Gulstrom, AKA The Annoying Child'). Niemeyer has no 2026 Ballotpedia survey and no website; gaps document this. Imbalance is explained by incumbency and longer statement. Bowman's 2022 survey positions are older and labelled.

## Rejected items
- amanda-staehely-b1, amanda-staehely-b2: unbylined Oregon Association of Nurseries 'Nursery News' reprint (candidate-affiliated advocacy group); excerpts are present but the source is not T3.

## Inventory discrepancies
- Inventory `incumbent` is `false` for challengers; files keep `null` (no cited source supports false). Marnell is not listed on Ballotpedia's 2026 page but is on the SOS candidate list; his Ballotpedia item is a dated 2020 run.
- John Chee: no usable material (no pamphlet statement, no Ballotpedia content); file has zero items by design.
