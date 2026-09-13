# H&H Resources Website

GitHub Pages-ready static site.

## Deploy

1. Create a GitHub repository.
2. Upload the contents of this folder **at the repository root**.
3. In GitHub: **Settings → Pages → Deploy from a branch → `main` / root**.
4. Open the generated GitHub Pages URL.

`index.html` is the landing page. No build step is required.

## Project library

- 63 supplied project references
- 82 supplied project photographs (81 WebP and 1 JPEG), plus responsive WebP candidates
- 6 project categories
- Structured source: `data/projects.json`
- Browser data file: `data/projects.js`
- Project UI logic: `assets/js/projects.js`

### Add a new project later

1. Add optimized WebP images under `assets/images/projects/<category>/<project-slug>/`.
2. Add the project record to `data/projects.json`.
3. Run `python tools/build-images.py` (requires Pillow) to generate smaller candidates, then `python tools/sync-project-data.py` to regenerate `data/projects.js`.
4. Run `python tools/build-seo.py` and `python tools/verify-seo.py` to update and validate the crawlable pages, homepage cards and sitemap.

The project archive is data-driven and does not require hand-writing dozens of HTML cards.

## SEO pages and maintenance

Every public URL uses the same showcase shell, header, menu, branding and interaction owners. The five main page URLs open the same slide panels as homepage navigation, including when reached from search results, opened in a new tab or refreshed. The six service and six selected project detail pages present their full content inside a scrollable detail panel using the shared design. The 404 page uses this shell too, with `noindex` and no sitemap entry. Project cards are generated into the initial HTML; JavaScript adds filtering and popups without recreating them.

`assets/js/panels.js` owns real-path navigation, direct entry, Home and browser Back/Forward. The generator emits the correct active panel and H1 before JavaScript runs, plus the `hnh-route-manifest` needed to update metadata during in-document navigation. Legacy panel hashes, project category hashes and all 63 project-reference fragments remain supported. A link to a detail document not present in the current shell navigates normally. Modified clicks retain normal browser behavior.

There are 18 canonical, sitemap-listed HTML pages: the homepage, About Us, Clients, Projects, Expertise and Contact, six service pages, and six selected project pages. Each has a unique title and description, self-referencing canonical, Open Graph and X sharing titles, descriptions and images and GeneralContractor (a LocalBusiness/Organization subtype) structured data. Service pages also carry Service structured data. All pages use the shared header and menu without breadcrumb trails or BreadcrumbList structured data. No certification validity dates, project completion dates, measured outcomes, reviews, opening hours or incorporation dates are inferred.

- Maintain service descriptions in `data/services.json`.
- The owner-confirmed search priorities are sports fields, courts, and turf/landscape for schools, clubs and government agencies. Homepage metadata, About Us and service descriptions use this focus while retaining Singapore as the existing service area. The Expertise directory follows the established showcase category order.
- Optional `public_awards` in `data/services.json` render attributed contract award records on service pages. Preserve the source URLs and distinguish award dates from completion dates; do not assume an award matches the date or exact works in a portfolio photograph.
- Maintain project facts in `data/projects.json` and regenerate `data/projects.js` using the existing sync tool.
- Maintain main-page content in its corresponding section of `index.html`; there is no second version of the About Us, Clients, Projects, Expertise or Contact layout.
- `tools/build-seo.py` owns the generated documents, route manifests, SEO metadata and marked project-card regions. It derives every document from the homepage shell. Run it after content or shell edits; do not edit generated pages directly. Executable behavior belongs to the shared files in `assets/js/`, and detailed-content styling in `assets/css/content-pages.css` is scoped to the shared detail panel.
- `tools/verify-seo.py` checks canonical routes, metadata, schema JSON, internal links and fragments, assets, executable JavaScript syntax, static project coverage and page discoverability. It also rejects breadcrumb navigation and stale breadcrumb schema across published pages and the 404 page. It needs Python 3 and Node.js, with no third-party packages.
- GitHub Pages serves the committed HTML directly. No hosting build or framework migration is required.
- Sitemap `lastmod` values change only when the generated page changes.
- The first homepage hero photo is preloaded. Later photos load as the slideshow advances. Offscreen project and client images use native lazy loading. Original photographs are retained; 480px and 960px WebP candidates (where smaller than the source) are selected through `srcset` and layout-specific `sizes`. Popup thumbnails use the smallest candidate, and popup main images and static galleries also use responsive sources. `data/image-variants.json` is generated by `tools/build-images.py`; project descriptions remain unchanged.
- Every document has one H1 for its active route; in-document navigation keeps it aligned with the URL and metadata. The homepage's business heading is stable while project location and surface labels change with the selected photograph.

