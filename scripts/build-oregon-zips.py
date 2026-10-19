"""
Builds lib/ballot/oregon-zips.json: for each Oregon ZIP (Census ZCTA), the counties, cities and
districts it overlaps, with the share of the ZIP's land area in each.

Source: Census 2020 relationship files (www2.census.gov/geo/docs/maps-data/data/rel2020/),
119th Congress and 2024 state legislative districts. Download these into one folder and pass it:

  cd-sld/tab20_cd11920_zcta520_st41.txt
  cd-sld/tab20_sldu202420_zcta520_st41.txt
  cd-sld/tab20_sldl202420_zcta520_st41.txt
  zcta520/tab20_zcta520_county20_natl.txt
  zcta520/tab20_zcta520_place20_natl.txt

  python3 scripts/build-oregon-zips.py <folder>

Land area is a stand-in for where people live, so tiny slivers (under 1%) are dropped.
"""

import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

SLIVER = 0.01
folder = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "lib" / "ballot" / "oregon-zips.json"


def rows(name):
    with open(folder / name, encoding="utf-8-sig", newline="") as f:
        yield from csv.DictReader(f, delimiter="|")


zip_land = {}
layers = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))


def add(layer, zcta, zland, key, part):
    if not zcta or not zland or int(zland) == 0:
        return
    zip_land[zcta] = int(zland)
    layers[zcta][layer][key] += int(part)


for layer, name, col in [
    ("cd", "tab20_cd11920_zcta520_st41.txt", "GEOID_CD119_20"),
    ("sd", "tab20_sldu202420_zcta520_st41.txt", "GEOID_SLDU2024_20"),
    ("hd", "tab20_sldl202420_zcta520_st41.txt", "GEOID_SLDL2024_20"),
]:
    for r in rows(name):
        add(layer, r["GEOID_ZCTA5_20"], r["AREALAND_ZCTA5_20"], int(r[col][2:]), r["AREALAND_PART"])

oregon = set(zip_land)

for r in rows("tab20_zcta520_county20_natl.txt"):
    if r["GEOID_ZCTA5_20"] in oregon and r["GEOID_COUNTY_20"].startswith("41"):
        name = re.sub(r" County$", "", r["NAMELSAD_COUNTY_20"])
        add("county", r["GEOID_ZCTA5_20"], r["AREALAND_ZCTA5_20"], name, r["AREALAND_PART"])

for r in rows("tab20_zcta520_place20_natl.txt"):
    # Incorporated cities only; Census-designated places have no city government or ballot.
    if r["GEOID_ZCTA5_20"] in oregon and r["GEOID_PLACE_20"].startswith("41") and r["NAMELSAD_PLACE_20"].endswith(" city"):
        name = r["NAMELSAD_PLACE_20"][: -len(" city")]
        add("city", r["GEOID_ZCTA5_20"], r["AREALAND_ZCTA5_20"], name, r["AREALAND_PART"])

result = {}
for zcta in sorted(oregon):
    entry = {}
    for layer in ["county", "city", "cd", "sd", "hd"]:
        parts = [
            [key, round(area / zip_land[zcta], 2)]
            for key, area in layers[zcta][layer].items()
            if area / zip_land[zcta] >= SLIVER
        ]
        entry[layer] = sorted(parts, key=lambda p: -p[1])
    result[zcta] = entry

out.write_text(json.dumps(result, separators=(",", ":")) + "\n")
print(f"wrote {len(result)} ZIPs to {out}")
