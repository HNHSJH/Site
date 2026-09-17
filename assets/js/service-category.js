(() => {
  const data = window.HNH_PROJECT_DATA;
  const serviceId = document.body?.dataset.serviceId || '';
  const grid = document.getElementById('service-project-grid');
  const count = document.getElementById('service-project-count');
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

  if (viewAll) viewAll.href = group.categories.length
    ? `/projects/?service=${encodeURIComponent(serviceId)}`
    : '/projects/';

  if (!data || !Array.isArray(data.projects) || !grid) return;

  const categoryNames = Object.fromEntries((data.categories || []).map(category => [category.id, category.name]));
  const matching = data.projects.filter(project => group.categories.includes(project.category));
  const selected = matching.filter(project => project.photos?.[0]).slice(0, 6);

  if (count) {
    count.textContent = matching.length
      ? `${matching.length} project reference${matching.length === 1 ? '' : 's'} in this capability.`
      : 'Published project photographs for this capability are not currently listed in the online archive.';
  }

  if (!selected.length) {
    grid.innerHTML = '<div class="card"><h3>More references available on enquiry.</h3><p>Contact H&H Resources for relevant project references and scope discussions.</p><a href="/contact/">Contact H&H Resources</a></div>';
    return;
  }

  grid.innerHTML = selected.map(project => {
    const photo = project.photos[0];
    const type = categoryNames[project.category] || project.category;
    const certification = (project.certification_text || []).filter(Boolean).join(' · ');
    const detail = [type, certification].filter(Boolean).join(' · ');
    const srcset = photo.srcset ? ` srcset="${esc(photo.srcset)}"` : '';
    return `<article class="card">`
      + `<img src="${esc(photo.thumbnail || photo.src)}"${srcset} sizes="(max-width:620px) calc(100vw - 32px), (max-width:900px) calc((100vw - 64px) / 2), 31vw" alt="${esc(project.display_name)} — ${esc(type)}" width="${photo.web_dimensions?.[0] || 1600}" height="${photo.web_dimensions?.[1] || 900}" loading="lazy" decoding="async">`
      + `<h3>${esc(project.display_name)}</h3>`
      + `<p>${esc(detail)}</p>`
      + `<a href="/projects/#${encodeURIComponent(project.id)}">View project →</a>`
      + `</article>`;
  }).join('');
})();