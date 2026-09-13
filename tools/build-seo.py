#!/usr/bin/env python3
"""Build crawlable HTML from H&H's maintained content; no hosting build required."""
from pathlib import Path
from html import escape
from datetime import datetime, timezone
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://hnhresources.com'
PROJECTS = json.loads((ROOT / 'data/projects.json').read_text())
SERVICES = json.loads((ROOT / 'data/services.json').read_text())
VARIANTS = json.loads((ROOT / 'data/image-variants.json').read_text())
CATEGORIES = {c['id']: c['name'] for c in PROJECTS['categories']}
BY_ID = {p['id']: p for p in PROJECTS['projects']}
FEATURED = ['artificial-turf--our-tampines-hub', 'acrylic-coating--tanah-merah-country-club',
            'timber-flooring--ngee-ann-polytechnic', 'epdm-flooring--sutd']
DETAILS = FEATURED + ['artificial-turf--ngee-ann-polytechnic', 'acrylic-coating--republic-polytechnic']
HOME = (ROOT / 'index.html').read_text()
ORG = {'@type': 'GeneralContractor', '@id': ORIGIN + '/#organization', 'name': 'H&H Resources',
       'legalName': 'H&H Resources Pte Ltd', 'url': ORIGIN + '/',
       'logo': ORIGIN + '/assets/logos/hnh-logo-160.png', 'email': 'enquiry@hnhresources.com',
       'telephone': '+6591148327', 'address': {'@type': 'PostalAddress',
       'streetAddress': '1 Tampines North Drive 1, #08-49 T-Space',
       'addressLocality': 'Singapore', 'postalCode': '528559', 'addressCountry': 'SG'},
       'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification',
       'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
       'opens': '00:00', 'closes': '23:59'}]}
OUTPUT = {}
PAGES = {}
PRIMARY_PANELS = {'/about-us/': 'about', '/clients/': 'clients', '/projects/': 'projects',
                  '/services/': 'expertise', '/contact/': 'contact'}
NAV = [('About Us', '/about-us/'), ('Clients', '/clients/'), ('Projects', '/projects/'),
       ('Expertise', '/services/'), ('Contact Us', '/contact/')]


def e(value):
    return escape(str(value), quote=True)


def project_url(p):
    return '/projects/' + p['id'].replace('--', '/') + '/' if p['id'] in DETAILS else '/projects/#' + p['id']


def service_for(p):
    return next(s for s in SERVICES if p['category'] in s['categories'])


CARD_SIZES = '(max-width: 560px) calc(100vw - 40px), (max-width: 900px) calc((92vw - 28px) / 2), (max-width: 1440px) calc((92vw - 56px) / 3), 424px'
GALLERY_SIZES = '(max-width: 500px) calc(100vw - 40px), (max-width: 1440px) 92vw, 1325px'
ARCHIVE_SIZES = '(max-width: 620px) calc(100vw - 32px), (max-width: 980px) calc((100vw - 100px) / 2), (max-width: 1440px) calc((100vw - 152px) / 3), 430px'
SHOWCASE_SIZES = '(max-width: 620px) calc((100vw - 40px) / 2), (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1400px) calc((100vw - 112px) / 4), 305px'


def responsive_attrs(photo, sizes):
    candidates = VARIANTS[photo['src']]['candidates']
    srcset = ', '.join(f'/{v["src"]} {v["width"]}w' for v in candidates)
    return f'srcset="{e(srcset)}" sizes="{e(sizes)}"'


def image(p, index=0, eager=False, sizes=CARD_SIZES):
    ph = p['photos'][index]
    w, h = ph['web_dimensions']
    fallback = VARIANTS[ph['src']]['candidates'][0]['src'] if sizes == CARD_SIZES else ph['src']
    return (f'<img src="/{e(fallback)}" {responsive_attrs(ph, sizes)} alt="{e(p["display_name"])} — {e(CATEGORIES[p["category"]])}" '
            f'width="{w}" height="{h}" decoding="async" loading="{"eager" if eager else "lazy"}"'
            + (' fetchpriority="high"' if eager else '') + '>')


def card(p):
    link = f'<a href="{project_url(p)}">Read project details →</a>' if p['id'] in DETAILS else ''
    return (f'<article class="card">{image(p)}'
            f'<h3>{e(p["display_name"])}</h3><p>{e(CATEGORIES[p["category"]])}</p>'
            f'<p>{e(p["detail_description"])}</p>{link}</article>')


