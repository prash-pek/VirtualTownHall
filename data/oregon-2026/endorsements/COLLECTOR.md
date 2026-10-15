# Outlet endorsement collector

Input: one outlet's endorsement pages, already saved as text in `sources/<outlet>/` (each file starts with `SOURCE: <url>`).
Lookup: `inventory-lookup.txt` lists every race id with its candidate ids, and every measure id.
Do not browse; everything you need is in those files. Nothing from memory.

Output: `outlets/<outlet>.json`, a JSON object:
{
  "outlet": "Willamette Week", "outlet_id": "wweek", "published": "2026-10-14", "retrieved_at": "2026-10-15",
  "endorsements": [ ... ],
  "unmatched": [ {"office": "...", "pick": "...", "source": "url", "note": "why no inventory match"} ],
  "notes": "anything a reviewer should know"
}

Each endorsement entry:
- `id`: "<outlet_id>-<race_or_measure_id>-<n>"
- `endorser`, `endorser_type`: "outlet", `tier`: "press_opinion"
- `race_id` (candidate races) or `measure_id` (measures)
- `pick`: "candidate" | "yes" | "no" | "none" | "dual"
- `candidate_id`: inventory candidate id when pick is "candidate" (one entry per endorsed candidate; in ranked-choice races give each its own entry)
- `rank`: integer when the outlet ranks candidates (#1, #2...), else null
- `side`: "yes" | "no" for measures, else omitted
- `statement`: one plain sentence, e.g. "Willamette Week endorsed Tina Kotek for governor."
- `excerpt`: VERBATIM text copied character-for-character from the source file, 1-3 sentences (max ~60 words) giving the outlet's reason. Do not fix typos, do not join non-adjacent sentences, no ellipses.
- `source`: the URL from the file's SOURCE line, `date`: published date

Rules: record only explicit picks (the outlet says vote for / endorse / rank / vote yes/no). An explicit "we make no endorsement" in a race is `pick: "none"`. Two candidates endorsed for one seat in a single-seat race is "dual". Map names with care (ballot names can include middle initials: "Diane S Sykes" = Diane Sykes). If an outlet's pick is not in the inventory (race outside it, or name not found), put it in `unmatched`, never guess an id.
Validate with `python3 -c "import json;json.load(open(PATH))"` before finishing. Report counts: endorsements, unmatched.
