# Verification report: Multnomah & Washington county local measures (Nov 3, 2026)

Verifier run 2026-10-14. Inputs: stripped collector files. Every cited URL was re-fetched with WebFetch. Outputs are in `verified/measures/`, and all nine pass `validate.py verified`.

## Cross-cutting finding: filed pamphlet arguments the collector missed

The collector reported the Multnomah County Voters' Pamphlet PDF as truncated before the measures section. That is true: text extraction stops at M-33 to M-34, and the large-print edition stops at page 43. However, the **Multnomah Military & Overseas Online Voters' Guide** (https://multco.us/info/military-overseas-online-voters-guide-november-2026-election) links each measure's filed arguments as separate PDFs. All of them are scanned images with no machine-readable text, so their authors and content could not be verified. They are listed here as completeness gaps; no items were added.

| Measure | Filed arguments (URL) | Represented in file? |
|---|---|---|
| 26-267 Portland | In favor (15): https://multco.us/file/26-267_favor_01-15.pdf/download; in opposition (15): https://multco.us/file/26-267_opposition_01-15.pdf/download. Also in the Washington County VP, WC-51 to WC-54 | No |
| 26-265 Troutdale levy | In opposition (1): https://multco.us/file/26-265_opposition_01.pdf/download; none in favor | No. The collector's gap ("No NO arguments found… in any reachable official source") is inaccurate |
| 26-266 Troutdale advisory | In opposition (3): https://multco.us/file/26-266_opposition_01-03.pdf/download; none in favor | No |
| 26-268 Reynolds SD bond | In favor (6): https://multco.us/file/26-268_favor_01-06.pdf/download; none in opposition | No |
| 26-269 Burlington WD | None listed | n/a |
| 34-355 Hillsboro SD | None listed in Multnomah; Washington County VP pp. WC-59 to WC-65 (7 pages), which likely includes filed arguments | Unknown |

The Washington County Voters' Pamphlet (https://www.washingtoncountyor.gov/elections/documents/november-3-2026-voters-pamphlet/download?inline) extracts only to about WC-30. Its measure index lists: 3-641 Wilsonville WC-47 to 50; 26-267 WC-51 to 54; 34-352 Banks WC-55; 34-353 Forest Grove WC-56; 34-354 King City WC-57 to 58; 34-355 Hillsboro WC-59 to 65. I found no separate argument files for Washington County. Page counts suggest arguments were filed for Hillsboro (and possibly King City). Banks and Forest Grove, at one page each, probably have none. None of this is verified.

**Recommendation:** OCR or read these PDFs manually so the filed arguments can be added. That would fix the imbalance in 26-265 and 26-268, which today rests only on press and explanatory text.

## Per measure

### portland-26-267: 3 verified, 3 corrected, 0 rejected
- Fiscal: $16.4M (FY27-28) and $17.0M (FY28-29) confirmed in the official summary. Ballot label, summary, yes/no verified.
- y1 corrected: the statement said "push back on cuts", but the excerpt says only "push back".
- y2 corrected: the statement included "public trust crisis", which is on the page but not in the excerpt.
- n1 corrected: the excerpt did not support "permanent set-aside in charter". It was replaced with adjacent verbatim text from the same Wilson quote.
- Balance: 3 YES / 3 NO, all T3 press (WW, OPB). There is no official explanatory statement (confirmed). 30 filed pamphlet arguments are not represented (see table).

### troutdale-26-265: 2 verified, 0 corrected, 0 rejected (fields: summary and fiscal_impact corrected)
- Fiscal: all five collection estimates, $267,800 and $428.48 confirmed. The official summary itself states the $300 annual fee and the ~$128.48 net increase, so the KATU reliance was removed. The summary was clarified to say the $25 fee is per month.
- Balance: 2 YES (1 official explanatory text, 1 KATU press) / 0 NO. A filed opposition argument exists but was missed.

### troutdale-26-266: 8 verified, 0 corrected, 0 rejected (field: fiscal_impact corrected to add the official cost caveat)
- Balance: 4 YES (2 explanatory, 2 KATU) / 4 NO (2 explanatory, 2 KATU). Count and tier match. NO speaker Sgt. Zwick is the deputies' union president, an interested party whose role is attributed. 3 filed opposition arguments are not represented.

### reynolds-sd-7-26-268: 2 verified, 0 corrected, 0 rejected
- Fiscal: $162.5M principal, $1.62 per $1,000 with no increase expected, and $8,168,000 state match all confirmed.
- Balance: 2 YES (both explanatory text) / 0 NO. The NO gap is accurate. 6 filed favor arguments are not represented.

### burlington-water-district-26-269: 2 verified, 0 corrected, 0 rejected
- Fiscal: all figures match the official text. The official "average of $87,029" is inconsistent with the official yearly figures, which average about $89,640. It is reproduced faithfully and flagged.
- Balance: 2 YES (both explanatory text) / 0 NO. No filed arguments on either side (confirmed).

### hillsboro-sd-1j-34-355: 0 items (all fields verified)
- Fiscal: $430M, $1.84 per $1,000, 21-year series and $6.1M match confirmed against the Multnomah sample ballot. The Washington County PDF is a scan.
- Balance: 0 / 0, gaps documented. Pamphlet arguments are likely at WC-59 to 65 but unverified. The district's own bond pages and KPTV (2026-05-28) were not used.

### banks-34-352: 0 items (fields verified)
- The collector missed Your Oregon News (2026-09-26, https://youroregonnews.com/2026/09/26/banks-voters-to-decide-on-police-levy-renewal-in-november-election/). It reports a renewal at an unchanged $2.50 per $1,000 for five years, funding two contracted WCSO deputies. Fiscal remains null, so the summary is incomplete.
- Balance: 0 / 0, gaps documented.

### forest-grove-34-353: 0 verified, 1 corrected, 0 rejected
- y1 corrected: the publisher should be the Joint *Interim* Committee on Ways and Means, Subcommittee on Capital Construction. The excerpt is verbatim, from Chief Reimann's letter of Feb 13, 2026.
- Fiscal is null. The city page still shows the 2025 Measure 34-343 ($29.5M), which confirms the collector's note.
- Balance: 1 YES (official testimony) / 0 NO, gap documented.

### king-city-34-354: 1 verified, 0 corrected, 0 rejected (field: summary corrected)
- The collector's gap says no explanatory statement was found. However, the City's measure page (https://www.ci.king-city.or.us/government/city_recorder/city_of_king_city_charter_modernization_amendments.php) links an official explanatory statement PDF. The summary was rebased on it, and the YON-only points stay attributed. YON points were confirmed (Ray Pitz, 2026-09-28).
- n1 (Suesserman candidate statement, WC-19) verified.
- Balance: 0 YES / 1 NO (a candidate statement, not a filed argument). The official explanatory statement could supply neutral explainer items in a re-collection.

## Inventory discrepancies
- None among these nine. Each matches the official listings: multco.us "Local Ballot Measure Filings" lists 26-265 to 26-269 and 34-355, and the Washington County VP index lists 34-352 to 34-355, 26-267 and 3-641. `wilsonville-3-641` is in the inventory; it is outside this batch.
