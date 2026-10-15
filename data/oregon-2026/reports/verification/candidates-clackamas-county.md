# Verification report: Clackamas County candidates (Nov 3, 2026)

Verifier run 2026-10-14. Races: `clackamas-county-clerk`, `-treasurer`, `-sheriff`, `-commissioner-pos-2`, `-commissioner-pos-4`, `-justice-of-the-peace`, `or-circuit-court-5-pos-5`. There are 11 candidate files, and all of them pass `validate.py verified`.

**Totals: 96 items. 80 verified, 16 corrected, 0 rejected.**

**Main source.** Most items cite the Clackamas County Nov 3, 2026 Voters' Pamphlet (docs.clackamas.us/…/03f4f9db…). Every pamphlet excerpt was re-checked and found verbatim, and each candidate's Occupation and website lines match the files. The pamphlet shows commissioner candidates under "Position 2" (Shull, Savas) and "Position 4" (R W Smith, Helm).

**T2 domains.** All three are printed in the T1 county pamphlet, so all stay T2:
- **ClackamasVoice.org (McMullen):** pamphlet prints "More information and endorsements: ClackamasVoice.org". The site's paid-for-by line is "Voices for Catherine McMullen (21544)".
- **friendsofremysmith.org (R W Smith):** pamphlet prints "Learn more: friendsofremysmith.org". The site heading reads "R.W. Smith for Clackamas County Commissioner, Position 4". The site has no paid-for-by line; this is noted but not a red flag, because the T1 link confirms the domain.
- **votedianahelm.com (Helm):** pamphlet prints it. The site's paid-for-by line is "Diana Helm for County Commissioner".

**OPB questionnaire items (11 items: Shull 4, Savas 2, Smith 3, Helm 2).**
- **The candidates' own answers:** OPB's articles of 2026-05-05 (Holly Bartholomew) link each PDF under "Read the candidates' complete answers to OPB's questions". The articles are "ousted-clackamas-county-commissioners-challenge-incumbent" for Position 2 and "clackamas-county-commission-oregon" for Position 4.
- **Dates:** the PDFs themselves are undated. `published_at` 2026-05-05 matches the article date, and the PDF filenames carry 2026-05-04/05 timestamps.
- **Correction applied:** every statement said only "In an OPB candidate questionnaire". All 11 now begin "In answers to an OPB questionnaire for the May 2026 primary", so general-election readers see where the answers came from.

## clackamas-county-clerk
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| catherine-mcmullen | 8 | 2 | 0 |
| mark-reaksecker | 7 | 1 | 0 |

- **Corrections:**
  - McMullen b2: extended the excerpt to the full sentence, which includes "and since 2015 as an elections administrator".
  - McMullen b3: extended the excerpt to include "Hatfield School of Government".
  - Reaksecker b3: the statement expanded "CCRP" as "Clackamas County Republican Party". The pamphlet never spells out the acronym or names a party, so the statement was reworded to the pamphlet's wording.
- **Balance:** 10 items for McMullen against 8. The gap comes from McMullen's official county bio page and a KPTV (2026-09-02) quote. Reaksecker's site, MarkForCountyClerk.Com (printed in the pamphlet), blocks fetching, and he has no T3 coverage; both points are documented in his gaps. Effort looks equal.
- **Missed material:** none found in the spot-search.

## clackamas-county-treasurer (unopposed)
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| brian-nava | 8 | 0 | 0 |

- **Missed material:** none of substance. The county's ClackCo Works podcast (2026-03-14) features the Treasurer but is not campaign material.

## clackamas-county-sheriff
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| brad-oneil | 9 | 0 | 0 |
| james-rhodes | 9 | 1 | 0 |

- **Correction:** Rhodes b1 extended the excerpt to the full OPB sentence, which includes "following the surprise resignation of Sheriff Angela Brandenburg".
- **Incumbency:** Rhodes is the **appointed interim** sheriff.
  - OPB 2026-07-28: the board appointed him five days after Brandenburg's mid-term resignation, and he serves until a successor is sworn in after November.
  - clackamas.us lists "Sheriff James Rhodes".
  - `incumbent: true` is kept, meaning he holds the office now. Displays should say "appointed interim sheriff", not imply he won an election. O'Neil has `incumbent: false`, which is correct.
