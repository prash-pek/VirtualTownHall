# Issue sweep verification: Oregon Senate 13 and 15 (or-senate-13, or-senate-15), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget (one search run for Lancaster's domain).
New items import as drafts; they show in /ops for review before anything is published.

## Race: or-senate-13

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Courtney Neron Misslin (D, incumbent) | 16 | 14 T1, 2 T3 | 15 | 1 | 0 | 14 |
| Glenn Lancaster (R) | 4 submitted, 0 usable | 4 T2 (unconfirmed) | 0 | 0 | 4 | 20 |
| Tim E Nelson (Libertarian) | 0 | none | 0 | 0 | 0 | 27 |

### Balance
The collector reported 13 T1 for Neron Misslin; the recount is 14 T1 (pamphlet 8, official Senate page 5, official biography 1) and 2 T3 (i11 JPR/Capital Chronicle, i12 Willamette Week 2020). Total 16.
Neron Misslin's count reflects a full pamphlet statement and official Senate pages. Lancaster's pamphlet entry has no website and his only issue material was on an unconfirmed domain, so none of it can be used. Nelson has no pamphlet statement in this edition's list, no known site and no coverage. Gaps are documented for all three. Lancaster's pamphlet statement itself (T1) was not collected and could be added in a later sweep.

### Corrections
- courtney-neron-misslin-i11 (data-center moratorium): the article does show her position, but only as one of four Democratic lawmakers who "will propose the moratorium during the 2027 legislative session", per a news release from House candidate Tammy Carpenter. She is not quoted. The old statement ("involved") was vague. Reworded to the reported action, attributed to the release; excerpt widened to include the verb. Stays T3.

### Rejections
- glenn-lancaster-i1 to i4: rejected for an unconfirmed campaign domain. glennlancaster.com is not in his candidate file, and his Voters' Pamphlet entry (p.38) lists no website. The only link found is an unlabeled icon on oregon.gop/2026-candidates (party voter guide, footer says "not authorized by any candidate"). The quotes are on the page, but T2 status is not established. The site also has a Facebook link labeled "Glenn Lancaster for Mayor", and the site's "paid for by" line names "Love Where You Live #23304". Same treatment as an earlier unconfirmed domain.

### Identity checks
- Neron Misslin: official page shows Senator, Senate District 13. Pamphlet entry p.38 matches. The 2020 WW item (i12) is about "Neron", House District 26 (Wilsonville), then a House candidate; same person, dated in the statement. Accepted.
- Lancaster's site says Oregon Senate, District 13, and the pamphlet lists "Retired Business Owner, Electric Utility Industry", consistent with the party page. Identity looks right; the domain is the open question.

## Race: or-senate-15

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Myrna A Munoz (D) | 8 | 8 T2 | 3 | 5 | 0 | 13 |
| Harold Hutchison (R) | 2 | 1 T2, 1 T3 | 2 | 0 | 0 | 20 |

### Balance
Munoz's site has a full issues page; Hutchison's carrd site is a short goals list. Both domains are confirmed by the Voters' Pamphlet (p.39). The 8 to 2 split reflects available material, not unequal effort. Hutchison's one T3 item is critical press coverage; no other T3 outlet was found, and his pamphlet statement (T1) is not yet collected. That pamphlet statement includes a number of positions, so a later sweep should add it for balance.

### Corrections
- myrna-munoz-i3: excerpt was cut mid-sentence. Page text blames "powerful corporate interests ... driving up electricity bills with a reckless build-out of AI data centers". Widened excerpt, reworded attributed to the site; "reckless" left out of the statement.
- myrna-munoz-i8: trailing period removed from the excerpt (source continues "rather than only the largest corporations").
- myrna-munoz-i4, i6, i7: statements used "they"; the site is third person ("she will fight"). Reworded.

### Rejections
None.

### Notes on harold-hutchison-i2 (abortion)
Verified. The WW page (WW Staff, 2026-10-14) reads "He said doctors who perform abortions are evil." in its Hutchison section, and the statement is attributed to WW as reported. WW does not give the date or setting of the remark (the section reads as the endorsement interview), so the statement does not add one. It is sourced only to WW. His own pamphlet says he opposes abortion; that is a separate item not collected.

### Identity checks
- Hutchison: pamphlet lists Harold Hutchison, Republican, SD 15, with the carrd domain; WW describes him as the SD 15 challenger to Muñoz. Match.
- Muñoz: pamphlet lists myrnaforsenate.com; site names her as the SD 15 candidate. Match.

## Retry next week
- Glenn Lancaster: confirm glennlancaster.com (ORESTAR filing, pamphlet, or a T3 outlet linking to it), then restore the 4 items; collect his pamphlet statement (p.38).
- Tim E Nelson: look for any campaign site or press coverage.
- Hutchison and Lancaster: collect pamphlet statements (T1) for balance.

## Token use
Verifier (Sonnet): about 120,000 tokens and 40 tool calls (estimate). Collectors: about 80,000 tokens each on average (see round 3 ledger).
