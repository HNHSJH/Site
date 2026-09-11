#!/usr/bin/env python3
"""Validate published HTML, canonical routes, local links, schema and JS syntax."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import json
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://hnhresources.com'


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
        self.ids = [a['id'] for _, a in self.tags if 'id' in a]

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def attrs(self, tag):
        return [a for t, a in self.tags if tag == t]


subprocess.run(['python3', str(ROOT / 'tools/build-seo.py'), '--check'], check=True)
sitemap = ET.parse(ROOT / 'sitemap.xml')
urls = [x.text for x in sitemap.findall('.//{*}loc')]
assert len(urls) == len(set(urls))
docs = {}
titles = []
descriptions = []
scripts = 0
checked_links = 0
for url in urls:
    assert url.startswith(ORIGIN + '/') and '#' not in url
    path = ROOT / (urlsplit(url).path.lstrip('/') + 'index.html')
    text = path.read_text()
    doc = Document(text)
    docs[url] = doc
    assert len(doc.attrs('h1')) == 1, f'{url}: expected one H1'
    assert not [x for x, n in Counter(doc.ids).items() if n > 1], f'{url}: duplicate IDs'
    canonicals = [a['href'] for a in doc.attrs('link') if a.get('rel') == 'canonical']
    assert canonicals == [url], f'{url}: canonical mismatch'
    meta = doc.attrs('meta')
    assert not any(a.get('http-equiv', '').lower() == 'refresh' for a in meta), f'{url}: redirect shell'
    assert not any('noindex' in a.get('content', '') for a in meta if a.get('name') == 'robots')
    titles.append(re.search(r'<title>(.*?)</title>', text, re.S).group(1))
    desc = [a['content'] for a in meta if a.get('name') == 'description']
    assert len(desc) == 1 and desc[0]
    descriptions += desc
    assert [a['content'] for a in meta if a.get('property') == 'og:url'] == [url]
    schema = re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)
    assert len(schema) == 1
    graph = json.loads(schema[0])['@graph']
    assert graph[0]['@type'] == 'GeneralContractor'
    assert graph[0]['telephone'] == '+6591148327'
    assert graph[1]['url'] == url
    for attrs, source in re.findall(r'<script([^>]*)>(.*?)</script>', text, re.S):
        if 'application/ld+json' in attrs or 'src=' in attrs:
            continue
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js') as script:
            script.write(source)
            script.flush()
            subprocess.run(['node', '--check', script.name], check=True, capture_output=True)
        scripts += 1
    for _, a in doc.tags:
        for key in ('href', 'src', 'data-bg'):
            if not a.get(key):
                continue
            target = urlsplit(urljoin(url, a[key]))
            if target.netloc != 'hnhresources.com':
                continue
            file = ROOT / unquote(target.path).lstrip('/')
            if file.is_dir():
                file /= 'index.html'
            assert file.exists(), f'{url}: missing {a[key]}'
            if target.fragment and file.suffix == '.html':
                target_doc = Document(file.read_text())
                assert target.fragment in target_doc.ids, f'{url}: missing fragment {a[key]}'
            checked_links += 1
        if 'srcset' in a:
            for item in a['srcset'].split(','):
                target = urlsplit(urljoin(url, item.strip().split()[0]))
                if target.netloc == 'hnhresources.com':
                    assert (ROOT / target.path.lstrip('/')).exists()

assert len(titles) == len(set(titles)), 'Duplicate titles'
assert len(descriptions) == len(set(descriptions)), 'Duplicate descriptions'
home = docs[ORIGIN + '/']
cards = [a for a in home.attrs('a') if 'project-card' in a.get('class', '').split()]
projects = json.loads((ROOT / 'data/projects.json').read_text())['projects']
assert len(cards) == len(projects) + 4
assert set(a['data-project-id'] for a in cards) == {p['id'] for p in projects}
slides = [a for a in home.attrs('div') if 'hero-slide' in a.get('class', '').split()]
assert len(slides) == 7 and sum('data-bg' in a for a in slides) == 6
assert sum(a.get('rel') == 'preload' and a.get('as') == 'image' for a in home.attrs('link')) == 1
for source in home.attrs('script'):
    if source.get('src'):
        subprocess.run(['node', '--check', str(ROOT / source['src'].split('?')[0])], check=True)
        scripts += 1

# Each page must be reachable through ordinary anchors starting at the homepage.
seen = set()
pending = [ORIGIN + '/']
while pending:
    url = pending.pop()
    if url in seen:
        continue
    seen.add(url)
    for a in docs[url].attrs('a'):
        target = urlsplit(urljoin(url, a.get('href', '')))
        canonical = target.scheme + '://' + target.netloc + target.path
        if canonical in docs and canonical not in seen:
            pending.append(canonical)
assert seen == set(urls), f'Orphaned pages: {set(urls) - seen}'
print(f'PASS: {len(urls)} canonical pages, {checked_links} local references, {scripts} executable scripts, '
      f'{len(projects)} crawlable project records; no orphan pages, duplicate metadata or broken local links.')
