# Issue sweep verification: Oregon Senate 19 and 20 (or-senate-19, or-senate-20), 2026-10-19

Protocol: `pipeline/ISSUE_SWEEP.md`, `pipeline/VERIFIER.md`. Optional spot-searches skipped for budget; each item checked against its source in one fetch per URL.
New items import as drafts; they show in /ops for review before anything is published.

## Race: or-senate-19

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Rob Wagner (incumbent per candidate file) | 12 | 8 T2, 4 T1 | 7 | 5 | 0 | 10 |
| Mary Dirksen | 3 | 3 T2 | 2 | 1 | 0 | 22 |

### Balance
Wagner has a full priorities page plus four dated T1 Legislature press-release items; Dirksen has a short campaign site (3 items, all T2). The spread reflects available material, not unequal effort; Dirksen's gaps are documented, with most issues "not searched (low coverage)" or "nothing found". Voters' Pamphlet statements (T1) were not collected for either and could be added later.

### Corrections
- mary-dirksen-i3: loose fit for addiction-mental-health. The line sits under "Public Safety & Victims' Rights" and states no treatment or mental-health policy. Topic changed to public-safety, statement names the section and keeps "our streets". An addiction-mental-health gap was added.
- rob-wagner-i5 (data centers): excerpt starts mid-sentence and the actor behind "made sure" was not visible, so "were made to pay" was an unstated claim. Reworded to quote the line and its section (Defending our environment).
- rob-wagner-i9: the press release is 2023-03-21 (text extracted locally from the PDF; WebFetch could not read it). The quote is "we worked across the aisle and with our partners in the House and Governor's office"; the statement had said "the Legislature worked". Reworded to the speaker's "we"; year kept.
- rob-wagner-i10: statement dropped the $132 million behavioral health workforce investment and "other behavioral health issues". Reworded to the full excerpt; March 2022 kept.
- rob-wagner-i11: the excerpt ends a sentence about targeted investments to drive down everyday costs. Reworded to say that; March 2022 kept.
- rob-wagner-i12: the page says building an economy for working families and small businesses "meant reducing barriers"; it does not say legislation "included" it. Reworded; March 2022 kept.

### Rejections
None.

### Specific checks
- Wagner campaign-page quotes (i1-i8): all eight checked verbatim against the page. i8 matches with the curly apostrophe in "I’ve"; the sentence continues past the trailing comma ("and was chief author and sponsor of the legislation that created the Task Force on Community Safety and Firearm Suicide Prevention"), which the statement does not claim.
- Wagner year labels: i9 (March 2023), i10, i11, i12 (March 2022) all state their year, as does the PDF date (2023-03-21 and 2022-03-04).
- Dirksen i1, i2: verified. i2 is the start of a longer sentence ("...so Oregon can become a place where companies stop leaving and start choosing again"); the statement claims only the quoted part.

### Identity checks
- Dirksen: site is marydirksen.com, the domain in her candidate file (Voters' Pamphlet); page identifies her campaign for State Senate District 19. Match.
- Wagner: robwagnerfororegon.com is the domain in his candidate file (Voters' Pamphlet). The page does not mention District 19; it calls him "Senate President Rob Wagner" and is paid for by "friends of rob wagner (18396)". Match on name and office; the district rests on the pamphlet-confirmed domain. Incumbent flag taken from the candidate file, not re-checked.
- Press releases: 2023 release is from the Office of the Senate President (Wagner, D-Lake Oswego); 2022 release is the Oregon Senate Democrats statement by Senate Majority Leader Rob Wagner. Match.

## Race: or-senate-20

| Candidate | New items | Tiers | Verified | Corrected | Rejected | Issues gapped |
|---|---|---|---|---|---|---|
| Mark Meek (incumbent per candidate file) | 12 | 12 T2 | 10 | 2 | 0 | 11 |
| Michele Stroh | 6 | 6 T2 | 1 | 4 | 1 | 17 |

### Balance
Meek has a detailed campaign site (12 T2 items); Stroh has a short site (6 items, one rejected as a duplicate, 5 usable). Neither has T1 or T3 material in this sweep. The spread reflects site depth, not unequal effort. Voters' Pamphlet statements (T1) were not collected for either.

### Corrections
- mark-meek-i2 (Child Tax Credit): the phrase is in the opening letter, which is first person; the page is third person elsewhere. "Is credited with" mischaracterised the voice and the excerpt does not show the subject. Reworded to say the opening letter refers to putting money back into families' pockets with the credit. Excerpt uses the page's curly apostrophe.
- mark-meek-i6 (childcare): shares one excerpt with i1. The excerpt names childcare as one of four costs and describes no childcare-specific measure. Statement now names all four and says so. i1 (cost-of-living) claims the four costs and nothing more. The two overlap; /ops reviewers may drop i6.
- michele-stroh-i2 (economy): a general opening line of "A call for common-sense governance", not a position. Reworded to say it is the section's opening line.
- michele-stroh-i3 (homelessness): "the crisis" is homelessness only from section context. Statement names the Real Results on Homelessness section and quotes the line.
- michele-stroh-i4 (addiction treatment): the excerpt is a fragment in a section that lists several approaches, and a heading was not confirmed. Reworded to "includes treatment for addiction among its approaches".
- michele-stroh-i5 (childcare): "they" replaced with "she"; it is a first-person line from her "Hey, I'm Michele Stroh" bio section.

### Rejections
- michele-stroh-i6 (local-business): second half of the same sentence as i5; adds nothing beyond her childcare story. A local-business gap was added.

### Specific checks
- Meek: every statement uses "described as", "credited with" or attributes the sentence to the page ("priorities page states"), consistent with the third-person voice. All 12 excerpts found verbatim; i2 differs only in apostrophe type.
- Meek i1/i6: see Corrections.
- Stroh i1: verbatim, including the curly apostrophe in "Salem’s".

### Identity checks
- Meek: votemarkmeek.com is the domain in his candidate file (Voters' Pamphlet); page states he has served District 20 since 2023. Match. Incumbent flag consistent with the page.
- Stroh: votestroh.com is the domain in her candidate file (Voters' Pamphlet); page is her campaign for Senate District 20, naming Oregon City, Gladstone, Happy Valley and Milwaukie. Match.

## Retry next week
- All four: collect Voters' Pamphlet statements (T1).
- Dirksen: look for treatment or mental-health, housing and homelessness material.
- Wagner: look for T1 material on taxes, water, wildfire and labor.
- Meek: look for T1 legislative-record items.
- Stroh: look for local-business policy, healthcare and press coverage.

## Token use
Verifier (Sonnet): about 100,000 tokens and 30 tool calls (estimate). Collectors: about 85,000 tokens each on average (see round 3 ledger).
