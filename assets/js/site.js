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
