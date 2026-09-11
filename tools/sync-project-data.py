#!/usr/bin/env python3
"""Regenerate data/projects.js from data/projects.json for the static H&H site."""
from pathlib import Path
import json
import sys

root = Path(__file__).resolve().parents[1]
source = root / 'data' / 'projects.json'
target = root / 'data' / 'projects.js'
data = json.loads(source.read_text(encoding='utf-8'))
variants = json.loads((root / 'data/image-variants.json').read_text())
for project in data['projects']:
    for photo in project['photos']:
        candidates = variants[photo['src']]['candidates']
        photo['srcset'] = ', '.join(f'{v["src"]} {v["width"]}w' for v in candidates)
        photo['thumbnail'] = candidates[0]['src']
content = 'window.HNH_PROJECT_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
if '--check' in sys.argv:
    if target.read_text() != content:
        raise SystemExit('Run tools/sync-project-data.py to update browser project data.')
    print('PASS: browser project data matches the source and image candidates.')
else:
    target.write_text(content, encoding='utf-8')
    print(f'Wrote {target.relative_to(root)} with {len(data.get("projects", []))} projects.')
