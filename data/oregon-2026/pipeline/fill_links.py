#!/usr/bin/env python3
"""Fill the candidate link bank (official_url) from sources we already verified. No web access.

  fill_links.py [--write]

For each incumbent in verified/candidates/ without an official_url, pick a cited source on a .gov host that
isn't an election or pamphlet office, preferring the member's own site (<name>.senate.gov / .house.gov, used
at its home page) over other office pages (used as cited). Records the item it came from in official_url_via.
Campaign websites (website_url) are already in the bank from collection. Prints what it would change.
"""
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
ELECTION_HOSTS = ("sos.oregon.gov", "oregonvotes.gov", "multco.us", "washingtoncountyor.gov", "clackamas.us")


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
    changed = 0
    for path in sorted((ROOT / "verified/candidates").glob("*.json")):
        d = json.loads(path.read_text())
        if not d.get("incumbent") or d.get("official_url"):
            continue
        found = candidate_url(d)
        if not found:
            continue
        url, via = found
        print(f"{d['id']}: {url} (from {via})")
        changed += 1
        if write:
            d["official_url"] = url
            d["official_url_via"] = f"cited source of verified item {via}"
            path.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f"{changed} candidates {'updated' if write else 'would change'}")


if __name__ == "__main__":
    main(sys.argv)
