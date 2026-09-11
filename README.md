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
- 82 optimized WebP project photographs
- 6 project categories
- Structured source: `data/projects.json`
- Browser data file: `data/projects.js`
- Project UI logic: `assets/js/projects.js`

### Add a new project later

1. Add optimized WebP images under `assets/images/projects/<category>/<project-slug>/`.
2. Add the project record to `data/projects.json`.
3. Run `python tools/sync-project-data.py` to regenerate `data/projects.js`.

The project archive is data-driven and does not require hand-writing dozens of HTML cards.

## Showcase images

The showcase is fully local and references the exact cover photograph used by the matching project record under `assets/images/projects/`. This keeps the showcase and All Projects imagery consistent and avoids duplicate hero files.

## About Us and Expertise

The About Us photograph is served as local 800px / 1600px WebP assets. Its right-hand text panel uses a 78%-opaque background, with internal scrolling when needed on smaller screens. Edit the wording in `.about-copy` in `index.html` and the appearance in the original About Us CSS block in the same file. The Contact Us information panel matches the About Us surface colour, 78% opacity, 3px backdrop blur, border and shadow. The BCA and bizSAFE Level 4 assets sit at the top right of the Expertise heading, above the category list. Both cutouts were rebuilt from the resupplied originals, resized to 480px and encoded as lossless WebP with genuine alpha transparency. Their reduced display sizes are retained, without a background, border or glow; content-hash query strings refresh cached logo images. Temasek Secondary School provides a pale sky behind the grey lettering. A feathered backdrop-brightness treatment follows the logo row to reveal that sky while the rest of the Expertise image remains dimmed for white text. Expertise content starts lower in the viewport; its three navigation controls retain their existing positions.

All four main section backdrops fill the viewport with `object-fit: cover`, a small homepage-style overscan, and dark gradient overlays. They reuse the existing optimised project photographs:

| Section | Background photograph |
| --- | --- |
| Projects | Seng Kang Primary School — artificial turf |
| Clients | Perennial Business City — running track |
| Expertise | Temasek Secondary School — artificial turf |
| Contact Us | Republic Polytechnic — acrylic coating |

The Clients section groups View All Clients, the selected-client grid and the heading together slightly above the centre of the viewport. The button sits at the top right, 16px above the grid, and the heading follows 22–30px below it. Automatic margins surround the whole composition rather than separating the grid from the heading; they collapse on short screens so all content remains scrollable above the fixed navigation. Projects and Clients share a 1280px gallery width, responsive gutters, 16px button-to-gallery spacing and one `.archive-trigger` button style with identical dimensions, colours, arrows and hover/focus states. Superseded button-specific style rules were removed. The selected-client logo tiles retain a pale surface with matching gallery gutters; headings and Expertise text use light colours. Contact placeholders and attachment helper text have stronger contrast. Archive and detail overlays retain their existing separate surfaces.

Copy sources checked on 11 September 2026:

- [H&H's published history](https://hnhresources.com/#about), as it appeared before this update: roots in 1980, former name M S Construction Pte Ltd, and more than 100 fields completed. This is company-reported history, not an incorporation date. [The current entity's incorporation date is 5 December 2008](https://www.sgpbusiness.com/company/H-H-Resources-Pte-Ltd).
- Existing company-supplied project references in `data/projects.json`: Our Tampines Hub and Ngee Ann Polytechnic artificial turf, and Tanah Merah Country Club acrylic court surfacing.
- [Tender PAS000ETT25000083](https://www.sgpbusiness.com/government/procurement/tender-number/PAS000ETT25000083): Our Tampines Hub jogging-track refurbishment awarded to H & H Resources on 9 October 2025. The copy describes a contract award; it does not infer completion or a current certification.

The two marks were supplied by the owner. Their inclusion does not add a claim that every project is BCA- or bizSAFE-certified. The public copy does not infer awards or golf-course construction roles from client names alone.

## Interaction model

The main site is intentionally no-scroll. Sections slide over the showcase. `All Projects`, project details, and `All Past Clients` use their own internal scroll areas.


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
