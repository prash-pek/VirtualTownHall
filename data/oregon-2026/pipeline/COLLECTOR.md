# Collector protocol (Oregon 2026)

You collect public-record content for assigned candidates or measures. Follow
`docs/data-sourcing-policy.md` and the schema in `data/oregon-2026/README.md`.
A separate verifier agent will re-fetch every source you cite, so anything you
cannot point to on a real page will be rejected.

## Tools
- Use **WebSearch** and **WebFetch** only. `curl`/`wget` cannot reach the web from this container.
- Only cite URLs that a WebSearch or WebFetch call actually returned. Never build or guess a URL.
- WebFetch answers through a summarizing model. To get an excerpt, ask it to
  "quote verbatim, character for character, the passage about X" and copy only text it returns in quotes.
  If it paraphrases, ask again for the exact wording or drop the item.
- Long PDFs (voters' pamphlets): page through with WebFetch `offset`.

## Equal effort (policy §4) — the fixed search set
Run **the same steps for every candidate in a race** (and both sides of a measure), and log each in `collection_log`:

Candidates:
1. **Voters' pamphlet statement** (T1). Statewide/federal/legislative/judicial: the SOS statewide pamphlet
   for the candidate's county edition (sos.oregon.gov/elections/Voters-Pamphlet). Local: the county pamphlet
   (Multnomah's is joint with the SOS book; Washington and Clackamas publish their own).
2. **Official office page** (T1) if the candidate holds or held the office or another public office
   (.gov roster, oregonlegislature.gov, congress.gov). Use it for bio facts and incumbency.
3. **Campaign website** (T2) — only if its domain is linked from the pamphlet, ORESTAR, an official page,
   or a T3 article. Record that page in `website_verified_via`. Otherwise leave `website_url` null.
4. **WebSearch** `"<full name>" <office or city> 2026`.
5. **WebSearch** with `allowed_domains`: opb.org, oregonlive.com, wweek.com, portlandmercury.com,
   oregoncapitalchronicle.com, apnews.com, ballotpedia.org, vote411.org, kgw.com, koin.com, kptv.com,
   pamplinmedia.com, portlandtribune.com, beavertonvalleytimes.com, lakeoswegoreview.com, kgw.com, katu.com.
   Query: `"<full name>"`.
6. Optional, same for all in the race: one follow-up fetch per promising T3 result (max 4 per candidate).

Measures:
1. County voters' pamphlet entry: ballot title (caption, question, summary), explanatory statement,
   arguments in favor and in opposition (T1). Also the county's measure page / ballot-content report.
2. The measure text / resolution from the jurisdiction's own site (T1) for `full_text_url` and fiscal facts.
3. For each side separately: WebSearch `"Measure <number>" <jurisdiction>` and the T3 allowed-domain search;
   take attributed statements from the YES committee/supporters and the NO side with the same effort.

Stop rules: positions ≤ 10, bio ≤ 5, voting_record ≤ 5 per candidate; arguments ≤ 6 per side per measure.
Prefer spreading positions across distinct topics over many items on one topic.

## Content rules
- `statement`: neutral third-person paraphrase, ≤ 40 words, says no more than the excerpt. Attribute:
  "Doe says…", "In her voters' pamphlet statement, Doe…", "In a 2026 OPB interview, Doe…".
- `excerpt`: verbatim, ≤ 50 words, actually on the page.
- No loaded words (radical, common-sense, extreme, slams, failed, disastrous, so-called, …).
- Excluded sources (policy §1): no Wikipedia, no advocacy scorecards/endorsement lists as evidence of position,
  no opponent material as evidence of a position, no AI summary sites, no theballotbrief.com, bluevoterguide.org,
  thegreenpapers.com, no search-result URLs on official domains, no social media unless linked from a T2 site.
- Images/video are never evidence.
- Nothing from model knowledge. If you didn't fetch it, it doesn't go in.
- A candidate with little public information gets short lists and explicit `gaps`, never lower-tier filler.
- No polling, endorsements, fundraising totals, predictions or horse-race content.
- Incumbency: set `incumbent` true/false only when an official source states it; put that URL in
  `incumbent_source_url`. Otherwise null. Record the ballot spelling in `name`; other spellings in `name_variants`.
- `retrieved_at`: today's date (YYYY-MM-DD).

## Output
- Candidates: `data/oregon-2026/raw/candidates/<candidate-id>.json`; measures: `data/oregon-2026/raw/measures/<measure-id>.json`.
  IDs are the inventory IDs. Item IDs: `<candidate-id>-b1`, `-p1`, `-v1`; measure arguments `<measure-id>-y1`, `-n1`.
- Add `collection_log`: list of `{ "step": "1".."6", "query_or_url": "...", "result": "used|nothing relevant|not found|blocked" }`.
- Add `collection_notes` for anything a reviewer should know (discrepancies with the inventory, name spelling,
  seat counts, incumbency conflicts). Do not edit `inventory.json`.
- Run `python3 data/oregon-2026/pipeline/validate.py raw <file>` on each file and fix every error.
