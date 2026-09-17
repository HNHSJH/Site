(() => {
  const revealProjectRoute = () => document.body?.classList.add('project-route-ready');

  if (location.pathname === '/' || document.body?.dataset.routePath === '/') {
    document.querySelector('.menu-button')?.style.setProperty('display', 'none', 'important');
    document.querySelector('.hero-playback')?.style.setProperty('display', 'none', 'important');
  }

  const data = window.HNH_PROJECT_DATA;
  if (!data || !Array.isArray(data.projects)) {
    revealProjectRoute();
    return;
  }

  const projects = data.projects;
  const categories = Object.fromEntries(data.categories.map(c => [c.id, c.name]));
  const categoryIds = new Set(data.categories.map(c => c.id));
  const byId = Object.fromEntries(projects.map(p => [p.id, p]));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const hoverCopy = p => [categories[p.category] || p.category, ...(p.certification_text || [])].filter(Boolean).join(' · ');

  // Project discovery follows the same top-level capability language used by Expertise.
  // Golf Course Construction and Irrigation Systems remain Expertise categories, but are
  // not presented as project-gallery filters until project references exist in the dataset.
  const serviceGroups = [
    {
      id: 'sports-fields',
      name: 'Sports Fields',
      description: 'Artificial, natural and hybrid field construction.',
      representative: 'artificial-turf--our-tampines-hub',
      categories: ['artificial-turf']
    },
    {
      id: 'sports-courts',
      name: 'Sports Courts',
      description: 'Acrylic court surfacing and timber sports flooring.',
      representative: 'acrylic-coating--tanah-merah-country-club',
      categories: ['acrylic-coating', 'timber-flooring']
    },
    {
      id: 'specialised-surfaces',
      name: 'Specialised Surfaces',
      description: 'Running tracks, EPDM and specialist sports surfaces.',
      representative: 'running-track--singapore-polytechnic',
      categories: ['running-track', 'epdm-flooring']
    },
    {
      id: 'turf-landscape',
      name: 'Turf & Landscape',
      description: 'Landscape turf and outdoor landscape works.',
      representative: 'landscape-artificial-turf--lion-city-sailors',
      categories: ['landscape-artificial-turf']
    }
  ];
  const serviceById = Object.fromEntries(serviceGroups.map(group => [group.id, group]));

  const selectedGrid = document.getElementById('selected-projects-grid');
  if (selectedGrid) {
    const showcase = serviceGroups.map(group => ({ group, project: byId[group.representative] })).filter(item => item.project?.photos?.[0]);
    if (showcase.length) {
      selectedGrid.innerHTML = showcase.map(({ group, project }, i) => {
        const ph = project.photos[0];
        const srcset = ph.srcset ? ` srcset="${esc(ph.srcset)}"` : '';
        const loading = i < 2 ? 'eager' : 'lazy';
        return `<a class="project-card project-category-card" href="/services/${encodeURIComponent(group.id)}/" data-service-category="${esc(group.id)}">`
          + `<div class="project-media"><span class="project-number">${String(i + 1).padStart(2, '0')} / ${String(showcase.length).padStart(2, '0')}</span>`
          + `<img src="${esc(ph.thumbnail || ph.src)}"${srcset} sizes="(max-width: 620px) calc((100vw - 40px) / 2), (max-width: 1020px) calc((100vw - 72px) / 2), 30vw" alt="${esc(group.name)} — H&H Resources" width="${ph.web_dimensions[0]}" height="${ph.web_dimensions[1]}" loading="${loading}" decoding="async"></div>`
          + `<div class="project-info"><div><h3>${esc(group.name)}</h3><p>${esc(group.description)}</p></div>`
          + '<span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M9 5h10v10"/></svg></span></div></a>';
      }).join('');
      selectedGrid.dataset.featuredReady = 'true';

      const shell = selectedGrid.closest('.section-shell');
      const kicker = shell?.querySelector('.section-kicker');
      const eyebrow = kicker?.querySelector(':scope > span');
      const heading = kicker?.querySelector('h1,h2');
      if (eyebrow) eyebrow.textContent = 'Project Categories';
      if (heading) heading.textContent = 'Explore our work by capability.';
    }
  }

  document.querySelectorAll('#all-projects-grid [data-project-id]').forEach(card => {
    const p = byId[card.dataset.projectId];
    const copy = card.querySelector('.project-info p');
    if (p && copy) copy.textContent = hoverCopy(p);
  });

  const allProjectsGrid = document.getElementById('all-projects-grid');
  const applyArchiveGrid = () => {
    if (!allProjectsGrid) return;
    const width = window.innerWidth;
    const columns = width <= 620 ? 1 : width <= 980 ? 2 : 3;
    allProjectsGrid.style.setProperty('grid-template-columns', `repeat(${columns},minmax(0,1fr))`, 'important');
    allProjectsGrid.style.setProperty('width', width > 980 ? 'min(100%,1560px)' : '100%', 'important');
    allProjectsGrid.style.setProperty('gap', '0', 'important');
    allProjectsGrid.style.setProperty('column-gap', '0', 'important');
    allProjectsGrid.style.setProperty('row-gap', '0', 'important');
  };
  applyArchiveGrid();
  window.addEventListener('resize', applyArchiveGrid, { passive: true });

  const applySelectedLayout = () => {
    if (!selectedGrid) return;
    const shell = selectedGrid.closest('.section-shell');
    const kicker = shell?.querySelector('.section-kicker');
    const footer = shell?.querySelector('.projects-footer');
    const footerButton = footer?.querySelector('.projects-all-trigger');
    const cards = [...selectedGrid.querySelectorAll(':scope > .project-card')];
    const desktop = window.matchMedia('(min-width: 1021px)').matches;

    const clear = (el, props) => props.forEach(prop => el?.style.removeProperty(prop));
    if (!desktop) {
      clear(shell, ['display','grid-template-columns','grid-template-rows','column-gap','row-gap','align-content','justify-content']);
      clear(kicker, ['grid-column','grid-row','align-self','margin','padding-right','transform','text-shadow']);
      clear(selectedGrid, ['display']);
      clear(footer, ['grid-column','grid-row','align-self','justify-self','margin','transform','width','height']);
      clear(footerButton, ['width','height','min-height','padding','display','align-items','justify-content']);
      cards.forEach(card => clear(card, ['grid-column','grid-row','height','align-self']));
      selectedGrid.style.setProperty('gap', '0', 'important');
      return;
    }

    shell?.style.setProperty('display', 'grid', 'important');
    shell?.style.setProperty('grid-template-columns', 'repeat(20,minmax(0,1fr))', 'important');
    shell?.style.setProperty('grid-template-rows', 'repeat(2,auto)', 'important');
    shell?.style.setProperty('column-gap', '0', 'important');
    shell?.style.setProperty('row-gap', '0', 'important');
    shell?.style.setProperty('align-content', 'center', 'important');
    shell?.style.setProperty('justify-content', 'stretch', 'important');

    kicker?.style.setProperty('grid-column', '1 / 8', 'important');
    kicker?.style.setProperty('grid-row', '1', 'important');
    kicker?.style.setProperty('align-self', 'center', 'important');
    kicker?.style.setProperty('margin', '0', 'important');
    kicker?.style.setProperty('padding-right', '28px', 'important');
    kicker?.style.setProperty('transform', 'translateY(-10px)', 'important');
    kicker?.style.setProperty('text-shadow', 'none', 'important');
    kicker?.querySelectorAll('h1,h2,span').forEach(el => el.style.setProperty('text-shadow', 'none', 'important'));
    selectedGrid.style.setProperty('display', 'contents', 'important');

    const positions = [
      ['8 / 14', '1'], ['14 / 20', '1'],
      ['8 / 14', '2'], ['14 / 20', '2']
    ];
    cards.forEach((card, index) => {
      const pos = positions[index];
      if (!pos) return;
      card.style.setProperty('grid-column', pos[0], 'important');
      card.style.setProperty('grid-row', pos[1], 'important');
      card.style.setProperty('height', 'clamp(220px,25vh,270px)', 'important');
      card.style.setProperty('align-self', 'stretch', 'important');
    });

    footer?.style.setProperty('grid-column', '1 / 8', 'important');
    footer?.style.setProperty('grid-row', '2', 'important');
    footer?.style.setProperty('align-self', 'end', 'important');
    footer?.style.setProperty('justify-self', 'stretch', 'important');
    footer?.style.setProperty('width', '100%', 'important');
    footer?.style.setProperty('height', '42px', 'important');
    footer?.style.setProperty('margin', '0 0 8px', 'important');
    footer?.style.removeProperty('transform');
    footerButton?.style.setProperty('width', '100%', 'important');
    footerButton?.style.setProperty('height', '42px', 'important');
    footerButton?.style.setProperty('min-height', '42px', 'important');
    footerButton?.style.setProperty('padding', '0 18px', 'important');
    footerButton?.style.setProperty('display', 'flex', 'important');
    footerButton?.style.setProperty('align-items', 'center', 'important');
    footerButton?.style.setProperty('justify-content', 'space-between', 'important');
  };
  applySelectedLayout();
  window.addEventListener('resize', applySelectedLayout, { passive: true });

  let initialProjectId = '';
  if (location.pathname === '/projects/' && location.hash) {
    try { initialProjectId = decodeURIComponent(location.hash.slice(1)); } catch { initialProjectId = ''; }
  }
  const holdInitialProject = Boolean(initialProjectId && byId[initialProjectId]);
  if (!holdInitialProject) revealProjectRoute();

  const directMatch = location.pathname.match(/^\/projects\/([^/]+)\/([^/]+)\/$/);
  if (directMatch) {
    let directId = '';
    try {
      directId = `${decodeURIComponent(directMatch[1])}--${decodeURIComponent(directMatch[2])}`;
    } catch {
      directId = '';
    }
    if (directId && byId[directId]) {
      location.replace(`/projects/#${encodeURIComponent(directId)}`);
      return;
    }
  }

  const filterbar = document.getElementById('project-filterbar');
  const filterProjects = filter => {
    let allowed = null;
    if (filter !== 'all') {
      if (serviceById[filter]) allowed = new Set(serviceById[filter].categories);
      else if (categoryIds.has(filter)) allowed = new Set([filter]);
      else allowed = new Set();
    }
    document.querySelectorAll('#all-projects-grid [data-project-id]').forEach(card => {
      const shouldHide = allowed && !allowed.has(card.dataset.projectCategory);
      card.hidden = Boolean(shouldHide);
      if (shouldHide) card.style.setProperty('display', 'none', 'important');
      else card.style.removeProperty('display');
    });
  };

  if (filterbar) {
    const groupCount = group => projects.filter(project => group.categories.includes(project.category)).length;
    const legacyAliases = data.categories.map(category =>
      `<button type="button" class="project-filter project-filter-alias" data-project-filter="${esc(category.id)}" hidden tabindex="-1" aria-hidden="true">${esc(category.name)}</button>`
    ).join('');
    filterbar.innerHTML = [
      `<button type="button" class="project-filter is-active" data-project-filter="all">All (${projects.length})</button>`,
      ...serviceGroups.map(group => `<button type="button" class="project-filter" data-project-filter="${esc(group.id)}">${esc(group.name)} (${groupCount(group)})</button>`),
      legacyAliases
    ].join('');
  }

  document.querySelectorAll('.project-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.projectFilter;
      document.querySelectorAll('.project-filter:not(.project-filter-alias)').forEach(x => {
        x.classList.toggle('is-active', x.dataset.projectFilter === filter);
      });
      if (btn.classList.contains('project-filter-alias')) {
        const parent = serviceGroups.find(group => group.categories.includes(filter));
        if (parent) {
          document.querySelectorAll('.project-filter:not(.project-filter-alias)').forEach(x => {
            x.classList.toggle('is-active', x.dataset.projectFilter === parent.id);
          });
        }
      }
      filterProjects(filter);
      const scroller = document.querySelector('.all-projects-gallery-inner');
      if (scroller) scroller.scrollTop = 0;
    });
  });

  // Expertise category pages link here with ?service=. Open the archive and apply
  // the matching top-level filter after panels.js has attached its click handlers.
  if (location.pathname === '/projects/') {
    const requestedService = new URLSearchParams(location.search).get('service');
    if (requestedService && serviceById[requestedService]) {
      window.setTimeout(() => {
        document.querySelector('.projects-all-trigger')?.click();
        document.querySelector(`.project-filter[data-project-filter="${CSS.escape(requestedService)}"]`)?.click();
      }, 0);
    }
  }

  const overlay = document.getElementById('project-detail-overlay');
  const mainImg = document.getElementById('project-detail-main-image');
  const thumbs = document.getElementById('project-detail-thumbs');
  const title = document.getElementById('project-detail-title');
  const category = document.getElementById('project-detail-category');
  const description = document.getElementById('project-detail-description');
  const meta = document.getElementById('project-detail-meta');
  const projectsPanel = document.getElementById('projects');
  let mainPhotoRequest = 0;

  function setParentProjectControlsHidden(hidden) {
    projectsPanel?.classList.toggle('project-detail-active', hidden);
    projectsPanel?.querySelectorAll(':scope > .panel-close, :scope > .panel-prev, :scope > .panel-next').forEach(control => {
      if (hidden) control.style.setProperty('display', 'none', 'important');
      else control.style.removeProperty('display');
    });
  }

  async function setMainPhoto(p, idx) {
    const ph = p.photos[idx];
    if (!ph || !mainImg) return;
    const requestId = ++mainPhotoRequest;
    const sizes = '(max-width: 900px) calc(100vw - 48px), (max-width: 1280px) 64vw, 820px';

    mainImg.style.opacity = '0';
    mainImg.style.visibility = 'hidden';
    mainImg.removeAttribute('srcset');
    mainImg.removeAttribute('src');
    mainImg.alt = '';
    thumbs?.querySelectorAll('.project-detail-thumb').forEach((b,i) => b.classList.toggle('is-active', i === idx));

    const preload = new Image();
    preload.sizes = sizes;
    if (ph.srcset) preload.srcset = ph.srcset;
    preload.src = ph.src;
    try {
      if (typeof preload.decode === 'function') await preload.decode();
      else await new Promise((resolve, reject) => {
        preload.onload = resolve;
        preload.onerror = reject;
      });
    } catch {
      // Keep the previous bitmap hidden even if decoding falls back to the browser load path.
    }
    if (requestId !== mainPhotoRequest) return;

    mainImg.sizes = sizes;
    mainImg.srcset = ph.srcset || '';
    [mainImg.width, mainImg.height] = ph.web_dimensions;
    mainImg.src = ph.src;
    mainImg.alt = `${p.display_name} — ${categories[p.category] || p.category}`;
    requestAnimationFrame(() => {
      if (requestId !== mainPhotoRequest) return;
      mainImg.style.visibility = 'visible';
      mainImg.style.opacity = '1';
    });
  }

  function openDetail(id, trigger) {
    const p = byId[id];
    if (!p || !overlay) {
      revealProjectRoute();
      return;
    }
    title.textContent = p.display_name;
    category.textContent = categories[p.category] || p.category;
    if (description) description.textContent = p.detail_description || '';
    const rows = [['Project type', categories[p.category] || p.category]];
    if (p.application_text?.length) rows.push(['Application', p.application_text.join(' · ')]);
    if (p.certification_text?.length) rows.push(['Certification', p.certification_text.join(' · ')]);
    meta.innerHTML = rows.map(([k,v]) => `<div class="project-detail-meta-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('');
    meta.hidden = rows.length === 0;
    thumbs.innerHTML = p.photos.map((ph,i) => `<button type="button" class="project-detail-thumb ${i===0?'is-active':''}" data-photo-index="${i}" aria-label="View image ${i+1}"><img src="${esc(ph.thumbnail || ph.src)}" width="${ph.web_dimensions[0]}" height="${ph.web_dimensions[1]}" alt="" loading="lazy" decoding="async" /></button>`).join('');
    setMainPhoto(p,0);
    overlay.dataset.projectId = id;
    overlay.classList.add('is-open');
    window.HnhDialogs.open(overlay, { labelledby: 'project-detail-title', initial: '.project-detail-close', close: closeDetail, trigger });
    setParentProjectControlsHidden(true);
    document.body.classList.add('project-detail-open');
    revealProjectRoute();
    const scroller = overlay.querySelector('.project-detail-scroll');
    if (scroller) scroller.scrollTop = 0;
  }

  function closeDetail() {
    if (!overlay) return;
    mainPhotoRequest += 1;
    if (mainImg) {
      mainImg.style.opacity = '0';
      mainImg.style.visibility = 'hidden';
    }
    overlay.classList.remove('is-open');
    window.HnhDialogs.close(overlay);
    overlay.removeAttribute('data-project-id');
    setParentProjectControlsHidden(false);
    document.body.classList.remove('project-detail-open');
    revealProjectRoute();
  }

  window.openHnhProject = openDetail;
  window.closeHnhProject = closeDetail;

  if (holdInitialProject) window.setTimeout(revealProjectRoute, 3000);

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-project-id].project-card');
    if (card) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openDetail(card.dataset.projectId, card);
      return;
    }
    const thumb = e.target.closest('.project-detail-thumb');
    if (thumb && overlay?.dataset.projectId) {
      setMainPhoto(byId[overlay.dataset.projectId], Number(thumb.dataset.photoIndex));
      return;
    }
    if (e.target.closest('.project-detail-close')) {
      closeDetail();
      return;
    }
    if (e.target.closest('.project-detail-enquire')) {
      closeDetail();
      if (typeof window.openHnhPanel === 'function') window.openHnhPanel('contact');
      else document.querySelector('[data-panel="contact"], a[href="#contact"]')?.click();
    }
  });
})();

if (window.matchMedia('(max-width: 620px)').matches) {
  const contactShell = document.querySelector('#contact > .section-shell');
  if (contactShell) {
    contactShell.style.position = 'relative';
    contactShell.style.top = '-20px';
  }
}
