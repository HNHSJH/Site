(() => {
  const data = window.HNH_PROJECT_DATA;
  if (!data || !Array.isArray(data.projects)) return;

  const projects = data.projects;
  const categories = Object.fromEntries(data.categories.map(c => [c.id, c.name]));
  const byId = Object.fromEntries(projects.map(p => [p.id, p]));
  const selectedIds = ["artificial-turf--our-tampines-hub", "acrylic-coating--tanah-merah-country-club", "timber-flooring--ngee-ann-polytechnic", "epdm-flooring--sutd"];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const metaBits = p => {
    const bits = [];
    if (p.certification_text?.length) bits.push(...p.certification_text);
    if (p.completion?.length) bits.push(...p.completion);
    return bits;
  };
  const subline = p => [categories[p.category] || p.category, ...metaBits(p).slice(0,1)].filter(Boolean).join(' · ');
  const photo = p => p.photos?.[0]?.src || '';

  function card(p, index, total, archive=false) {
    return `
      <button class="project-card ${archive ? 'all-project-card' : ''}" type="button" data-project-id="${esc(p.id)}" data-project-category="${esc(p.category)}">
        <div class="project-media">
          <span class="project-number">${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span>
          <img src="${esc(photo(p))}" alt="${esc(p.display_name)}" loading="${archive ? 'lazy' : 'eager'}" decoding="async" />
        </div>
        <div class="project-info">
          <div><h3>${esc(p.display_name)}</h3><p>${esc(subline(p))}</p></div>
          <span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M9 5h10v10"/></svg></span>
        </div>
      </button>`;
  }

  const filterbar = document.getElementById('project-filterbar');
  if (filterbar) {
    const counts = Object.fromEntries(data.categories.map(c => [c.id, projects.filter(p => p.category === c.id).length]));
    filterbar.innerHTML = [
      `<button type="button" class="project-filter is-active" data-project-filter="all">All (${projects.length})</button>`,
      ...data.categories.map(c => `<button type="button" class="project-filter" data-project-filter="${esc(c.id)}">${esc(c.name)} (${counts[c.id] || 0})</button>`)
    ].join('');
  }

  const selectedGrid = document.getElementById('selected-projects-grid');
  if (selectedGrid) {
    const chosen = selectedIds.map(id => byId[id]).filter(Boolean);
    selectedGrid.innerHTML = chosen.map((p,i) => card(p,i,chosen.length,false)).join('');
  }

  const allGrid = document.getElementById('all-projects-grid');
  if (allGrid) {
    allGrid.innerHTML = projects.map((p,i) => card(p,i,projects.length,true)).join('');
  }

  document.querySelectorAll('.project-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.projectFilter;
      document.querySelectorAll('.project-filter').forEach(x => x.classList.toggle('is-active', x === btn));
      document.querySelectorAll('#all-projects-grid [data-project-id]').forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.projectCategory !== filter;
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
    mainImg.src = ph.src;
    mainImg.alt = p.display_name;
    thumbs.querySelectorAll('.project-detail-thumb').forEach((b,i) => b.classList.toggle('is-active', i === idx));
  }

  function openDetail(id) {
    const p = byId[id];
    if (!p || !overlay) return;
    title.textContent = p.display_name;
    category.textContent = categories[p.category] || p.category;
    const rows = [];
    if (p.certification_text?.length) rows.push(['Certification', p.certification_text.join(' · ')]);
    if (p.completion?.length) rows.push(['Completion', p.completion.join(' · ')]);
    meta.innerHTML = rows.map(([k,v]) => `<div class="project-detail-meta-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('');
    thumbs.innerHTML = p.photos.map((ph,i) => `<button type="button" class="project-detail-thumb ${i===0?'is-active':''}" data-photo-index="${i}" aria-label="View image ${i+1}"><img src="${esc(ph.src)}" alt="" loading="lazy" /></button>`).join('');
    setMainPhoto(p,0);
    overlay.dataset.projectId = id;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
    setParentProjectControlsHidden(true);
    document.body.classList.add('project-detail-open');
    const scroller = overlay.querySelector('.project-detail-scroll');
    if (scroller) scroller.scrollTop = 0;
  }

  function closeDetail() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    overlay.removeAttribute('data-project-id');
    setParentProjectControlsHidden(false);
    document.body.classList.remove('project-detail-open');
  }

  window.openHnhProject = openDetail;
  window.closeHnhProject = closeDetail;

  // Showcase slide selection is handled by the hero gallery dots; clicking the hero itself does not navigate.

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-project-id].project-card');
    if (card) {
      e.preventDefault();
      openDetail(card.dataset.projectId);
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
      document.querySelector('.all-projects-gallery')?.classList.remove('is-open');
      if (typeof window.openHnhPanel === 'function') window.openHnhPanel('contact');
      else document.querySelector('[data-panel="contact"], a[href="#contact"]')?.click();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) {
      e.stopImmediatePropagation();
      closeDetail();
    }
  }, true);
})();
