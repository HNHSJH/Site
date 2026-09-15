(() => {
  const serviceOrder = [
    'golf-course-construction',
    'turf-landscape',
    'sports-fields',
    'sports-courts',
    'irrigation-systems',
    'specialised-surfaces'
  ];
  const serviceSet = new Set(serviceOrder);
  const directMatch = location.pathname.match(/^\/services\/([^/]+)\/$/);

  // Direct SEO service URLs should land in the real Expertise experience.
  if (directMatch && serviceSet.has(directMatch[1])) {
    location.replace(`/services/#${directMatch[1]}`);
    return;
  }

  const expertise = document.getElementById('expertise');
  const shell = expertise?.querySelector(':scope > .section-shell');
  const heading = expertise?.querySelector('.expertise-heading');
  const marks = expertise?.querySelector('.expertise-marks');
  const list = expertise?.querySelector('.expertise-list');

  const applyExpertiseLayout = () => {
    if (!shell) return;
    const mobile = window.matchMedia('(max-width: 620px)').matches;

    if (mobile) {
      shell.style.setProperty('justify-content', 'flex-start', 'important');
      shell.style.setProperty('align-items', 'center', 'important');
      shell.style.setProperty('overflow-y', 'auto', 'important');
      shell.style.setProperty('overscroll-behavior', 'contain', 'important');
      shell.style.setProperty('padding', '86px 16px 104px', 'important');

      [heading, list].forEach(element => {
        if (!element) return;
        element.style.setProperty('width', 'min(100%, 460px)', 'important');
        element.style.setProperty('margin-left', 'auto', 'important');
        element.style.setProperty('margin-right', 'auto', 'important');
      });

      // Auto margins vertically center the complete content block when it fits,
      // while still allowing natural scrolling when an accordion expands.
      heading?.style.setProperty('margin-top', 'auto', 'important');
      list?.style.setProperty('margin-bottom', 'auto', 'important');

      if (marks) {
        marks.style.setProperty('width', '100%', 'important');
        marks.style.setProperty('justify-self', 'center', 'important');
        marks.style.setProperty('justify-content', 'center', 'important');
      }
    } else {
      shell.style.removeProperty('justify-content');
      shell.style.removeProperty('align-items');
      shell.style.removeProperty('overflow-y');
      shell.style.removeProperty('overscroll-behavior');
      shell.style.removeProperty('padding');
      [heading, list].forEach(element => {
        if (!element) return;
        element.style.removeProperty('width');
        element.style.removeProperty('margin-left');
        element.style.removeProperty('margin-right');
      });
      heading?.style.removeProperty('margin-top');
      list?.style.removeProperty('margin-bottom');
      if (marks) {
        marks.style.removeProperty('width');
        marks.style.removeProperty('justify-self');
        marks.style.removeProperty('justify-content');
      }
    }
  };

  const applySharedMobilePresentation = () => {
    const mobile = window.matchMedia('(max-width: 620px)').matches;

    const about = document.getElementById('about');
    const aboutShell = about?.querySelector(':scope > .section-shell');
    const aboutPanel = about?.querySelector('.about-panel');

    const projects = document.getElementById('projects');
    const projectShell = projects?.querySelector(':scope > .section-shell');
    const projectKicker = projectShell?.querySelector('.section-kicker');
    const projectGrid = projectShell?.querySelector('#selected-projects-grid');
    const projectFooter = projectShell?.querySelector('.projects-footer');

    const heroSlides = document.querySelector('.hero-slides');
    const heroSlideItems = [...document.querySelectorAll('.hero-slide')];

    if (mobile) {
      if (aboutShell) {
        aboutShell.style.setProperty('justify-content', 'flex-start', 'important');
        aboutShell.style.setProperty('align-items', 'center', 'important');
        aboutShell.style.setProperty('overflow-y', 'auto', 'important');
        aboutShell.style.setProperty('overscroll-behavior', 'contain', 'important');
        aboutShell.style.setProperty('padding', '88px 16px 110px', 'important');
      }
      if (aboutPanel) {
        aboutPanel.style.setProperty('width', 'min(100%, 420px)', 'important');
        aboutPanel.style.setProperty('margin-left', 'auto', 'important');
        aboutPanel.style.setProperty('margin-right', 'auto', 'important');
        aboutPanel.style.setProperty('margin-top', 'auto', 'important');
        aboutPanel.style.setProperty('margin-bottom', 'auto', 'important');
      }

      if (projectShell) {
        projectShell.style.setProperty('justify-content', 'center', 'important');
        projectShell.style.setProperty('align-items', 'center', 'important');
        projectShell.style.setProperty('padding', '84px 14px 108px', 'important');
        projectShell.style.setProperty('overflow-y', 'auto', 'important');
        projectShell.style.setProperty('overscroll-behavior', 'contain', 'important');
      }
      [projectKicker, projectGrid, projectFooter].forEach(element => {
        if (!element) return;
        element.style.setProperty('width', 'min(100%, 420px)', 'important');
        element.style.setProperty('margin-left', 'auto', 'important');
        element.style.setProperty('margin-right', 'auto', 'important');
      });
      projectKicker?.style.setProperty('margin-bottom', '14px', 'important');
      projectFooter?.style.setProperty('margin-top', '10px', 'important');

      if (heroSlides) heroSlides.style.setProperty('background', '#182019', 'important');
      heroSlideItems.forEach(slide => {
        slide.style.setProperty('background-size', 'contain', 'important');
        slide.style.setProperty('background-repeat', 'no-repeat', 'important');
        slide.style.setProperty('background-position', 'center center', 'important');
        slide.style.setProperty('background-color', '#182019', 'important');
        slide.style.setProperty('transform', 'none', 'important');
      });
    } else {
      if (aboutShell) {
        aboutShell.style.removeProperty('justify-content');
        aboutShell.style.removeProperty('align-items');
        aboutShell.style.removeProperty('overflow-y');
        aboutShell.style.removeProperty('overscroll-behavior');
        aboutShell.style.removeProperty('padding');
      }
      if (aboutPanel) {
        aboutPanel.style.removeProperty('width');
        aboutPanel.style.removeProperty('margin-left');
        aboutPanel.style.removeProperty('margin-right');
        aboutPanel.style.removeProperty('margin-top');
        aboutPanel.style.removeProperty('margin-bottom');
      }

      if (projectShell) {
        projectShell.style.removeProperty('align-items');
      }
      [projectKicker, projectGrid, projectFooter].forEach(element => {
        if (!element) return;
        element.style.removeProperty('margin-left');
        element.style.removeProperty('margin-right');
      });
      projectKicker?.style.removeProperty('margin-bottom');

      if (heroSlides) heroSlides.style.removeProperty('background');
      heroSlideItems.forEach(slide => {
        slide.style.removeProperty('background-size');
        slide.style.removeProperty('background-repeat');
        slide.style.removeProperty('background-position');
        slide.style.removeProperty('background-color');
        slide.style.removeProperty('transform');
      });
    }
  };

  const scheduleMobilePresentation = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      applyExpertiseLayout();
      applySharedMobilePresentation();
    }));
  };

  applyExpertiseLayout();
  scheduleMobilePresentation();
  window.addEventListener('load', scheduleMobilePresentation, { once: true });
  window.addEventListener('resize', scheduleMobilePresentation, { passive: true });

  const items = [...document.querySelectorAll('.expertise-item')];
  if (!items.length) return;

  function setOpen(item, open) {
    const toggle = item.querySelector('.expertise-toggle');
    const options = item.querySelector('.expertise-options');
    item.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (options) options.setAttribute('aria-hidden', String(!open));
  }

  function openFromHash(scroll = true) {
    const slug = decodeURIComponent(location.hash.slice(1));
    const index = serviceOrder.indexOf(slug);
    if (index < 0 || !items[index]) return false;
    items.forEach(item => setOpen(item, false));
    setOpen(items[index], true);
    if (scroll) requestAnimationFrame(() => items[index].scrollIntoView({ block: 'center' }));
    return true;
  }

  items.forEach(item => {
    setOpen(item, item.classList.contains('is-open'));
    const toggle = item.querySelector('.expertise-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      items.forEach(other => setOpen(other, false));
      setOpen(item, shouldOpen);
    });
  });

  openFromHash(true);
  window.addEventListener('hashchange', () => openFromHash(true));
})();
