# Data Sourcing & Verification Policy

Applies to every public-seeded candidate profile and ballot measure (PRD v2 §2.1, §3, §6). Collector and verifier agents, and later the automated pipeline, follow this document.

**Goal:** every fact a voter sees is true, traceable to a trustworthy source, and presented neutrally — in an environment full of AI-generated, fabricated and partisan content.

---

## 1. Source tiers

| Tier | What | Examples (Oregon) | Use |
|---|---|---|---|
| **T1 Official** | Government / election authority publications | sos.oregon.gov (incl. Voters' Pamphlet, candidate filings), oregonvotes.gov, oregonlegislature.gov (bills, votes, LPRO/LFO fiscal & measure analyses), county elections (multco.us, washingtoncountyor.gov, clackamas.us), portland.gov, oregonmetro.gov, congress.gov, fec.gov, ORESTAR | Ballot contents, candidate list, measure text, fiscal impact, official arguments, voting records, candidate statements |
| **T2 Candidate-official** | The candidate's own channels | Campaign website **linked from or consistent with the official filing**; official social accounts linked from that site; official office (.gov) pages for incumbents | Candidate positions in their own words |
| **T3 Reputable press / nonpartisan** | Named outlets with editorial standards, bylines and dates | OPB, The Oregonian/OregonLive, Willamette Week, Portland Mercury, Oregon Capital Chronicle, Associated Press, Ballotpedia, League of Women Voters / Vote411 | Interview/debate quotes (attributed), context; must be cross-checked where possible |
| **Excluded** | Anything else | Unbylined/undated sites, content farms, AI-generated summary sites, aggregators that don't cite originals, opponent/attack sites as evidence of a position, advocacy-group scorecards as evidence of a position, unverified social accounts, forums, Wikipedia as a sole source, outputs of any AI model | Never cited |

Rules:
- Prefer the highest tier available. A position backed only by T3 must be attributed as such ("In a 2026 OPB interview, …").
- A campaign website is T2 only if its domain is confirmed via the official filing, the Voters' Pamphlet, ORESTAR, or a T3 outlet linking to it.
- Measure arguments come from the official Voters' Pamphlet arguments and the official explanatory statement first.

## 2. Red flags for fake / AI-generated content
Reject or escalate a source when any of these apply:
- No author, no organization, no date, or "about" page is missing/generic.
- Domain recently registered, look-alike of a real outlet or campaign (typosquats), or not linked from any T1/T2 source.
- Quote cannot be found in any T1/T2/T3 source, or only appears on low-quality aggregators.
- Generic, templated prose that could apply to any candidate; mismatched facts (wrong district, wrong office, wrong year).
- Images/video as the sole evidence (deepfake risk) — never use as evidence.
- Claims dated before the candidate's relevant career, or position attributed to the wrong person of a similar name.

## 3. Item requirements
Every collected fact (position, bio fact, argument) must have:
- `statement`: neutral paraphrase in third person, present tense where possible, ≤ 40 words.
- `excerpt`: verbatim supporting text from the source, ≤ 50 words (short excerpts only — no bulk copying).
- `source`: `url`, `publisher`, `tier`, `published_at` (if known), `retrieved_at`.
- `topic`: one tag from the platform taxonomy (economy, education, healthcare, housing, environment, public-safety, infrastructure, taxes, immigration, civil-rights, local-business, transportation, technology, veterans, agriculture, foreign-policy, gun-policy, social-services) or a custom tag if none fits.

## 4. Neutrality rules
- No loaded or evaluative language in paraphrases ("radical", "common-sense", "extreme", "slams", "failed").
- Use the candidate's or committee's own framing, attributed ("Doe says the measure would…"), never the platform's judgment.
- Equal treatment: every candidate in a race gets the same collection effort and the same source search; record when a candidate simply has little public information (`gaps`), rather than filling with lower-tier sources.
- Measures: both YES and NO sides must be represented whenever an official argument or reputable source exists for that side; note explicitly when one side has no filed arguments.
- No predictions, endorsements, polling, or horse-race content in profiles.

## 5. Verification checks (verifier agent)
For each item:
1. **Source reachable** and the excerpt actually appears on the page (or the PDF).
2. **Attribution correct**: right person, office, race and election cycle.
3. **Tier correct** and source not on the exclusion list / no red flags.
4. **Paraphrase faithful**: the statement says no more and no less than the excerpt.
5. **Neutral wording** per §4.
6. **Recency**: prefer 2025–2026; older positions kept only when labelled with their date and not contradicted by newer ones.

Per race / measure:
7. **Balance**: comparable coverage across candidates; both measure sides present; disparities explained by documented `gaps`.
8. **Completeness**: every candidate on the official ballot is present; no one is included who isn't on the ballot.

Each item gets `verification.status`: `verified` | `corrected` (with the change described) | `rejected` (with reason), plus `verified_at` and `checks_failed`.
