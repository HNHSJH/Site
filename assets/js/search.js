(() => {
  const form = document.querySelector('.menu-search');
  const input = form?.querySelector('input');
  const results = document.getElementById('menu-search-results');
  const status = document.getElementById('menu-search-status');
  if (!input || !results) return;
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const records = [];
  const seen = new Map();
  function add(title, detail, href) {
    if (!href) return;
    if (seen.has(href)) { seen.get(href).text += ` ${normalize(`${title} ${detail}`)}`; return; }
    const record = { title, detail, href, text: normalize(`${title} ${detail}`) };
    seen.set(href, record);
    records.push(record);
  }
  document.querySelectorAll('.showcase-nav a, .expertise-options a[href^="/services/"]').forEach(link => {
    add(link.querySelector('span')?.textContent || link.textContent, 'H&H Resources', link.getAttribute('href'));
  });
  const data = window.HNH_PROJECT_DATA;
  const categories = Object.fromEntries((data?.categories || []).map(item => [item.id, item.name]));
  (data?.projects || []).forEach(project => {
    const card = document.querySelector(`#all-projects-grid [data-project-id="${project.id}"]`);
    add(project.display_name, categories[project.category] || project.category, card?.getAttribute('href'));
  });

  function search() {
    const terms = normalize(input.value).split(' ').filter(Boolean);
    results.replaceChildren();
    results.hidden = !terms.length;
    if (!terms.length) { status.textContent = ''; return; }
    const matches = records.filter(record => terms.every(term => record.text.includes(term)));
    // The complete matching list remains available by scrolling, including all
    // project references. Ordinary links retain browser/new-tab behaviour.
    matches.forEach(record => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = record.href;
      const title = document.createElement('span');
      title.textContent = record.title;
      const detail = document.createElement('small');
      detail.textContent = record.detail;
      link.append(title, detail);
      item.append(link);
      results.append(item);
    });
    status.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'}.` : 'No results. Try a school, club or surface name.';
  }
  input.addEventListener('input', search);
  input.addEventListener('search', search);
  form.addEventListener('submit', event => {
    event.preventDefault();
    search();
    results.querySelector('a')?.focus();
  });
})();
