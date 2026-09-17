(() => {
  const data = window.HNH_PROJECT_DATA;
  const serviceId = document.body?.dataset.serviceId || '';
  const grid = document.getElementById('service-project-grid');
  const viewAll = document.getElementById('service-view-all');

  const serviceGroups = {
    'sports-fields': { categories: ['artificial-turf'] },
    'sports-courts': { categories: ['acrylic-coating', 'timber-flooring'] },
    'specialised-surfaces': { categories: ['running-track', 'epdm-flooring'] },
    'turf-landscape': { categories: ['landscape-artificial-turf'] },
    'golf-course-construction': { categories: [] },
    'irrigation-systems': { categories: [] }
  };

  const group = serviceGroups[serviceId] || { categories: [] };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  if (viewAll) viewAll.href = '/projects/';
  if (!data || !Array.isArray(data.projects) || !grid) return;

  const categoryNames = Object.fromEntries((data.categories || []).map(category => [category.id, category.name]));
  const matching = data.projects
    .filter(project => group.categories.includes(project.category) && project.photos?.[0])
    .slice(0, 9);

  const applyArchiveGrid = () => {
    const width = window.innerWidth;
    const columns = width <= 620 ? 1 : width <= 980 ? 2 : 3;
    grid.style.setProperty('display', 'grid', 'important');
    grid.style.setProperty('grid-template-columns', `repeat(${columns},minmax(0,1fr))`, 'important');
    grid.style.setProperty('width', width > 980 ? 'min(100%,1560px)' : '100%', 'important');
    grid.style.setProperty('margin-inline', 'auto', 'important');
    grid.style.setProperty('gap', '0', 'important');
    grid.style.setProperty('column-gap', '0', 'important');
    grid.style.setProperty('row-gap', '0', 'important');
  };

  grid.innerHTML = matching.map((project, index) => {
    const photo = project.photos[0];
    const type = categoryNames[project.category] || project.category;
    const certification = (project.certification_text || []).filter(Boolean).join(' · ');
    const detail = [type, certification].filter(Boolean).join(' · ');
    const srcset = photo.srcset ? ` srcset="${esc(photo.srcset)}"` : '';
    return `<a class="project-card all-project-card" href="/projects/#${encodeURIComponent(project.id)}" data-project-id="${esc(project.id)}" data-project-category="${esc(project.category)}">`
      + `<div class="project-media"><span class="project-number">${String(index + 1).padStart(2, '0')} / ${String(matching.length).padStart(2, '0')}</span>`
      + `<img src="${esc(photo.thumbnail || photo.src)}"${srcset} sizes="(max-width: 620px) calc(100vw - 32px), (max-width: 980px) 50vw, 33.333vw" alt="${esc(project.display_name)} — ${esc(type)}" width="${photo.web_dimensions?.[0] || 1600}" height="${photo.web_dimensions?.[1] || 900}" loading="lazy" decoding="async"></div>`
      + `<div class="project-info"><div><h3>${esc(project.display_name)}</h3><p>${esc(detail)}</p></div><span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M9 5h10v10"/></svg></span></div>`
      + `</a>`;
  }).join('');

  applyArchiveGrid();
  window.addEventListener('resize', applyArchiveGrid, { passive: true });
})();
