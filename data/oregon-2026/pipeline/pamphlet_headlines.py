#!/usr/bin/env python3
"""Read the labeled background fields from each candidate's voters' pamphlet statement.

  pamphlet_headlines.py <pdf_dir>

Every Oregon pamphlet statement opens with the same labeled lines the candidate
filed: Occupation, Occupational Background, Educational Background, Prior
Governmental Experience, and sometimes one more (Civic Leadership, Community
Service). This script copies those lines word for word from the PDFs listed in
PAMPHLETS below and writes ../pamphlet-headlines.json. It never rewrites or
summarizes what the candidate wrote.

Download the PDFs into <pdf_dir> first, named by the keys of PAMPHLETS, e.g.
  curl -sSL -o <pdf_dir>/sos-book13.pdf <url>

How it reads a page: statements sit two to a page, one per half. In each half it
finds the "Occupation:" label, reads the big name text above it, and matches
that name to the inventory. Fields run until the first gap that is not followed
by another bold "Label:", which is where the candidate's own statement starts.
Candidates found in no pamphlet are listed under "not_found"; the site says
"no pamphlet statement found" for them, never "did not file".

Needs pdfplumber.
"""
import json
import re
import sys
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "pamphlet-headlines.json"
SOS = "https://sos.oregon.gov/elections/Voters-Pamphlet/Documents/VP_G26-Book{}_web.pdf"
# The state pamphlet comes first: it holds every federal, statewide, legislative and judicial
# statement in one layout. County pamphlets add the local races.
PAMPHLETS = {
    **{f"sos-book{n}": ("Oregon Voters' Pamphlet (state)", SOS.format(n)) for n in range(1, 20)},
    "multnomah-county": ("Multnomah County Voters' Pamphlet",
                         "https://multco.us/file/multnomah_county_voters'_pamphlet_-_november_2026_general_election/download"),
    "washington-county": ("Washington County Voters' Pamphlet",
                          "https://www.washingtoncountyor.gov/elections/documents/november-3-2026-voters-pamphlet/download?inline"),
    "clackamas-county": ("Clackamas County Voters' Pamphlet",
                         "https://dochub.clackamas.us/documents/drupal/03f4f9db-a1ab-4a1f-9ce1-16059d49a513"),
}

# Canonical keys for the labels Oregon pamphlets print. Anything else that looks
# like a bold "Label:" right after these is kept under "other" with its own label.
LABELS = {
    "occupation": "occupation",
    "occupational background": "occupational_background",
    "educational background": "educational_background",
    "education background": "educational_background",
    "prior governmental experience": "prior_governmental_experience",
    "prior government experience": "prior_governmental_experience",
}
# Optional fields some candidates add after the standard four. Only these count; any other
# "Something:" after the fields is the start of the candidate's own statement.
EXTRA_LABELS = {"civic leadership", "community service", "community involvement", "community leadership",
                "civic involvement", "community experience", "community volunteer experience", "volunteer experience",
                "volunteer service", "volunteering", "military experience", "military service",
                "community & professional experience", "community involvement & awards"}
LABEL_RE = re.compile(r"^([A-Z][A-Za-z/&,' ]{2,48}?):\s*(.*)$")


def norm(s):
    s = s.replace("’", "'")
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def is_bold(ch):
    return any(k in ch["fontname"] for k in ("Bold", "Black", "Heavy", "Semibold", "SemiBold", "Demi"))


NAMES = {}


def candidate_index():
    inv = json.loads((ROOT / "inventory.json").read_text())
    NAMES.update({c["id"]: c["name"] for c in inv["candidates"]})
    out = []
    for c in inv["candidates"]:
        for n in [c["name"], *c.get("name_variants", [])]:
            toks = norm(n).split()
            out.append((c["id"], toks[0], toks[-1]))
    return [c["id"] for c in inv["candidates"]], out


def match_name(block, index):
    """Inventory ids whose first and last name both appear in the name block.

    When several match (shared surnames), keep the ones whose whole name appears in order."""
    toks = set(norm(block).split())

    def first_ok(first):  # "Matt" in print for "Matthew" on the filing, and the reverse
        return first in toks or any(len(t) >= 3 and len(first) >= 3 and (t.startswith(first) or first.startswith(t)) for t in toks)

    hits = sorted({cid for cid, first, last in index if last in toks and first_ok(first)})
    if len(hits) > 1:
        full = f" {norm(block)} "
        exact = sorted({cid for cid, first, last in index if cid in hits and f" {first} " in full and f" {last} " in full
                        and full.index(f" {first} ") < full.index(f" {last} ")})
        if len(exact) > 1:  # "Sue R Rieke Smith" vs "R W Smith": keep the name with every word present
            whole = [cid for cid in exact if all(t in toks for t in norm(NAMES[cid]).split())]
            exact = whole or exact
        hits = exact or hits
    return hits


