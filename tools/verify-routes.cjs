// Browser regressions for the shared showcase at every published entry URL.
// Start a static server first, then run with Playwright available to Node.
// HNH_TEST_URL defaults to http://127.0.0.1:8765. No forms are submitted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const base = new URL(process.env.HNH_TEST_URL || 'http://127.0.0.1:8765');
const origin = 'https://hnhresources.com';
const routes = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
  .map(match => new URL(match[1]).pathname);
const mainPanels = { '/about-us/': 'about', '/clients/': 'clients', '/projects/': 'projects',
  '/services/': 'expertise', '/contact/': 'contact' };
const manifest = {};
for (const route of [...routes, '/404.html']) {
  const source = fs.readFileSync(path.join(root, route, route.endsWith('.html') ? '' : 'index.html'), 'utf8');
  const manifestTag = source.match(/<script(?=[^>]*\bid="hnh-route-manifest")[^>]*>([\s\S]*?)<\/script>/);
  assert(manifestTag, `${route}: missing route manifest`);
  const current = JSON.parse(manifestTag[1]);
  assert(current[route], `${route}: missing definition for direct entry`);
  manifest[route] = current[route];
}
const projectData = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const fragmentProject = projectData.projects.find(project => !routes.includes(`/projects/${project.id.replace('--', '/')}/`));
assert.equal(routes.length, 18, 'Expected all 18 published entry URLs');
assert(fragmentProject, 'Expected an archive project addressed by fragment');
for (const route of routes) assert(manifest[route], `Missing route definition: ${route}`);

async function inspectRoute(page, route, { javaScript = true, checkImages = false } = {}) {
  const expected = manifest[route];
  await page.waitForFunction(({ expectedPath, expectedPanel, expectedTitle, scripting }) => {
    const heading = document.querySelector('h1');
    const bounds = heading?.getBoundingClientRect();
    return location.pathname === expectedPath && heading?.textContent.trim() && document.title === expectedTitle
      && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth
      && (!scripting || !expectedPanel || document.body.dataset.activePanel === expectedPanel);
  }, { expectedPath: route, expectedPanel: route === '/' ? null : (mainPanels[route] || 'route-detail'), expectedTitle: expected.title, scripting: javaScript });
  assert.equal(await page.locator('h1').count(), 1, `${route}: one H1`);
  assert(await page.locator('h1').isVisible(), `${route}: visible H1`);
  assert(await page.locator('.site-header .brand').isVisible(), `${route}: visible common brand`);
  assert.equal(await page.locator('.site-bar').count(), 0, `${route}: no former standalone header`);
  assert.equal(await page.title(), expected.title, `${route}: page title`);
  assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), expected.description, `${route}: description`);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + route, `${route}: canonical`);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), origin + route, `${route}: social URL`);
  assert.equal(await page.locator('#all-projects-grid .project-card').count(), 63, `${route}: full project archive`);
  const layout = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const bounds = heading.getBoundingClientRect();
    return {
      duplicateIds: [...document.querySelectorAll('[id]')].map(node => node.id).filter((id, i, ids) => ids.indexOf(id) !== i),
      headingInViewport: bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth,
      bodyWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth
    };
  });
  assert.deepEqual(layout.duplicateIds, [], `${route}: no duplicate IDs`);
  assert(layout.headingInViewport, `${route}: initial heading is on screen`);
  assert(layout.bodyWidth <= layout.viewportWidth + 1, `${route}: no horizontal page overflow (${layout.bodyWidth}px)`);
  if (route !== '/' && javaScript) {
    assert.equal(await page.locator('h1').evaluate(el => el.closest('.scroll-section')?.id), mainPanels[route] || 'route-detail', `${route}: H1 belongs to active content`);
  }
  if (checkImages) {
    const images = page.locator(route.startsWith('/projects/') && route !== '/projects/' ? '#route-detail .gallery img' : '.site-header .brand img');
    assert(await images.count(), `${route}: expected content images`);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.complete ? undefined : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }));
      assert(await img.evaluate(image => image.naturalWidth > 0), `${route}: image failed to load: ${await img.getAttribute('src')}`);
    }
  }
}

async function contextFor(browser, viewport, javaScriptEnabled) {
  const context = await browser.newContext({ viewport, javaScriptEnabled, reducedMotion: 'reduce' });
  // Local route verification never needs an outbound request or form submission.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === base.origin) await route.continue();
    else await route.abort();
  });
  return context;
}

