(() => {
  const grid = document.querySelector('.clients .client-grid');
  if (!grid) return;
  const items = [...grid.querySelectorAll('.client-logo')];
  if (!items.length) return;

  const shell = grid.closest('.section-shell');
  const footer = shell?.querySelector('.clients-footer');
  const intro = shell?.querySelector('.clients-intro');
  const viewAll = footer?.querySelector('.clients-all-trigger');
  const viewAllArrow = viewAll?.querySelector('span');
  const allClientsGrid = document.querySelector('.all-clients-grid');

  const applyClientLayout = () => {
    const desktop = window.matchMedia('(min-width: 1021px)').matches;

    if (shell) {
      shell.style.setProperty('transform', desktop ? 'translateY(128px)' : 'none', 'important');
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
      viewAll.style.setProperty('position', 'relative', 'important');
      viewAll.style.setProperty('width', '100%', 'important');
      viewAll.style.setProperty('min-height', '54px', 'important');
      viewAll.style.setProperty('padding', '0 54px', 'important');
      viewAll.style.setProperty('display', 'flex', 'important');
      viewAll.style.setProperty('align-items', 'center', 'important');
      viewAll.style.setProperty('justify-content', 'center', 'important');
      viewAll.style.setProperty('text-align', 'center', 'important');
      viewAll.style.setProperty('background', 'rgba(255,255,255,.18)', 'important');
    }
    if (viewAllArrow) {
      viewAllArrow.style.setProperty('position', 'absolute', 'important');
      viewAllArrow.style.setProperty('right', '22px', 'important');
      viewAllArrow.style.setProperty('top', '50%', 'important');
      viewAllArrow.style.setProperty('transform', 'translateY(-50%)', 'important');
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

  let activeItem = items.find(item => item.classList.contains('is-prehighlighted')) || items[0];

  const setActive = item => {
    if (!item || item === activeItem) return;
    items.forEach(client => client.classList.remove('is-prehighlighted'));
    item.classList.add('is-prehighlighted');
    activeItem = item;
  };

  items.forEach(client => client.classList.toggle('is-prehighlighted', client === activeItem));

  items.forEach(item => {
    item.addEventListener('pointerenter', () => setActive(item));
    item.addEventListener('focusin', () => setActive(item));
    item.addEventListener('pointerdown', () => setActive(item), { passive: true });
  });
})();