### Consistent direct routes — 13 September 2026

The separate content-page header and layout were removed. Main routes now reuse the original showcase panels, while detail pages retain their existing descriptions, photographs, service scope and attributed contract records in the shared design. Browser asset URLs are root-relative, including generated popup photo candidates, so nested URLs load the same images. No-JavaScript visits can read the initial page, with ordinary navigation and expanded project/client archives or service choices.

Run the existing checks and the browser route checks before release:

```sh
python tools/verify-seo.py
NODE_PATH=/tmp/hnh-verification/node_modules node tools/verify-interactions.cjs
# Start a local static server and run with Playwright available in NODE_PATH.
HNH_TEST_URL=http://127.0.0.1:8765 node tools/verify-routes.cjs
```

The route check covers all 18 canonical URLs at desktop and mobile widths, direct loading, refresh, initial no-JavaScript content, route metadata/H1, nested images, Home, navigation history and legacy fragments. `HNH_CHROMIUM_EXECUTABLE` can point to an existing Chromium installation. These checks do not submit the contact form or verify email delivery.

### Follow-up information needed from the owner

1. Search Console indexing/performance reports once processing completes, plus the Google Business Profile URL if optimisation is wanted. The owner has signed in to Search Console.
2. Confirm any geographic coverage beyond the site's existing Singapore focus, if applicable. Priority services and target customer groups have been supplied and implemented.
3. Project dates, exact scope, surface systems, dimensions, outcomes and approved testimonials for fuller case studies.
4. Current BCA registration details and bizSAFE status/validity, plus verified official profile URLs for structured-data links.
The owner confirmed **24/7 business hours** and **+65 9114 8327** as the primary number. Both are published in contact information and structured data. Other directory telephone numbers do not override these owner-confirmed details.

