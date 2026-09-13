// Simulated DOM regression checks; no network requests or form submissions.
// Requires Node 20+ and jsdom 30.0.1 (see README for an isolated install).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const generated = path.join(path.dirname(require.resolve('jsdom')), 'generated/idl');
const FileList = require(path.join(generated, 'FileList.js'));
const { implForWrapper } = require(path.join(generated, 'utils.js'));

function setup({ reduced = false, hash = '', width = 1440 } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => {
    if (!error.message.includes('navigation (except hash changes)')) errors.push(error.message);
  });
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: `https://hnhresources.com/${hash}`, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole
  });
  const w = dom.window;
  const d = w.document;
  for (const link of d.querySelectorAll('link[rel="stylesheet"]')) {
    const style = d.createElement('style');
    style.textContent = fs.readFileSync(path.join(root, new URL(link.href).pathname), 'utf8');
    d.head.append(style);
  }
  const timers = new Map();
  let timerId = 0;
  w.setTimeout = (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; };
  w.clearTimeout = id => timers.delete(id);
  w.requestAnimationFrame = fn => { fn(w.performance.now() + 2000); return 0; };
  const listeners = [];
  const motion = { matches: reduced, addEventListener: (_, fn) => listeners.push(fn) };
  w.matchMedia = query => query.includes('prefers-reduced-motion') ? motion : { matches: query.includes('max-width: 620px') && width <= 620 };
  const observers = [];
  w.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(node) { this.node = node; }
    unobserve() {}
    disconnect() {}
  };
  w.scrollTo = () => {};
  for (const script of [...d.scripts]) {
    if (script.type === 'application/ld+json' || script.type === 'application/json') continue;
    w.eval(script.src ? fs.readFileSync(path.join(root, new URL(script.src).pathname), 'utf8') : script.textContent);
  }
  assert.deepEqual(errors, []);
  const click = selector => { const element = typeof selector === 'string' ? d.querySelector(selector) : selector; assert(element); element.click(); return element; };
  const key = (key, shiftKey = false) => d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
  return { w, d, dom, errors, timers, click, key, observers,
    rotation: () => [...timers.values()].filter(timer => timer.ms === 6000),
    setMotion(value) { motion.matches = value; listeners.forEach(fn => fn({ matches: value })); },
    finish() { assert.deepEqual(errors, []); dom.window.close(); }
  };
}

async function attachments() {
  const t = setup(); const { w, d, click } = t;
  const form = d.getElementById('contact-form');
  const MB = 1024 * 1024;
  const makeFile = (name, size = 8) => new w.File([new Uint8Array(size).fill(77)], name, { lastModified: 123 });
  function pick(file) {
    const input = [...d.querySelectorAll('#attachment-file-inputs input')].find(input => !input.files.length);
    const list = FileList.create(w);
    if (file) implForWrapper(list).push(implForWrapper(file));
    input.files = list;
    input.dispatchEvent(new w.Event('change', { bubbles: true }));
  }
  function payload() {
    return [...new w.FormData(form)].filter(([key, value]) => key.startsWith('attachment') && value instanceof w.File);
  }
  function check(names) {
    assert.deepEqual(payload().map(([, file]) => file.name), names);
    assert.deepEqual([...d.querySelectorAll('.hnh-attachment-name')].map(node => node.textContent), names);
    assert.deepEqual(payload().map(([key]) => key), names.map((_, i) => `attachment${i + 1}`));
    assert(w.HnhAttachments.validate());
  }
  pick(makeFile('first.png')); pick(makeFile('second.png'));
  check(['first.png', 'second.png']);
  // Verify the original bytes remain attached, not just displayed filenames.
  assert.deepEqual(Array.from(new Uint8Array(await payload()[1][1].arrayBuffer())), Array(8).fill(77));
  click('.hnh-attachment-remove'); check(['second.png']);
  pick(makeFile('second.png')); check(['second.png']);
  assert.match(d.getElementById('attachment-message').textContent, /already attached/);
  pick(); check(['second.png']); // Cancel preserves previous attachments.
  pick(makeFile('oversize.pdf', 5 * MB + 1)); check(['second.png']);
  form.reset(); check([]);
  pick(makeFile('one.pdf', 5 * MB)); pick(makeFile('two.pdf', 5 * MB));
  check(['one.pdf', 'two.pdf']);
  pick(makeFile('over-total.pdf')); check(['one.pdf', 'two.pdf']);
  assert.match(d.getElementById('attachment-message').textContent, /10 MB/);
  form.reset();
  for (let i = 1; i <= 5; i++) pick(makeFile(`${i}.png`));
  assert(d.getElementById('attachment-button').disabled);
  pick(makeFile('six.png')); check(['1.png', '2.png', '3.png', '4.png', '5.png']);
  click('.hnh-attachment-remove'); assert(!d.getElementById('attachment-button').disabled);
  pick(makeFile('replacement.png')); check(['2.png', '3.png', '4.png', '5.png', 'replacement.png']);
  form.reset(); check([]);
  assert.equal(form.method, 'post'); assert.equal(form.enctype, 'multipart/form-data');
  assert.equal(form.action, 'https://formsubmit.co/enquiry@hnhresources.com');
  t.finish();
  console.log('PASS attachments: repeated selection, original bytes in FormData, remove, cancel, duplicate, limits and reset.');
}

