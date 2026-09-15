(() => {
    const grid = document.querySelector('.clients .client-grid');
    if (!grid) return;
    const items = [...grid.querySelectorAll('.client-logo')];
    if (!items.length) return;

    // Test layout: keep the selected logo mosaic continuous and turn View All
    // Clients into the full-width horizontal control directly below the grid.
    const shell = grid.closest('.section-shell');
    const footer = shell?.querySelector('.clients-footer');
    const intro = shell?.querySelector('.clients-intro');
    const viewAll = footer?.querySelector('.clients-all-trigger');
    const allClientsGrid = document.querySelector('.all-clients-grid');

    grid.style.setProperty('gap', '0', 'important');
    grid.style.setProperty('column-gap', '0', 'important');
    grid.style.setProperty('row-gap', '0', 'important');
    grid.style.setProperty('order', '1', 'important');
    footer?.style.setProperty('order', '2', 'important');
    intro?.style.setProperty('order', '3', 'important');

    if (footer) {
      footer.style.setProperty('width', 'min(100%, var(--gallery-width))', 'important');
      footer.style.setProperty('margin', '0 auto', 'important');
      footer.style.setProperty('padding', '0', 'important');
      footer.style.setProperty('display', 'flex', 'important');
      footer.style.setProperty('justify-content', 'stretch', 'important');
    }
    if (viewAll) {
      viewAll.style.setProperty('width', '100%', 'important');
      viewAll.style.setProperty('min-height', '54px', 'important');
      viewAll.style.setProperty('padding', '0 22px', 'important');
      viewAll.style.setProperty('display', 'flex', 'important');
      viewAll.style.setProperty('align-items', 'center', 'important');
      viewAll.style.setProperty('justify-content', 'space-between', 'important');
      viewAll.style.setProperty('background', 'rgba(255,255,255,.18)', 'important');
    }
    if (allClientsGrid) {
      allClientsGrid.style.setProperty('gap', '0', 'important');
      allClientsGrid.style.setProperty('column-gap', '0', 'important');
      allClientsGrid.style.setProperty('row-gap', '0', 'important');
    }

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
      // Also makes the behaviour intuitive on touch devices.
      item.addEventListener('pointerdown', () => setActive(item), { passive: true });
    });
  })();
