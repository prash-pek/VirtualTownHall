# Verification: Multnomah cities, batch 1 (Fairview, Gresham, Maywood Park)

Verifier run 2026-10-14. 20 candidates in 9 races. The verifier re-fetched every cited URL with WebFetch and asked for verbatim quotes. No item was rejected. Every output passes `validate.py verified`.

**Sources and access**
- The Military & Overseas guide page (multco.us/info/military-overseas-online-voters-guide-november-2026-election) now links only the full county pamphlet, not the per-candidate files. The per-candidate files at `multco.us/file/<city>_<pos>_<name>/download` still load, and every cited statement was re-fetched there.
- The full county pamphlet's Candidate Index loads. Its footnote says: "Candidates who did not file a candidate statement for the Voters' Pamphlet have an asterisk (*) by their names." Only Steven Haschke and Dan Miller have an asterisk.
- The fetch tool's text of the full pamphlet ends at page M-34. Pages M-39 (Weber) and M-50 (Akers) cannot be reached that way, and their individual statement files are image-only scans. A human reading would fill both profiles.
- Fairview's own website blocks automated fetching (robots), so there is no Fairview council roster.

## fairview-mayor (unopposed)
- **Counts:** Keith A Kudrna: 8 verified, 1 corrected, 0 rejected.
- **Correction:** b2 said his present occupation was "with Suntel House Plans". The pamphlet lists Suntel as previous employment, so it was removed from the statement.
- **Incumbency:** incumbent=true is confirmed by the Oregon Blue Book ("Mayor: Keith Kudrna") and by his own statement.
- **KATU quote** (2026-10-01): verified.

## fairview-council-pos-4 (unopposed)
- **Counts:** Jenni Weber: 0 items.
- **Why empty:** source access. The Candidate Index lists "Jenni Weber M-39" with no asterisk, so she filed a statement. Her statement file has no machine-readable text.
- **Search:** the spot-search found nothing.
- **Incumbency:** null (no roster available).

## fairview-council-pos-5 (unopposed)
- **Counts:** Ted Tosterud: 7 verified, 1 corrected (b1: "Retired" was not in the excerpt).
- **Incumbency:** null. His statement lists "Fairview City Councilor" under prior experience with no dates, and there is no roster to check against.

## fairview-council-pos-6
- **Counts:** Adam Bird: 8 verified. Steven Haschke: 0 items.
- **Balance:** the gap is a confirmed non-filer gap. The index shows "Steven Haschke*", and the spot-search found nothing.
- **Missed material:** Bird's statement names two more of his three priorities, which were not collected:
  - "a practical local plan for homelessness as county resources dwindle"
  - "a budget that doesn't balance itself without hard, concrete choices"
- **Incumbency:** null for both. Bird's statement lists only PSAC and the Budget Committee as government experience.

## gresham-mayor
- **Counts:**
  - Travis Stovall: 9 verified, 4 corrected.
  - Sue Piazza: 12 verified.
- **Corrections (Stovall):**
  - p3 and p6: the statements went past the end of their excerpts, so the excerpts were extended to the full sentences.
  - p5: the statement added "locally", which is not in the text, so it was reworded.
  - p8: the excerpt was not verbatim. The Tribune reads `..." he added.`, not `said Mayor Travis Stovall`. The statement was narrowed to match.
- **Balance:** comparable. Both have a pamphlet statement, a city page and one quote from the same Tribune article.
- **Incumbency:** confirmed by greshamoregon.gov/meet-the-council. Piazza=false is correct for the mayor's office; she is the sitting Position 5 councilor.
- **Websites:** both are printed in their statements.

## gresham-council-pos-2
- **Counts:**
  - Heather Coleman-Cox: 9 verified.
  - Will DelPlato: 8 verified, 2 corrected. b1 had "Retired" outside its excerpt. b4's excerpt was extended to cover "leading healthcare teams".
- **Balance:** comparable.
- **Incumbency:** false for both. Position 2 is held by Eddy Morales.
- **Websites:** both are printed in their statements.

## gresham-council-pos-4
- **Counts:**
  - Gregory Schroeder: 9 verified.
  - Krestina Aziz: 9 verified, 1 corrected (p2: excerpt extended).
  - Joshua Al-jaouni: 8 verified, 2 corrected. b2 named PCC, which is not in the excerpt. p3 said "addiction", which appears only in the section heading.
  - Teo Ramirez: 8 verified. His 2025 Tribune quote is dated in the statement and predates his candidacy. The attribution is consistent with his pamphlet background.
- **Balance:** comparable.
- **Missed material:** Schroeder's statement has a housing line ("We can provide housing choices while investing in safe neighborhoods..."). It was not collected.
- **Incumbency:** false for all four. Position 4 is held by Jerry Hinton.

## gresham-council-pos-6
- **Counts:** Janine Gladfelter: 10 verified. Dan Miller: 0 items.
- **Balance:** the gap is a confirmed non-filer gap. The index shows "Dan Miller*", and his city filing PDF is an image-only scan.
- **Search:** the spot-search found nothing identifiable as him.
- **Incumbency:** Gladfelter is confirmed (Position 6, term Jan 2023 to Dec 2026). Miller=false is supported.

## maywood-park-council (vote for 3)
- **Counts:**
  - Kevin Bussema: 9 verified, 1 corrected (b2: "small business owner" was not in the excerpt).
  - Katy Collins: 8 verified.
  - Winn Holly: 4 verified, 4 corrected. Holly's statement says "queer, trans, nonbinary" but gives no pronouns. The verifier reworded "they/their" to use Holly's name.
  - Jim Akers: 1 corrected. The roster lists him as **Mayor** under its City Council heading; the item now says so.
  - Kelly Ripley Feller: 7 verified.
- **Balance:** the four readable statements got comparable coverage. Akers's thin profile is a source-access gap: "Jim Akers M-50" has no asterisk, so he filed, but his file is an image-only scan.
- **Available material:** an archived 2008 county statement for "JAMES S. AKERS" exists at multco.us/node/2489. It is not added because of its age; a collector may add it with its date.
- **Incumbency:** Akers and Bussema=true, and the other three=false, supported by the roster.
- **Websites:** all three that the collector set are printed in the statements.

## Inventory discrepancies
- **Rosters:** none. The Gresham city elections page lists exactly the inventory candidates, all "qualified for the ballot". The county Candidate Index matches the inventory for all three cities.
- **Incumbency (inventory has null for everyone):**
  - Supported true: keith-kudrna (Fairview mayor), travis-stovall, janine-gladfelter, kevin-bussema, jim-akers (Maywood Park mayor, council seat).
  - Supported false: sue-piazza (for mayor), heather-coleman-cox, will-delplato, gregory-schroeder, krestina-aziz, joshua-al-jaouni, teo-ramirez, dan-miller, katy-collins, winn-holly, kelly-ripley-feller.
  - Undetermined: the four non-mayor Fairview candidates.
- **Name variants (already recorded in name_variants):**
  - Al-jaouni: the Candidate Index prints "Al-jaouni"; his statement and the city page print "Al-Jaouni".
  - The city elections page prints "William DelPlato" and "Daniel Miller".