function dialogs(width) {
  const t = setup({ width }); const { w, d, click, key } = t;
  const shell = d.getElementById('site-interaction-shell');
  const brand = d.querySelector('.brand');
  click('.showcase-nav [data-panel="projects"]');
  const trigger = click('.projects-all-trigger');
  const archive = d.querySelector('.all-projects-gallery');
  assert.equal(d.activeElement, archive.querySelector('.all-projects-close'));
  assert.equal(shell.getAttribute('role'), 'dialog');
  assert.equal(shell.getAttribute('aria-modal'), 'true');
  assert.equal(d.getElementById(shell.getAttribute('aria-labelledby')).textContent, 'All Projects');
  assert(d.querySelector('#selected-projects-grid').closest('[inert]'));
  assert(!brand.closest('[inert]'));
  const card = click('#all-projects-grid .project-card');
  const detail = d.getElementById('project-detail-overlay');
  const close = detail.querySelector('.project-detail-close');
  assert.equal(d.activeElement, close);
  assert(archive.hasAttribute('inert'));
  const last = detail.querySelector('.project-detail-enquire');
  last.focus(); key('Tab'); assert.equal(d.activeElement, brand);
  key('Tab', true); assert.equal(d.activeElement, last);
  // Programmatic attempts to focus the obscured page are contained as well.
  d.querySelector('#selected-projects-grid .project-card').focus(); assert.equal(d.activeElement, close);
  key('Escape'); assert.equal(d.activeElement, card);
  assert(!detail.classList.contains('is-open'));
  assert(archive.classList.contains('is-open'));
  assert(!archive.hasAttribute('inert'));
  key('Escape'); assert.equal(d.activeElement, trigger);
  assert.equal(d.body.dataset.activePanel, 'projects');
  assert(!shell.hasAttribute('role'));
  assert(detail.hasAttribute('inert')); assert(archive.hasAttribute('inert'));
  // Direct project close and the enquiry CTA must clear all archive state.
  const direct = click('#selected-projects-grid .project-card'); click(close); assert.equal(d.activeElement, direct);
  click(trigger); click(card); click(last);
  assert.equal(d.body.dataset.activePanel, 'contact');
  assert(!d.body.classList.contains('project-archive-open')); assert(!shell.hasAttribute('role'));
  click('.brand'); click('.showcase-nav [data-panel="clients"]');
  const clientsTrigger = click('.clients-all-trigger');
  const schoolTrigger = click('.all-clients-grid .client-school-trigger');
  assert.equal(d.activeElement, d.querySelector('.moe-school-close'));
  key('Escape'); assert.equal(d.activeElement, schoolTrigger);
  assert(d.body.classList.contains('client-archive-open'));
  key('Escape'); assert.equal(d.activeElement, clientsTrigger);
  const directSchool = click('#clients .section-shell .client-school-trigger');
  key('Escape'); assert.equal(d.activeElement, directSchool);
  click(clientsTrigger); click(schoolTrigger); click(brand);
  assert(!d.body.classList.contains('panel-open')); assert(!shell.hasAttribute('role'));
  click('.menu-button'); assert.equal(shell.getAttribute('aria-label'), 'H&H Resources menu');
  key('Escape'); assert.equal(d.activeElement, d.querySelector('.menu-button'));
  assert(d.getElementById('site-menu').hasAttribute('inert'));
  t.finish();
  console.log(`PASS popup focus at ${width}px: open, Tab wrapping, nested Escape, restoration, Home and enquiry navigation.`);
}