def showcase_card(p, i, count, archive=False):
    ph = p['photos'][0]
    w, h = ph['web_dimensions']
    sub = ' · '.join([CATEGORIES[p['category']]] + p.get('certification_text', [])[:1])
    anchor = f' id="{e(p["id"])}"' if archive else ''
    first_in_category = next(item for item in PROJECTS['projects'] if item['category'] == p['category'])
    category_anchor = (f'<span class="category-anchor" id="{e(p["category"])}" aria-hidden="true"></span>'
                       if archive and p == first_in_category else '')
    return (f'<a class="project-card{" all-project-card" if archive else ""}"{anchor} href="{project_url(p)}" '
            f'data-project-id="{e(p["id"])}" data-project-category="{e(p["category"])}">'
            f'{category_anchor}'
            f'<div class="project-media"><span class="project-number">{i:02d} / {count:02d}</span>'
            f'<img src="/{e(VARIANTS[ph["src"]]["candidates"][0]["src"])}" {responsive_attrs(ph, ARCHIVE_SIZES if archive else SHOWCASE_SIZES)} alt="{e(p["display_name"])} — {e(CATEGORIES[p["category"]])}" '
            f'width="{w}" height="{h}" loading="lazy" decoding="async"></div>'
            f'<div class="project-info"><div><h3>{e(p["display_name"])}</h3><p>{e(sub)}</p></div>'
            '<span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
            '<path d="M5 19 19 5M9 5h10v10"/></svg></span></div></a>')


def metadata(title, description, url, kind='WebPage', extra=None, breadcrumbs=None, social=None):
    graph = [ORG, {'@type': kind, '@id': ORIGIN + url + '#webpage', 'url': ORIGIN + url,
                   'name': title, 'description': description, 'inLanguage': 'en-SG',
                   'publisher': {'@id': ORIGIN + '/#organization'}}]
    if extra:
        graph.append(extra)
    if breadcrumbs:
        breadcrumb_id = ORIGIN + url + '#breadcrumb'
        graph[1]['breadcrumb'] = {'@id': breadcrumb_id}
        graph.append({'@type': 'BreadcrumbList', '@id': breadcrumb_id,
                      'itemListElement': [{'@type': 'ListItem', 'position': i,
                                           'name': name, 'item': ORIGIN + path}
                                          for i, (name, path) in enumerate(breadcrumbs, 1)]})
    social = social or {'src': '/og.png', 'width': 1200, 'height': 629,
                        'alt': 'H&H Resources — sports fields, courts, turf and landscape in Singapore',
                        'type': 'image/png'}
    social_url = ORIGIN + social['src']
    schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c')
    return (f'<title>{e(title)}</title>\n<meta name="description" content="{e(description)}">\n'
            f'<link rel="canonical" href="{ORIGIN}{url}">\n'
            '<meta property="og:type" content="website">\n<meta property="og:locale" content="en_SG">\n'
            '<meta property="og:site_name" content="H&amp;H Resources">\n'
            f'<meta property="og:title" content="{e(title)}">\n<meta property="og:description" content="{e(description)}">\n'
            f'<meta property="og:url" content="{ORIGIN}{url}">\n'
            f'<meta property="og:image" content="{e(social_url)}">\n'
            f'<meta property="og:image:type" content="{social["type"]}">\n'
            f'<meta property="og:image:width" content="{social["width"]}">\n'
            f'<meta property="og:image:height" content="{social["height"]}">\n'
            f'<meta property="og:image:alt" content="{e(social["alt"])}">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:image" content="{e(social_url)}">\n'
            f'<meta name="twitter:image:alt" content="{e(social["alt"])}">\n'
            f'<meta name="twitter:title" content="{e(title)}">\n<meta name="twitter:description" content="{e(description)}">\n'
            f'<script type="application/ld+json">{schema}</script>')


