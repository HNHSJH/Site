#!/usr/bin/env python3
"""Build smaller WebP candidates without altering the supplied project photographs.

Requires Pillow (pip install Pillow). Run before sync-project-data.py/build-seo.py.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'data/image-variants.json'
WIDTHS = (480, 960)
QUALITY = 76
old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
manifest = {}
created = 0

for project in json.loads((ROOT / 'data/projects.json').read_text())['projects']:
    for photo in project['photos']:
        src = photo['src']
        source = ROOT / src
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        cached = old.get(src, {})
        if (cached.get('sha256') == digest and cached.get('quality') == QUALITY
                and cached.get('widths') == list(WIDTHS)
                and all((ROOT / v['src']).exists() for v in cached.get('candidates', []))):
            manifest[src] = cached
            continue
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert('RGB')
            candidates = []
            for width in WIDTHS:
                if width >= image.width:
                    continue
                height = round(image.height * width / image.width)
                target = source.with_name(f'{source.stem}-{width}w.webp')
                image.resize((width, height), Image.Resampling.LANCZOS).save(
                    target, 'WEBP', quality=QUALITY, method=6)
                candidates.append({'src': target.relative_to(ROOT).as_posix(),
                                   'width': width, 'height': height})
                created += 1
            candidates.append({'src': src, 'width': image.width, 'height': image.height})
            manifest[src] = {'sha256': digest, 'quality': QUALITY,
                             'widths': list(WIDTHS), 'candidates': candidates}

MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Built {created} smaller images; {len(manifest)} original photographs preserved.')
