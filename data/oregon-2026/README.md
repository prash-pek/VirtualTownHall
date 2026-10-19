# Oregon General Election — Nov 3, 2026

Public-record seed data for TownHall AI. All content follows [docs/data-sourcing-policy.md](../../docs/data-sourcing-policy.md).

Scope: every contest on any ballot in Oregon. Priority if coverage must be limited: statewide + federal → Multnomah, Washington and Clackamas counties → City of Portland and Metro → other Portland-area cities and districts → rest of state.

## Layout

```
inventory.json              # elections, jurisdictions, races, measures (from official sources)
raw/candidates/<id>.json    # collector output, one file per candidate
raw/measures/<id>.json      # collector output, one file per measure
verified/candidates/<id>.json
verified/measures/<id>.json # verifier output (same shape + verification fields)
reports/                    # collection and verification reports
```

IDs are lowercase kebab-case slugs: candidates `firstname-lastname` (append `-2` on collision), races `<jurisdiction>-<office>[-<district>]` (e.g. `or-us-house-3`, `portland-council-d2`), measures `<jurisdiction>-<number>` (e.g. `or-measure-118`, `multnomah-26-250`).

## inventory.json

```json
{
  "election": { "id": "or-2026-general", "name": "Oregon General Election", "date": "2026-11-03", "sources": [ "url" ] },
  "jurisdictions": [ { "id": "multnomah-county", "name": "Multnomah County", "type": "state|county|city|metro|congressional_district|state_senate_district|state_house_district|school_district|special_district|other", "parent_id": "or", "zips": [ "97201" ], "notes": "" } ],
  "races": [ { "id": "or-governor", "jurisdiction_id": "or", "office": "Governor", "district": null, "seats": 1, "partisan": true, "candidate_ids": [ "..." ], "source_url": "..." } ],
  "measures": [ { "id": "or-measure-119", "jurisdiction_id": "or", "number": "119", "title": "...", "source_url": "..." } ],
  "coverage_notes": "what was and wasn't inventoried, and why"
}
```

`zips` is best-effort (a ZIP may map to several jurisdictions); leave empty if no reliable source.

## raw/candidates/<id>.json

```json
{
  "id": "jane-doe",
  "name": "Jane Doe",
  "race_id": "or-us-house-3",
  "party": "Democrat",
  "incumbent": false,
  "occupation": "...",
  "website_url": "...",
  "website_verified_via": "url of the T1/T3 source that confirms the campaign domain",
  "official_url": "incumbents only: the office's own page (filled by pipeline/fill_links.py from verified sources)",
  "official_url_via": "which verified item it came from",
  "pamphlet_url": "the voters' pamphlet for this candidate or their race (fill_links.py); the fallback link",
  "pamphlet_url_via": "where it came from",
  "bio": [ ITEM ],
  "positions": [ ITEM ],
  "voting_record": [ ITEM ],
  "gaps": [ "No public position found on housing" ],
  "collection_notes": "..."
}
```

## raw/measures/<id>.json

```json
{
  "id": "or-measure-119",
  "jurisdiction_id": "or",
  "number": "119",
  "title": "...",
  "ballot_label": "...verbatim official caption/question...",
  "summary": "neutral plain-language summary, <= 80 words",
  "yes_means": "...official result-of-yes text...",
  "no_means": "...",
  "fiscal_impact": "...",
  "full_text_url": "...",
  "endorsements": [ { "id": "...", "endorser": "...", "endorser_type": "outlet|organization|official|person", "side": "yes|no", "statement": "...", "excerpt": "...", "source": { ... } } ],
  "arguments": [ { "side": "yes|no", "kind": "argument|rebuttal|explainer", "author": "...", "statement": "...", "excerpt": "...", "source": { ... } } ],
  "topics": [ "taxes" ],
  "gaps": [],
  "collection_notes": "..."
}
```

## ITEM

```json
{
  "id": "jane-doe-p1",
  "topic": "housing",
  "statement": "Neutral third-person paraphrase, <= 40 words",
  "excerpt": "Verbatim supporting text, <= 50 words",
  "source": { "url": "...", "publisher": "...", "tier": "T1|T2|T3", "published_at": "YYYY-MM-DD|null", "retrieved_at": "2026-10-13" }
}
```

Verifier adds to every ITEM / argument / measure summary field:

```json
"verification": { "status": "verified|corrected|rejected", "checks_failed": [], "note": "...", "verified_at": "2026-10-13" }
```
and at file level: `"verification_summary": { "verified": 0, "corrected": 0, "rejected": 0, "balance_notes": "..." }`.

## Pipeline additions (2026-10-14)

Fields added by the collector/verifier pipeline (`pipeline/`), all optional for importers:

- Inventory candidates: `incumbent_source_url` (official page supporting `incumbent`), `name_variants` (other spellings; `name` is the printed-ballot spelling).
- Raw candidates: `incumbent_source_url`, `name_variants`, `collection_log` (list of `{step, query_or_url, result}` showing the fixed search set was run), `collection_notes`. The last two are removed in `verified/`.
- Measures: arguments carry `id` and `topic` like an ITEM. `kind: "explainer"` marks text from an official explanatory statement or the jurisdiction's own documents rather than a filed pamphlet argument. Oregon local ballot titles have no official result-of-vote text, so `yes_means`/`no_means` are neutral one-sentence descriptions of the ballot question.
- Verified measures: `<field>_verification` objects for `ballot_label`, `summary`, `yes_means`, `no_means`, `fiscal_impact`.
- `reports/inventory_fixes.json`: proposed inventory corrections with evidence; `pipeline/apply_fixes.py` applies the confirmed ones and verified incumbency.

Run `python3 pipeline/validate.py status` for coverage, `validate.py raw|verified <files>` for checks.

- `endorsements` (optional, candidates and measures; `side` on measures only): endorsers named in a source already read, such as a pamphlet statement or argument sponsor line. They are shown in a collapsed "Endorsed by" list and never scored or used as evidence of a position.