def page(url, title, description, heading, content, parent=None, kind='WebPage', extra=None, social=None):
    crumb = '<a href="/">Home</a>'
    if parent:
        crumb += f' <span aria-hidden="true">/</span> <a href="{parent[1]}">{e(parent[0])}</a>'
    label = dict((path, name) for name, path in NAV).get(url, heading)
    crumb += f' <span aria-hidden="true">/</span> <span aria-current="page">{e(label)}</span>'
    breadcrumbs = [('Home', '/')] + ([parent] if parent else []) + [(label, url)]
    PAGES[url] = {'panel': PRIMARY_PANELS.get(url, 'route-detail'), 'title': title,
                  'description': description, 'heading': heading, 'content': content,
                  'breadcrumb': f'<nav class="breadcrumb route-breadcrumb" aria-label="Breadcrumb">{crumb}</nav>',
                  'seo': metadata(title, description, url, kind, extra, breadcrumbs, social)}


def enquiry(label='Discuss your project'):
    return f'<div class="actions"><a class="button" href="/contact/" data-panel="contact">{label}</a><a class="button" href="tel:+6591148327">Call +65 9114 8327</a></div>'


page('/services/', 'Sports Construction Services Singapore | H&H Resources',
     'Sports fields, courts, turf and landscape construction for schools, clubs and government agencies in Singapore. Explore H&H Resources services.',
     'Sports construction services in Singapore', '', kind='CollectionPage')

for s in SERVICES:
    related = [p for p in PROJECTS['projects'] if p['category'] in s['categories']]
    preferred = [BY_ID[x] for x in DETAILS if BY_ID[x] in related]
    selected = (preferred + [p for p in related if p not in preferred])[:6]
    body = f'<p class="intro">{e(s["intro"])}</p><section class="content-section"><h2>Scope of work</h2><ul>' + ''.join(f'<li>{e(x)}</li>' for x in s['scope']) + '</ul></section>'
    if s.get('public_awards'):
        body += '<section class="content-section prose"><h2>Public contract award records</h2>'
        for award in s['public_awards']:
            body += (f'<h3>{e(award["name"])}</h3><p>{e(award["text"])}</p>'
                     f'<p><a href="{e(award["url"])}">SGPBusiness record: {e(award["tender"])}</a></p>')
        body += '<p>The dates above are contract award dates.</p></section>'
    if selected:
        body += '<section class="content-section"><h2>Related project references</h2><div class="card-grid">' + ''.join(card(p) for p in selected) + '</div><p><a href="/projects/">View the full project portfolio →</a></p></section>'
    body += f'<section class="content-section prose"><h2>Planning your project</h2><p>{e(s["planning"])}</p>{enquiry()}</section>'
    page('/services/' + s['id'] + '/', s['title'] + ' | H&H Resources', s['description'], s['title'], body, ('Expertise', '/services/'),
         extra={'@type': 'Service', 'name': s['name'], 'serviceType': s['name'], 'description': s['intro'], 'url': ORIGIN + '/services/' + s['id'] + '/', 'provider': {'@id': ORIGIN + '/#organization'}, 'areaServed': {'@type': 'Country', 'name': 'Singapore'}})

page('/projects/', 'Sports Turf & Surfacing Projects | H&H Resources Singapore',
     'Explore H&H Resources project references across artificial turf, sports court coatings, timber flooring, running tracks and EPDM surfacing in Singapore.',
     'Our project portfolio', '', kind='CollectionPage')

for project_id in DETAILS:
    p = BY_ID[project_id]
    s = service_for(p)
    heading = p['display_name'] + ' — ' + CATEGORIES[p['category']]
    body = f'<p class="intro">{e(p["detail_description"])}</p><dl class="facts"><dt>Location</dt><dd>{e(p["display_name"])}, Singapore</dd><dt>Project type</dt><dd>{e(CATEGORIES[p["category"]])}</dd></dl>'
    body += '<div class="gallery">' + ''.join(f'<figure>{image(p, i, i == 0, GALLERY_SIZES)}<figcaption>{e(heading)} · Photograph {i + 1}</figcaption></figure>' for i in range(len(p['photos']))) + '</div>'
    body += f'<section class="content-section prose"><h2>Related expertise</h2><p>{e(s["intro"])}</p><p><a href="/services/{s["id"]}/">Explore {e(s["name"].lower())} →</a></p><h2>Planning a similar project?</h2><p>{e(s["planning"])}</p>{enquiry()}</section>'
    photo = p['photos'][0]
    page(project_url(p), heading + ' | H&H Resources', p['detail_description'], heading, body, ('Projects', '/projects/'),
         social={'src': '/' + photo['src'], 'width': photo['web_dimensions'][0],
                 'height': photo['web_dimensions'][1], 'alt': heading,
                 'type': 'image/webp' if photo['src'].endswith('.webp') else 'image/jpeg'})

