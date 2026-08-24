#!/usr/bin/env python3
"""Regenerate data/projects.js from data/projects.json for the static H&H site."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
source = root / 'data' / 'projects.json'
target = root / 'data' / 'projects.js'
data = json.loads(source.read_text(encoding='utf-8'))
target.write_text(
    'window.HNH_PROJECT_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8'
)
print(f'Wrote {target.relative_to(root)} with {len(data.get("projects", []))} projects.')
