(() => {
  const CTA_HEIGHT = '50px';
  const CTA_BG = '#20312d';
  const CTA_HOVER = '#355349';

  const styleArchiveCtas = () => {
    const mobile = window.matchMedia('(max-width: 620px)').matches;

    document.querySelectorAll('.clients-all-trigger, .projects-all-trigger').forEach(button => {
      const ctaFooter = button.closest('.clients-footer, .projects-footer');
      if (ctaFooter) {
        ctaFooter.style.setProperty('height', CTA_HEIGHT, 'important');
        ctaFooter.style.setProperty('min-height', CTA_HEIGHT, 'important');
      }

      button.style.setProperty('height', CTA_HEIGHT, 'important');
      button.style.setProperty('min-height', CTA_HEIGHT, 'important');
      button.style.setProperty('background', CTA_BG, 'important');
      button.style.setProperty('color', '#fff', 'important');
      button.style.setProperty('border-color', CTA_BG, 'important');
      button.style.setProperty('box-shadow', 'none', 'important');

      if (mobile && button.classList.contains('projects-all-trigger')) {
        const footer = button.closest('.projects-footer');
        const arrow = button.querySelector('span');
        if (footer) {
          footer.style.setProperty('width', '100%', 'important');
          footer.style.setProperty('height', CTA_HEIGHT, 'important');
          footer.style.setProperty('min-height', CTA_HEIGHT, 'important');
          footer.style.setProperty('margin', '14px 0 0', 'important');
          footer.style.setProperty('display', 'flex', 'important');
          footer.style.setProperty('justify-content', 'stretch', 'important');
        }
        button.style.setProperty('position', 'relative', 'important');
        button.style.setProperty('width', '100%', 'important');
        button.style.setProperty('padding', '0 54px', 'important');
        button.style.setProperty('display', 'flex', 'important');
        button.style.setProperty('align-items', 'center', 'important');
        button.style.setProperty('justify-content', 'center', 'important');
        button.style.setProperty('text-align', 'center', 'important');
        if (arrow) {
          arrow.style.setProperty('position', 'absolute', 'important');
          arrow.style.setProperty('right', '22px', 'important');
          arrow.style.setProperty('top', '50%', 'important');
          arrow.style.setProperty('transform', 'translateY(-50%)', 'important');
        }
      }

      if (button.dataset.archiveCtaStandardized === 'true') return;
      button.dataset.archiveCtaStandardized = 'true';
      const setHover = active => {
        const tone = active ? CTA_HOVER : CTA_BG;
        button.style.setProperty('background', tone, 'important');
        button.style.setProperty('border-color', tone, 'important');
      };
      button.addEventListener('pointerenter', () => setHover(true));
      button.addEventListener('pointerleave', () => setHover(false));
      button.addEventListener('focus', () => setHover(true));
      button.addEventListener('blur', () => setHover(false));
    });
  };

  // projects.js also owns the Projects CTA geometry. Apply the shared visual
  // treatment after the synchronous script pass so both CTAs finish identical.
  requestAnimationFrame(() => requestAnimationFrame(styleArchiveCtas));
  window.addEventListener('resize', () => requestAnimationFrame(styleArchiveCtas), { passive: true });

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
    const mobile = window.matchMedia('(max-width: 620px)').matches;

    if (shell) {
      shell.style.setProperty(
        'transform',
        desktop ? 'translateY(128px)' : mobile ? 'translateY(150px)' : 'none',
        'important'
      );
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
      footer.style.setProperty('height', CTA_HEIGHT, 'important');
      footer.style.setProperty('min-height', CTA_HEIGHT, 'important');
      footer.style.setProperty('margin', '0 auto', 'important');
      footer.style.setProperty('padding', '0', 'important');
      footer.style.setProperty('display', 'flex', 'important');
      footer.style.setProperty('justify-content', 'center', 'important');
    }
    if (viewAll) {
      viewAll.style.setProperty('position', 'relative', 'important');
      viewAll.style.setProperty('width', '100%', 'important');
      viewAll.style.setProperty('height', CTA_HEIGHT, 'important');
      viewAll.style.setProperty('min-height', CTA_HEIGHT, 'important');
      viewAll.style.setProperty('padding', '0 54px', 'important');
      viewAll.style.setProperty('display', 'flex', 'important');
      viewAll.style.setProperty('align-items', 'center', 'important');
      viewAll.style.setProperty('justify-content', 'center', 'important');
      viewAll.style.setProperty('text-align', 'center', 'important');
      viewAll.style.setProperty('background', CTA_BG, 'important');
      viewAll.style.setProperty('color', '#fff', 'important');
      viewAll.style.setProperty('border-color', CTA_BG, 'important');
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

    styleArchiveCtas();
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
