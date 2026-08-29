(() => {
    const grid = document.querySelector('.clients .client-grid');
    if (!grid) return;
    const items = [...grid.querySelectorAll('.client-logo')];
    if (!items.length) return;

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