def column_entries(page, x0, x1):
    # Sideways text (a rotated caption in the gutter) is not part of either statement.
    col = page.filter(lambda o: o.get("object_type") != "char" or o.get("upright", True)).crop((x0, 0, x1, page.height))
    lines = [l for l in col.extract_text_lines() if l["text"].strip()]
    starts = [i for i, l in enumerate(lines) if l["text"].lstrip().startswith("Occupation:")]
    for k, s in enumerate(starts):
        body = lines[s]["chars"][0]["size"]
        # Name: text printed well above body size, between the previous statement and this label.
        prev_end = starts[k - 1] + 1 if k else 0
        above = [l for l in lines[prev_end:s] if l["chars"][0]["size"] > body * 1.35]
        name = " ".join(l["text"] for l in above[-4:])
        end = starts[k + 1] if k + 1 < len(starts) else len(lines)
        yield name, lines[s:end]


def gutter(page):
    """The x position between the two statement columns: the spot near the middle that the fewest letters cross."""
    w = page.width
    lo, hi = int(w * 0.42), int(w * 0.58)
    cover = [0] * (hi - lo)
    for c in page.chars:
        if c["text"].strip() and c["x1"] > lo and c["x0"] < hi:
            for x in range(max(lo, int(c["x0"]) + 1), min(hi, int(c["x1"]) + 1)):
                if c["x0"] < x < c["x1"]:
                    cover[x - lo] += 1
    best, best_x = None, w / 2
    for x in range(lo, hi):
        n = cover[x - lo]
        if best is None or n < best or (n == best and abs(x - w / 2) < abs(best_x - w / 2)):
            best, best_x = n, x
    return best_x


def label_of(line):
    """The label at the start of a line, if the line opens a field."""
    m = LABEL_RE.match(line["text"].strip())
    if not m:
        return None
    label = m.group(1).strip()
    if label.lower() in LABELS or label.lower() in EXTRA_LABELS:
        return m
    # Other short bold labels only count right after the standard ones (checked by the caller).
    return m if is_bold(line["chars"][0]) and len(label.split()) <= 4 else None


def field_steps(lines):
    """Line steps that are surely inside a field: non-label lines above the last standard label.

    The statement can only start after the last standard label, so these never include its gap."""
    known = [i for i, l in enumerate(lines[:40]) if (m := label_of(l)) and m.group(1).strip().lower() in LABELS]
    if not known:
        return []
    return [lines[i]["top"] - lines[i - 1]["top"] for i in range(1, known[-1])
            if i not in known and lines[i]["top"] - lines[i - 1]["top"] >= lines[i]["chars"][0]["size"] * 0.6]