async function directRoutes(browser, viewport, javaScriptEnabled) {
  const context = await contextFor(browser, viewport, javaScriptEnabled);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === base.origin && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const route of routes) {
    const response = await page.goto(new URL(route, base).href, { waitUntil: 'load' });
    assert.equal(response.status(), 200, `${route}: direct response`);
    await inspectRoute(page, route, { javaScript: javaScriptEnabled, checkImages: javaScriptEnabled });
    if (javaScriptEnabled) {
      await page.reload({ waitUntil: 'load' });
      await inspectRoute(page, route);
      await page.locator('.brand').click();
      await page.waitForURL(new URL('/', base).href);
      await inspectRoute(page, '/');
    }
  }
  assert.deepEqual(errors, [], `${viewport.width}px ${javaScriptEnabled ? 'scripted' : 'no-JS'}: browser/resource errors`);
  await context.close();
  console.log(`PASS ${viewport.width}px ${javaScriptEnabled ? 'direct/refresh/Home' : 'JavaScript-disabled initial content'}: all ${routes.length} routes, visible H1, shared header, metadata and archive.`);
}

async function interactions(browser, viewport) {
  const context = await contextFor(browser, viewport, true);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/', base).href);
  for (const [route, panel] of Object.entries(mainPanels)) {
    if (new URL(page.url()).pathname !== '/') {
      await page.locator('.brand').click();
      await page.waitForURL(new URL('/', base).href);
    }
    await page.locator('.menu-button').click();
    await page.locator(`.menu-nav [data-panel="${panel}"]`).click();
    await page.waitForURL(new URL(route, base).href);
    await inspectRoute(page, route);
  }
  await page.goto(new URL('/projects/', base).href);
  await page.locator('#projects > .panel-next').click();
  await page.waitForURL(new URL('/services/', base).href);
  await inspectRoute(page, '/services/');
  await page.locator('#expertise > .panel-next').click();
  await page.waitForURL(new URL('/contact/', base).href);
  await inspectRoute(page, '/contact/');
  await page.goBack();
  await page.waitForURL(new URL('/services/', base).href);
  await inspectRoute(page, '/services/');
  await page.goForward();
  await page.waitForURL(new URL('/contact/', base).href);
  await inspectRoute(page, '/contact/');

  await page.goto(new URL(`/projects/#${fragmentProject.id}`, base).href);
  await page.waitForFunction(id => document.querySelector('#project-detail-overlay.is-open')?.dataset.projectId === id, fragmentProject.id);
  assert.equal(await page.locator('#project-detail-title').textContent(), fragmentProject.display_name);
  await page.waitForFunction(() => document.querySelector('#project-detail-main-image')?.naturalWidth > 0);
  await page.locator('.project-detail-enquire').click();
  await page.waitForURL(new URL('/contact/', base).href);
  await inspectRoute(page, '/contact/');

  // Legacy hash bookmarks remain useful after navigation adopts real paths.
  await page.goto(new URL('/#projects', base).href);
  await page.waitForFunction(() => document.body.dataset.activePanel === 'projects');
  await page.locator('.projects-all-trigger').click();
  assert(await page.locator('.all-projects-gallery.is-open').isVisible());
  await page.locator('#all-projects-grid .project-card').first().click();
  await page.waitForFunction(() => document.querySelector('#project-detail-main-image')?.naturalWidth > 0);
  await page.keyboard.press('Escape');
  assert(await page.locator('.all-projects-gallery.is-open').isVisible());
  await page.keyboard.press('Escape');
  await page.locator('.brand').click();
  await page.waitForURL(new URL('/', base).href);
  await inspectRoute(page, '/');

  // The established mobile menu hides search; exercise it where it is offered.
  if (viewport.width > 980) {
    await page.locator('.menu-button').click();
    await page.locator('.menu-search input').fill('contact');
    await page.locator('#menu-search-results a[href="/contact/"]').click();
    await page.waitForURL(new URL('/contact/', base).href);
    await inspectRoute(page, '/contact/');
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('menu-open')), false, 'Search result closes menu');
    assert(await page.locator('#site-menu').evaluate(menu => menu.inert), 'Search result restores inert menu');
    assert.equal(await page.locator('#site-interaction-shell').getAttribute('role'), null, 'Search result clears menu dialog');
  }

  await page.goto(new URL('/404.html', base).href);
  await inspectRoute(page, '/404.html');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/, '404 excludes indexing');
  await page.locator('.brand').click();
  await page.waitForURL(new URL('/', base).href);
  await inspectRoute(page, '/');
  assert.equal(await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.some(node => /noindex/.test(node.content))), false, '404 Home navigation clears noindex');
  assert.deepEqual(errors, [], `${viewport.width}px navigation browser errors`);
  await context.close();
  console.log(`PASS ${viewport.width}px navigation: menu${viewport.width > 980 ? '/search' : ''} paths, history Back/Forward, fragment projects, gallery images, enquiry, 404 and Home.`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HNH_CHROMIUM_EXECUTABLE || undefined });
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      if (!process.argv.includes('--navigation-only')) {
        await directRoutes(browser, viewport, true);
        await directRoutes(browser, viewport, false);
      }
      await interactions(browser, viewport);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
