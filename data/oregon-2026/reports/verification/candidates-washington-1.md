# Verification report: Washington County batch 1 (Nov 3, 2026)

Verifier run 2026-10-14. Races: `washington-county-commissioner-at-large`, `washington-county-commissioner-d4`, `beaverton-council-pos-1`, `banks-mayor`, `banks-council-pos-1`, `-pos-3`, `-pos-5`, `cornelius-mayor`, `cornelius-council`, `durham-council`. 18 candidate files. All outputs pass `validate.py verified`.

**Totals: 129 items. 122 verified, 7 corrected, 0 rejected.**

**Sources and method:**
- Every cited URL was re-fetched. Pamphlet excerpts were checked in the county Nov 3, 2026 Voters' Pamphlet, against each candidate's own statement and contest heading.
- **Banks Post is accepted as T3.** It is an independently owned Banks newspaper, founded 2017. Its articles are bylined (Chas Hundley) and dated. It follows the SPJ Code of Ethics, has a corrections policy and an AI policy, and makes no endorsements (bankspost.com/about).
- **KPTV is accepted as T3** (bylined, dated).
- **Unreadable official PDFs:** the Banks, Cornelius and Durham certified-candidate PDFs on washingtoncountyor.gov are image-only and returned no text. Names and incumbency markers from those lists could not be machine-verified.

## washington-county-commissioner-at-large (Chair seat)
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| nafisa-fai | 12 | 0 | 0 |
| pam-treece | 12 | 0 | 0 |

- **Incumbency:**
  - Chair Kathryn Harrington resigned. Her last day was Oct 2, 2026 (OPB, 2026-09-21).
  - The county BCC page names "Chair Pro Tem Jason Snider". OPB says Vice Chair Jerry Willey leads meetings.
  - Fai holds District 1 and Treece holds District 2, so incumbent=false is correct for both.
- **Balance:** equal. Each has 4 bio items and 8 positions, from pamphlet plus OPB.
- **Missed material:** OPB 2026-05-19 (runoff) and KOIN chair-primary coverage were used for neither candidate.

## washington-county-commissioner-d4
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| kipperlyn-sinclair | 10 | 0 | 0 |
| steve-callaway | 12 | 0 | 0 |

- **Incumbency:** the seat is held by Vice Chair Jerry Willey, who is not running. incumbent=false is correct for both.
- **Balance:** comparable. Sinclair did not answer OPB's questionnaire, which is documented.
- **Missed material:** Banks Post candidacy profiles of both candidates, and OPB 2026-05-08 "9 newcomers vie for 2 seats".

## beaverton-council-pos-1
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| evelyn-kocher | 9 | 1 | 0 |
| rachel-philip | 8 | 0 | 0 |

- **Correction:** Kocher b4. The excerpt ran into the next list entry ("…Commission, City of Beaverton"). It was trimmed to the HECC entry.
- **Incumbency:** the Position 1 page names the holder as "Ashley". incumbent=false is correct for both.
- **Balance:** balanced. The spot-search found no missed T1–T3 material.

## banks-mayor
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| jimmy-bogroff | 8 | 0 | 0 |
| marsha-kirk | 6 | 0 | 0 |

- **Incumbency:**
  - Kirk is true. The source was changed to the 2026 pamphlet ("Mayor, 2025–present").
  - Bogroff is false. The source was changed to the pamphlet.
- **Balance:** Kirk has fewer positions because her site blocked fetching and her pamphlet statement is general. This is documented.
- **Possible missed material:** KOIN "Mayor Monday: Community updates from Banks", which was not fetched.

## banks-council-pos-1
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| stewart-terrall | 7 | 1 | 0 |
| stephanie-jones | 7 | 1 | 0 |

- **Corrections:**
  - Terrall p2: the excerpt was extended from mid-sentence to "…receive adequate service".
  - Jones b2: the excerpt did not support "appointed to Kirk's seat". It was replaced with the article's appointment sentence.
- **Incumbency:**
  - Terrall is false, sourced to the pamphlet ("Prior Governmental Experience: None").
  - **Jones was changed from true to null.** The Feb 11, 2025 minutes list her as a councilor but give no position numbers and are 20 months old. Only the Banks Post (T3) says she holds CC1.
- **Balance:** balanced.

## banks-council-pos-3
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| debra-berry | 2 | 1 | 0 |
| cody-kollar | 0 | 0 | 0 |

- **Open seat:** incumbent Niki Walters did not file (Banks Post, 2026-08-18).
- **Correction:** Berry b1. "Different council seat" was not in the excerpt, so the statement was reworded.
- **Berry's items:**
  - All three are from her October 2024 run for Position 6, and the statements are dated.
  - Same-name caveat: the identity is consistent (Debra L. Berry of Banks), but no official source confirms it.
- **Kollar:** the spot-search found only the Banks Post filing notice and no same-name material.
- **Balance:** the disparity reflects the public record. Neither candidate filed a pamphlet statement.

## banks-council-pos-5
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| pearcia-bogroff | 6 | 1 | 0 |
| megan-blake | 0 | 0 | 0 |

- **Correction:** Bogroff b2. The statement claimed more than the excerpt ("term expires Dec. 31, 2026") and was reworded.
- **Incumbency:**
  - **Bogroff was changed from true to null and Blake from false to null.** The 2025 minutes do not show who holds Position 5.
  - The Banks Post (T3, 2026-08-18) says Bogroff is the incumbent.
- **Balance:** Blake has no pamphlet statement, website or coverage. This is documented.

## cornelius-mayor
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| jeffrey-dalin | 9 | 0 | 0 |

- **Incumbency:** true, confirmed on the city council page.
- **Possible missed material:** the city's "State of the City 2026" page.

## cornelius-council
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| edgar-baker | 9 | 0 | 0 |

- **Incumbency:** false is correct. He is a former councilor and is not on the current council page.
- **Vote-for number (inventory has seats=2):** not confirmable from 2026 official text.
  - The certified-candidate PDF is image-only, and the pamphlet prints no "vote for".
  - The city's Aug 2022 Gazette shows two 4-year council terms (Colgan, Hernandez) running through Dec 31, 2026. This is consistent with 2 but needs the ballot or a readable certified list.

## durham-council
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| joshua-drake | 3 | 0 | 0 |
| sean-lee | 2 | 2 | 0 |

- **Corrections:** Lee b1 and p1. Both excerpts ended mid-word and were trimmed to word boundaries.
- **Seats:** seats=2 is confirmed by the city ("voters in Durham will fill two City Council positions").
- **Incumbency:** both are sitting councilors (council page; Jan 27, 2026 agenda), so true is correct.
- **Balance:** comparable.
- **Completeness:** the candidate list cannot be checked against a readable official source. The county PDF is image-only, and the city pages name no candidates.

## Inventory discrepancies / proposed fixes
- **washington-county-commissioner-at-large notes:** the note "pamphlet lists Kathryn Harrington as current Chair" is outdated. She resigned effective Oct 2, 2026 (OPB 2026-09-21; county BCC page names Chair Pro Tem Jason Snider). The contest is the Chair seat (pamphlet heading: "Commissioner At-Large").
- **washington-county-commissioner-d4 notes:** add that Willey is also Vice Chair.
- **banks-council-pos-3:** open seat. Incumbent Niki Walters did not file (Banks Post 2026-08-18).
- **Banks position labels:** Banks Post uses CC1, CC3 and CC5.
- **cornelius-council seats=2:** unconfirmed by 2026 official text. The 2022 city data is consistent with 2.
- **Incumbency:** Jones and P. Bogroff are now null, pending a readable certified-candidate list.
