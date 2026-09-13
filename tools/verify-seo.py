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


def verify_no_breadcrumbs(doc, text, url):
    assert not any({'breadcrumb', 'route-breadcrumb'} & set(a.get('class', '').split())
                   or a.get('aria-label', '').lower() == 'breadcrumb'
                   for a in doc.attrs('nav')), f'{url}: unexpected visible breadcrumb navigation'
    # Check embedded route metadata too, so navigation cannot restore old schema.
    assert 'BreadcrumbList' not in text and '#breadcrumb' not in text, f'{url}: stale breadcrumb schema or reference'
    for source in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        assert not any('breadcrumb' in node for node in json.loads(source)['@graph']), f'{url}: stale breadcrumb property'


subprocess.run(['python3', str(ROOT / 'tools/build-seo.py'), '--check'], check=True)
subprocess.run(['python3', str(ROOT / 'tools/sync-project-data.py'), '--check'], check=True)
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
    verify_no_breadcrumbs(doc, text, url)
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
    social = {a.get('property', a.get('name')): a.get('content') for a in meta}
    assert social['twitter:card'] == 'summary_large_image'
    assert social['og:image'] == social['twitter:image']
    assert social['og:image:alt'] and social['twitter:image:alt']
    social_path = urlsplit(social['og:image'])
    assert social_path.netloc == 'hnhresources.com'
    assert (ROOT / social_path.path.lstrip('/')).is_file(), f'{url}: missing sharing image'
    assert int(social['og:image:width']) > 0 and int(social['og:image:height']) > 0
    for attrs, source in re.findall(r'<script([^>]*)>(.*?)</script>', text, re.S):
        if 'application/ld+json' in attrs or 'application/json' in attrs:
            json.loads(source)
            continue
        if 'src=' in attrs:
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
            if re.search(r'\s\d+w(?:,|$)', a['srcset']):
                assert a.get('sizes'), f'{url}: responsive image missing sizes'
            for item in a['srcset'].split(','):
                target = urlsplit(urljoin(url, item.strip().split()[0]))
                if target.netloc == 'hnhresources.com':
                    assert (ROOT / target.path.lstrip('/')).exists()

error_page = (ROOT / '404.html').read_text()
verify_no_breadcrumbs(Document(error_page), error_page, ORIGIN + '/404.html')

assert len(titles) == len(set(titles)), 'Duplicate titles'
assert len(descriptions) == len(set(descriptions)), 'Duplicate descriptions'
home = docs[ORIGIN + '/']
cards = [a for a in home.attrs('a') if 'project-card' in a.get('class', '').split()]
projects = json.loads((ROOT / 'data/projects.json').read_text())['projects']
by_url = {ORIGIN + '/projects/' + p['id'].replace('--', '/') + '/': p for p in projects}
for url, doc in docs.items():
    styles = [a['href'].split('?')[0] for a in doc.attrs('link') if a.get('rel') == 'stylesheet']
    home_styles = [a['href'].split('?')[0] for a in home.attrs('link') if a.get('rel') == 'stylesheet']
    assert styles == home_styles, f'{url}: different shared stylesheets'
    assert '/assets/css/showcase.css' in styles and '/assets/css/brand.css' in styles
    assert len([a for a in doc.attrs('header') if 'site-header' in a.get('class', '').split()]) == 1, f'{url}: missing shared header'
    assert not [a for _, a in doc.tags if 'site-bar' in a.get('class', '').split()], f'{url}: legacy standalone header'
    assert {'site-menu', 'top', 'about', 'clients', 'projects', 'expertise', 'contact',
            'all-projects-grid', 'project-detail-overlay', 'contact-form'}.issubset(doc.ids), f'{url}: incomplete shared shell'
    route_cards = [a for a in doc.attrs('a') if 'project-card' in a.get('class', '').split()]
    assert len(route_cards) == len(projects) + 4, f'{url}: incomplete project archive'
    assert {a['data-project-id'] for a in route_cards} == {p['id'] for p in projects}
    for img in doc.attrs('img'):
        if '/images/projects/' in img.get('src', '') and img.get('alt'):
            assert img.get('srcset') and img.get('sizes'), f'{url}: project image missing candidates'
    if url in by_url:
        record = by_url[url]
        meta = {a.get('property', a.get('name')): a.get('content') for a in doc.attrs('meta')}
        assert meta['description'] == record['detail_description']
        assert meta['og:image'] == ORIGIN + '/' + record['photos'][0]['src']
        assert record['display_name'] in meta['og:title']
assert len(cards) == len(projects) + 4
assert set(a['data-project-id'] for a in cards) == {p['id'] for p in projects}
slides = [a for a in home.attrs('div') if 'hero-slide' in a.get('class', '').split()]
assert len(slides) == 7 and sum('data-bg' in a for a in slides) == 6
assert sum(a.get('rel') == 'preload' and a.get('as') == 'image' for a in home.attrs('link')) == 1
for source in home.attrs('script'):
    if source.get('src'):
        subprocess.run(['node', '--check', str(ROOT / source['src'].split('?')[0].lstrip('/'))], check=True)
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