function search() {
  const t = setup(); const { w, d, click } = t;
  click('.menu-button');
  const form = d.querySelector('.menu-search'); const input = form.querySelector('input');
  const list = d.getElementById('menu-search-results');
  const query = value => { input.value = value; input.dispatchEvent(new w.Event('input', { bubbles: true })); };
  query('tAmPiNeS'); assert(list.querySelector('a')); assert.match(list.textContent, /Tampines/);
  const submission = new w.Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submission); assert(submission.defaultPrevented); assert.equal(d.activeElement, list.querySelector('a'));
  query('natural football'); assert(list.querySelector('a[href="/services/sports-fields/"]'));
  query('artificial turf'); assert(list.querySelectorAll('a').length > 3);
  for (const link of list.querySelectorAll('a')) {
    const url = new URL(link.href);
    assert.equal(url.origin, 'https://hnhresources.com');
    assert(fs.existsSync(path.join(root, url.pathname, 'index.html')));
  }
  const modified = new w.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
  list.querySelector('a').dispatchEvent(modified); assert(!modified.defaultPrevented);
  query('<script>missing project</script>'); assert.equal(list.children.length, 0); assert.match(d.getElementById('menu-search-status').textContent, /No results/);
  assert(!list.querySelector('script'));
  query(''); assert(list.hidden); assert.equal(d.getElementById('menu-search-status').textContent, '');
  t.finish(); console.log('PASS search: matching, service aliases, real result links, keyboard submission, clear and no results.');
}

function slideshow() {
  const t = setup(); const { d, w, click } = t;
  const active = () => [...d.querySelectorAll('.hero-slide')].indexOf(d.querySelector('.hero-slide.active'));
  assert.equal(t.rotation().length, 1);
  const firstTimer = t.rotation()[0]; firstTimer.fn(); assert.equal(active(), 1);
  click('.hero-playback'); assert.equal(t.rotation().length, 0);
  click('.hero-dot:nth-child(4)'); assert.equal(active(), 3); assert.equal(t.rotation().length, 0);
  click('.hero-playback'); assert.equal(t.rotation().length, 1);
  click('.showcase-nav [data-panel="about"]'); assert.equal(t.rotation().length, 0);
  const lazyCount = d.querySelectorAll('.hero-slide[data-bg]').length;
  firstTimer.fn(); assert.equal(active(), 3); assert.equal(d.querySelectorAll('.hero-slide[data-bg]').length, lazyCount);
  click('.brand'); assert.equal(t.rotation().length, 1);
  click('.menu-button'); assert.equal(t.rotation().length, 0);
  click('.menu-button'); assert.equal(t.rotation().length, 1);
  Object.defineProperty(d, 'hidden', { configurable: true, value: true }); d.dispatchEvent(new w.Event('visibilitychange'));
  assert.equal(t.rotation().length, 0);
  Object.defineProperty(d, 'hidden', { configurable: true, value: false }); d.dispatchEvent(new w.Event('visibilitychange'));
  assert.equal(t.rotation().length, 1);
  t.setMotion(true); assert.equal(t.rotation().length, 0); assert(d.querySelector('.hero-playback').disabled);
  t.setMotion(false); assert.equal(t.rotation().length, 1);
  const observer = t.observers[0]; observer.callback([{ isIntersecting: false }]); assert.equal(t.rotation().length, 0);
  observer.callback([{ isIntersecting: true }]); assert.equal(t.rotation().length, 1);
  d.querySelector('.hero-dot').focus(); assert.equal(t.rotation().length, 0);
  d.querySelector('.brand').focus(); assert.equal(t.rotation().length, 1);
  const enter = new w.Event('pointerenter'); enter.pointerType = 'mouse'; d.querySelector('.hero-dots').dispatchEvent(enter); assert.equal(t.rotation().length, 0);
  d.querySelector('.hero-dots').dispatchEvent(new w.Event('pointerleave')); assert.equal(t.rotation().length, 1);
  t.finish();
  for (const options of [{ reduced: true }, { hash: '#projects' }]) {
    const initial = setup(options); assert.equal(initial.rotation().length, 0);
    assert.equal(initial.d.querySelectorAll('.hero-slide[data-bg]').length, 6);
    initial.click('.hero-dot:nth-child(2)'); assert.equal(initial.rotation().length, 0);
    initial.finish();
  }
  console.log('PASS slideshow: pause/manual controls, hidden panels/menu/tab, lazy loading, motion changes, focus and hover.');
}

(async () => {
  await attachments();
  dialogs(1440);
  dialogs(390);
  search();
  slideshow();
})().catch(error => { console.error(error); process.exitCode = 1; });
