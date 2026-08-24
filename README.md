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
