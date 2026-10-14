#!/usr/bin/env python3
"""Apply confirmed corrections to inventory.json.

Sources, in order:
  1. reports/inventory_fixes.json entries with status "confirmed"
  2. verified/candidates/*.json: `incumbent` (with incumbent_source_url) and `name_variants`

Prints every change. Ids, references and candidate_ids order are never touched.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
inv_path = ROOT / "inventory.json"
inv = json.loads(inv_path.read_text())
cands = {c["id"]: c for c in inv["candidates"]}
races = {r["id"]: r for r in inv["races"]}
SETTABLE = {"name", "incumbent", "seats", "source_url"}


def change(obj, field, value, why):
    if obj.get(field) != value:
        print(f"{obj['id']}.{field}: {obj.get(field)!r} -> {value!r}  ({why})")
        obj[field] = value


for fix in json.loads((ROOT / "reports/inventory_fixes.json").read_text()):
    if fix.get("status") != "confirmed" or fix["field"] not in SETTABLE:
        continue
    target = cands.get(fix["target"]) or races.get(fix["target"])
    if target is None:
        raise SystemExit(f"unknown target {fix['target']}")
    old = target.get(fix["field"])
    change(target, fix["field"], fix["proposed"], fix["evidence_url"])
    if fix["field"] == "name" and old and old != fix["proposed"]:
        variants = target.setdefault("name_variants", [])
        if old not in variants:
            variants.append(old)
    if fix["field"] == "incumbent":
        target["incumbent_source_url"] = fix["evidence_url"]

for path in sorted((ROOT / "verified/candidates").glob("*.json")):
    v = json.loads(path.read_text())
    c = cands[v["id"]]
    if "incumbent" in v and (v["incumbent"] is None or v.get("incumbent_source_url")):
        change(c, "incumbent", v["incumbent"], v.get("incumbent_source_url") or "verified: unsupported")
        if v.get("incumbent_source_url"):
            c["incumbent_source_url"] = v["incumbent_source_url"]
        else:
            c.pop("incumbent_source_url", None)
    for name in v.get("name_variants") or []:
        variants = c.setdefault("name_variants", [])
        if name != c["name"] and name not in variants:
            variants.append(name)

inv_path.write_text(json.dumps(inv, indent=2, ensure_ascii=False) + "\n")
