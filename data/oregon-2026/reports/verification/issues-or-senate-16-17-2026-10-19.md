# Issue sweep verification: Oregon Senate 16 and 17 (or-senate-16, or-senate-17), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget; each item checked against its source in one fetch per URL.
New items import as drafts; they show in /ops for review before anything is published.

## Race: or-senate-16

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Courtney Bangs | 11 | 11 T2 | 10 | 1 | 0 | 11 |
| Melisa Finkle | 1 | 1 T3 | 0 | 1 | 0 | 20 |
| Rachel Armitage | 2 | 2 T3 | 1 | 1 | 0 | 19 |

### Balance
Bangs has a full campaign priorities page (11 T2 items). Finkle has no campaign site on file and only one press item. Armitage's only material is the Tillamook County Pioneer filing story. The spread reflects available material, not unequal effort; the gaps are documented. Voters' Pamphlet statements (T1) were not collected for any of the three and could be added in a later sweep, which would help balance. Armitage's candidate file lists SenateDistrict16.com, but no item uses it.

### Corrections
- courtney-bangs-i3 (Second Amendment): "refers to" understated the page, which says Courtney "will always staunchly defend property rights and our Constitutional Second Amendment right to bear arms". Reworded to the action, attributed to the site and its public safety section; "staunchly" left out.
- melisa-finkle-i1: the excerpt lists three subjects (care safety, rural infrastructure, emergency preparedness) but the statement named only the first. Reworded to the full list, attributed to the Pioneer (editor byline, article of 2026-08-18).
- rachel-armitage-i2 (infrastructure): excerpt widened to include the subject and verb. The statement was already attributed to the Pioneer as a report about her earlier Senate service. The article gives no date for the funding, and none is added.

### Rejections
None.

### Specific checks
- Bangs domain: courtneybangs.com is the domain in her candidate file, sourced to the 2026 Voters' Pamphlet. The page header reads "Courtney Bangs for State Senate" and the footer "Oregon State Senate - District 16". I did not re-open the pamphlet PDF this run.
- Bangs abortion item (i10): verified. The line sits in the "Human & Fundamental Rights" section. Surrounding text says she advocates for vulnerable children, born and unborn, and supports women facing unplanned pregnancies through prenatal care, adoption services and counseling. The statement says only that she would ensure those women have the support they need. It adds no policy stance beyond that. A reader may want the page's wider framing; it is not included.
- Finkle: attributed to the Pioneer in the statement. The article's byline is "Editor" only. The article says her background in public-sector oversight shapes the bills she hopes to develop.
- Armitage education (i1): verified. It is a direct quote from her filing statement; the excerpt ends mid-sentence ("good schools"), and the sentence then goes on to a government that works for everyone. The statement lists the items quoted and claims nothing more, so the cut is not misleading.

### Identity checks
- Finkle: article names her as an independent candidate for Senate District 16, a public-sector investigator in Rockaway Beach. Match.
- Armitage: article reports she filed for the open SD 16 seat on 2026-02-18 and that she is a former appointed state senator. Match.
- Bangs: site names her as the SD 16 candidate. Match.

## Race: or-senate-17

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Lisa Reynolds (incumbent per candidate file) | 5 | 5 T2 | 3 | 2 | 0 | 16 |
| John A N Chee | 0 | none | 0 | 0 | 0 | 27 |

### Balance
Reynolds has a campaign priorities page; Chee has no site or coverage on file, and all of his issues are gapped (5 searched, 22 not searched for low coverage). The disparity is a material gap, not documented unequal effort, but Chee got less search depth (most issues "not searched"). A later sweep should look for a pamphlet statement and any campaign presence for him.

### Corrections
- lisa-reynolds-i3 (childcare): loose fit. The page names "childcare challenges" only as one example of poverty-related stress under End Child Poverty ("Lisa advocates for upstream investments to mitigate the stress of poverty (hunger, housing insecurity, childcare challenges)") and describes no childcare policy. Topic changed from childcare to social-services; statement reworded to the page text. Childcare is added to her gaps.
- lisa-reynolds-i5 (abortion): trailing comma trimmed from the excerpt. The page continues "thanks to 2023's HB 2002", which the statement does not claim.

### Rejections
None.

### Identity checks
- Reynolds: site is lisafororegon.com, the domain in her candidate file (Voters' Pamphlet). Content is from her campaign priorities page. Incumbent flag taken from the candidate file, not re-checked this run.
- Chee: nothing to check (no items).

## Retry next week
- Chee: look for a campaign site, pamphlet statement or press coverage.
- All five: collect Voters' Pamphlet statements (T1).
- Finkle: look for a campaign site and confirm its domain.
- Reynolds: look for T1 legislative-record material on childcare.

## Token use
Verifier (Sonnet): about 95,000 tokens and 25 tool calls (estimate). Collectors: about 80,000 tokens each on average (see round 3 ledger).
