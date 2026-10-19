# Issue sweep verification: US House District 2 (or-us-house-2), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md` with the token-budget rules. Each URL fetched once, all items on it checked in that call.
New items import as drafts; they show in /ops for review before anything is published.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Cliff Bentz (R, incumbent) | 18 (16 positions, 2 votes) | 7 T1, 11 T3 | 9 | 8 | 1 | 13 |
| Chris Beck (D) | 13 | 11 T2, 2 T3 | 11 | 2 | 0 | 13 |

## Balance
Same issue list, skip rule and early stop for both. Differences come from what exists:
- Beck's campaign issues page (one fetch) covers 11 of his 13 items; OPB's Sept 30, 2026 profile gave the other 2. His 11 gapped issues
  are mostly "nothing found" for a challenger with little coverage; infrastructure and elections-democracy were not searched (early stop).
- Bentz has no confirmed campaign site on file, so his items come from house.gov (T1, including 2 House Clerk votes) and local news (T3).
  Several T3 items are from 2022 and 2023 and are dated in the statements.
- Beck has no voting record (not a sitting member).
Spot-searches: `"Cliff Bentz" Oregon 2nd District 2026` found a May 2026 Military Construction-VA appropriations vote (veterans) and an
April 2026 McMahon school visit (education), both T1 material not in the file; education is gapped, veterans is already covered.
No housing statements found. `"Chris Beck" Oregon 2nd Congressional District 2026` found only coverage already used or party/primary background.
No evidence of unequal effort.

## Corrections
- cliff-bentz-i2 (hydropower): passage is the office's press-release text, not a quote from Bentz; now attributed to the release.
  Cited URL is the energy issues page that lists the June 18, 2026 release.
- cliff-bentz-i3 (KOIN, data centers): "the country" replaced with the quoted wording; Bentz is quoted directly.
- cliff-bentz-i4 (Capital Chronicle, tax cuts): "2017" removed (not on the page); worded as Bentz's answer in the interview.
- cliff-bentz-i5 (RV parks): the "state and cities should ease regulations" half is the reporter's paraphrase and not in the excerpt;
  statement cut to Bentz's direct quote.
- cliff-bentz-i8 (water): see Speaker attribution below.
- cliff-bentz-i9 (Capital Chronicle, wildfire): added context that the remark was about timber provisions in the 2025 bill.
- cliff-bentz-i11 (KOBI, I-5): "cited federal backing" changed to "highlighted efforts to win federal funding".
- cliff-bentz-i13 (Herald and News): "these" covers the programs making up 71% of the federal budget (Social Security, Medicare, SNAP,
  veterans programs, earned income tax credits and others), not only Social Security and Medicare.
- chris-beck-i8: dropped "supporting and preserving working lands" (a separate bullet with different wording); kept the USDA bullet.
- chris-beck-i12: added the context (a proposed rural service corps).

## Speaker attribution (Bentz items flagged by the requester)
- i7 KPTV public safety: the fetch shows the sentence is a direct Bentz quote inside the KPTV article (Oct 10, 2025); statement credits KPTV. Verified.
- i5, i6, i14, i15 Mail Tribune (Yahoo copy, Oct 30-31, 2022): i5 RV quote is direct Bentz speech; i6 (homelessness models) and i15
  (pro-life) are reporter paraphrase, and the statements say "The Medford Mail Tribune reported that Bentz said", never his words.
- i8 water: the bentz.house.gov "In The News" item appears to be a republished summary of E&E News reporting (page links to it; author not named).
  Those are not his words and the page does not say he introduced the bill. Reworded to attribute to the item. Left at T1
  because it sits on the official site; reviewer should decide whether it belongs in the published set.
- i2 water/hydropower: office press release text, attributed to the release.
- i4, i9 Yahoo copy of the Capital Chronicle interview: both are Bentz's own answers in a Q&A transcript (Baumhardt's questions are not used).
- i10, i11 KOBI: reporter narration, attributed to KOBI.

## Rejections
- cliff-bentz-i14 (Mail Tribune, "I absolutely want to protect those programs"): the quote is Bentz's, but the single fetch did not
  confirm that "those programs" are Social Security and Medicare, and a follow-up search did not either.

## Identity checks (for review in /ops)
- Beck's campaign domain: the candidate file cites the Voters' Pamphlet PDF (`VP_G26-Book17_web.pdf`) as confirmation. WebFetch returned raw
  PDF data and could not read it, so this run could not re-confirm. The issues page is titled for Chris Beck for Congress and "District 2"
  and mentions Bentz; OPB (Sept 30, 2026) and search results describe him as the Democratic nominee against Bentz. Accepted.
- Bentz: `verified/candidates/cliff-bentz.json` has `website_url` null, so no T2 items were used.
- chris-beck-i2 and i5 (OPB) are by Jefferson Public Radio reporters, published on OPB. Fine as T3.
- Undated pages: Beck's campaign issues page has no date (statements imply none).

## Retry next week
- cliff-bentz social-security-medicare: find a source that ties the 2022 "protect those programs" quote to Social Security and Medicare.
- cliff-bentz veterans/education: May 2026 MilCon-VA appropriations vote and April 2026 McMahon school visit appeared in the spot-search.
- Re-check Beck's website via the Voters' Pamphlet in a readable form.

## Token use (from agent completion notices)
| Agent | Tokens | Tool calls |
|---|---|---|
| Collector, Cliff Bentz | 118.8k | 56 |
| Collector, Chris Beck | 93.3k | 22 |
| Verifier, both | see round-2 ledger | |
