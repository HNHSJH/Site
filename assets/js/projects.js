(() => {
  const revealProjectRoute = () => document.body?.classList.add('project-route-ready');
  const data = window.HNH_PROJECT_DATA;
  if (!data || !Array.isArray(data.projects)) {
    revealProjectRoute();
    return;
  }

  const projects = data.projects;
  const categories = Object.fromEntries(data.categories.map(c => [c.id, c.name]));
  const byId = Object.fromEntries(projects.map(p => [p.id, p]));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const hoverCopy = p => [categories[p.category] || p.category, ...(p.certification_text || [])].filter(Boolean).join(' · ');

  const featuredProjectIds = [
    'artificial-turf--our-tampines-hub',
    'acrylic-coating--tanah-merah-country-club',
    'timber-flooring--ngee-ann-polytechnic',
    'epdm-flooring--sutd',
    'running-track--singapore-polytechnic',
    'landscape-artificial-turf--lion-city-sailors',
    'artificial-turf--jurong-east-stadium',
    'acrylic-coating--singapore-swimming-club'
  ];

  const selectedGrid = document.getElementById('selected-projects-grid');
  if (selectedGrid) {
    const featured = featuredProjectIds.map(id => byId[id]).filter(Boolean);
    if (featured.length === featuredProjectIds.length) {
      selectedGrid.innerHTML = featured.map((p, i) => {
        const ph = p.photos?.[0];
        if (!ph) return '';
        const srcset = ph.srcset ? ` srcset="${esc(ph.srcset)}"` : '';
        const loading = i < 2 ? 'eager' : 'lazy';
        return `<a class="project-card" href="/projects/#${encodeURIComponent(p.id)}" data-project-id="${esc(p.id)}" data-project-category="${esc(p.category)}">`
          + `<div class="project-media"><span class="project-number">${String(i + 1).padStart(2, '0')} / ${String(featured.length).padStart(2, '0')}</span>`
          + `<img src="${esc(ph.thumbnail || ph.src)}"${srcset} sizes="(max-width: 620px) calc((100vw - 40px) / 2), (max-width: 1020px) calc((100vw - 72px) / 2), 24vw" alt="${esc(p.display_name)} — ${esc(categories[p.category] || p.category)}" width="${ph.web_dimensions[0]}" height="${ph.web_dimensions[1]}" loading="${loading}" decoding="async"></div>`
          + `<div class="project-info"><div><h3>${esc(p.display_name)}</h3><p>${esc(hoverCopy(p))}</p></div>`
          + '<span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M9 5h10v10"/></svg></span></div></a>';
      }).join('');
      selectedGrid.dataset.featuredReady = 'true';
    }
  }

  // Keep the archive hierarchy consistent with the selected gallery: project
  // name remains visible over the image; type and certification reveal on hover.
  document.querySelectorAll('#all-projects-grid [data-project-id]').forEach(card => {
    const p = byId[card.dataset.projectId];
    const copy = card.querySelector('.project-info p');
    if (p && copy) copy.textContent = hoverCopy(p);
  });

  // The Projects landing page uses an explicit compact 2 / 4 / 2 composition.
  // Inline important values intentionally beat the older showcase grid rules.
  const applySelectedLayout = () => {
    if (!selectedGrid) return;
    const shell = selectedGrid.closest('.section-shell');
    const kicker = shell?.querySelector('.section-kicker');
    const footer = shell?.querySelector('.projects-footer');
    const cards = [...selectedGrid.querySelectorAll(':scope > .project-card')];
    const desktop = window.matchMedia('(min-width: 1021px)').matches;

    const clear = (el, props) => props.forEach(prop => el?.style.removeProperty(prop));
    if (!desktop) {
      clear(shell, ['display','grid-template-columns','grid-template-rows','column-gap','row-gap','align-content','justify-content']);
      clear(kicker, ['grid-column','grid-row','align-self','margin','padding-right']);
      clear(selectedGrid, ['display']);
      clear(footer, ['grid-column','grid-row','align-self','justify-self','margin']);
      cards.forEach(card => clear(card, ['grid-column','grid-row','height']));
      return;
    }

    shell?.style.setProperty('display', 'grid', 'important');
    shell?.style.setProperty('grid-template-columns', 'repeat(8,minmax(0,1fr))', 'important');
    shell?.style.setProperty('grid-template-rows', 'repeat(3,auto)', 'important');
    shell?.style.setProperty('column-gap', '8px', 'important');
    shell?.style.setProperty('row-gap', '7px', 'important');
    shell?.style.setProperty('align-content', 'center', 'important');
    shell?.style.setProperty('justify-content', 'stretch', 'important');

    kicker?.style.setProperty('grid-column', '1 / 4', 'important');
    kicker?.style.setProperty('grid-row', '1', 'important');
    kicker?.style.setProperty('align-self', 'center', 'important');
    kicker?.style.setProperty('margin', '0', 'important');
    kicker?.style.setProperty('padding-right', '20px', 'important');
    selectedGrid.style.setProperty('display', 'contents', 'important');

    const positions = [
      ['4 / 6', '1'], ['6 / 8', '1'],
      ['1 / 3', '2'], ['3 / 5', '2'], ['5 / 7', '2'], ['7 / 9', '2'],
      ['5 / 7', '3'], ['7 / 9', '3']
    ];
    cards.forEach((card, index) => {
      const pos = positions[index];
      if (!pos) return;
      card.style.setProperty('grid-column', pos[0], 'important');
      card.style.setProperty('grid-row', pos[1], 'important');
      card.style.setProperty('height', 'clamp(136px,15vh,160px)', 'important');
    });

    footer?.style.setProperty('grid-column', '1 / 3', 'important');
    footer?.style.setProperty('grid-row', '3', 'important');
    footer?.style.setProperty('align-self', 'center', 'important');
    footer?.style.setProperty('justify-self', 'start', 'important');
    footer?.style.setProperty('margin', '0', 'important');
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
  if (filterbar) {
    const counts = Object.fromEntries(data.categories.map(c => [c.id, projects.filter(p => p.category === c.id).length]));
    filterbar.innerHTML = [
      `<button type="button" class="project-filter is-active" data-project-filter="all">All (${projects.length})</button>`,
      ...data.categories.map(c => `<button type="button" class="project-filter" data-project-filter="${esc(c.id)}">${esc(c.name)} (${counts[c.id] || 0})</button>`)
    ].join('');
  }

  document.querySelectorAll('.project-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.projectFilter;
      document.querySelectorAll('.project-filter').forEach(x => x.classList.toggle('is-active', x === btn));
      document.querySelectorAll('#all-projects-grid [data-project-id]').forEach(card => {
        const shouldHide = filter !== 'all' && card.dataset.projectCategory !== filter;
        card.hidden = shouldHide;
        if (shouldHide) card.style.setProperty('display', 'none', 'important');
        else card.style.removeProperty('display');
      });
      const scroller = document.querySelector('.all-projects-gallery-inner');
      if (scroller) scroller.scrollTop = 0;
    });
  });

  const overlay = document.getElementById('project-detail-overlay');
  const mainImg = document.getElementById('project-detail-main-image');
  const thumbs = document.getElementById('project-detail-thumbs');
  const title = document.getElementById('project-detail-title');
  const category = document.getElementById('project-detail-category');
  const description = document.getElementById('project-detail-description');
  const meta = document.getElementById('project-detail-meta');
  const projectsPanel = document.getElementById('projects');

  function setParentProjectControlsHidden(hidden) {
    projectsPanel?.classList.toggle('project-detail-active', hidden);
    projectsPanel?.querySelectorAll(':scope > .panel-close, :scope > .panel-prev, :scope > .panel-next').forEach(control => {
      if (hidden) control.style.setProperty('display', 'none', 'important');
      else control.style.removeProperty('display');
    });
  }

  function setMainPhoto(p, idx) {
    const ph = p.photos[idx];
    if (!ph) return;
    mainImg.sizes = '(max-width: 900px) calc(100vw - 48px), (max-width: 1280px) 64vw, 820px';
    mainImg.srcset = ph.srcset || '';
    [mainImg.width, mainImg.height] = ph.web_dimensions;
    mainImg.src = ph.src;
    mainImg.alt = `${p.display_name} — ${categories[p.category] || p.category}`;
    thumbs.querySelectorAll('.project-detail-thumb').forEach((b,i) => b.classList.toggle('is-active', i === idx));
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
