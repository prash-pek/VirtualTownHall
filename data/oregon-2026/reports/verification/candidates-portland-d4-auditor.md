# Verification report: Portland City Auditor and Council District 4 (Nov 3, 2026)

Verifier run 2026-10-14. Races: `portland-auditor`, `portland-council-d4`. 13 candidate files. All outputs pass `validate.py verified`.

**Totals: 119 items. 77 verified, 42 corrected, 0 rejected.** Every cited URL was re-fetched. Every excerpt was found on its page, apart from the two small excerpt fixes listed below.

**Rules applied across both races:**
- **Pronouns:** only Rede (she/her), Green (he/him), Clark (she/her) and Zimmerman (he/him) state pronouns, on their portland.gov pages. The other nine candidates state none in their pamphlet statements or filing forms. For those nine, "he/his/her" was replaced with the name or they/them. This change accounts for 31 of the 42 corrections; none of those items had any other problem.
- **Tier:** stated priorities on an incumbent's portland.gov office page are T2 and bio facts on that page are T1, the same as in earlier batches.

## portland-auditor
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| simone-rede | 8 | 3 | 0 |

- **Corrections:** p1, p2 and p3 sit under "As your accountability champion I have worked to:". They describe past work, so the statements were changed from future aims to "has worked to".
- **File-level checks:**
  - Incumbent `true` is confirmed by portland.gov/auditor/simone-rede (re-elected Nov 2024).
  - simoneforauditor.com is printed in her pamphlet statement.
- **Completeness:** unopposed. The ballot content lists one candidate. portland.gov's 2026 city candidates page lists no write-in or withdrawn Auditor candidates.
- **Balance:** not applicable (single candidate).

## portland-council-d4
| Candidate | Verified | Corrected | Rejected | Items (T1/T2/T3) |
|---|---|---|---|---|
| matt-schulte | 1 | 7 | 0 | 6/0/2 |
| jeremy-beausoleil-smith | 7 | 5 | 0 | 10/0/2 |
| john-goldsmith | 3 | 2 | 0 | 3/0/2 |
| mitch-green | 10 | 1 | 0 | 8/1/2 |
| olivia-clark | 6 | 0 | 0 | 3/0/3 |
| jayne-cronlund | 9 | 1 | 0 | 7/0/3 |
| john-mcdonald | 5 | 6 | 0 | 10/0/1 |
| eric-zimmerman | 5 | 3 | 0 | 3/1/4 |
| jamey-evenstar | 8 | 0 | 0 | 6/0/2 |
| timothy-anderson | 6 | 2 | 0 | 6/0/2 |
| eli-arnold | 5 | 5 | 0 | 8/0/2 |
| josh-leake | 4 | 7 | 0 | 7/0/4 |

**Corrections other than pronouns:**
- Excerpt fixes:
  - Schulte p4: the page reads "ReBoot, connects". The missing comma was added to the excerpt.
  - Leake b3: a trailing ";" that is not on the page was removed.
- Tier fixes: Green p7 and Zimmerman p1 are their own priorities on their portland.gov pages, so T1 was changed to T2.
- Attribution fixes:
  - Zimmerman p4 and p5: the Mercury quotes these from his campaign website, not from an interview.
  - Schulte p5 and p6: the Mercury quotes these from his candidate questionnaire.
  - Goldsmith b4: the Mercury takes this self-description from a Facebook video.
- Paraphrase fix: Leake p6 now says the Mercury reports "end the drug emergency" as his top priority.

**Balance:**
- Most candidates have 8–12 items, built the same way: T1 pamphlet statement and filing items, plus T3 items from the OPB 2026-10-07 and Mercury 2026-09-11 race overviews. Both articles cover all 12 candidates.
- Goldsmith has 5 bio items and no positions. This is a non-filer gap, not missed effort. The pamphlet's candidate index lists "John J Goldsmith*", and its footnote says the asterisk marks candidates who "did not file a candidate statement". OPB also reports that he did not submit information to the voter guide.
- Clark (6 items) and Zimmerman (8 items, few T1 positions) have thin profiles because of a source-access gap:
  - Their individual pamphlet statement PDFs return no machine-readable text.
  - The text of the full county pamphlet is cut off at about 104k characters, before the City pages M-52 to M-66.
  - Clark's portland.gov page lists no priorities.
  - Not unequal effort, but no candidate's campaign site was used as a T2 source. For these two, their confirmed sites (oliviaforportland.com, ez4pdx.com) are the obvious way to fill the gap.
- Filing-form gaps were confirmed. The AUD-120 PDFs for Schulte, Green and Beausoleil Smith have no candidate-entered text or no machine-readable text at all. Anderson's form has only an unlabelled list of service.

**Campaign websites:** every domain is printed in a pamphlet statement or AUD-120:
- Pamphlet statements: mattschulte.org, jeremy4pdx.com, mitch4portland.com, jayneforaflourishingfuture.com, evenstarforportland.com, EliforPortland.com, JoshforPortland.com.
- AUD-120 filing forms: johngoldsmith4pdx.net, OliviaforPortland.com, ez4pdx.com.
- McDonald's `website_url` null is correct: no website appears in his pamphlet statement or filing form.
- Anderson's `website_url` null is correct: his pamphlet statement prints only a LinkedIn link.

**Incumbency:** portland.gov/council lists the D4 councilors as Eric Zimmerman, Mitch Green and Olivia Clark, so all three are `true`. The other nine are `false`, and none appears on the council roster.

**Names and order:** the ballot content (RCV) order matches the inventory: Schulte, Beausoleil Smith, John J Goldsmith, Green, Clark, Cronlund, McDonald, Zimmerman, Evenstar, Timothy (TJ) Anderson, Arnold, Leake. File names match the ballot.

**Possible missed material** (found by spot searches, not used by the collector, content not checked):
- KPTV, 2026-09-25: "Analysts point to shifting dynamics in city's new government as District 4 race heats up".
- Willamette Week, 2025-11-08: "Portland cop Eli Arnold will run for City Council again" (Arnold).
- Willamette Week, 2026-09-18: a story on an outside committee attacking Green. It is context only, not evidence of his positions.

## Inventory discrepancies
- **Missing certified write-in:** portland.gov's 2026 city candidates page lists **Rachelle A. Dixon** as a "Certified Write-In Candidate" for Councilor District 4 (filing form AUD-141). She is not in the inventory. She is not on the printed ballot content, and no file was created.
- **No other discrepancies:**
  - portland.gov marks Genevieve Rose Greenwood and Rebekah Morgan as ineligible for D4. Their exclusion from the inventory is correct.
  - All 12 ballot candidates and the single Auditor candidate have files.
