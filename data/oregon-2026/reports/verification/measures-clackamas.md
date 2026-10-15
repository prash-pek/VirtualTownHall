# Verification report: Clackamas County local measures (3-638 to 3-644)

Verifier run 2026-10-14. Tools: WebSearch and WebFetch only. Every cited URL was re-fetched.

## Batch-wide findings
- **Clackamas ballot-title PDFs are unreadable.** The inventory `source_url` documents for 3-638, 3-641 (and likely the others) return only the multilingual "request translation or accommodations" notice to WebFetch. The 24-529 document (5e9ffeb3…) does extract. Captions were checked against the measure list on the Clackamas Nov 3, 2026 election page. Where the collector left "(…see collection_notes)" in `ballot_label`, it was changed to "(Question and summary not retrieved.)" because collection notes are stripped from verified output.
- **Clackamas County voters' pamphlet** (docs.clackamas.us/…/03f4f9db…): WebFetch extracts only 117,028 characters, which ends around page C-33 (candidate statements). The measure index puts the measures at about C-42 to C-59. No per-measure or per-section argument documents were found on clackamas.us. **Filed arguments for all seven measures remain unchecked.**
- **Washington County pamphlet** (washingtoncountyor.gov/…/november-3-2026-voters-pamphlet): the table of contents lists **3-641 at WC-47 to WC-50**. Four pages points to filed arguments beyond the explanatory statement. The extraction stops around WC-29, so those pages could not be read.
- No inventory discrepancies: all seven measures in the Clackamas election page list have files, and no extra measures were found.

## wilsonville-3-641: 6 arguments (3 verified, 3 corrected, 0 rejected)
- Measure fields (label, summary, yes/no, fiscal) all verified against wilsonvilleoregon.gov/ord-905 (ballot title and explanatory statement).
- y1, y2 and n4 were corrected: their statements included content from the letters that is not in the excerpt (food carts, jobs and gathering spaces; "hurts the city budget"; "taxpayers don't need to underwrite"). The statements were trimmed to match the excerpts.
- Press check: both letters (Mark Smith and Doris Wehler, Wilsonville) are signed and appear on a Spokesman letters page dated Sept 19, 2026. The column has the byline "By Eric Winters", is in the Opinion section and is dated Oct 1, 2026. Each item explicitly names Measure 3-641, so none refers to the May 2026 measure. All are attributed as a letter or opinion. Winters is a chief petitioner of the May 2026 public-vote measure, which is noted in verification.
- Balance by kind:
  - YES: 0 official, 0 pamphlet, 2 press/letter (1 author).
  - NO: 0 official, 0 pamphlet, 4 press (opinion column ×3 and letter ×1; 2 authors).
  - The YES shortfall is in gaps. A spot search found no fall-2026 YES statement that was missed.
- **Missed pamphlet arguments:** likely in the Washington County pamphlet (WC-47 to WC-50) and the Clackamas pamphlet; not read.

## estacada-3-638: 0 arguments
- Ballot label corrected (pointer only). Summary **corrected**: the City FAQ says existing businesses could be affected "potentially in the future", and that Ord. 2026-009 (effective only if 2026-008 is) "could impact currently operating businesses". The press claim that existing businesses are unaffected is now attributed to Your Oregon News (Keizur, Sept 25, 2026), and the City's statement sits next to it.
- Balance: 0/0. Both absences are in gaps. A T3 **OregonLive article** (Sept 2026) reportedly gives paraphrased positions on both sides (McElroy for; Margolis, Sampson of Mule Extracts and Sale of Northwest Technologies against). It is blocked to WebFetch, so it was added to gaps for manual retrieval. The collector was right to exclude the press release and the MMJDaily repost.
- Missed pamphlet arguments: unknown (pamphlet unreadable).

## north-clackamas-sd-3-639: 0 arguments
- Label corrected (pointer only). Summary and fiscal impact verified against the district bond page (2026-07-06): $245M, "without increasing your current tax rate".
- Balance: 0/0, documented. Spot search found only district pages and excluded aggregators.
- Missed pamphlet arguments: unknown.

## monitor-rfpd-3-640: 0 arguments
- Label corrected (pointer only). Summary and fiscal impact verified against the 24-529 explanatory statement ($1.97/$1,000, "higher than the existing permanent tax rate of each district", all three measures required).
- Balance: 0/0, documented.
- Missed pamphlet arguments: unknown.

## canby-3-642: 1 argument (1 verified)
- Full ballot title verified against Resolution No. 1465, Exhibit A.
- y1 is the referring council's WHEREAS rationale (official text).
- Balance: YES 1 official / NO 0, documented. No opposition found.
- Missed pamphlet arguments: unknown.

## canby-3-643: 2 arguments (2 verified)
- Label, summary and fiscal impact verified against the July 15, 2026 council packet: Res. 1466 staff report and Exhibit A, read through WebFetch with an offset.
- YES: 2 official (staff report; City explainer page). NO: 0, documented.
- Missed pamphlet arguments: unknown.

## gladstone-sd-3-644: 0 arguments
- **gladstoneschoolbond.org decision: kept as district-official (T1).** The site has no publisher line, but the official gladstone.k12.or.us navigation links to it as "Website for proposed 2026 bond", and district articles link to it.
- Summary **corrected**: the $10.2M state matching grant is not on the bond site, so it is now sourced to the district article of July 8, 2026.
- Fiscal impact **corrected**: the quote said "current tax rate"; the site says "existing tax rate". The "OSCIM" label, which appears on neither page, was removed.
- Label corrected (pointer only).
- Balance: 0/0, documented. The only press found covers the failed May 2025 bond (3-624).
- Missed pamphlet arguments: unknown.

## Rejected items
None.
