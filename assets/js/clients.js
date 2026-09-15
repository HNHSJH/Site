(() => {
  const applyProjectTuning = () => {
    const projectsPanel = document.getElementById('projects');
    const selectedGrid = document.getElementById('selected-projects-grid');
    const projectShell = selectedGrid?.closest('.section-shell');
    const projectFooter = projectShell?.querySelector('.projects-footer');
    const projectViewAll = projectFooter?.querySelector('.projects-all-trigger');
    const allProjectsGrid = document.getElementById('all-projects-grid');

    // Keep the selected landing mosaic fully continuous even though projects.js
    // owns the desktop placement with inline styles.
    if (projectShell) {
      projectShell.style.setProperty('column-gap', '0', 'important');
      projectShell.style.setProperty('row-gap', '0', 'important');
    }

    // The archive stays at three large columns on desktop. Tablet/mobile step
    // down naturally so the images remain readable rather than becoming tiny.
    if (allProjectsGrid) {
      const desktop = window.matchMedia('(min-width: 981px)').matches;
      const tablet = window.matchMedia('(min-width: 621px) and (max-width: 980px)').matches;
      allProjectsGrid.style.setProperty(
        'grid-template-columns',
        desktop ? 'repeat(3, minmax(0, 1fr))' : tablet ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        'important'
      );
      allProjectsGrid.style.setProperty('width', desktop ? 'min(100%, 1560px)' : '100%', 'important');
      allProjectsGrid.style.setProperty('gap', '0', 'important');
      allProjectsGrid.style.setProperty('column-gap', '0', 'important');
      allProjectsGrid.style.setProperty('row-gap', '0', 'important');
    }

    // Smaller archive control, aligned to the top of its bottom-right grid slot.
    if (projectFooter) {
      projectFooter.style.setProperty('align-self', 'start', 'important');
      projectFooter.style.setProperty('justify-self', 'end', 'important');
      projectFooter.style.setProperty('margin', '0', 'important');
    }
    if (projectViewAll) {
      projectViewAll.style.setProperty('min-height', '36px', 'important');
      projectViewAll.style.setProperty('padding', '0 12px', 'important');
      projectViewAll.style.setProperty('font-size', '8px', 'important');
      projectViewAll.style.setProperty('letter-spacing', '.11em', 'important');
      projectViewAll.style.setProperty('width', 'auto', 'important');
      projectViewAll.style.setProperty('transform', 'none', 'important');
    }

    // Avoid retaining stale inline sizing if this script is evaluated before a
    // panel is first opened.
    projectsPanel?.style.removeProperty('--unused-project-tuning');
  };

  applyProjectTuning();
  window.addEventListener('resize', applyProjectTuning, { passive: true });

  const grid = document.querySelector('.clients .client-grid');
  if (!grid) return;
  const items = [...grid.querySelectorAll('.client-logo')];
  if (!items.length) return;

  const shell = grid.closest('.section-shell');
  const footer = shell?.querySelector('.clients-footer');
  const intro = shell?.querySelector('.clients-intro');
  const viewAll = footer?.querySelector('.clients-all-trigger');
  const allClientsGrid = document.querySelector('.all-clients-grid');

  const applyClientLayout = () => {
    const desktop = window.matchMedia('(min-width: 1021px)').matches;

    // Keep the three selected-client elements together, but return the group
    // lower into the middle of the page on desktop.
    if (shell) {
      shell.style.setProperty('transform', desktop ? 'translateY(44px)' : 'none', 'important');
    }

    grid.style.setProperty('gap', '0', 'important');
    grid.style.setProperty('column-gap', '0', 'important');
    grid.style.setProperty('row-gap', '0', 'important');
    grid.style.setProperty('order', '1', 'important');
    items.forEach(item => item.style.setProperty('border', '0', 'important'));

    footer?.style.setProperty('order', '2', 'important');
    intro?.style.setProperty('order', '3', 'important');

    if (footer) {
      footer.style.setProperty('width', 'min(100%, var(--gallery-width))', 'important');
      footer.style.setProperty('margin', '0 auto', 'important');
      footer.style.setProperty('padding', '0', 'important');
      footer.style.setProperty('display', 'flex', 'important');
      footer.style.setProperty('justify-content', 'center', 'important');
    }
    if (viewAll) {
      viewAll.style.setProperty('width', '100%', 'important');
      viewAll.style.setProperty('min-height', '54px', 'important');
      viewAll.style.setProperty('padding', '0 22px', 'important');
      viewAll.style.setProperty('display', 'flex', 'important');
      viewAll.style.setProperty('align-items', 'center', 'important');
      viewAll.style.setProperty('justify-content', 'center', 'important');
      viewAll.style.setProperty('gap', '14px', 'important');
      viewAll.style.setProperty('text-align', 'center', 'important');
      viewAll.style.setProperty('background', 'rgba(255,255,255,.18)', 'important');
    }
    if (allClientsGrid) {
      allClientsGrid.style.setProperty('gap', '0', 'important');
      allClientsGrid.style.setProperty('column-gap', '0', 'important');
      allClientsGrid.style.setProperty('row-gap', '0', 'important');
      allClientsGrid.querySelectorAll('.client-logo').forEach(item => item.style.setProperty('border', '0', 'important'));
    }
  };

  applyClientLayout();
  window.addEventListener('resize', applyClientLayout, { passive: true });

  // The first client is highlighted initially. Thereafter the most recently
  // hovered/focused client remains highlighted until another client is used.
  let activeItem = items.find(item => item.classList.contains('is-prehighlighted')) || items[0];

  const setActive = item => {
    if (!item || item === activeItem) return;
    items.forEach(client => client.classList.remove('is-prehighlighted'));
    item.classList.add('is-prehighlighted');
    activeItem = item;
  };

  // Ensure a deterministic initial state even if cached markup is restored.
  items.forEach(client => client.classList.toggle('is-prehighlighted', client === activeItem));

  items.forEach(item => {
    item.addEventListener('pointerenter', () => setActive(item));
    item.addEventListener('focusin', () => setActive(item));
    item.addEventListener('pointerdown', () => setActive(item), { passive: true });
  });
})();