def line_step(entries):
    """A pamphlet's usual in-field line step, for statements whose fields are all one line long."""
    steps = sorted(st for _, lines in entries for st in field_steps(tidy(lines)))
    return steps[len(steps) // 2] if steps else None


PHOTO_NOTE = re.compile(r"^(No [Pp]hoto( [Ss]ubmitted)?|Submitted)\s*")
SPLIT_LABEL = re.compile(r"^(Prior Governmental|Prior Government|Occupational|Educational)$")


def drop_stray(line):
    """Remove one or two letters sitting far right of the line's words: pieces of a caption
    printed down the gutter, not part of the statement. Lines of only such letters go too."""
    chars = [c for c in line["chars"] if c["text"].strip()]
    if len(chars) <= 2 and len(line["text"].strip()) <= 2:
        return None
    k = len(chars)
    while k > 1 and chars[k - 1]["x0"] - chars[k - 2]["x1"] > 10 and len(chars) - k < 2:
        k -= 1
    if k == len(chars):
        return line
    text = line["text"].rstrip()
    for c in reversed(chars[k:]):
        text = text[: text.rfind(c["text"])].rstrip()
    return {**line, "text": text, "chars": chars[:k]}


def tidy(lines):
    """Drop the "No photo submitted" box text that sits beside the fields, and rejoin labels
    printed across two lines ("Prior Governmental" / "Experience: ...")."""
    out = []
    for l in lines:
        l = drop_stray(l)
        if l is None:
            continue
        text = PHOTO_NOTE.sub("", l["text"].strip())
        if not text:
            continue
        l = {**l, "text": text, "chars": [c for c in l["chars"] if c["text"].strip()][-len(text):] or l["chars"]}
        if out and SPLIT_LABEL.match(out[-1]["text"]) and re.match(r"^(Experience|Background):", text):
            out[-1] = {**out[-1], "text": f"{out[-1]['text']} {text}", "top": l["top"], "bottom": l["bottom"]}
            continue
        out.append(l)
    return out


def read_fields(lines, step):
    """Labeled fields from the Occupation line down to where the statement starts.

    A field continues on the next line when that line follows at the normal line step.
    A bigger gap ends it; the next block is another field only if it opens with a label."""
    lines = tidy(lines)
    own = field_steps(lines)
    own.sort()
    limit = (own[len(own) // 2] if own else step or lines[0]["chars"][0]["size"] * 1.2) * 1.1
    size = lines[0]["chars"][0]["size"]
    # Everything above the last standard label is field text: some candidates leave blank
    # lines inside a field, and the statement can only start after that label.
    std, seen = [], set()
    for i, l in enumerate(lines[:60]):
        m = label_of(l)
        key = m and LABELS.get(m.group(1).strip().lower())
        if key and key not in seen:
            seen.add(key)
            std.append(i)
    last_std = std[-1] if std else 0
    fields, cur, last_top = [], None, None
    for i, l in enumerate(lines):
        text = l["text"].strip()
        step = l["top"] - last_top if last_top is not None else 0
        m = label_of(l)
        known = m and (m.group(1).strip().lower() in LABELS or m.group(1).strip().lower() in EXTRA_LABELS)
        if m and known and len(fields) < 7:
            cur = [m.group(1).strip(), m.group(2).strip()]
            fields.append(cur)
        elif cur is not None and i < last_std:
            cur[1] = join(cur[1], text)
        elif cur is not None and (step <= limit or (not cur[1] and step <= limit * 1.6)) and not is_heading(l, size):
            cur[1] = join(cur[1], text)
        else:
            break
        last_top = l["top"]
    return fields


def is_heading(line, size):
    return line["chars"][0]["size"] > size * 1.2 or (is_bold(line["chars"][0]) and line["text"].isupper())


def join(a, b):
    if not a:
        return b
    if a.endswith("-") and b[:1].islower():  # word broken across lines
        return a[:-1] + b
    if a.endswith(("-", "/")):  # a real hyphen or slash at the line end
        return a + b
    return f"{a} {b}"


def filled(entry):
    return sum(1 for k in ("occupation", "occupational_background", "educational_background", "prior_governmental_experience") if entry.get(k))


def shape(fields):
    out, other = {}, []
    for label, value in fields:
        key = LABELS.get(label.lower())
        value = re.sub(r"\s+", " ", value).strip()
        if key and key not in out:
            out[key] = value
        else:
            other.append({"label": label, "text": value})
    if other:
        out["other"] = other
    return out


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    pdf_dir = Path(argv[1])
    ids, index = candidate_index()
    found, unmatched, conflicts = {}, [], []
    for key, (title, url) in PAMPHLETS.items():
        path = pdf_dir / f"{key}.pdf"
        if not path.exists():
            print(f"missing {path}, skipped")
            continue
        entries = []
        with pdfplumber.open(path) as pdf:
            for pno, page in enumerate(pdf.pages, 1):
                half = gutter(page)
                for x0, x1 in ((0, half), (half, page.width)):
                    entries += [(pno, name, lines) for name, lines in column_entries(page, x0, x1)]
            step = line_step([(n, l) for _, n, l in entries])
            for pno, name, lines in entries:
                fields = read_fields(lines, step)
                ids_hit = match_name(name, index)
                if len(ids_hit) != 1:
                    unmatched.append({"pamphlet": key, "page": pno, "name_text": name, "matches": ids_hit})
                    continue
                cid = ids_hit[0]
                entry = {**shape(fields), "source": {"title": title, "url": url, "page": pno}}
                if cid in found:
                    a = {k: v for k, v in found[cid].items() if k != "source"}
                    b = {k: v for k, v in entry.items() if k != "source"}
                    if a != b:
                        conflicts.append({"id": cid, "kept": found[cid]["source"], "also": entry["source"], "diff": [a, b]})
                    if filled(b) > filled(a):  # keep the copy where every standard field was read
                        found[cid] = entry
                    continue
                found[cid] = entry
        print(f"{key}: {len(found)} candidates so far")
    result = {
        "note": "Generated by pipeline/pamphlet_headlines.py. Labeled background lines copied word for word from each candidate's voters' pamphlet statement.",
        "candidates": dict(sorted(found.items())),
        "not_found": sorted(set(ids) - set(found)),
        "unmatched_statements": unmatched,
        "conflicts": conflicts,
    }
    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(f"{len(found)} found, {len(result['not_found'])} not found, {len(unmatched)} unmatched, {len(conflicts)} conflicts")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