The owner enabled **Enforce HTTPS** on 11 September 2026. A live request to `http://hnhresources.com/` returned HTTP 301 to `https://hnhresources.com/`, followed by HTTP 200. This item is complete. The owner reports that they are now signed in to Search Console and most reports show “processing data”. [Google says newly added properties can take up to a week to generate data](https://support.google.com/webmasters/answer/96568?hl=en). Account access and report contents have not been independently inspected here. Submit `https://hnhresources.com/sitemap.xml` in Search Console if not already submitted, and use URL Inspection for the HTTPS homepage.

### Public research follow-up — 11 September 2026

The following records were found in SGPBusiness, a secondary directory. Current certificate validity could not be independently checked against BCA or WSHC records, so no new current-status certification claims were added.

- [Company record](https://www.sgpbusiness.com/company/H-H-Resources-Pte-Ltd): UEN 200822717G; incorporation 5 December 2008; registered address matches the website. The 1980 company-reported lineage remains distinct from incorporation. The directory lists +65 6443 4796 and +65 6904 3383; the owner has confirmed that +65 9114 8327 remains the primary number.
- The same directory lists CW01 C3, CW02 C2 and FM03 L3 through 1 May 2029, and GB1 through 17 October 2028. Obtain current BCA documents or an accessible official company record before publishing these as verified credentials. Current bizSAFE Level 4 validity and official social profiles were not confirmed. Business hours were subsequently confirmed directly by the owner as 24/7.
- [MOE Phase 10 school synthetic turf](https://www.sgpbusiness.com/government/procurement/tender-number/MOE000ETT24000037): H&H is one of two suppliers awarded items on 27 January 2025. Published on the sports field service page with attribution; no exclusive award or completion claim.
- [Our Tampines Hub Town Square turf](https://www.sgpbusiness.com/government/procurement/tender-number/PAS000ETT24000062): award on 10 September 2024, with a three-year maintenance period and a three-year extension option. Published on the sports field service page with attribution.
- [Company procurement records](https://www.sgpbusiness.com/company/H-H-Resources-Pte-Ltd/government-procurement): Republic Polytechnic outdoor court replacement, RPO000ETT24000011, awarded 13 August 2024; published on the court service page with attribution. The same source lists Ngee Ann Polytechnic Block 16 artificial turf replacement, NPO000ETT23000021, awarded 15 November 2023; retained here as a research lead for a fuller owner-confirmed case study.

Contract values, programme totals, completion dates, dimensions and outcomes were not inferred or added. Public award records supplement the existing owner-supplied portfolio; they do not date its photographs.

The 11 September SEO release was checked with the static validator and simulated DOM interactions for panels, project filters, project popups, client/MOE navigation, service accordions, contact navigation, modified link clicks, history navigation and the stable H1. Browser rendering and physical-device visual acceptance remain unverified because the browser cannot access this static checkout's local preview.

## Showcase images

The showcase is fully local and references the exact cover photograph used by the matching project record under `assets/images/projects/`. This keeps the showcase and All Projects imagery consistent and avoids duplicate hero files.

## About Us and Expertise

The About Us photograph is served as local 800px / 1600px WebP assets. Its right-hand text panel uses a 78%-opaque background, with internal scrolling when needed on smaller screens. Edit the wording in `.about-copy` in `index.html` and the appearance in `assets/css/showcase.css`. The Contact Us information panel matches the About Us surface colour, 78% opacity, 3px backdrop blur, border and shadow. The BCA and bizSAFE Level 4 assets sit at the top right of the Expertise heading, above the category list. Both cutouts were rebuilt from the resupplied originals, resized to 480px and encoded as lossless WebP with genuine alpha transparency. Their reduced display sizes are retained, without a background, border or glow; content-hash query strings refresh cached logo images. Expertise now uses a plain white background with dark green headings, readable grey body text and subtle dividers. Expertise content starts lower in the viewport; its three navigation controls retain their existing positions.

Projects and Contact Us retain full-viewport photographs with `object-fit: cover`, a small homepage-style overscan and dark gradient overlays. Clients uses the supplied pale green (`#DEE7DE`), while Expertise stays plain white:

| Section | Background |
| --- | --- |
| Projects | Seng Kang Primary School — artificial turf |
| Clients | Pale green `#DEE7DE` |
| Expertise | Plain white |
| Contact Us | Republic Polytechnic — acrylic coating |

The Clients section groups View All Clients, the selected-client grid and the heading together slightly above the centre of the viewport. The button sits at the top right, 16px above the grid, and the heading follows 22–30px below it. Automatic margins surround the whole composition rather than separating the grid from the heading; they collapse on short screens so all content remains scrollable above the fixed navigation. Clients uses the original joined logo grid with shared borders and no gutters between tiles. Projects and Clients retain a 1280px gallery width, 16px button-to-gallery spacing and one `.archive-trigger` button component. Its dimensions and interactions are shared, with a dark-text colour scheme for the pale green Clients page. Navigation and copyright text also adapt to the light panels. Contact placeholders and attachment helper text have stronger contrast. All Projects and individual project popups use the same `--panel-background: #dee7de` swatch as Clients, including their sticky headers. Archive titles, card captions, filters, buttons, focus rings and copyright use dark colours for contrast; project-number badges retain white text over their dark backing. Client archive surfaces retain their existing treatment.

Copy sources checked on 11 September 2026:

- [H&H's published history](https://hnhresources.com/#about), as it appeared before this update: roots in 1980, former name M S Construction Pte Ltd, and more than 100 fields completed. This is company-reported history, not an incorporation date. [The current entity's incorporation date is 5 December 2008](https://www.sgpbusiness.com/company/H-H-Resources-Pte-Ltd).
- Existing company-supplied project references in `data/projects.json`: Our Tampines Hub and Ngee Ann Polytechnic artificial turf, and Tanah Merah Country Club acrylic court surfacing.
- Owner correction, 11 September 2026: the About Us reference is the artificial-turf football field at Our Tampines Hub. The separate jogging-track award story has been removed; no award year or completion date is attached to this football-field reference.

The two marks were supplied by the owner. Their inclusion does not add a claim that every project is BCA- or bizSAFE-certified. The public copy does not infer awards or golf-course construction roles from client names alone.

## Interaction model

The interaction fixes of 11 September 2026 have one owner per feature:

- `assets/js/attachments.js` owns the contact attachment picker and removable list. Files are added one at a time and retained in their original native inputs, named `attachment1` through `attachment5`. The visible list and native multipart payload use those same inputs. Limits are five files, 5 MB per file and 10 MB combined. Duplicate selections, invalid additions, cancellation, removal and reset preserve the remaining files. No DataTransfer reconstruction or JavaScript upload is needed. The two competing inline controllers have been removed.
- `assets/js/dialogs.js` manages archive, project, school and menu focus as a stack. The shared shell includes the active popup and H&H header so Home stays operable within the modal. Background branches are inert. Tab stays in the active dialog controls; Escape closes only the top popup; focus returns to its actual trigger. Dialog labels follow the visible popup title.
- `assets/js/search.js` searches the maintained project data and existing page/service links. Results have real URLs, include all matches in a scrollable list, support normal/new-tab navigation and report empty results. Submitting the search moves keyboard focus to the first result. The menu button and overlay are reachable again; the menu follows the same five-section order as Explore. Search retains its desktop presentation.
- `assets/js/slideshow.js` owns rotation and lazy background loading. Pause/Play, manual selection, reduced-motion changes, page visibility, open panels/menu, viewport visibility and interaction with the controls are handled centrally. Reduced motion prevents autoplay. An explicit Play request takes effect even when the button has focus. Manual selection announces the project without repeatedly announcing autoplay changes.

Run the local checks before release:

```sh
python tools/verify-seo.py
npm install --no-save --prefix /tmp/hnh-interaction-check jsdom@30.0.1
NODE_PATH=/tmp/hnh-interaction-check/node_modules node tools/verify-interactions.cjs
```

The interaction check uses jsdom and requires a compatible Node version (Node 24 was used). It verifies real FileList/FormData contents and bytes in a simulated DOM, plus focus, search, navigation and timer behaviour. It does not send enquiries or replace physical-device, assistive-technology, visual-browser or actual email-delivery checks. Search Console processing is independent of these checks.

The main site is intentionally no-scroll. Sections slide over the showcase. The guided order is About Us → Clients → Projects → Expertise → Contact Us, with the same order in the homepage Explore menu, the available main-menu links, the HTML sections and the Previous/Next controls. `All Projects`, project details, and `All Past Clients` use their own internal scroll areas.

The H&H logo and home link remain visible across all five panels and their project/client/school popups. Every page uses the same transparent logo, two-line wordmark and responsive sizing from `assets/css/brand.css`, with no backing box. Wordmark colour adapts to the light or dark page background. Archive scroll areas reserve space below the fixed brand. Panel stacking stays bounded below the header, including after repeated navigation. Standalone pages retain their shared H&H header, and the 404 page also includes the logo and home link.


## v2 update
- Seven project-specific hero images and captions.
- Added 17 supplied client logos to View All Clients.
- Removed internal project-reference commentary from the public UI.
- Contact Us omits the top-right Back to Showcase control.


## MOE school drill-down

In **Past Clients → View All Clients**, the Ministry of Education tile opens an internal list of H&H school project references. The maintained source list is also stored in `data/moe-schools.json`.


## v3 updates
- Ministry of Education is first in Past Clients and opens the larger school-project list.
- Showcase uses seven exact project cover images from the All Projects library and each slide is clickable.
- Showcase pin labels now show the exact facility/institution name.


## v4 updates
- Singapore American School showcase now uses the West Field project cover.
- Showcase gallery bars directly select/play the chosen hero; the hero itself no longer opens project details.
- Our Tampines Hub and Ngee Ann Polytechnic timber-flooring cover photographs were straightened at source, so Hero and All Projects remain identical.
- Project-detail enquiry CTA moved lower for clearer spacing.
- View All Projects / View All Clients CTAs are more prominent.
- Previous/Next panel navigation now tracks the active panel explicitly to avoid stale overlapping-panel state.


## v5 interaction updates
- Guided order: About Us → Past Projects → Past Clients → Expertise → Contact Us.
- OTH and Ngee Ann timber hero/project covers re-levelled in the opposite direction from v4.
- Hero eyebrow shows the surface category only; the pin line carries the exact place name.
- Project and client panels have extra top clearance.
- MOE school drill-down hides panel navigation so only Back to All Clients remains.


## v6 refinements
- Main flow labels are now About Us → Projects → Clients → Expertise → Contact Us.
- All Projects and All Clients hide panel-level Back/Previous/Next controls while open.
- Archive/MOE sticky headers are more compact with extra top clearance.
- OTH and Ngee Ann timber showcase/project images received a very small additional horizon correction.


## v7 refinements
- Increased hero headline line-height/clip safe area so descenders and lower glyphs are not visually clipped.
- Lifted hero copy slightly for additional bottom breathing room.
- Re-straightened Our Tampines Hub and Ngee Ann Polytechnic timber cover images with a slightly stronger clockwise correction, using a single clean transform from the pre-straightened source and safe-cropping away rotation edges.


## v8 refinements
- Levelled Singapore American School West Field and Singapore Swimming Club hero/project images.
- Added restrained warm/cool text contrast to About Us and Expertise while preserving the existing H&H palette.

## v9 notes
- First navigation H&H loading spinner reduced from ~4 seconds to ~2 seconds.
- About Us four-stat block removed and replaced with `100+ Fields completed`.
- See `DOMAIN_SETUP.md` for custom-domain DNS wiring guidance.

## Image cleanup

23 supplied project photographs with visible camera date/time/device/location overlays were cleaned by conservative edge cropping. See `TIMESTAMP_CLEANUP.md` for the file list.


## v12 About Us update
- Integrated “more than 100 fields completed” into the main About Us sentence.
- Removed the standalone 100+ statistic block.
- Lowered the former company-name paragraph slightly for better visual hierarchy.

## SEO asset and stylesheet follow-up — 11 September 2026

- The shared header uses a 160px transparent PNG (sufficient for its 48px display at 3× density). The original source mark is retained.
- `og.png` is the site-wide sharing card (1200 × 629). The six project detail pages instead share their own original cover photograph, title and existing description. These images are sharing previews, not additional project evidence.
- `assets/css/showcase.css` consolidates the homepage's 29 style blocks. Active rule order is preserved; 38 obsolete loader rules/keyframes and 9 exact duplicate rules were removed, along with unused first-navigation loader JavaScript. The malformed retired reduced-motion selector is gone. Shared brand CSS remains in `assets/css/brand.css`.
- Corrected 23 stale photo height values to match the actual files; the original image bytes and all project descriptions remain unchanged.
- Project descriptions have intentionally not been expanded. Do not infer scope, dates or outcomes from photographs or procurement records.
- Responsive image selection follows [web.dev guidance](https://web.dev/articles/serve-responsive-images). It does not guarantee rankings or a particular performance score. Breadcrumb trails and their structured data were removed on 13 September 2026 to keep the shared page design consistent.
