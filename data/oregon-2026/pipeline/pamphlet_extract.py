#!/usr/bin/env python3
"""Pull each candidate's pages out of a downloaded voters' pamphlet PDF.

  pamphlet_extract.py <pamphlet.pdf> <source_url> <out_dir> <candidate-id>...

Reads inventory names (and name_variants), finds the pages that mention each
candidate, and writes <out_dir>/<candidate-id>.txt with the page text and page
numbers, plus <out_dir>/_index.json. Collectors quote from these files instead
of paging through the PDF with WebFetch; the citation is still <source_url>.
Pages with no text layer (scans) are listed as such so the gap is logged the
same way for everyone.

Download the PDF first, e.g.  curl -sSL -o /tmp/x.pdf <url>  (needs network
access to the county or SOS site).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = {c["id"]: c for c in json.loads((ROOT / "inventory.json").read_text())["candidates"]}


def pages(pdf):
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
    parts = text.split("\f")
    return parts[:-1] if parts and not parts[-1].strip() else parts


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def main(argv):
    if len(argv) < 5:
        print(__doc__)
        return 2
    pdf, url, out = argv[1], argv[2], Path(argv[3])
    out.mkdir(parents=True, exist_ok=True)
    texts = pages(pdf)
    normed = [norm(t) for t in texts]
    scans = [i + 1 for i, t in enumerate(texts) if len(t.strip()) < 10]
    index = {"source_url": url, "pages": len(texts), "pages_without_text": scans, "candidates": {}}
    for cid in argv[4:]:
        c = CANDIDATES[cid]
        names = [c["name"], *c.get("name_variants", [])]
        hits = sorted({i + 1 for i, t in enumerate(normed) for n in names if f" {norm(n)} " in f" {t} "})
        index["candidates"][cid] = hits
        body = [f"source_url: {url}", f"candidate: {c['name']} ({cid})", f"pages: {hits or 'none found'}", ""]
        for p in hits:
            body += [f"===== page {p} =====", texts[p - 1].rstrip(), ""]
        (out / f"{cid}.txt").write_text("\n".join(body))
        print(f"{cid}: pages {hits or '-'}")
    (out / "_index.json").write_text(json.dumps(index, indent=2) + "\n")
    if scans:
        print(f"{len(scans)} pages have no text layer (scans): {scans[:20]}{'...' if len(scans) > 20 else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
