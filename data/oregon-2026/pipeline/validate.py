#!/usr/bin/env python3
"""Schema and policy checks for Oregon 2026 seed files.

  validate.py raw <file>...        check collector output
  validate.py verified <file>...   check verifier output
  validate.py strip <file> <out>   copy a raw file without collector notes/log (verifier input)
  validate.py status               coverage table: inventory vs raw vs verified
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = json.loads((ROOT / "inventory.json").read_text())
CANDIDATES = {c["id"]: c for c in INVENTORY["candidates"]}
MEASURES = {m["id"]: m for m in INVENTORY["measures"]}

TIERS = {"T1", "T2", "T3"}
STATUSES = {"verified", "corrected", "rejected"}
TOPICS = {
    "economy", "education", "healthcare", "housing", "environment", "public-safety",
    "infrastructure", "taxes", "immigration", "civil-rights", "local-business",
    "transportation", "technology", "veterans", "agriculture", "foreign-policy",
    "gun-policy", "social-services",
}
LOADED = re.compile(
    r"\b(radical|common[- ]sense|extreme|extremist|slams?|slammed|failed|failing|disastrous|"
    r"so-called|reckless|dangerous|crazy|woke|heroic|brave|corrupt)\b",
    re.I,
)
EXCLUDED_HOSTS = re.compile(
    r"(wikipedia\.org|theballotbrief\.com|bluevoterguide\.org|thegreenpapers\.com|"
    r"facebook\.com|x\.com|twitter\.com|instagram\.com|tiktok\.com|youtube\.com|reddit\.com)",
    re.I,
)
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
COLLECTOR_ONLY = ("collection_log", "collection_notes")


def words(s):
    return len((s or "").split())


def check_item(item, where, errs, verified):
    for key in ("id", "topic", "statement", "excerpt", "source"):
        if not item.get(key):
            errs.append(f"{where}: missing {key}")
    if words(item.get("statement")) > 40:
        errs.append(f"{where}: statement over 40 words")
    if words(item.get("excerpt")) > 50:
        errs.append(f"{where}: excerpt over 50 words")
    if LOADED.search(item.get("statement") or ""):
        errs.append(f"{where}: loaded word in statement: {LOADED.search(item['statement']).group(0)}")
    topic = item.get("topic") or ""
    if topic not in TOPICS and not topic.startswith("custom:"):
        errs.append(f"{where}: topic '{topic}' not in taxonomy (use custom:<tag>)")
    src = item.get("source") or {}
    url = src.get("url") or ""
    if not url.startswith("http"):
        errs.append(f"{where}: source.url missing")
    if EXCLUDED_HOSTS.search(url):
        errs.append(f"{where}: excluded source host {url}")
    if src.get("tier") not in TIERS:
        errs.append(f"{where}: source.tier must be T1/T2/T3")
    if not src.get("publisher"):
        errs.append(f"{where}: source.publisher missing")
    if not DATE.match(src.get("retrieved_at") or ""):
        errs.append(f"{where}: source.retrieved_at must be YYYY-MM-DD")
    pub = src.get("published_at")
    if pub is not None and not DATE.match(pub):
        errs.append(f"{where}: source.published_at must be YYYY-MM-DD or null")
    if verified:
        check_verification(item.get("verification"), where, errs)


def check_verification(v, where, errs):
    if not isinstance(v, dict):
        errs.append(f"{where}: missing verification")
        return
    if v.get("status") not in STATUSES:
        errs.append(f"{where}: verification.status invalid")
    if not isinstance(v.get("checks_failed"), list):
        errs.append(f"{where}: verification.checks_failed must be a list")
    if v.get("status") in ("corrected", "rejected") and not v.get("note"):
        errs.append(f"{where}: {v.get('status')} needs a note")
    if not DATE.match(v.get("verified_at") or ""):
        errs.append(f"{where}: verification.verified_at must be YYYY-MM-DD")


def check_candidate(d, errs, verified):
    cid = d.get("id")
    inv = CANDIDATES.get(cid)
    if not inv:
        errs.append(f"unknown candidate id {cid}")
        return
    if d.get("race_id") != inv["race_id"]:
        errs.append(f"race_id {d.get('race_id')} != inventory {inv['race_id']}")
    for key in ("name", "bio", "positions", "voting_record", "gaps"):
        if key not in d:
            errs.append(f"missing {key}")
    if d.get("incumbent") is not None and not d.get("incumbent_source_url"):
        errs.append("incumbent set without incumbent_source_url")
    if d.get("website_url") and not d.get("website_verified_via"):
        errs.append("website_url without website_verified_via")
    caps = {"bio": 5, "positions": 10, "voting_record": 5}
    ids = set()
    for key, cap in caps.items():
        items = d.get(key) or []
        if len(items) > cap:
            errs.append(f"{key}: {len(items)} items, cap {cap}")
        for i, item in enumerate(items):
            check_item(item, f"{key}[{i}]", errs, verified)
            if item.get("id") in ids:
                errs.append(f"duplicate item id {item.get('id')}")
            ids.add(item.get("id"))


def check_measure(d, errs, verified):
    mid = d.get("id")
    if mid not in MEASURES:
        errs.append(f"unknown measure id {mid}")
        return
    for key in ("title", "ballot_label", "summary", "yes_means", "no_means", "arguments", "gaps"):
        if key not in d:
            errs.append(f"missing {key}")
    if words(d.get("summary")) > 80:
        errs.append("summary over 80 words")
    for key in ("summary", "yes_means", "no_means"):
        if LOADED.search(d.get(key) or ""):
            errs.append(f"{key}: loaded word")
    sides = {"yes": 0, "no": 0}
    for i, arg in enumerate(d.get("arguments") or []):
        where = f"arguments[{i}]"
        if arg.get("side") not in ("yes", "no"):
            errs.append(f"{where}: side must be yes|no")
        else:
            sides[arg["side"]] += 1
        if arg.get("kind") not in ("argument", "rebuttal", "explainer"):
            errs.append(f"{where}: kind must be argument|rebuttal|explainer")
        if not arg.get("author"):
            errs.append(f"{where}: author missing")
        arg.setdefault("topic", "custom:measure")
        check_item(arg, where, errs, verified)
    for side, n in sides.items():
        if n > 6:
            errs.append(f"{side}: {n} arguments, cap 6")
        if n == 0 and not any(side.upper() in g or side in g.lower() for g in d.get("gaps") or []):
            errs.append(f"no {side} arguments and no gap explaining it")
    if verified:
        for key in ("ballot_label", "summary", "yes_means", "no_means", "fiscal_impact"):
            if d.get(key) and not isinstance(d.get(f"{key}_verification"), dict):
                errs.append(f"missing {key}_verification")
            elif d.get(key):
                check_verification(d[f"{key}_verification"], key, errs)


def check_file(path, verified):
    errs = []
    try:
        d = json.loads(Path(path).read_text())
    except Exception as e:  # noqa: BLE001
        return [f"invalid JSON: {e}"]
    kind = "measures" if "/measures/" in str(path) else "candidates"
    if Path(path).stem != d.get("id"):
        errs.append(f"file name {Path(path).stem} != id {d.get('id')}")
    (check_measure if kind == "measures" else check_candidate)(d, errs, verified)
    if verified:
        for key in COLLECTOR_ONLY:
            if key in d:
                errs.append(f"{key} must be removed in verified output")
        s = d.get("verification_summary")
        if not isinstance(s, dict) or not {"verified", "corrected", "rejected", "balance_notes"} <= set(s):
            errs.append("verification_summary missing or incomplete")
    elif not d.get("collection_log"):
        errs.append("collection_log missing")
    return errs


def status():
    races = {r["id"]: r for r in INVENTORY["races"]}
    raw_c = {p.stem for p in (ROOT / "raw/candidates").glob("*.json")}
    ver_c = {p.stem for p in (ROOT / "verified/candidates").glob("*.json")}
    raw_m = {p.stem for p in (ROOT / "raw/measures").glob("*.json")}
    ver_m = {p.stem for p in (ROOT / "verified/measures").glob("*.json")}
    print(f"measures: {len(MEASURES)} inventory, {len(raw_m)} raw, {len(ver_m)} verified")
    print(f"candidates: {len(CANDIDATES)} inventory, {len(raw_c)} raw, {len(ver_c)} verified")
    for rid, r in races.items():
        ids = r["candidate_ids"]
        if any(i in raw_c for i in ids):
            print(f"  {rid}: {sum(i in raw_c for i in ids)}/{len(ids)} raw, {sum(i in ver_c for i in ids)}/{len(ids)} verified")


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    mode = argv[1]
    if mode == "status":
        status()
        return 0
    if mode == "strip":
        d = json.loads(Path(argv[2]).read_text())
        for key in COLLECTOR_ONLY:
            d.pop(key, None)
        Path(argv[3]).parent.mkdir(parents=True, exist_ok=True)
        Path(argv[3]).write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
        return 0
    if mode not in ("raw", "verified"):
        print(__doc__)
        return 2
    bad = 0
    for f in argv[2:]:
        errs = check_file(f, mode == "verified")
        if errs:
            bad += 1
            print(f"FAIL {f}")
            for e in errs:
                print(f"  - {e}")
        else:
            print(f"ok   {f}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
