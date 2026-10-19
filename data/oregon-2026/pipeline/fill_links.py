#!/usr/bin/env python3
"""Fill the candidate link bank (official_url, pamphlet_url) from sources we already verified. No web access.

  fill_links.py [--write]

For each incumbent in verified/candidates/ without an official_url, pick a cited source on a .gov host that
isn't an election or pamphlet office, preferring the member's own site (<name>.senate.gov / .house.gov, used
at its home page) over other office pages (used as cited). Records the item it came from in official_url_via.
Campaign websites (website_url) are already in the bank from collection.

Every candidate also gets a pamphlet_url, the fallback link when we have neither official_url nor website_url:
the voters' pamphlet page the candidate is cited from, else the pamphlet for their race (the state pamphlet
book a race-mate is cited from, or the county pamphlet of the elections office that lists the race).
Prints what it would change.
"""
import json
from collections import Counter
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
ELECTION_HOSTS = ("sos.oregon.gov", "oregonvotes.gov", "multco.us", "washingtoncountyor.gov", "clackamas.us")


# The full county pamphlets for Nov 3, 2026, as cited across verified/candidates/.
COUNTY_PAMPHLETS = {
    "multco.us": "https://multco.us/file/multnomah_county_voters'_pamphlet_-_november_2026_general_election/download",
    "washingtoncountyor.gov": "https://www.washingtoncountyor.gov/elections/documents/november-3-2026-voters-pamphlet/download?inline",
    "clackamas.us": "https://docs.clackamas.us/documents/drupal/03f4f9db-a1ab-4a1f-9ce1-16059d49a513",
}
STATE_BOOK = re.compile(r"^https://sos\.oregon\.gov/elections/Voters-Pamphlet/Documents/VP_G26-Book\d+_web\.pdf$")


def is_pamphlet(i):
    src = i.get("source") or {}
    url = src.get("url") or ""
    return bool(STATE_BOOK.match(url)) or (
        "pamphlet" in (src.get("publisher") or "").lower() and "military" not in url.lower()
    )


def own_pamphlet(d):
    for i in items(d):
        if is_pamphlet(i):
            return i["source"]["url"], f"cited source of verified item {i['id']}"
    return None


def race_pamphlet(race, mates):
    books = Counter(u for m in mates for u in re.findall(r"https://sos\.oregon\.gov/[^\"\s]+", json.dumps(m)) if STATE_BOOK.match(u))
    if books:
        return books.most_common(1)[0][0], f"state pamphlet book cited most in the files for {race['id']}"
    host = (urlparse(race.get("source_url") or "").hostname or "").lower()
    for h, url in COUNTY_PAMPHLETS.items():
        if host == h or host.endswith("." + h):
            return url, f"county pamphlet of the office listing {race['id']} ({h})"
    return None


def items(d):
    for key in ("bio", "positions", "voting_record"):
        for i in d.get(key) or []:
            if (i.get("verification") or {}).get("status") != "rejected":
                yield i


def candidate_url(d):
    best = None
    for i in items(d):
        url = (i.get("source") or {}).get("url") or ""
        host = (urlparse(url).hostname or "").lower()
        if not host.endswith(".gov") or any(host == h or host.endswith("." + h) for h in ELECTION_HOSTS):
            continue
        if any(w in url.lower() for w in ("newsroom", "/news", "press-release", "/posts/")):
            continue  # an announcement about them, not their page
        if host.endswith(".senate.gov") or host.endswith(".house.gov"):
            if host not in ("www.senate.gov", "www.house.gov", "senate.gov", "house.gov"):
                return f"https://{host}/", i["id"]
        best = best or (url, i["id"])
    return best


def main(argv):
    write = "--write" in argv
    paths = sorted((ROOT / "verified/candidates").glob("*.json"))
    docs = {p: json.loads(p.read_text()) for p in paths}
    races = {r["id"]: r for r in json.loads((ROOT / "inventory.json").read_text())["races"]}
    by_race = {}
    for d in docs.values():
        by_race.setdefault(d["race_id"], []).append(d)
    changed = 0
    missing = []
    for path, d in docs.items():
        before = json.dumps(d)
        if d.get("incumbent") and not d.get("official_url"):
            found = candidate_url(d)
            if found:
                url, via = found
                print(f"{d['id']}: official {url} (from {via})")
                d["official_url"] = url
                d["official_url_via"] = f"cited source of verified item {via}"
        if not d.get("pamphlet_url"):
            found = own_pamphlet(d) or race_pamphlet(races[d["race_id"]], by_race[d["race_id"]])
            if found:
                d["pamphlet_url"], d["pamphlet_url_via"] = found
                print(f"{d['id']}: pamphlet {found[0]} ({found[1]})")
            elif not (d.get("official_url") or d.get("website_url")):
                missing.append(d["id"])
        if json.dumps(d) != before:
            changed += 1
            if write:
                path.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f"{changed} candidates {'updated' if write else 'would change'}")
    print(f"{len(missing)} with no link at all: {', '.join(missing)}")


if __name__ == "__main__":
    main(sys.argv)
