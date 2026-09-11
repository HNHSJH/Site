(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const dots = [...hero.querySelectorAll('.hero-dot')];
  const toggle = hero.querySelector('.hero-playback');
  const controls = hero.querySelector('.hero-dots');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const project = document.getElementById('hero-project-label');
  const location = document.getElementById('hero-location-text');
  const status = document.getElementById('hero-slide-status');
  let index = 0;
  let timer;
  let paused = false;
  let inView = true;
  let hovering = false;
  let focused = false;

  function canPlay() {
    return !paused && !motion.matches && !document.hidden && inView && !hovering && !focused
      && !document.body.classList.contains('panel-open') && !document.body.classList.contains('menu-open');
  }

  function refresh() {
    clearTimeout(timer);
    timer = undefined;
    const playing = canPlay();
    hero.classList.toggle('slideshow-paused', !playing);
    toggle.disabled = motion.matches;
    toggle.textContent = motion.matches ? 'Motion off' : paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', motion.matches ? 'Slideshow paused: reduced motion enabled' : paused ? 'Play slideshow' : 'Pause slideshow');
    // Restart the progress indicator with the same interval as the next slide.
    const active = dots[index];
    active.classList.remove('active');
    void active.offsetWidth;
    active.classList.add('active');
    if (playing) timer = setTimeout(() => {
      if (canPlay()) show((index + 1) % slides.length);
      else refresh();
    }, 6000);
  }

  function show(next, manual = false) {
    index = next;
    const slide = slides[index];
    if (slide.dataset.bg) {
      slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
      delete slide.dataset.bg;
    }
    slides.forEach((item, i) => item.classList.toggle('active', i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });
    project.textContent = slide.dataset.project || '';
    location.textContent = slide.dataset.location || '';
    if (manual) status.textContent = `Slide ${index + 1} of ${slides.length}: ${location.textContent}, ${project.textContent}`;
    refresh();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  toggle.addEventListener('click', () => {
    paused = !paused;
    // An explicit Play request takes effect even while its button has focus.
    if (!paused) { focused = false; hovering = false; }
    refresh();
  });
  controls.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; refresh(); } });
  controls.addEventListener('pointerleave', () => { hovering = false; refresh(); });
  hero.addEventListener('focusin', () => { focused = true; refresh(); });
  hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { focused = false; refresh(); } });
  document.addEventListener('visibilitychange', refresh);
  if (motion.addEventListener) motion.addEventListener('change', refresh);
  else motion.addListener?.(refresh);
  const observer = new IntersectionObserver(entries => {
    inView = entries[0]?.isIntersecting ?? true;
    refresh();
  }, { threshold: 0.02 });
  observer.observe(hero);
  window.HnhSlideshow = { refresh };
  show(0);
})();