# Main-page content is owned by the corresponding section in index.html.
# Only metadata is defined here; there is no second layout or copy to maintain.
page('/about-us/', 'About H&H Resources | Sports Construction Singapore',
     'Learn about H&H Resources, its roots in 1980 and its golf, turf, landscape and sports-facility construction experience in Singapore.',
     'Built on experience. Made for play.', '', kind='AboutPage')
page('/clients/', 'Clients & School Projects | H&H Resources Singapore',
     'Explore H&H Resources client and school project references across Singapore, including schools, sports clubs, government agencies and community organisations.',
     'Our clients in Singapore', '', kind='CollectionPage')
page('/contact/', 'Contact H&H Resources | Sports Construction Enquiries',
     'Contact H&H Resources about sports construction, turf and surfacing works in Singapore. Call +65 9114 8327 or email enquiry@hnhresources.com.',
     'Start a project with H&H', '', kind='ContactPage')

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

seo = metadata('Sports Fields, Courts & Turf Singapore | H&H Resources',
               'H&H Resources provides sports field, court, turf and landscape construction for schools, clubs and government agencies in Singapore. Explore our projects.', '/')
if '<!-- start:seo -->' in HOME:
    HOME = re.sub(r'<!-- start:seo -->.*?<!-- end:seo -->', lambda m: '<!-- start:seo -->\n' + seo + '\n<!-- end:seo -->', HOME, flags=re.S)
else:
    HOME = re.sub(r'<meta[^>]*name="description"[^>]*>\s*', '', HOME)
    HOME = re.sub(r'<link rel="canonical"[^>]*>\s*', '', HOME)
    HOME = re.sub(r'<title>.*?</title>', lambda m: '<!-- start:seo -->\n' + seo + '\n<!-- end:seo -->', HOME)
PAGES['/'] = {'panel': 'top', 'title': 'Sports Fields, Courts & Turf Singapore | H&H Resources',
              'description': 'H&H Resources provides sports field, court, turf and landscape construction for schools, clubs and government agencies in Singapore. Explore our projects.',
              'seo': seo}

# The homepage owns the showcase markup. Each public URL uses this same shell,
# with its destination already visible in the HTML and its own metadata.
for url, panel in PRIMARY_PANELS.items():
    start, end = f'<!-- start:route-breadcrumb:{panel} -->', f'<!-- end:route-breadcrumb:{panel} -->'
    crumb = start + PAGES[url]['breadcrumb'] + end
    if start in HOME:
        HOME = re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda m: crumb, HOME, flags=re.S)
    else:
        HOME, count = re.subn(rf'(<section[^>]*\bid="{panel}"[^>]*>)', lambda m: m[1] + '\n' + crumb,
                             HOME, count=1)
        assert count == 1, panel

# Closed views are hidden by the shared stylesheet. Leaving their static HTML
# accessible lets no-JavaScript visitors read the expanded archive/accordions.
# The interaction owners apply inert/aria-hidden when JavaScript initializes.
HOME = re.sub(r'<div\b[^>]*class="(?:all-projects-gallery|all-clients-gallery|moe-school-gallery)"[^>]*>',
              lambda m: re.sub(r'\s(?:aria-hidden="true"|inert\b)', '', m[0]), HOME)
HOME = HOME.replace('<div aria-hidden="true" class="expertise-options">', '<div class="expertise-options">')

# A small ordinary navigation remains available when scripts are disabled.
fallback_nav = ('<noscript><nav class="no-script-nav" aria-label="Main navigation">'
                '<a href="/">Home</a>' + ''.join(f'<a href="{url}">{label}</a>' for label, url in NAV)
                + '</nav></noscript>')
HOME = re.sub(r'<!-- start:no-script-nav -->.*?<!-- end:no-script-nav -->\n?', '', HOME, flags=re.S)
HOME = HOME.replace('<main id="top">', '<!-- start:no-script-nav -->' + fallback_nav
                    + '<!-- end:no-script-nav -->\n<main id="top">')


