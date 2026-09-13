// Shared showcase navigation. Real URLs, direct entry and browser history use
// the same panel owner; the generator supplies each document's route metadata.
    (() => {
      const panelFlow = [
        { id: 'about', label: 'About Us' },
        { id: 'clients', label: 'Clients' },
        { id: 'projects', label: 'Projects' },
        { id: 'expertise', label: 'Expertise' },
        { id: 'contact', label: 'Contact Us' }
      ];
      const panelIds = new Set(panelFlow.map(item => item.id));
      if (document.getElementById('route-detail')) panelIds.add('route-detail');
      const primaryPaths = { top: '/', about: '/about-us/', clients: '/clients/',
        projects: '/projects/', expertise: '/services/', contact: '/contact/' };
      const routeManifest = JSON.parse(document.getElementById('hnh-route-manifest')?.textContent || '{}');
      const normalizePath = path => /\/[^/]+\.[^/]+$/.test(path) && !path.endsWith('/index.html')
        ? path : path.replace(/index\.html$/, '').replace(/\/?$/, '/');
      const routeForPath = path => {
        if (routeManifest[path]) return routeManifest[path];
        const primary = Object.entries(primaryPaths).find(([, url]) => url === path);
        return primary ? { panel: primary[0] } : null;
      };
      const pathForPanel = id => primaryPaths[id] ||
        Object.keys(routeManifest).find(path => routeManifest[path].panel === id);
      const panels = [...document.querySelectorAll('.scroll-section')];
      const projectGallery = document.querySelector('.all-projects-gallery');
      const clientGallery = document.querySelector('.all-clients-gallery');
      const moeSchoolGallery = document.querySelector('.moe-school-gallery');
      [projectGallery, clientGallery, moeSchoolGallery].forEach(gallery => {
        if (!gallery) return;
        gallery.setAttribute('inert', '');
        gallery.setAttribute('aria-hidden', 'true');
      });
      let statAnimationDone = false;
      let activePanel = document.querySelector('.scroll-section.panel-active');
      let panelCleanupTimer = null;
      let currentMetadataPath = null;
      let pendingProject = null;
      let pendingCategory = null;

      function setHeading(panelId) {
        const container = panelId === 'top' ? document.querySelector('.hero') : document.getElementById(panelId);
        let heading = container?.querySelector('[data-route-heading]') || container?.querySelector('h1, h2');
        if (!heading) return;
        function retag(element, tag) {
          if (element.tagName.toLowerCase() === tag) return element;
          const replacement = document.createElement(tag);
          [...element.attributes].forEach(attribute => replacement.setAttribute(attribute.name, attribute.value));
          while (element.firstChild) replacement.append(element.firstChild);
          element.replaceWith(replacement);
          return replacement;
        }
        document.querySelectorAll('h1').forEach(element => {
          if (element !== heading) retag(element, 'h2');
        });
        heading = retag(heading, 'h1');
        heading.setAttribute('data-route-heading', panelId);
      }

      function syncRoute(path, updateHistory, hash = '', search = '') {
        const route = routeForPath(path);
        if (!route) return;
        if (currentMetadataPath !== path && route.seo) {
          const nodes = [...document.head.childNodes];
          const start = nodes.find(node => node.nodeType === 8 && node.data.trim() === 'start:seo');
          const end = nodes.find(node => node.nodeType === 8 && node.data.trim() === 'end:seo');
          const template = document.createElement('template');
          template.innerHTML = route.seo;
          if (start && end) {
            while (start.nextSibling && start.nextSibling !== end) start.nextSibling.remove();
            end.before(template.content);
          } else {
            document.head.querySelectorAll('title, meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]').forEach(node => node.remove());
            document.head.append(template.content);
          }
        }
        currentMetadataPath = path;
        document.body.dataset.currentRoute = path;
        setHeading(route.panel);
        document.querySelectorAll('.menu-nav a[data-panel], .showcase-nav a[data-panel]').forEach(link => {
          if (link.dataset.panel === route.panel) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        const destination = path + search + hash;
        if (updateHistory && destination !== location.pathname + location.search + location.hash) {
          history.pushState({ panel: route.panel, path }, '', destination);
        }
      }

      function buildPanelControls() {
        panels.forEach(panel => {
          panel.querySelectorAll('.panel-close, .panel-prev, .panel-next').forEach(el => el.remove());
          const index = panelFlow.findIndex(item => item.id === panel.id);
          if (index < 0) {
            if (panel.id === 'route-detail') {
              const close = document.createElement('button');
              close.type = 'button';
              close.className = 'panel-close';
              close.textContent = 'Back to Home';
              panel.prepend(close);
            }
            return;
          }

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
        window.HnhDialogs.close(projectGallery);
        document.body.classList.remove('project-archive-open');
      }

      function openProjectGallery(trigger) {
        if (!projectGallery) return;
        closeClientGallery();
        projectGallery.classList.add('is-open');
        window.HnhDialogs.open(projectGallery, { labelledby: 'all-projects-title', initial: '.all-projects-close', close: closeProjectGallery, trigger });
        document.body.classList.add('project-archive-open');
        const scroller = projectGallery.querySelector('.all-projects-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function closeMoeSchoolGallery() {
        if (!moeSchoolGallery) return;
        moeSchoolGallery.classList.remove('is-open');
        window.HnhDialogs.close(moeSchoolGallery);
        document.body.classList.remove('moe-schools-open');
      }

      function openMoeSchoolGallery(trigger) {
        if (!moeSchoolGallery) return;
        moeSchoolGallery.classList.add('is-open');
        window.HnhDialogs.open(moeSchoolGallery, { labelledby: 'school-projects-title', initial: '.moe-school-close', close: closeMoeSchoolGallery, trigger });
        document.body.classList.add('moe-schools-open');
        const scroller = moeSchoolGallery.querySelector('.moe-school-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function closeClientGallery() {
        closeMoeSchoolGallery();
        if (!clientGallery) return;
        clientGallery.classList.remove('is-open');
        window.HnhDialogs.close(clientGallery);
        document.body.classList.remove('client-archive-open');
      }

      function openClientGallery(trigger) {
        if (!clientGallery) return;
        closeProjectGallery();
        clientGallery.classList.add('is-open');
        window.HnhDialogs.open(clientGallery, { labelledby: 'all-clients-title', initial: '.all-clients-close', close: closeClientGallery, trigger });
        document.body.classList.add('client-archive-open');
        const scroller = clientGallery.querySelector('.all-clients-gallery-inner');
        if (scroller) scroller.scrollTop = 0;
      }

      function openPanel(id, updateHistory = true, direction = 'forward', immediate = false) {
        if (!panelIds.has(id)) return;
        if (document.body.classList.contains('menu-open')) window.setMenu(false);
        pendingProject = null;
        pendingCategory = null;
        if (typeof window.closeHnhProject === 'function') window.closeHnhProject();
        closeProjectGallery();
        closeClientGallery();
        const next = document.getElementById(id);
        if (!next) return;
        const path = pathForPanel(id);
        if (path) syncRoute(path, updateHistory);

        const current = activePanel;
        if (current === next) return;
        if (panelCleanupTimer) {
          window.clearTimeout(panelCleanupTimer);
          panelCleanupTimer = null;
        }

        // Bound the panel layers so repeated navigation cannot cover the global brand.
        panels.forEach(panel => {
          panel.style.zIndex = panel === next ? '92' : panel === current ? '91' : '90';
        });
        next.dataset.revealed = 'true';
        next.classList.add('section-visible');
        next.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        animateAboutStats(next);

        const reveal = () => {
          next.classList.add('panel-active');
          next.style.transition = '';
          next.style.transform = '';
          next.style.visibility = '';
          next.style.pointerEvents = '';
        };
        if (immediate) {
          panels.forEach(panel => panel.classList.toggle('panel-active', panel === next));
          reveal();
        } else {
          next.style.transition = 'none';
          next.style.visibility = 'visible';
          next.style.pointerEvents = 'none';
          next.style.transform = direction === 'back' ? 'translate3d(-101%,0,0)' : 'translate3d(101%,0,0)';
          void next.offsetWidth;
          requestAnimationFrame(reveal);
        }

        activePanel = next;
        document.body.classList.add('panel-open');
        document.body.dataset.activePanel = id;
        window.HnhSlideshow.refresh();

        if (!immediate && current && current !== next) {
          panelCleanupTimer = window.setTimeout(() => {
            if (current !== activePanel) current.classList.remove('panel-active');
            document.querySelectorAll('.scroll-section.panel-active').forEach(panel => {
              if (panel !== activePanel) panel.classList.remove('panel-active');
            });
            panelCleanupTimer = null;
          }, 840);
        }
      }

      window.openHnhPanel = id => openPanel(id, true, 'forward');
      window.openHnhProjectFromShowcase = projectId => {
        openPanel('projects', true, 'forward');
        window.setTimeout(() => {
          if (typeof window.openHnhProject === 'function') window.openHnhProject(projectId);
        }, 900);
      };

      function closePanels(updateHistory = true) {
        if (document.body.classList.contains('menu-open')) window.setMenu(false);
        pendingProject = null;
        pendingCategory = null;
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
        window.HnhSlideshow.refresh();
        syncRoute('/', updateHistory);
      }

      function finishProjectEntry() {
        if (pendingCategory) {
          const filter = [...document.querySelectorAll('[data-project-filter]')].find(node => node.dataset.projectFilter === pendingCategory);
          if (filter) { pendingCategory = null; openProjectGallery(); filter.click(); }
        }
        if (!pendingProject || typeof window.openHnhProject !== 'function') return;
        const id = pendingProject;
        pendingProject = null;
        openProjectGallery();
        window.openHnhProject(id);
      }

      function navigate(url, updateHistory = true, immediate = false) {
        const target = url instanceof URL ? url : new URL(url, location.href);
        if (target.origin !== location.origin) return false;
        let path = normalizePath(target.pathname);
        let hash;
        try { hash = decodeURIComponent(target.hash.slice(1)); } catch { hash = ''; }
        const legacyPanel = hash === 'contact-form' ? 'contact' : hash;
        if (primaryPaths[legacyPanel]) path = primaryPaths[legacyPanel];
        let route = routeForPath(path);
        // GitHub Pages renders our 404 document at the requested unknown URL.
        // Display its shared detail panel without changing that URL; clicking a
        // different unknown URL still performs an ordinary browser navigation.
        if (!route && !updateHistory && target.pathname === location.pathname && document.body.dataset.routePath === '/404.html') {
          path = '/404.html';
          route = routeManifest[path];
        }
        if (!route || (route.panel !== 'top' && !document.getElementById(route.panel))) return false;
        if (route.panel === 'top') closePanels(false);
        else openPanel(route.panel, false, 'forward', immediate);
        syncRoute(path, updateHistory, primaryPaths[legacyPanel] ? '' : target.hash, target.search);
        if (route.panel === 'projects' && hash) {
          const card = [...document.querySelectorAll('#all-projects-grid [data-project-id]')].find(node => node.dataset.projectId === hash);
          if (card) {
            pendingProject = hash;
            finishProjectEntry();
          } else {
            if ([...document.querySelectorAll('#all-projects-grid [data-project-category]')].some(card => card.dataset.projectCategory === hash)) {
              pendingCategory = hash;
              finishProjectEntry();
            }
          }
        }
        return true;
      }

      window.HnhRoutes = {
        navigate,
        restore: () => navigate(location.href, false, true),
        finishProjectEntry
      };

      document.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const allProjects = event.target.closest('.projects-all-trigger');
        if (allProjects) {
          event.preventDefault();
          openProjectGallery(allProjects);
          return;
        }

        const allClients = event.target.closest('.clients-all-trigger');
        if (allClients) {
          event.preventDefault();
          openClientGallery(allClients);
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
          openMoeSchoolGallery(moeSchoolTrigger);
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

        const link = event.target.closest('a[href]');
        if (!link || link.matches('.project-card, .project-detail-enquire') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        const target = new URL(link.href, location.href);
        // Keep ordinary within-document anchors native, except the supported
        // legacy panel and project links which must open their visible panel.
        const hash = target.hash.slice(1);
        const sameDocument = target.pathname === location.pathname;
        const projectHash = [...document.querySelectorAll('#all-projects-grid [data-project-id]')].some(card => card.dataset.projectId === hash);
        const categoryHash = normalizePath(target.pathname) === '/projects/' && [...document.querySelectorAll('#all-projects-grid [data-project-category]')].some(card => card.dataset.projectCategory === hash);
        if (sameDocument && target.hash && !primaryPaths[hash] && hash !== 'contact-form' && !projectHash && !categoryHash) return;
        if (navigate(target)) event.preventDefault();
      }, true);

      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        if (document.body.classList.contains('panel-open')) closePanels();
      });

      window.addEventListener('popstate', () => navigate(location.href, false, true));
      window.addEventListener('hashchange', () => navigate(location.href, false, true));
      navigate(location.href, false, true);
      // Project data and the detail controller are loaded after the panel owner.
      // Initial hash entry is completed once their synchronous scripts are ready.
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', finishProjectEntry, { once: true });
      else finishProjectEntry();
    })();
