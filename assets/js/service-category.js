(() => {
  const data = window.HNH_PROJECT_DATA;
  const serviceId = document.body?.dataset.serviceId || '';
  const grid = document.getElementById('service-project-grid');
  const heroMedia = document.getElementById('service-hero-media');
  const heroCaption = document.getElementById('service-hero-caption');
  const count = document.getElementById('service-project-count');
  const viewAll = document.getElementById('service-view-all');
  const projectSection = document.getElementById('service-projects');

  const serviceGroups = {
    'sports-fields': {
      name: 'Sports Fields',
      categories: ['artificial-turf'],
      representative: 'artificial-turf--our-tampines-hub'
    },
    'sports-courts': {
      name: 'Sports Courts',
      categories: ['acrylic-coating', 'timber-flooring'],
      representative: 'acrylic-coating--tanah-merah-country-club'
    },
    'specialised-surfaces': {
      name: 'Specialised Surfaces',
      categories: ['running-track', 'epdm-flooring'],
      representative: 'running-track--singapore-polytechnic'
    },
    'turf-landscape': {
      name: 'Turf & Landscape',
      categories: ['landscape-artificial-turf'],
      representative: 'landscape-artificial-turf--lion-city-sailors'
    },
    'golf-course-construction': {
      name: 'Golf Course Construction',
      categories: []
    },
    'irrigation-systems': {
      name: 'Irrigation Systems',
      categories: []
    }
  };

  const group = serviceGroups[serviceId] || { name: 'Projects', categories: [] };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  if (viewAll) viewAll.href = group.categories.length
    ? `/projects/?service=${encodeURIComponent(serviceId)}`
    : '/projects/';

  if (!data || !Array.isArray(data.projects)) {
    if (grid) grid.innerHTML = '<p class="service-project-empty">Project references are available in the main project archive.</p>';
    return;
  }

  const categoryNames = Object.fromEntries((data.categories || []).map(category => [category.id, category.name]));
  const matching = data.projects.filter(project => group.categories.includes(project.category));
  const representative = matching.find(project => project.id === group.representative && project.photos?.[0]);
  const selected = [
    ...(representative ? [representative] : []),
    ...matching.filter(project => project !== representative)
  ].slice(0, 6);

  const firstPhotoProject = representative || matching.find(project => project.photos?.[0]);
  if (heroMedia) {
    if (firstPhotoProject) {
      const photo = firstPhotoProject.photos[0];
      const image = document.createElement('img');
      image.src = photo.src;
      if (photo.srcset) image.srcset = photo.srcset;
      image.sizes = '(max-width: 900px) calc(100vw - 40px), 48vw';
      image.width = photo.web_dimensions?.[0] || 1600;
      image.height = photo.web_dimensions?.[1] || 900;
      image.alt = `${firstPhotoProject.display_name} — ${categoryNames[firstPhotoProject.category] || group.name}`;
      image.decoding = 'async';
      image.loading = 'eager';
      image.fetchPriority = 'high';
      heroMedia.prepend(image);
      if (heroCaption) heroCaption.textContent = `${firstPhotoProject.display_name} · ${categoryNames[firstPhotoProject.category] || group.name}`;
    } else {
      const image = document.createElement('img');
      image.src = '/assets/images/about/hnh-course-construction-1600.webp';
      image.alt = '';
      image.decoding = 'async';
      heroMedia.prepend(image);
      if (heroCaption) heroCaption.textContent = 'H&H Resources · Singapore';
    }
  }

  if (count) {
    count.textContent = matching.length
      ? `${matching.length} project reference${matching.length === 1 ? '' : 's'} in this capability`
      : 'Capability overview';
  }

  if (!grid) return;
  if (!selected.length) {
    projectSection?.classList.add('has-no-projects');
    grid.innerHTML = '<p class="service-project-empty">We do not currently publish project photographs for this capability. Browse the full project archive or contact H&H Resources for relevant references.</p>';
    return;
  }

  grid.innerHTML = selected.map(project => {
    const photo = project.photos?.[0];
    if (!photo) return '';
    const type = categoryNames[project.category] || project.category;
    const certification = (project.certification_text || []).filter(Boolean).join(' · ');
    const detail = [type, certification].filter(Boolean).join(' · ');
    const srcset = photo.srcset ? ` srcset="${esc(photo.srcset)}"` : '';
    return `<a class="service-project-card" href="/projects/#${encodeURIComponent(project.id)}">`
      + `<img src="${esc(photo.thumbnail || photo.src)}"${srcset} sizes="(max-width:620px) calc(100vw - 32px), (max-width:900px) calc((100vw - 33px) / 2), 33vw" alt="${esc(project.display_name)} — ${esc(type)}" width="${photo.web_dimensions?.[0] || 1600}" height="${photo.web_dimensions?.[1] || 900}" loading="lazy" decoding="async">`
      + `<div class="service-project-card-copy"><h3>${esc(project.display_name)}</h3><p>${esc(detail)}</p></div>`
      + '</a>';
  }).join('');
})();