- **Balance:** 9 items against 10. Both draw on the pamphlet plus the same OPB 2026-10-09 article. Neither file uses its campaign site (both sites are printed in the pamphlet), which is symmetric.
- **Missed material:** possibly a T2 item from each campaign site. The OPB article also reports endorsements and fundraising, which are correctly excluded.

## clackamas-county-commissioner-pos-2
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| mark-shull | 6 | 4 | 0 |
| paul-savas | 8 | 2 | 0 |

- **Corrections:** OPB primary context added (see above).
- **Position:** clackamas.us/elections/localofficials.html lists "Paul Savas, County Commissioner, Position 2", which confirms both his incumbency and the position.
- **Balance:** 10 items each. Shull has no campaign website; OPB confirms "has no campaign website".
- **Missed material:** none in T1/T2/T3. Savas's electpaulsavas.com (printed in the pamphlet) is unused, but Savas already has 5 T1 positions.

## clackamas-county-commissioner-pos-4
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| rw-smith | 7 | 3 | 0 |
| diana-helm | 8 | 2 | 0 |

- **Corrections:**
  - OPB primary context added (see above).
  - Helm p7: the statement attributed the cost gap to the sheriff's office, but the excerpt didn't name the office. The preceding sentence of the same answer was added: "I fully support our Sheriff's Office, our deputies, and our jail."
  - Smith p7: the question's subject (sheriff's office funding) was added.
- **Position:** confirmed by two sources:
  - localofficials.html lists "Diana Helm, County Commissioner, Position 4".
  - The county release of 2025-05-19 says she was appointed to Position #4 through December 2026.
- **Same-name check (rw-smith):**
  - The ballot name "R W Smith", the pamphlet's link to friendsofremysmith.org, the site heading "R.W. Smith" and OPB's "R.W. Smith, an environmental consultant" all refer to one person, and the occupation matches the pamphlet.
  - Search results also surface former chair Tootie Smith, a different person, but nothing in the file comes from her.
- **Balance:** 10 items each, and each candidate has one T2 item.
- **Missed material:** none found.

## clackamas-county-justice-of-the-peace (unopposed)
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| kathleen-rastetter | 5 | 1 | 0 |

- **Correction:** b1 extended the excerpt to the full sentence, which includes "effective this past Jan. 1." (release dated 2026-01-15).
- **Incumbency:** the Governor appointed her effective 2026-01-01; the Governor's release is dated 2025-12-16. localofficials.html lists her as Justice of the Peace. `incumbent: true` is supported.
- **Missed material:** the Governor's release of 2025-12-16 (T1) has a little more bio (civil litigator, pro tem judge). It is optional.

## or-circuit-court-5-pos-5 (unopposed)
| Candidate | Verified | Corrected | Rejected |
|---|---|---|---|
| kara-brooks | 5 | 0 | 0 |

- **Incumbency:** the Governor's release (2026-08-07) supports the appointment but does not name a position number. `incumbent_source_url` was changed to the official ballot directive (multco.us, 2026-09-03), which prints "Kara A Brooks Incumbent" under "Judge of the Circuit Court, 5th District, Position 5".
- **Missed material:** her state voters' pamphlet statement. The verifier also could not reach it (the oregonvotes.gov PDF redirects), so the gap is confirmed.

## Inventory discrepancies (not edited; for `inventory_fixes.json`)
1. **`kathleen-rastetter`:** inventory has `incumbent: null`. Official sources support `true` (Governor appointment effective 2026-01-01; localofficials.html).
2. **`clackamas-county-commissioner-pos-2` and `-pos-4` notes:** both say the position number is "not stated" for Savas and Helm. localofficials.html states "Position 2" and "Position 4", so the notes should be updated and `incumbent_source_url` added for both.
3. **`clackamas-county-commissioner-pos-4`:** the seat is the remainder of an unexpired 4-year term (Jan 2027 to Dec 2028). Sources: the May 19, 2026 county ballot says "Completion of Unexpired 4 Year Term", and the county release of 2025-05-19 gives the dates. The inventory has no note of this.
4. **`clackamas-county-sheriff`:** the note could add that Rhodes is the board-appointed interim sheriff (OPB 2026-07-28) and that the seat is on the ballot for a full four-year term (county elections page).
5. **Completeness:** every candidate on the county general-election page and the ballot directive has a file, and the official names match ("Brian T Nava", "R W Smith", "Kara A Brooks"). No file is for anyone off the ballot.
