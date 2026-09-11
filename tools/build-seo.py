#!/usr/bin/env python3
"""Build crawlable HTML from H&H's maintained content; no hosting build required."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from datetime import date
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://hnhresources.com'
PROJECTS = json.loads((ROOT / 'data/projects.json').read_text())
SERVICES = json.loads((ROOT / 'data/services.json').read_text())
CATEGORIES = {c['id']: c['name'] for c in PROJECTS['categories']}
BY_ID = {p['id']: p for p in PROJECTS['projects']}
FEATURED = ['artificial-turf--our-tampines-hub', 'acrylic-coating--tanah-merah-country-club',
            'timber-flooring--ngee-ann-polytechnic', 'epdm-flooring--sutd']
DETAILS = FEATURED + ['artificial-turf--ngee-ann-polytechnic', 'acrylic-coating--republic-polytechnic']
HOME = (ROOT / 'index.html').read_text()
ORG = {'@type': 'Organization', '@id': ORIGIN + '/#organization', 'name': 'H&H Resources',
       'legalName': 'H&H Resources Pte Ltd', 'url': ORIGIN + '/',
       'logo': ORIGIN + '/assets/logos/hnh-logo.png', 'email': 'enquiry@hnhresources.com',
       'telephone': '+6591148327', 'address': {'@type': 'PostalAddress',
       'streetAddress': '1 Tampines North Drive 1, #08-49 T-Space',
       'addressLocality': 'Singapore', 'postalCode': '528559', 'addressCountry': 'SG'}}
OUTPUT = {}


def e(value):
    return escape(str(value), quote=True)


def project_url(p):
    return '/projects/' + p['id'].replace('--', '/') + '/' if p['id'] in DETAILS else '/projects/#' + p['id']


def service_for(p):
    return next(s for s in SERVICES if p['category'] in s['categories'])


def image(p, index=0, eager=False):
    ph = p['photos'][index]
    w, h = ph['web_dimensions']
    return (f'<img src="/{e(ph["src"])}" alt="{e(p["display_name"])} — {e(CATEGORIES[p["category"]])}" '
            f'width="{w}" height="{h}" decoding="async" loading="{"eager" if eager else "lazy"}"'
            + (' fetchpriority="high"' if eager else '') + '>')


def card(p):
    link = f'<a href="{project_url(p)}">Read project details →</a>' if p['id'] in DETAILS else ''
    return (f'<article class="card" id="{e(p["id"])}">{image(p)}'
            f'<h3>{e(p["display_name"])}</h3><p>{e(CATEGORIES[p["category"]])}</p>'
            f'<p>{e(p["detail_description"])}</p>{link}</article>')


def showcase_card(p, i, count, archive=False):
    ph = p['photos'][0]
    w, h = ph['web_dimensions']
    sub = ' · '.join([CATEGORIES[p['category']]] + p.get('certification_text', [])[:1])
    return (f'<a class="project-card{" all-project-card" if archive else ""}" href="{project_url(p)}" '
            f'data-project-id="{e(p["id"])}" data-project-category="{e(p["category"])}">'
            f'<div class="project-media"><span class="project-number">{i:02d} / {count:02d}</span>'
            f'<img src="{e(ph["src"])}" alt="{e(p["display_name"])} — {e(CATEGORIES[p["category"]])}" '
            f'width="{w}" height="{h}" loading="lazy" decoding="async"></div>'
            f'<div class="project-info"><div><h3>{e(p["display_name"])}</h3><p>{e(sub)}</p></div>'
            '<span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
            '<path d="M5 19 19 5M9 5h10v10"/></svg></span></div></a>')


def metadata(title, description, url, kind='WebPage', extra=None):
    graph = [ORG, {'@type': kind, '@id': ORIGIN + url + '#webpage', 'url': ORIGIN + url,
                   'name': title, 'description': description, 'inLanguage': 'en-SG',
                   'publisher': {'@id': ORIGIN + '/#organization'}}]
    if extra:
        graph.append(extra)
    schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c')
    return (f'<title>{e(title)}</title>\n<meta name="description" content="{e(description)}">\n'
            f'<link rel="canonical" href="{ORIGIN}{url}">\n'
            '<meta property="og:type" content="website">\n<meta property="og:locale" content="en_SG">\n'
            '<meta property="og:site_name" content="H&amp;H Resources">\n'
            f'<meta property="og:title" content="{e(title)}">\n<meta property="og:description" content="{e(description)}">\n'
            f'<meta property="og:url" content="{ORIGIN}{url}">\n<meta name="twitter:card" content="summary">\n'
            f'<meta name="twitter:title" content="{e(title)}">\n<meta name="twitter:description" content="{e(description)}">\n'
            f'<script type="application/ld+json">{schema}</script>')


def page(url, title, description, heading, content, parent=None, kind='WebPage', extra=None):
    nav = [('About Us', '/about-us/'), ('Clients', '/clients/'), ('Projects', '/projects/'),
           ('Expertise', '/services/'), ('Contact Us', '/contact/')]
    links = ''.join(f'<a href="{href}"' + (' aria-current="page"' if href == url else '') + f'>{label}</a>' for label, href in nav)
    crumb = '<a href="/">Home</a>'
    if parent:
        crumb += f' <span aria-hidden="true">/</span> <a href="{parent[1]}">{e(parent[0])}</a>'
    crumb += f' <span aria-hidden="true">/</span> <span aria-current="page">{e(heading)}</span>'
    cls = ' class="clients-page"' if url == '/clients/' else ''
    OUTPUT[url.strip('/') + '/index.html'] = f'''<!doctype html>
<html lang="en-SG"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
{metadata(title, description, url, kind, extra)}
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#eff3ed"><link rel="stylesheet" href="/assets/css/content-pages.css?v=20260911">
</head><body{cls}><a class="skip-link" href="#main">Skip to content</a>
<header class="site-bar"><a class="brand" href="/"><img src="/assets/logos/hnh-logo.png" width="48" height="48" alt="">H&amp;H Resources</a><nav class="site-nav" aria-label="Main navigation">{links}</nav></header>
<main class="page" id="main"><nav class="breadcrumb" aria-label="Breadcrumb">{crumb}</nav><h1>{e(heading)}</h1>{content}</main>
<footer class="site-footer"><div class="footer-inner"><div>H&amp;H Resources Pte Ltd<br>1 Tampines North Drive 1, #08-49 T-Space, Singapore 528559</div><div><a href="tel:+6591148327">+65 9114 8327</a><br><a href="mailto:enquiry@hnhresources.com">enquiry@hnhresources.com</a></div></div></footer>
</body></html>
'''


def enquiry(label='Discuss your project'):
    return f'<div class="actions"><a class="button" href="/#contact">{label}</a><a class="button" href="tel:+6591148327">Call +65 9114 8327</a></div>'


service_cards = ''.join(f'<article class="service"><h2><a href="/services/{s["id"]}/">{e(s["name"])}</a></h2><p>{e(s["intro"])}</p></article>' for s in SERVICES)
page('/services/', 'Sports Construction Services Singapore | H&H Resources',
     'Explore H&H Resources services in Singapore: golf courses, turf and landscape, sports fields, court surfacing, irrigation and specialised surfaces.',
     'Sports construction services in Singapore', '<p class="intro">Explore our golf, turf, landscape and sports-facility construction capabilities.</p><div class="service-grid">' + service_cards + '</div>' + enquiry(), kind='CollectionPage')

for s in SERVICES:
    related = [p for p in PROJECTS['projects'] if p['category'] in s['categories']]
    preferred = [BY_ID[x] for x in DETAILS if BY_ID[x] in related]
    selected = (preferred + [p for p in related if p not in preferred])[:6]
    body = f'<p class="intro">{e(s["intro"])}</p><section class="content-section"><h2>Scope of work</h2><ul>' + ''.join(f'<li>{e(x)}</li>' for x in s['scope']) + '</ul></section>'
    if selected:
        body += '<section class="content-section"><h2>Related project references</h2><div class="card-grid">' + ''.join(card(p) for p in selected) + '</div><p><a href="/projects/">View the full project portfolio →</a></p></section>'
    body += f'<section class="content-section prose"><h2>Planning your project</h2><p>{e(s["planning"])}</p>{enquiry()}</section>'
    page('/services/' + s['id'] + '/', s['title'] + ' | H&H Resources', s['description'], s['title'], body, ('Expertise', '/services/'),
         extra={'@type': 'Service', 'name': s['name'], 'serviceType': s['name'], 'description': s['intro'], 'url': ORIGIN + '/services/' + s['id'] + '/', 'provider': {'@id': ORIGIN + '/#organization'}, 'areaServed': {'@type': 'Country', 'name': 'Singapore'}})

portfolio = '<p class="intro">Explore our portfolio of artificial turf, acrylic court coatings, landscape artificial turf, running tracks, timber flooring and EPDM surfacing.</p>'
portfolio += '<nav class="actions" aria-label="Project categories">' + ''.join(f'<a href="#{c["id"]}">{e(c["name"])}</a>' for c in PROJECTS['categories']) + '</nav>'
for c in PROJECTS['categories']:
    portfolio += f'<section class="content-section" id="{c["id"]}"><h2>{e(c["name"])} projects</h2><div class="card-grid">' + ''.join(card(p) for p in PROJECTS['projects'] if p['category'] == c['id']) + '</div></section>'
page('/projects/', 'Sports Turf & Surfacing Projects | H&H Resources Singapore', 'Explore H&H Resources project references across artificial turf, sports court coatings, timber flooring, running tracks and EPDM surfacing in Singapore.', 'Our project portfolio', portfolio + enquiry(), kind='CollectionPage')

for project_id in DETAILS:
    p = BY_ID[project_id]
    s = service_for(p)
    heading = p['display_name'] + ' — ' + CATEGORIES[p['category']]
    body = f'<p class="intro">{e(p["detail_description"])}</p><dl class="facts"><dt>Location</dt><dd>{e(p["display_name"])}, Singapore</dd><dt>Project type</dt><dd>{e(CATEGORIES[p["category"]])}</dd></dl>'
    body += '<div class="gallery">' + ''.join(f'<figure>{image(p, i, i == 0)}<figcaption>{e(heading)} · Photograph {i + 1}</figcaption></figure>' for i in range(len(p['photos']))) + '</div>'
    body += f'<section class="content-section prose"><h2>Related expertise</h2><p>{e(s["intro"])}</p><p><a href="/services/{s["id"]}/">Explore {e(s["name"].lower())} →</a></p><h2>Planning a similar project?</h2><p>{e(s["planning"])}</p>{enquiry()}</section>'
    page(project_url(p), heading + ' | H&H Resources', p['detail_description'], heading, body, ('Projects', '/projects/'))

about = re.search(r'<div class="about-copy">(.*?)</div>', HOME, re.S).group(1)
page('/about-us/', 'About H&H Resources | Sports Construction Singapore', 'Learn about H&H Resources, its roots in 1980 and its golf, turf, landscape and sports-facility construction experience in Singapore.', 'Built on experience. Made for play.',
     '<div class="split"><div class="prose">' + about + '</div><img src="/assets/images/about/hnh-course-construction-800.webp" width="800" height="600" alt="Golf course construction works" fetchpriority="high"></div><section class="content-section"><h2>Explore H&amp;H</h2><p><a href="/services/">Our construction expertise</a> · <a href="/projects/">Our project portfolio</a> · <a href="/clients/">Our clients</a></p>' + enquiry() + '</section>', kind='AboutPage')

class Logos(HTMLParser):
    def __init__(self):
        super().__init__()
        self.logos = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'img' and 'assets/logos/clients/' in a.get('src', ''):
            pair = (a['src'], a['alt'])
            if pair not in self.logos:
                self.logos.append(pair)

logos = Logos()
logos.feed(HOME)
clients = '<p class="intro">Long-standing partnerships across Singapore, including schools, institutions, clubs and community organisations.</p><div class="client-grid">'
clients += ''.join(f'<div class="client"><img src="/{e(src)}" alt="" width="240" height="82" loading="lazy"><p>{e(name)}</p></div>' for src, name in logos.logos) + '</div>'
schools = re.findall(r'<div class="moe-school-group">(.*?)</div>', HOME, re.S)
clients += '<section class="content-section"><h2>School project references</h2><div class="school-groups">' + ''.join('<div>' + group + '</div>' for group in schools) + '</div></section><p><a href="/projects/">Explore our project portfolio →</a></p>'
page('/clients/', 'Clients & School Projects | H&H Resources Singapore', 'Explore H&H Resources clients and school project references across Singapore, including educational institutions, sports clubs and community organisations.', 'Our clients in Singapore', clients, kind='CollectionPage')

page('/contact/', 'Contact H&H Resources | Sports Construction Enquiries', 'Contact H&H Resources about sports construction, turf and surfacing works in Singapore. Call +65 9114 8327 or email enquiry@hnhresources.com.', 'Start a project with H&H',
     '<p class="intro">Tell us about your golf, turf, landscape or sports-surface project.</p><div class="split"><section class="content-section"><h2>Contact details</h2><p><a href="tel:+6591148327">+65 9114 8327</a><br><a href="mailto:enquiry@hnhresources.com">enquiry@hnhresources.com</a></p><address>1 Tampines North Drive 1<br>#08-49 T-Space<br>Singapore 528559</address></section><section class="content-section"><h2>Send a project enquiry</h2><p>Use our enquiry form to share your project type, a brief description and supporting attachments. Site photographs and drawings help us understand the scope.</p>' + enquiry('Open enquiry form') + '</section></div><section class="content-section"><h2>Explore our work</h2><p><a href="/services/">Construction services</a> · <a href="/projects/">Project portfolio</a></p></section>', kind='ContactPage')

# Static cards remain the canonical markup. JavaScript adds filtering and popups.
for grid_id, records, archive in [('selected-projects-grid', [BY_ID[x] for x in FEATURED], False), ('all-projects-grid', PROJECTS['projects'], True)]:
    content = ''.join(showcase_card(p, i, len(records), archive) for i, p in enumerate(records, 1))
    # Explicit markers make subsequent regeneration independent of nested cards.
    start = f'<!-- start:{grid_id} -->'
    end = f'<!-- end:{grid_id} -->'
    if start in HOME:
        HOME = re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda m: start + content + end, HOME, flags=re.S)
    else:
        HOME, n = re.subn(rf'(<div[^>]*id="{grid_id}"[^>]*>)</div>', lambda m: m[1] + start + content + end + '</div>', HOME)
        if n != 1:
            raise ValueError('Expected one empty grid: ' + grid_id)

seo = metadata('Sports Turf & Surface Construction Singapore | H&H Resources',
               'H&H Resources provides golf, turf, landscape and sports-facility construction in Singapore. Explore our project portfolio and discuss your requirements.', '/')
if '<!-- start:seo -->' in HOME:
    HOME = re.sub(r'<!-- start:seo -->.*?<!-- end:seo -->', lambda m: '<!-- start:seo -->\n' + seo + '\n<!-- end:seo -->', HOME, flags=re.S)
else:
    HOME = re.sub(r'<meta[^>]*name="description"[^>]*>\s*', '', HOME)
    HOME = re.sub(r'<link rel="canonical"[^>]*>\s*', '', HOME)
    HOME = re.sub(r'<title>.*?</title>', lambda m: '<!-- start:seo -->\n' + seo + '\n<!-- end:seo -->', HOME)
OUTPUT['index.html'] = HOME

# Preserve lastmod unless a page actually changes. Never invent daily freshness.
old_sitemap = (ROOT / 'sitemap.xml').read_text()
lastmods = dict(re.findall(r'<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>', old_sitemap))
today = date.today().isoformat()
urls = []
for path, content in OUTPUT.items():
    target = ROOT / path
    url = ORIGIN + ('/' if path == 'index.html' else '/' + path.removesuffix('index.html'))
    changed = not target.exists() or target.read_text() != content
    urls.append((url, today if changed else lastmods.get(url, today)))
OUTPUT['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{url}</loc><lastmod>{modified}</lastmod></url>\n' for url, modified in sorted(urls)) + '</urlset>\n'

if '--check' in sys.argv:
    stale = [path for path, content in OUTPUT.items() if not (ROOT / path).exists() or (ROOT / path).read_text() != content]
    if stale:
        raise SystemExit('Generated content needs rebuilding: ' + ', '.join(stale))
    print(f'PASS: {len(urls)} canonical pages are up to date.')
else:
    for path, content in OUTPUT.items():
        target = ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
    print(f'Built {len(urls)} canonical pages, static project cards and sitemap.')
