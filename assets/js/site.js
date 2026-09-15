const directProjectRoutes = new Set([
  'artificial-turf--our-tampines-hub',
  'acrylic-coating--tanah-merah-country-club',
  'timber-flooring--ngee-ann-polytechnic',
  'epdm-flooring--sutd',
  'artificial-turf--ngee-ann-polytechnic',
  'acrylic-coating--republic-polytechnic'
]);
const directProjectMatch = location.pathname.match(/^\/projects\/([^/]+)\/([^/]+)\/$/);
if (directProjectMatch) {
  let directProjectId = '';
  try {
    directProjectId = `${decodeURIComponent(directProjectMatch[1])}--${decodeURIComponent(directProjectMatch[2])}`;
  } catch {
    directProjectId = '';
  }
  if (directProjectRoutes.has(directProjectId)) {
    location.replace(`/projects/#${encodeURIComponent(directProjectId)}`);
  }
}

const body = document.body;

// Keep the main public routes deliberately distinct in search results instead of
// repeating variations of "Sports Construction" across every page.
const deliberateSeoByPath = {
  '/': {
    title: 'Sports Fields, Courts & Turf Singapore | H&H Resources',
    description: 'H&H Resources provides sports field, court, turf and landscape construction for schools, clubs and government agencies in Singapore. Explore our projects.'
  },
  '/about-us/': {
    title: 'About H&H Resources | Turf & Sports Surface Specialists',
    description: 'Learn about H&H Resources, its roots in 1980 and its experience across sports fields, courts, turf, golf and landscape works in Singapore.'
  },
  '/clients/': {
    title: 'Past Clients & School Projects | H&H Resources',
    description: 'Explore H&H Resources client references across Singapore, including schools, sports clubs, government agencies and community organisations.'
  },
  '/projects/': {
    title: 'Artificial Turf, Court & Track Projects | H&H Resources',
    description: 'Explore H&H Resources projects across artificial turf, court coatings, timber sports flooring, running tracks and EPDM surfaces in Singapore.'
  },
  '/services/': {
    title: 'Turf, Sports Field, Court & Landscape Services | H&H Resources',
    description: 'Explore H&H Resources expertise in sports fields, courts, turf, landscape works, irrigation, golf course construction and specialist surfaces in Singapore.'
  },
  '/contact/': {
    title: 'Contact H&H Resources | Turf, Court & Field Enquiries',
    description: 'Contact H&H Resources about turf, sports field, court, landscape and specialist surfacing works in Singapore. Call +65 9114 8327 or email enquiry@hnhresources.com.'
  }
};

const applyDeliberateSeo = () => {
  const path = body?.dataset.currentRoute || location.pathname;
  const record = deliberateSeoByPath[path];
  if (!record) return;
  document.title = record.title;
  const updates = [
    ['meta[name="description"]', 'content', record.description],
    ['meta[property="og:title"]', 'content', record.title],
    ['meta[property="og:description"]', 'content', record.description],
    ['meta[name="twitter:title"]', 'content', record.title],
    ['meta[name="twitter:description"]', 'content', record.description]
  ];
  updates.forEach(([selector, attribute, value]) => document.querySelector(selector)?.setAttribute(attribute, value));
};

applyDeliberateSeo();
new MutationObserver(applyDeliberateSeo).observe(body, { attributes: true, attributeFilter: ['data-current-route'] });
window.addEventListener('popstate', applyDeliberateSeo);

const ensureGlobalContactFooter = () => {
  let footer = document.querySelector('.global-contact-footer');
  if (!footer) {
    footer = document.createElement('div');
    footer.className = 'global-contact-footer';
    footer.setAttribute('role', 'contentinfo');
    footer.innerHTML = `
      <span>1 Tampines North Drive 1, #08-49 T-Space, Singapore 528559</span>
      <span aria-hidden="true">·</span>
      <a href="mailto:enquiry@hnhresources.com">enquiry@hnhresources.com</a>
      <span aria-hidden="true">·</span>
      <a href="tel:+6591148327">+65 9114 8327</a>
    `;
    document.getElementById('site-interaction-shell')?.appendChild(footer);
  }

  let style = document.getElementById('hnh-global-footer-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'hnh-global-footer-style';
    document.head.appendChild(style);
  }
  style.textContent = `
    .global-contact-footer {
      position: fixed;
      right: var(--pad);
      bottom: 14px;
      z-index: 160;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      max-width: calc(100vw - (var(--pad) * 2));
      color: rgba(255,255,255,.78);
      font-size: 8px;
      line-height: 1;
      letter-spacing: .065em;
      white-space: nowrap;
      text-transform: uppercase;
      pointer-events: auto;
      transition: color .3s ease, opacity .3s ease;
    }
    .global-contact-footer a {
      color: inherit;
      text-decoration: none;
    }
    .global-contact-footer a:hover,
    .global-contact-footer a:focus-visible {
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    body[data-active-panel="clients"] .global-contact-footer,
    body[data-active-panel="projects"] .global-contact-footer,
    body[data-active-panel="expertise"] .global-contact-footer,
    body[data-route-path="/clients/"] .global-contact-footer,
    body[data-route-path="/projects/"] .global-contact-footer,
    body[data-route-path^="/projects/"] .global-contact-footer,
    body[data-route-path="/services/"] .global-contact-footer,
    body.client-archive-open .global-contact-footer,
    body.moe-schools-open .global-contact-footer,
    body.project-archive-open .global-contact-footer,
    body.project-detail-open .global-contact-footer,
    body[data-active-panel="route-detail"] .global-contact-footer {
      color: rgba(32,49,45,.78);
    }

    body[data-active-panel="projects"] .global-copyright,
    body[data-route-path="/projects/"] .global-copyright,
    body[data-route-path^="/projects/"] .global-copyright,
    body.project-archive-open .global-copyright,
    body.project-detail-open .global-copyright {
      color: rgba(32,49,45,.78) !important;
    }

    @media (max-width: 620px) {
      .global-contact-footer {
        right: 14px;
        bottom: 25px;
        gap: 5px;
        max-width: calc(100vw - 28px);
        font-size: 6px;
        letter-spacing: .035em;
      }
    }
  `;
};

