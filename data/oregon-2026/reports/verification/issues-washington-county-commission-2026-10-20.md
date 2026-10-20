# Issue sweep verification: Washington County Commission (at-large and D4), 2026-10-20

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget; each item checked against its source in one fetch per URL. Six pages fetched: nafisaforwashingtoncounty.com (home and /priorities), OPB, pamforwashingtoncounty.com, kipperlynsinclair.com, The Banks Post.
New items import as drafts; they show in /ops for review. Items marked `low_confidence` appear under "Needs a look".

## Race 1: Washington County Commissioner At-Large (washington-county-commissioner-at-large)

**Race label for a human to check:** OPB ("...race for Washington County chair") and KOIN describe Fai vs Treece as the county CHAIR runoff. Both campaign sites are titled "for Washington County Chair" ("Pam Treece for Washington County Chair"; Fai's page title says Washington County Chair). Our race id says commissioner-at-large. Race ids were not changed; someone should confirm the office name and id against the official ballot/Elections Division listing.

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Nafisa Fai | 12 | 11 T2, 1 T3 | 12 | 0 | 0 | 8 |
| Pam Treece | 3 | 3 T2 | 3 | 0 | 0 | 17 |

### Balance
Fai 12 vs Treece 3. Treece's site is one page with few policy statements, but 11 of her 17 gaps are "not searched (low coverage)", so search depth was less than for Fai. A later sweep should look for Treece forum answers and news (OPB's article covers both).

### Corrections
None.

### Rejections
None.

### Specific checks
- Fai i2 (OPB 2026-05-07): quote present; Fai is the speaker, discussing farmland protection and growth (paragraph before says soils and farm economy must be protected while the county is home to innovative companies, and the balance has not been found). Topic "economy" is a loose fit (closer to agriculture/land use); kept, `low_confidence`.
- Fai i5 (/priorities): "Protect funding for essential services, including housing, transit, and health care" is a bullet "Protect Essential Services" under "Investing in Washington County's future", set against the $20.5M budget shortfall. It is a budget-protection line, not a health care policy; statement is faithful, kept with `low_confidence` for topic fit.
- Fai i3 and i5 are on /priorities (i3 under "Lower housing and utility costs for working families"); the other ten are on the home page (i1 and i9 under "Investing in Washington County's Future", i4 "Housing that Helps Us Thrive", i6 "More Solutions for Community Safety", i7/i8/i9 "A Clean and Healthy Environment for Everyone", i10 "Transportation that Connects Us", i11 the intro banner). i11 is third-person site copy ("Nafisa's goal..."); statement attributes it to the campaign site.
- Treece: all three excerpts present on the home page (i1 under "Homelessness"). i2 and i3 are fragments of longer sentences; statements stay within the fragment. The site writes about her in third person.

## Race 2: Washington County Commissioner District 4 (washington-county-commissioner-d4)

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Kipperlyn Sinclair | 9 | 9 T2 | 9 | 0 | 0 | 12 |
| Steve Callaway | 4 | 4 T3 | 2 | 2 | 0 | 17 |

### Balance
Sinclair 9 (campaign site) vs Callaway 4 (one Banks Post article). The collector reported electstevecallaway.com returned empty content to WebFetch, so no Callaway campaign material; 10 of his 17 gaps are "not searched (low coverage)". Effort looks unequal; retry below. Callaway's `website_url` was not re-confirmed.

### Corrections
- steve-callaway-i2 (water): the quote is direct Callaway speech, but the page ties it to residents being squeezed; the Clean Water Services link is the reporter's context (a low-income rate for CWS customers struggling with bills is named as a priority). Statement reworded to say he named a low-income CWS rate as a priority and said the county needs to begin to take real actions to provide some relief. `low_confidence`: context came from a WebFetch summary, not a verbatim read of the surrounding paragraph.
- steve-callaway-i3 (elections-democracy): quote present, said in criticism of Clean Water Services after citing former chair Andy Duyck as a model of transparency. Removed "a concern behind his interest in county government", which the page as read does not support. Topic is a loose fit (agency transparency); `low_confidence`.

### Rejections
None.

### Specific checks
- Sinclair: all 9 excerpts present on kipperlynsinclair.com, a page for Washington County Commissioner, District 4 (i1, i2 "Why I'm Running"; i3, i9 "A Leader for People"; i4 "Invest Local"; i5 "Stop the Sprawl"; i6 "Protect Due Process & Public Safety"; i7, i8 "Diversify Our Economy"). i3, i4, i8, i9 are fragments of longer sentences; i8 is the tail of the sentence that holds i7. Statements stay within the fragments.
  - i2: the excerpt begins "This unchecked growth"; the data center antecedent was not confirmed in the single fetch, so `low_confidence`.
  - i8 (infrastructure) and i9 (elections-democracy) are loose topic fits; kept with `low_confidence`.
- Callaway: article by Chas Hundley, published 2026-05-09 (updated 2026-05-10), matches. i1 and i4 are direct quotes, verified (i4's excerpt ends with a comma, as on the page). i2 and i3 corrected as above.

### Identity checks
- Fai and Treece: both sites identify them as current county commissioners running for Chair; OPB names both. Campaign domains not re-checked against pamphlet this run.
- Sinclair: page names the office and district. Callaway: Banks Post names the District 4 seat.
- Not re-checked this run: candidate-file `website_url` pages and `incumbent` flags.

## Retry next week
- Treece: forum, OPB/KOIN or Oregonian material; 11 unsearched issues.
- Fai: education, childcare, gun-policy, water, abortion, veterans, elections-democracy, social-services; a stronger agriculture source for the farmland item.
- Callaway: reach electstevecallaway.com; other news and forum material; recheck the CWS context in the Banks Post article.
- Sinclair: confirm the data center antecedent for i2; homelessness, healthcare, transportation gaps.
- Human check of the "chair" vs "commissioner-at-large" race label.

## Token use
Verifier (Sonnet): about 95,000 tokens and 20 tool calls (estimate). Collectors: about 85,000 tokens each on average (see round 3 ledger).
