# Verification 2026-10-15: wweek.json and mercury.json

All 12 source files read in full (7 WW, 5 Mercury article/cheat-sheet files plus the Mercury index page). Ids checked against inventory-lookup.txt. `python3 -I check_excerpts.py`: 0 problems (mercury 29 entries, wweek 46 entries).

## Entries checked
75 (WW 46, Mercury 29). All are general-election picks for the stated race, with correct candidate/race/measure ids. No pick was a primary-only or honorable-mention endorsement. Ranks match the sources.

## Entries changed
| Entry | Before | After | Why |
|---|---|---|---|
| wweek-portland-council-d3-2 (Koyama Lane) | excerpt: "If everybody ranked ... Novick, Koyama Lane and Torres ..." (shared) | "Koyama Lane, 40, has also approached the budget process with a fine-toothed comb rather than an ax, ..." | Excerpt should be about this pick. Rank 2 unchanged. |
| wweek-portland-council-d3-3 (Torres) | same shared excerpt | "We didn't find her all that inspiring, ... common-sense vote to safeguard the city's basic services ..." | Same. Rank 3 unchanged. |
| wweek-or-senate-20-1 (Meek) | two sentences, the first about opponent Stroh | "Meek is proving to be a more than sufficient form of loyal opposition." | First sentence was about the other candidate. |
| wweek notes / mercury notes | stale or incomplete | updated for the rulings below | |

## Rulings on judgment calls
- WW D2 Cruz rank 2: keep. Williams gets the "top endorsement", Cruz is the other of "the two who stand head and shoulders", and the piece says "rank the two".
- WW D4 Green rank 4: keep. "Disqualifying for a top-three spot", "we rank him above Eli Arnold", and Arnold gets "fifth-place nod".
- WW D3 Koyama Lane/Torres ranks 2-3: ranks correct (the order "Novick, Koyama Lane and Torres" is the stated ranking, with Otero 4th and Morillo 5th). Split into separate excerpts.
- Mercury D3 Esther Leon: NOT added. The Mercury says "we aren't ready to endorse Esther León", files her under Honorable mention, gives no number, and the cheat sheet lists only Morillo, Koyama Lane and Novick. "Ranking her on our ballots behind our top picks" is a voting intention, not a ranked endorsement. A rank would have to be invented (implied #4).
- WW HD29 Schimmel party: entries have no party field. WW says "Republican/Independent" (IPO member and Republican nominee); inventory says Independent. Both are accurate, and the notes now say so.

## Entries added
None. Missed picks searched for in every file: no "no endorsement"/dual statements exist. WW not-ranked/not-endorsed: Evenstar, Leon, Sollitt, Beausoleil Smith (D3/D4), Ong Norris, Zaghloul, Greene (County D2), Sykes, Hagedorn (WW chose Maurer Rowan, Savage), all opponents in legislative races. Mercury declines to rank Torres, Brim-Edwards, Meieran. Picks that only one outlet made (e.g. WW-only judges and US House 6; Mercury-only US House 3, HD 34, 44-47) are correctly present in just that outlet's file.

## Open questions
- Leon: if the project wants "will rank on our ballot" captured, it needs a schema decision (e.g. rank null with a flag); I left it out.
- Mercury cheat-sheet picks (federal, legislature, judges) use the cheat-sheet line as the excerpt, which gives no reason; consistent with COLLECTOR.md but weak evidence text.
- Mercury `published` date (2026-10-14) is not stated in the saved sources; could not verify.
- WW HD33 statement says "Shannon Isadore" (WW's name) for candidate shannon-jones-isadore; left as is.