ensureGlobalContactFooter();

    const menuButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.menu-overlay');

    function setMenu(open) {
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) window.HnhDialogs.open(menu, { label: 'H&H Resources menu', initial: '.menu-search input', close: () => setMenu(false), trigger: menuButton });
      else window.HnhDialogs.close(menu);
      window.HnhSlideshow.refresh();
    }

    menuButton.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    document.querySelectorAll('.menu-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.querySelectorAll('.site-header a').forEach(link => link.addEventListener('click', () => setMenu(false)));

    const hero = document.querySelector('.hero');
    const backToTop = document.querySelector('.back-to-top');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => hero?.classList.add('hero-ready'));

    if (hero && backToTop) {
      const heroObserver = new IntersectionObserver(entries => {
        const heroIsVisible = entries[0]?.isIntersecting ?? true;
        backToTop.classList.toggle('is-visible', !heroIsVisible);
      }, { threshold: 0.02 });

      heroObserver.observe(hero);
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
    const sections = [...document.querySelectorAll('.scroll-section')];
    let statsStarted = false;

    function animateCount(element, duration = 1450) {
      const start = Number(element.dataset.start || 0);
      const target = Number(element.dataset.count || 0);
      const startTime = performance.now();

      function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(start + (target - start) * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(frame);
        else element.textContent = target.toLocaleString();
      }
      requestAnimationFrame(frame);
    }

    function revealSection(section) {
      if (section.dataset.revealed === 'true') return;
      section.dataset.revealed = 'true';

      const revealContent = () => {
        section.classList.add('section-visible');

        section.querySelectorAll('.reveal').forEach((element, index) => {
          window.setTimeout(() => element.classList.add('visible'), index * 70);
        });

        if (!statsStarted && section.classList.contains('intro')) {
          statsStarted = true;
          window.setTimeout(() => {
            section.querySelectorAll('[data-count]').forEach(element => animateCount(element));
          }, 260);
        }
      };

      if (prefersReducedMotion) {
        revealContent();
        return;
      }

      if (section.classList.contains('instant-reveal')) {
        revealContent();
        return;
      }

      window.setTimeout(revealContent, 480);
    }

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealSection(entry.target);
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

    const contactForm = document.querySelector('#contact-form');
    const contactFormStatus = document.querySelector('#contact-form-status');
    const contactSubmit = contactForm?.querySelector('.contact-submit');
    const sentFromForm = new URLSearchParams(window.location.search).get('sent') === '1';
    if (sentFromForm && contactFormStatus) {
      contactFormStatus.textContent = 'Thank you. Your enquiry has been sent.';
      history.replaceState(history.state, '', `${window.location.pathname}${window.location.hash || '#contact'}`);
    }

    contactForm?.addEventListener('submit', event => {
      if (!contactForm.reportValidity()) {
        event.preventDefault();
        return;
      }
      if (!window.HnhAttachments.validate()) {
        event.preventDefault();
        contactFormStatus.textContent = 'Please check the attachment limits and try again.';
        return;
      }

      const honey = contactForm.elements.namedItem('_honey');
      if (honey?.value) {
        event.preventDefault();
        return;
      }

      const projectType = contactForm.elements.namedItem('projectType')?.value || 'General Enquiry';
      const subject = contactForm.elements.namedItem('_subject');
      const sourceUrl = contactForm.elements.namedItem('_url');
      if (subject) subject.value = `Website enquiry — ${projectType}`;
      if (sourceUrl) sourceUrl.value = window.location.href;

      if (contactSubmit) {
        contactSubmit.textContent = 'Sending…';
      }
      if (contactFormStatus) contactFormStatus.textContent = 'Sending your enquiry…';
      // Important: do not preventDefault here. The browser must perform the native
      // multipart/form-data POST so FormSubmit receives the actual file bytes.
    });
