(() => {
  const serviceOrder = [
    'golf-course-construction',
    'turf-landscape',
    'sports-fields',
    'sports-courts',
    'irrigation-systems',
    'specialised-surfaces'
  ];
  const serviceSet = new Set(serviceOrder);
  const directMatch = location.pathname.match(/^\/services\/([^/]+)\/$/);

  // Direct SEO service URLs should land in the real Expertise experience.
  if (directMatch && serviceSet.has(directMatch[1])) {
    location.replace(`/services/#${directMatch[1]}`);
    return;
  }

  const items = [...document.querySelectorAll('.expertise-item')];
  if (!items.length) return;

  function setOpen(item, open) {
    const toggle = item.querySelector('.expertise-toggle');
    const options = item.querySelector('.expertise-options');
    item.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (options) options.setAttribute('aria-hidden', String(!open));
  }

  function openFromHash(scroll = true) {
    const slug = decodeURIComponent(location.hash.slice(1));
    const index = serviceOrder.indexOf(slug);
    if (index < 0 || !items[index]) return false;
    items.forEach(item => setOpen(item, false));
    setOpen(items[index], true);
    if (scroll) requestAnimationFrame(() => items[index].scrollIntoView({ block: 'center' }));
    return true;
  }

  items.forEach(item => {
    setOpen(item, item.classList.contains('is-open'));
    const toggle = item.querySelector('.expertise-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      items.forEach(other => setOpen(other, false));
      setOpen(item, shouldOpen);
    });
  });

  openFromHash(true);
  window.addEventListener('hashchange', () => openFromHash(true));
})();
