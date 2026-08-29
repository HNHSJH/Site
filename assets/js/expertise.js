(() => {
    const items = [...document.querySelectorAll('.expertise-item')];
    if (!items.length) return;
    function setOpen(item, open) {
      const toggle = item.querySelector('.expertise-toggle');
      const options = item.querySelector('.expertise-options');
      item.classList.toggle('is-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
      if (options) options.setAttribute('aria-hidden', String(!open));
    }
    items.forEach(item => {
      const toggle = item.querySelector('.expertise-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', () => {
        const shouldOpen = !item.classList.contains('is-open');
        items.forEach(other => setOpen(other, false));
        setOpen(item, shouldOpen);
      });
    });
  })();
