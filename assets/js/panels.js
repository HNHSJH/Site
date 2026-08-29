// Full-screen panel navigation for the no-scroll experiment.
    (() => {
      const panelFlow = [
        { id: 'about', label: 'About Us' },
        { id: 'projects', label: 'Projects' },
        { id: 'clients', label: 'Clients' },
        { id: 'expertise', label: 'Expertise' },
        { id: 'contact', label: 'Contact Us' }
      ];
      const panelIds = new Set(panelFlow.map(item => item.id));
      const panels = [...document.querySelectorAll('.scroll-section')];
      const projectGallery = document.querySelector('.all-projects-gallery');
      const clientGallery = document.querySelector('.all-clients-gallery');
      const moeSchoolGallery = document.querySelector('.moe-school-gallery');
      let layer = 90;
      let statAnimationDone = false;
      let activePanel = null;
      let panelCleanupTimer = null;

      function buildPanelControls() {
        panels.forEach(panel => {
          panel.querySelectorAll('.panel-close, .panel-prev, .panel-next').forEach(el => el.remove());
          const index = panelFlow.findIndex(item => item.id === panel.id);
          if (index < 0) return;

          if (panel.id !== 'contact') {
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'panel-close';
            close.textContent = 'Back to Home';
            close.setAttribute('aria-label', 'Back to home');
            panel.prepend(close);
          }

          const previous = index === 0
            ? { id: 'showcase', label: 'Home' }
            : panelFlow[index - 1];
          const next = index === panelFlow.length - 1
            ? { id: 'showcase', label: 'Home' }
            : panelFlow[index + 1];

          const previousButton = document.createElement('button');
          previousButton.type = 'button';
          previousButton.className = 'panel-prev';
          previousButton.dataset.target = previous.id;
          previousButton.textContent = `Previous: ${previous.label}`;
          previousButton.setAttribute('aria-label', `Go back to ${previous.label}`);
          panel.append(previousButton);

          const nextButton = document.createElement('button');
          nextButton.type = 'button';
          nextButton.className = 'panel-next';
          nextButton.dataset.target = next.id;
          nextButton.textContent = index === panelFlow.length - 1
            ? 'Finish: Home'
            : `Next: ${next.label}`;
          nextButton.setAttribute('aria-label', index === panelFlow.length - 1
            ? 'Finish and return to home'
            : `Continue to ${next.label}`);
          panel.append(nextButton);
        });
      }

      buildPanelControls();


      function animateAboutStats(panel) {
        if (statAnimationDone || panel.id !== 'about') return;
        statAnimationDone = true;
        panel.querySelectorAll('[data-count]').forEach(el => {
          const start = Number(el.dataset.start || 0);
          const target = Number(el.dataset.count || 0);
          const duration = 1050;
          const begin = performance.now();
          const tick = now => {
            const p = Math.min((now - begin) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
          };
          requestAnimationFrame(tick);
        });
      }

      function closeProjectGallery() {
        if (!projectGallery) return;
        projectGallery.classList.remove('is-open');
        projectGallery.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('project-archive-open');
      }

      function openProjectGallery() {
        if (!projectGallery) return;
        closeClientGallery();
        projectGallery.classList.add('is-open');
        projectGallery.setAttribute('aria-hidden', 'false');
        document.body.classList.add('project-archive-open');
        const scroller = projectGallery.querySelector('.all-projects-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function closeMoeSchoolGallery() {
        if (!moeSchoolGallery) return;
        moeSchoolGallery.classList.remove('is-open');
        moeSchoolGallery.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('moe-schools-open');
      }

      function openMoeSchoolGallery() {
        if (!moeSchoolGallery) return;
        moeSchoolGallery.classList.add('is-open');
        moeSchoolGallery.setAttribute('aria-hidden', 'false');
        document.body.classList.add('moe-schools-open');
        const scroller = moeSchoolGallery.querySelector('.moe-school-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function closeClientGallery() {
        closeMoeSchoolGallery();
        if (!clientGallery) return;
        clientGallery.classList.remove('is-open');
        clientGallery.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('client-archive-open');
      }

      function openClientGallery() {
        if (!clientGallery) return;
        closeProjectGallery();
        clientGallery.classList.add('is-open');
        clientGallery.setAttribute('aria-hidden', 'false');
        document.body.classList.add('client-archive-open');
        const scroller = clientGallery.querySelector('.all-clients-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function openPanel(id, updateHistory = true, direction = 'forward', skipFirstLoader = false) {
        if (!panelIds.has(id)) return;
        if (typeof window.closeHnhProject === 'function') window.closeHnhProject();
        closeProjectGallery();
        closeClientGallery();
        const next = document.getElementById(id);
        if (!next) return;

        const current = activePanel;
        if (current === next) return;
        if (panelCleanupTimer) {
          window.clearTimeout(panelCleanupTimer);
          panelCleanupTimer = null;
        }


        layer += 1;
        next.style.zIndex = String(layer);
        next.dataset.revealed = 'true';
        next.classList.add('section-visible');
        next.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        animateAboutStats(next);

        // Put the destination genuinely on the correct side before animating it in.
        next.style.transition = 'none';
        next.style.visibility = 'visible';
        next.style.pointerEvents = 'none';
        next.style.transform = direction === 'back'
          ? 'translate3d(-101%,0,0)'
          : 'translate3d(101%,0,0)';
        void next.offsetWidth;

        requestAnimationFrame(() => {
          next.classList.add('panel-active');
          next.style.transition = '';
          next.style.transform = '';
          next.style.visibility = '';
          next.style.pointerEvents = '';
        });

        activePanel = next;
        document.body.classList.add('panel-open');
        document.body.dataset.activePanel = id;

        if (current && current !== next) {
          panelCleanupTimer = window.setTimeout(() => {
            if (current !== activePanel) current.classList.remove('panel-active');
            document.querySelectorAll('.scroll-section.panel-active').forEach(panel => {
              if (panel !== activePanel) panel.classList.remove('panel-active');
            });
            panelCleanupTimer = null;
          }, 840);
        }

        if (updateHistory) history.pushState({ panel: id }, '', `#${id}`);
      }

      window.openHnhPanel = id => openPanel(id, true, 'forward');
      window.openHnhProjectFromShowcase = projectId => {
        openPanel('projects', true, 'forward');
        window.setTimeout(() => {
          if (typeof window.openHnhProject === 'function') window.openHnhProject(projectId);
        }, 900);
      };

      function closePanels(updateHistory = true) {
        if (typeof window.closeHnhProject === 'function') window.closeHnhProject();
        closeProjectGallery();
        closeClientGallery();
        if (panelCleanupTimer) { window.clearTimeout(panelCleanupTimer); panelCleanupTimer = null; }
        document.querySelectorAll('.scroll-section.panel-active').forEach(panel => {
          panel.classList.remove('panel-active');
        });
        activePanel = null;
        document.body.classList.remove('panel-open');
        delete document.body.dataset.activePanel;
        if (updateHistory) history.pushState({ panel: null }, '', location.pathname + location.search);
      }

      document.addEventListener('click', event => {
        const allProjects = event.target.closest('.projects-all-trigger');
        if (allProjects) {
          event.preventDefault();
          openProjectGallery();
          return;
        }

        const allClients = event.target.closest('.clients-all-trigger');
        if (allClients) {
          event.preventDefault();
          openClientGallery();
          return;
        }

        const galleryClose = event.target.closest('.all-projects-close');
        if (galleryClose) {
          event.preventDefault();
          closeProjectGallery();
          return;
        }

        const clientGalleryClose = event.target.closest('.all-clients-close');
        if (clientGalleryClose) {
          event.preventDefault();
          closeClientGallery();
          return;
        }

        const moeSchoolTrigger = event.target.closest('.client-school-trigger[data-client-detail="moe"]');
        if (moeSchoolTrigger) {
          event.preventDefault();
          openMoeSchoolGallery();
          return;
        }

        const moeSchoolClose = event.target.closest('.moe-school-close');
        if (moeSchoolClose) {
          event.preventDefault();
          closeMoeSchoolGallery();
          return;
        }

        const previousControl = event.target.closest('.panel-prev');
        if (previousControl) {
          event.preventDefault();
          const target = previousControl.dataset.target;
          if (target === 'showcase') closePanels();
          else openPanel(target, true, 'back');
          return;
        }

        const nextControl = event.target.closest('.panel-next');
        if (nextControl) {
          event.preventDefault();
          const target = nextControl.dataset.target;
          if (target === 'showcase') closePanels();
          else openPanel(target, true, 'forward');
          return;
        }

        const close = event.target.closest('.panel-close');
        if (close) {
          event.preventDefault();
          closePanels();
          return;
        }

        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href').slice(1);
        if (id === 'top') {
          event.preventDefault();
          closePanels();
          return;
        }
        if (panelIds.has(id) || id === 'contact-form') {
          event.preventDefault();
          openPanel(id === 'contact-form' ? 'contact' : id);
        }
      }, true);

      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (moeSchoolGallery && moeSchoolGallery.classList.contains('is-open')) {
          closeMoeSchoolGallery();
          return;
        }
        if (projectGallery && projectGallery.classList.contains('is-open')) {
          closeProjectGallery();
          return;
        }
        if (clientGallery && clientGallery.classList.contains('is-open')) {
          closeClientGallery();
          return;
        }
        if (document.body.classList.contains('panel-open')) closePanels();
      });

      window.addEventListener('popstate', () => {
        const id = location.hash.slice(1);
        if (panelIds.has(id)) openPanel(id, false);
        else closePanels(false);
      });

      const initialId = location.hash.slice(1);


      // v24: loader intentionally disabled.
      if (panelIds.has(initialId)) openPanel(initialId, false);
    })();