def render_route(url, record):
    panel = record['panel']
    document = re.sub(r'<!-- start:seo -->.*?<!-- end:seo -->',
                      lambda m: '<!-- start:seo -->\n' + record['seo'] + '\n<!-- end:seo -->', HOME, flags=re.S)
    body = f'<body data-route-path="{e(url)}" data-initial-panel="{panel}"'
    if panel != 'top':
        body += f' class="panel-open" data-active-panel="{panel}"'
    document = re.sub(r'<body\b[^>]*>', body + '>', document, count=1)
    if panel == 'route-detail':
        detail = ('<section class="scroll-section route-detail" id="route-detail" aria-labelledby="route-detail-title">'
                  '<div class="route-detail-inner">' + record['breadcrumb']
                  + f'<h1 id="route-detail-title" data-route-heading="route-detail">{e(record["heading"])}</h1>'
                  + record['content'] + '</div></section>\n')
        document = document.replace('</main>', detail + '</main>', 1)

    # The one H1 follows the page being served, without changing shared styling.
    def heading_tag(match):
        tag = 'h1' if match['panel'] == panel else 'h2'
        return f'<{tag}{match["attrs"]}>{match["content"]}</{tag}>'
    document = re.sub(r'<h[12](?P<attrs>[^>]*data-route-heading="(?P<panel>[^"]+)"[^>]*)>'
                      r'(?P<content>.*?)</h[12]>', heading_tag, document, flags=re.S)
    if panel != 'top':
        # Main showcase sections have no nested sections. The detail section is
        # initialized via its opening tag; all of its content is already visible.
        pattern = rf'(<section[^>]*\bid="{panel}"[^>]*>)(.*?)(</section>)'
        def reveal(match):
            opening = re.sub(r'class="([^"]*)"', lambda m: f'class="{m[1]} panel-active section-visible"', match[1], count=1)
            content = re.sub(r'class="([^"]*\breveal\b[^"]*)"',
                             lambda m: f'class="{m[1]} visible"', match[2])
            return opening + content + match[3]
        document, count = re.subn(pattern, reveal, document, count=1, flags=re.S)
        assert count == 1, panel
        # Do not prioritize the hidden homepage hero over a direct page's media.
        document = re.sub(r'<link rel="preload" as="image"[^>]*>\s*', '', document)
        if panel in ('about', 'projects', 'contact'):
            start = document.index(f'id="{panel}"')
            end = document.index('</section>', start)
            active = document[start:end].replace('loading="lazy"', 'loading="eager"', 1)
            document = document[:start] + active + document[end:]

    manifest = {path: {key: value[key] for key in ('panel', 'title', 'description', 'seo')}
                for path, value in PAGES.items() if path == '/' or path in PRIMARY_PANELS or path == url}
    payload = json.dumps(manifest, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    document = re.sub(r'<!-- start:route-manifest -->.*?<!-- end:route-manifest -->',
                      lambda m: '<!-- start:route-manifest --><script type="application/json" id="hnh-route-manifest">'
                      + payload + '</script><!-- end:route-manifest -->', document, flags=re.S)
    return document


for url, record in PAGES.items():
    path = 'index.html' if url == '/' else url.strip('/') + '/index.html'
    OUTPUT[path] = render_route(url, record)

# Preserve lastmod unless a page actually changes. Never invent daily freshness.
old_sitemap = (ROOT / 'sitemap.xml').read_text()
lastmods = dict(re.findall(r'<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>', old_sitemap))
today = datetime.now(timezone.utc).date().isoformat()
urls = []
for path, content in OUTPUT.items():
    target = ROOT / path
    url = ORIGIN + ('/' if path == 'index.html' else '/' + path.removesuffix('index.html'))
    changed = not target.exists() or target.read_text() != content
    urls.append((url, today if changed else lastmods.get(url, today)))
OUTPUT['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{url}</loc><lastmod>{modified}</lastmod></url>\n' for url, modified in sorted(urls)) + '</urlset>\n'

# Keep error pages in the same design without adding them to the sitemap.
page('/404.html', 'Page not found | H&H Resources', 'Find H&H Resources services, projects and contact information.',
     'Page not found.', '<p class="intro">The page you requested is no longer available. Explore our services and projects, or contact us about your site.</p>'
     '<div class="actions"><a class="button" href="/" data-panel="top">Back to Home</a><a class="button" href="/services/" data-panel="expertise">Explore our expertise</a></div>')
PAGES['/404.html']['seo'] += '\n<meta name="robots" content="noindex">'
OUTPUT['404.html'] = render_route('/404.html', PAGES['/404.html'])

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
