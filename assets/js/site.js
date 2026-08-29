const body = document.body;
    const menuButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.menu-overlay');

    function setMenu(open) {
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
    }

    menuButton.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    document.querySelectorAll('.menu-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

    const slides = [...document.querySelectorAll('.hero-slide')];
    const dots = [...document.querySelectorAll('.hero-dot')];
    let slideIndex = 0;
    let slideTimer;

    const heroTitle = document.getElementById('hero-title');
    const heroProjectLabel = document.getElementById('hero-project-label');
    const heroLocationText = document.getElementById('hero-location-text');

    function ensureHeroSlideLoaded(slide) {
      if (!slide || !slide.dataset.bg) return;
      slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
      delete slide.dataset.bg;
    }

    function showSlide(nextIndex) {
      slideIndex = nextIndex;
      ensureHeroSlideLoaded(slides[slideIndex]);
      slides.forEach((slide, i) => slide.classList.toggle('active', i === slideIndex));
      const activeSlide = slides[slideIndex];
      if (activeSlide) {
        if (heroTitle) heroTitle.textContent = activeSlide.dataset.title || '';
        if (heroProjectLabel) heroProjectLabel.textContent = activeSlide.dataset.project || '';
        if (heroLocationText) heroLocationText.textContent = activeSlide.dataset.location || '';
      }
      dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === slideIndex) requestAnimationFrame(() => dot.classList.add('active'));
      });
      clearTimeout(slideTimer);
      const following = slides[(slideIndex + 1) % slides.length];
      const warmNext = () => ensureHeroSlideLoaded(following);
      if ('requestIdleCallback' in window) requestIdleCallback(warmNext, { timeout: 1800 });
      else setTimeout(warmNext, 700);
      slideTimer = setTimeout(() => showSlide((slideIndex + 1) % slides.length), 6000);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    showSlide(0);

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
        section.classList.remove('section-loading');
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

      revealContent();
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
    const attachmentInputs = document.querySelector('#attachment-file-inputs');
    const attachmentButton = document.querySelector('#attachment-button');
    const attachmentSelection = document.querySelector('#attachment-selection');
    const attachmentControl = attachmentInputs?.closest('.attachment-control');
    const maxAttachmentSize = 5 * 1024 * 1024;
    const maxAttachmentTotal = 10 * 1024 * 1024;
    const maxAttachmentCount = 5;
    const attachmentAccept = '.jpg,.jpeg,.png,.gif,.mp4,.doc,.docx,.pdf,.zip,image/jpeg,image/png,image/gif,video/mp4,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/zip';

    function selectedAttachmentFiles() {
      return [...(attachmentInputs?.querySelectorAll('input[type="file"]') || [])]
        .flatMap(input => [...(input.files || [])]);
    }

    function validateAttachments() {
      const files = selectedAttachmentFiles();
      attachmentControl?.classList.remove('is-error');
      if (!files.length) {
        if (attachmentSelection) attachmentSelection.textContent = 'No files selected';
        return true;
      }

      const tooLarge = files.find(file => file.size > maxAttachmentSize);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (tooLarge) {
        if (attachmentSelection) attachmentSelection.textContent = `${tooLarge.name} exceeds 5MB`;
        attachmentControl?.classList.add('is-error');
        return false;
      }
      if (totalSize > maxAttachmentTotal) {
        if (attachmentSelection) attachmentSelection.textContent = 'Combined attachments exceed 10MB';
        attachmentControl?.classList.add('is-error');
        return false;
      }

      if (attachmentSelection) {
        attachmentSelection.textContent = files.length === 1
          ? files[0].name
          : `${files.length} files selected`;
      }
      return true;
    }

    function addNextAttachmentInput() {
      if (!attachmentInputs || !attachmentButton) return;
      const inputs = [...attachmentInputs.querySelectorAll('input[type="file"]')];
      const selectedCount = inputs.filter(input => input.files?.length).length;
      const hasEmptyInput = inputs.some(input => !input.files?.length);
      if (selectedCount >= maxAttachmentCount || hasEmptyInput) return;

      const nextNumber = inputs.length + 1;
      const input = document.createElement('input');
      input.type = 'file';
      input.id = `enquiry-attachment-${nextNumber}`;
      input.name = `attachment${nextNumber}`;
      input.accept = attachmentAccept;
      attachmentInputs.append(input);
      attachmentButton.htmlFor = input.id;
    }

    attachmentInputs?.addEventListener('change', event => {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'file') return;
      validateAttachments();
      if (event.target.files?.length) addNextAttachmentInput();
    });

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
      if (!validateAttachments()) {
        event.preventDefault();
        contactFormStatus.textContent = 'Please check the attachment size and try again.';
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
