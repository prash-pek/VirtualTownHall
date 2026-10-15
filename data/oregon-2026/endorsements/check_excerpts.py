"""Check every excerpt in outlets/*.json appears verbatim in its saved source text."""
import json, glob, os, re, sys
base = os.path.dirname(os.path.abspath(__file__))
src = {}
for f in glob.glob(os.path.join(base, 'sources', '*', '*.txt')):
    t = open(f).read(); url = t.split('\n', 1)[0].replace('SOURCE: ', '').strip()
    src[url] = re.sub(r'\s+', ' ', t)
inv = open(os.path.join(base, 'inventory-lookup.txt')).read()
bad = 0
for f in sorted(glob.glob(os.path.join(base, 'outlets', '*.json'))):
    d = json.load(open(f)); n = 0
    for e in d['endorsements']:
        n += 1
        ex = re.sub(r'\s+', ' ', e['excerpt']).strip()
        if e['source'] not in src: print(f, e['id'], 'unknown source', e['source']); bad += 1
        elif ex not in src[e['source']]: print(f, e['id'], 'excerpt not verbatim:', ex[:80]); bad += 1
        for k in ('race_id', 'measure_id', 'candidate_id'):
            if e.get(k) and not re.search(r'(^|\s)' + re.escape(e[k]) + r' \|', inv, re.M): print(f, e['id'], 'bad', k, e[k]); bad += 1
    print(os.path.basename(f), n, 'entries,', len(d.get('unmatched', [])), 'unmatched')
print('problems:', bad); sys.exit(1 if bad else 0)
