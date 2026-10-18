# Verification: outlets/oregonian.json (2026-10-18)

All 8 source files read in full. Excerpts checked by script (whitespace-normalised substring match against the named source file): all 13 are verbatim and found in the correct file, 1-3 adjacent sentences, none over 60 words except none (max 46). All race/measure/candidate ids exist in inventory-lookup.txt. Source URLs match SOURCE lines.

| id | verdict | reason |
|---|---|---|
| oregonian-or-governor-1 | OK | "we endorse Kotek for a second term" explicit; or-governor / tina-kotek valid; rank null (single-choice race). |
| oregonian-multnomah-county-chair-1 | OK | Pick explicit in summary list; julia-brim-edwards valid. Excerpt is the list line, verbatim from voting-recommendations.txt. Acceptable per Mercury precedent (cheat-sheet lines used as excerpts, flagged in the 10-15 report as weak but compliant). rank null is right: no rank stated (Cruz article says only Brim-Edwards endorsed). Notes already disclose. |
| oregonian-multnomah-county-commissioner-d2-1 | OK | "rank Cruz as their number one choice" supports rank 1; "only endorsing Cruz" so no other entries. |
| oregonian-washington-county-commissioner-at-large-1 | OK | "they should elect Treece"; race = Washington County chair (Treece/Fai), correct. rank null. |
| oregonian-or-circuit-court-4-pos-2-1 | OK | "We recommend Sykes ..." explicit; diane-sykes valid (Diane S Sykes). 2 adjacent sentences. |
| oregonian-or-circuit-court-4-pos-14-1 | OK | "voters should choose Hagedorn" / "elect him"; joseph-hagedorn valid. Two adjacent sentences, 46 words, gives reasons. |
| oregonian-portland-council-d3-1 | OK | Torres #1 ("in that order", "number one pick"). Excerpt adjacent, reason for Torres. |
| oregonian-portland-council-d3-2 | OK | Novick #2 ("ranking Novick second"). Excerpt is a single sentence of praise; acceptable. |
| oregonian-portland-council-d3-3 | OK | Morillo #3 ("Torres, Novick and Morillo in that order"). Excerpt opens with "We strongly believe that." (refers back to a quote, slightly context-dependent) but is adjacent, verbatim and gives the board's reason (most effective). Optional improvement only, not required. |
| oregonian-portland-council-d4-1 | OK | Zimmerman #1 ("vote him first"). |
| oregonian-portland-council-d4-2 | OK | Clark #2 ("rank Clark second"). Excerpt spans a paragraph break but the sentences are adjacent in the source; 46 words. |
| oregonian-portland-council-d4-3 | OK | Arnold #3 ("ranking him third"). |
| oregonian-portland-26-267-1 | OK | "vote 'no' on Measure 26-267"; pick no / side no; measure id valid. Excerpt verbatim (curly quotes preserved). |

## Missed picks
None. Cross-checked voting-recommendations.txt against the json: all 9 summary lines (governor, chair, D2, Washington chair, judge Pos 2, judge Pos 14, council D3 x3, D4 x3, Measure 26-267) are covered (13 entries). No other races in any article.

## Wrongly included
None. Explicit non-endorsements (Koyama Lane "did not make our list", Mitch Green "not endorsing", Drazan not endorsed, Fai, Savage, Maurer Rowan, other D2/D3/D4 candidates) are correctly absent. Pick "none" is not warranted for any race (no explicit "we make no endorsement" statements; the board declining to rank further candidates is not a race-level non-endorsement).

## Other issues
- No FIX items.
- Statement nit (optional): the Treece statement says "Washington County chair"; fine and matches source.
- Statement nit (optional): D3/D4 statements say "(ranked #n)"; consistent with Mercury/WW precedent.
- published/date/source "PENDING" are known and not reported. JSON parses (13 entries, unmatched empty).
