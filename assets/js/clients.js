(() => {
  const CTA_HEIGHT = '50px';
  const CTA_BG = '#20312d';
  const CTA_HOVER = '#355349';

  const styleContactFormPanel = () => {
    const contact = document.getElementById('contact');
    const form = document.querySelector('#contact-form.contact-form');
    if (!contact || !form) return;

    const mobile = window.matchMedia('(max-width: 620px)').matches;
    const shell = contact.querySelector(':scope > .section-shell');
    const heading = contact.querySelector('.contact-heading');
    const details = contact.querySelector('.contact-details');
    const actions = form.querySelector('.contact-form-actions');
    const submit = form.querySelector('.contact-submit');
    const attachmentRow = form.querySelector('.attachment-visible-row');
    const horizontalOffset = mobile ? '0' : '52px';

    if (shell) {
      shell.style.setProperty('position', 'relative', 'important');
      shell.style.setProperty('top', mobile ? '0' : '-36px', 'important');
      if (mobile) {
        shell.style.setProperty('padding', '76px 16px 118px', 'important');
        shell.style.setProperty('overflow-y', 'auto', 'important');
        shell.style.setProperty('overscroll-behavior', 'contain', 'important');
        shell.style.setProperty('justify-content', 'flex-start', 'important');
      } else {
        shell.style.removeProperty('overflow-y');
        shell.style.removeProperty('overscroll-behavior');
        shell.style.removeProperty('justify-content');
        shell.style.removeProperty('padding');
      }
    }

    [heading, form].forEach(element => {
      if (!element) return;
      element.style.setProperty('position', 'relative', 'important');
      element.style.setProperty('left', horizontalOffset, 'important');
    });

    if (heading) {
      // Use the shared grid width; auto width centres this flex item between its margins.
      heading.style.removeProperty('width');
      heading.style.setProperty('margin-bottom', mobile ? '18px' : '', 'important');
    }

    form.style.setProperty('background', 'rgba(255,255,255,.12)', 'important');
    form.style.setProperty('border', '1px solid rgba(255,255,255,.18)', 'important');
    form.style.setProperty('padding', mobile ? '18px 16px' : '20px 22px', 'important');
    form.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
    form.style.setProperty('-webkit-backdrop-filter', 'blur(8px)', 'important');
    form.style.setProperty('box-shadow', 'none', 'important');
    form.style.setProperty('width', mobile ? '100%' : '', 'important');

    if (mobile) {
      form.style.setProperty('grid-template-columns', '1fr', 'important');
      form.style.setProperty('gap', '14px', 'important');
      form.querySelectorAll('.contact-field').forEach(field => {
        field.style.setProperty('grid-column', '1', 'important');
        field.style.setProperty('gap', '6px', 'important');
      });
      form.querySelectorAll('.contact-field input, .contact-field select, .contact-field textarea').forEach(field => {
        field.style.setProperty('font-size', '16px', 'important');
        field.style.setProperty('padding', '10px 0 11px', 'important');
      });
      const textarea = form.querySelector('.contact-message-field textarea');
      if (textarea) {
        textarea.style.setProperty('min-height', '108px', 'important');
        textarea.style.setProperty('height', 'auto', 'important');
        textarea.style.setProperty('max-height', 'none', 'important');
      }
    } else {
      form.style.removeProperty('grid-template-columns');
      form.style.removeProperty('gap');
      form.querySelectorAll('.contact-field').forEach(field => {
        field.style.removeProperty('grid-column');
        field.style.removeProperty('gap');
      });
      form.querySelectorAll('.contact-field input, .contact-field select, .contact-field textarea').forEach(field => {
        field.style.removeProperty('font-size');
        field.style.removeProperty('padding');
      });
      const textarea = form.querySelector('.contact-message-field textarea');
      if (textarea) {
        textarea.style.removeProperty('min-height');
        textarea.style.removeProperty('height');
        textarea.style.removeProperty('max-height');
      }
    }

    form.querySelectorAll('.contact-field label').forEach(label => {
      label.style.setProperty('font-size', mobile ? '11px' : '12px', 'important');
      label.style.setProperty('color', 'rgba(248,252,249,.96)', 'important');
      label.style.setProperty('letter-spacing', mobile ? '.09em' : '.11em', 'important');
    });

    if (actions) {
      if (mobile) {
        actions.style.setProperty('grid-column', '1', 'important');
        actions.style.setProperty('display', 'flex', 'important');
        actions.style.setProperty('flex-direction', 'column', 'important');
        actions.style.setProperty('align-items', 'stretch', 'important');
        actions.style.setProperty('gap', '10px', 'important');
        actions.style.setProperty('margin-top', '4px', 'important');
      } else {
        actions.style.removeProperty('grid-column');
        actions.style.removeProperty('flex-direction');
        actions.style.removeProperty('align-items');
        actions.style.removeProperty('gap');
        actions.style.removeProperty('margin-top');
      }
    }

    if (submit) {
      if (mobile) {
        submit.style.setProperty('width', '100%', 'important');
        submit.style.setProperty('min-height', '46px', 'important');
        submit.style.setProperty('justify-content', 'center', 'important');
        submit.style.setProperty('font-size', '10px', 'important');
      } else {
        submit.style.removeProperty('width');
        submit.style.removeProperty('min-height');
        submit.style.removeProperty('justify-content');
        submit.style.removeProperty('font-size');
      }
    }

    if (attachmentRow) {
      if (mobile) {
        attachmentRow.style.setProperty('display', 'grid', 'important');
        attachmentRow.style.setProperty('grid-template-columns', '1fr', 'important');
        attachmentRow.style.setProperty('gap', '10px', 'important');
      } else {
        attachmentRow.style.removeProperty('display');
        attachmentRow.style.removeProperty('grid-template-columns');
        attachmentRow.style.removeProperty('gap');
      }
    }

    if (details) {
      if (mobile) {
        details.style.setProperty('display', 'grid', 'important');
        details.style.setProperty('grid-template-columns', '1fr', 'important');
        details.style.setProperty('gap', '0', 'important');
        details.style.setProperty('margin-top', '18px', 'important');
        details.style.setProperty('padding-top', '0', 'important');
        details.querySelectorAll('.line').forEach(line => {
          line.style.setProperty('padding', '12px 0', 'important');
          line.style.setProperty('border-top', '1px solid rgba(215,230,238,.28)', 'important');
        });
        details.querySelectorAll('small').forEach(el => el.style.setProperty('font-size', '8px', 'important'));
        details.querySelectorAll('a, p').forEach(el => {
          el.style.setProperty('font-size', '13px', 'important');
          el.style.setProperty('line-height', '1.4', 'important');
        });
      } else {
        details.style.removeProperty('display');
        details.style.removeProperty('grid-template-columns');
        details.style.removeProperty('gap');
        details.style.removeProperty('margin-top');
        details.style.removeProperty('padding-top');
        details.querySelectorAll('.line').forEach(line => {
          line.style.removeProperty('padding');
          line.style.removeProperty('border-top');
        });
        details.querySelectorAll('small, a, p').forEach(el => {
          el.style.removeProperty('font-size');
          el.style.removeProperty('line-height');
        });
      }
    }

    let hintStyle = document.getElementById('hnh-contact-hint-style');
    if (!hintStyle) {
      hintStyle = document.createElement('style');
      hintStyle.id = 'hnh-contact-hint-style';
      document.head.appendChild(hintStyle);
    }
    hintStyle.textContent = `
      #contact-form .contact-field input::placeholder,
      #contact-form .contact-field textarea::placeholder {
        color: rgba(185, 207, 191, .78) !important;
        opacity: 1 !important;
      }
      #contact-form #enquiry-type:required:invalid {
        color: rgba(185, 207, 191, .78) !important;
      }
      #contact-form #enquiry-type:valid {
        color: rgba(248, 252, 249, .96) !important;
      }
      #contact-form #enquiry-type option {
        color: #16221c !important;
      }
    `;

    const hintText = {
      'enquiry-name': 'e.g. Alex Tan',
      'enquiry-company': 'e.g. ABC Construction Pte Ltd',
      'enquiry-email': 'e.g. alex@company.com',
      'enquiry-phone': 'e.g. +65 9123 4567',
      'enquiry-message': 'Site location, approximate area, required works and preferred completion date'
    };
    Object.entries(hintText).forEach(([id, placeholder]) => {
      document.getElementById(id)?.setAttribute('placeholder', placeholder);
    });

    const projectTypeHint = document.querySelector('#enquiry-type option[value=""]');
    if (projectTypeHint) projectTypeHint.textContent = 'Choose the closest project category';
  };

  styleContactFormPanel();
  window.addEventListener('resize', styleContactFormPanel, { passive: true });

  const styleProjectComposition = () => {
    const projects = document.getElementById('projects');
    const projectShell = projects?.querySelector(':scope > .section-shell');
    const kicker = projectShell?.querySelector('.section-kicker');
    const selectedGrid = projectShell?.querySelector('#selected-projects-grid');
    const footer = projectShell?.querySelector('.projects-footer');
    const footerButton = footer?.querySelector('.projects-all-trigger');
    const cards = selectedGrid ? [...selectedGrid.querySelectorAll(':scope > .project-card')] : [];
    if (!projectShell) return;

    const desktop = window.matchMedia('(min-width: 1021px)').matches;
    const mobile = window.matchMedia('(max-width: 620px)').matches;

    if (desktop) {
      projectShell.style.setProperty('position', 'relative', 'important');
      projectShell.style.setProperty('top', '-24px', 'important');
      projectShell.style.setProperty('width', '100%', 'important');
      projectShell.style.setProperty('margin-inline', 'auto', 'important');
      projectShell.style.removeProperty('overflow-y');
      projectShell.style.removeProperty('padding');
      projectShell.style.removeProperty('justify-content');
      cards.forEach(card => card.style.removeProperty('display'));
    } else if (mobile) {
      projectShell.style.setProperty('position', 'relative', 'important');
      projectShell.style.setProperty('top', '0', 'important');
      projectShell.style.setProperty('width', '100%', 'important');
      projectShell.style.setProperty('margin-inline', 'auto', 'important');
      projectShell.style.setProperty('padding', '76px 14px 118px', 'important');
      projectShell.style.setProperty('overflow-y', 'auto', 'important');
      projectShell.style.setProperty('overscroll-behavior', 'contain', 'important');
      projectShell.style.setProperty('justify-content', 'flex-start', 'important');

      if (kicker) {
        kicker.style.setProperty('width', '100%', 'important');
        kicker.style.setProperty('margin', '0 0 14px', 'important');
        kicker.style.setProperty('padding-right', '0', 'important');
        kicker.style.setProperty('transform', 'none', 'important');
      }
      if (selectedGrid) {
        selectedGrid.style.setProperty('display', 'grid', 'important');
        selectedGrid.style.setProperty('grid-template-columns', 'repeat(2,minmax(0,1fr))', 'important');
        selectedGrid.style.setProperty('gap', '8px', 'important');
        selectedGrid.style.setProperty('width', '100%', 'important');
        selectedGrid.style.setProperty('margin', '0 auto', 'important');
      }
      cards.forEach((card, index) => {
        card.style.setProperty('display', index < 4 ? 'block' : 'none', 'important');
        card.style.setProperty('grid-column', 'auto', 'important');
        card.style.setProperty('grid-row', 'auto', 'important');
        card.style.setProperty('height', 'auto', 'important');
        card.style.setProperty('min-height', '116px', 'important');
        card.style.setProperty('aspect-ratio', '4 / 3', 'important');
      });
      if (footer) {
        footer.style.setProperty('width', '100%', 'important');
        footer.style.setProperty('height', CTA_HEIGHT, 'important');
        footer.style.setProperty('min-height', CTA_HEIGHT, 'important');
        footer.style.setProperty('margin', '10px 0 0', 'important');
        footer.style.setProperty('display', 'flex', 'important');
      }
      if (footerButton) {
        footerButton.style.setProperty('width', '100%', 'important');
        footerButton.style.setProperty('height', CTA_HEIGHT, 'important');
        footerButton.style.setProperty('min-height', CTA_HEIGHT, 'important');
      }
    } else {
      projectShell.style.removeProperty('position');
      projectShell.style.removeProperty('top');
      projectShell.style.removeProperty('width');
      projectShell.style.removeProperty('margin-inline');
      projectShell.style.removeProperty('overflow-y');
      projectShell.style.removeProperty('overscroll-behavior');
      projectShell.style.removeProperty('justify-content');
      projectShell.style.removeProperty('padding');
      kicker?.style.removeProperty('width');
      kicker?.style.removeProperty('margin');
      kicker?.style.removeProperty('padding-right');
      kicker?.style.removeProperty('transform');
      selectedGrid?.style.removeProperty('grid-template-columns');
      selectedGrid?.style.removeProperty('gap');
      selectedGrid?.style.removeProperty('width');
      selectedGrid?.style.removeProperty('margin');
      cards.forEach(card => {
        card.style.removeProperty('display');
        card.style.removeProperty('grid-column');
        card.style.removeProperty('grid-row');
        card.style.removeProperty('height');
        card.style.removeProperty('min-height');
        card.style.removeProperty('aspect-ratio');
      });
      footer?.style.removeProperty('width');
      footer?.style.removeProperty('margin');
    }
  };

  requestAnimationFrame(() => requestAnimationFrame(styleProjectComposition));
  window.addEventListener('resize', () => requestAnimationFrame(styleProjectComposition), { passive: true });

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
          footer.style.setProperty('margin', '10px 0 0', 'important');
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

  requestAnimationFrame(() => requestAnimationFrame(styleArchiveCtas));
  window.addEventListener('resize', () => requestAnimationFrame(styleArchiveCtas), { passive: true });

  const grid = document.querySelector('.clients .client-grid');
  if (!grid) return;
  const allClientsGrid = document.querySelector('.all-clients-grid');

  if (grid.querySelectorAll(':scope > .client-logo').length < 9 && allClientsGrid) {
    const ninthSource = [...allClientsGrid.querySelectorAll(':scope > .client-logo')]
      .find(tile => tile.querySelector('img')?.alt === 'Lion City Sailors');
    if (ninthSource) grid.appendChild(ninthSource.cloneNode(true));
  }

  const items = [...grid.querySelectorAll(':scope > .client-logo')];
  if (!items.length) return;

  const shell = grid.closest('.section-shell');
  const footer = shell?.querySelector('.clients-footer');
  const intro = shell?.querySelector('.clients-intro');
  const viewAll = footer?.querySelector('.clients-all-trigger');
  const viewAllArrow = viewAll?.querySelector('span');

  const applyClientLayout = () => {
    const desktop = window.matchMedia('(min-width: 1021px)').matches;
    const mobile = window.matchMedia('(max-width: 620px)').matches;
    const selectedWidth = 'min(100%,1120px)';
    const mobileWidth = 'min(100%,420px)';

    if (shell) {
      shell.style.setProperty('transform', desktop ? 'translateY(28px)' : 'none', 'important');
      if (mobile) {
        shell.style.setProperty('padding', '76px 14px 118px', 'important');
        shell.style.setProperty('overflow-y', 'auto', 'important');
        shell.style.setProperty('overscroll-behavior', 'contain', 'important');
        shell.style.setProperty('justify-content', 'flex-start', 'important');
      } else {
        shell.style.removeProperty('padding');
        shell.style.removeProperty('overflow-y');
        shell.style.removeProperty('overscroll-behavior');
        shell.style.removeProperty('justify-content');
      }
    }

    grid.style.setProperty('gap', '0', 'important');
    grid.style.setProperty('column-gap', '0', 'important');
    grid.style.setProperty('row-gap', '0', 'important');
    grid.style.setProperty('width', desktop ? selectedWidth : mobile ? mobileWidth : '100%', 'important');
    grid.style.setProperty('margin', desktop || mobile ? '0 auto' : '0', 'important');
    grid.style.setProperty('justify-self', desktop || mobile ? 'center' : 'stretch', 'important');
    grid.style.setProperty('align-self', desktop || mobile ? 'center' : 'stretch', 'important');

    if (desktop) {
      grid.style.setProperty('order', '1', 'important');
      const rowHeight = 'clamp(142px,16vh,172px)';
      grid.style.setProperty('grid-template-columns', 'repeat(3,minmax(0,1fr))', 'important');
      grid.style.setProperty('grid-template-rows', `repeat(3,${rowHeight})`, 'important');
      grid.style.setProperty('grid-auto-rows', rowHeight, 'important');
      items.forEach(item => {
        item.style.setProperty('grid-column', 'auto', 'important');
        item.style.setProperty('grid-row', 'auto', 'important');
        item.style.setProperty('min-height', rowHeight, 'important');
        item.style.setProperty('height', rowHeight, 'important');
        item.style.removeProperty('place-items');
        item.style.removeProperty('justify-items');
        item.style.removeProperty('align-items');
        item.style.removeProperty('text-align');
        const img = item.querySelector('img');
        img?.style.removeProperty('max-height');
        img?.style.removeProperty('max-width');
        img?.style.removeProperty('margin');
        img?.style.removeProperty('place-self');
        img?.style.removeProperty('object-position');
      });
      footer?.style.setProperty('order', '2', 'important');
      intro?.style.setProperty('order', '3', 'important');
    } else if (mobile) {
      intro?.style.setProperty('order', '1', 'important');
      grid.style.setProperty('order', '2', 'important');
      footer?.style.setProperty('order', '3', 'important');
      intro?.style.setProperty('width', mobileWidth, 'important');
      intro?.style.setProperty('margin', '0 auto 14px', 'important');
      intro?.style.setProperty('grid-template-columns', '1fr', 'important');
      intro?.style.setProperty('gap', '8px', 'important');

      const rowHeight = 'clamp(82px,12vh,104px)';
      grid.style.setProperty('grid-template-columns', 'repeat(3,minmax(0,1fr))', 'important');
      grid.style.setProperty('grid-template-rows', `repeat(3,${rowHeight})`, 'important');
      grid.style.setProperty('grid-auto-rows', rowHeight, 'important');
      items.forEach(item => {
        item.style.setProperty('grid-column', 'auto', 'important');
        item.style.setProperty('grid-row', 'auto', 'important');
        item.style.setProperty('min-height', rowHeight, 'important');
        item.style.setProperty('height', rowHeight, 'important');
        item.style.setProperty('padding', '10px 8px', 'important');
        item.style.setProperty('place-items', 'center', 'important');
        item.style.setProperty('justify-items', 'center', 'important');
        item.style.setProperty('align-items', 'center', 'important');
        item.style.setProperty('text-align', 'center', 'important');
        const img = item.querySelector('img');
        img?.style.setProperty('max-height', '42px', 'important');
        img?.style.setProperty('max-width', '84%', 'important');
        img?.style.setProperty('margin', '0 auto', 'important');
        img?.style.setProperty('place-self', 'center', 'important');
        img?.style.setProperty('object-position', 'center', 'important');
      });
    } else {
      grid.style.setProperty('order', '1', 'important');
      footer?.style.setProperty('order', '2', 'important');
      intro?.style.setProperty('order', '3', 'important');
      intro?.style.removeProperty('width');
      intro?.style.removeProperty('margin');
      intro?.style.removeProperty('grid-template-columns');
      intro?.style.removeProperty('gap');
      grid.style.removeProperty('grid-template-columns');
      grid.style.removeProperty('grid-template-rows');
      grid.style.removeProperty('grid-auto-rows');
      items.forEach(item => {
        item.style.removeProperty('grid-column');
        item.style.removeProperty('grid-row');
        item.style.removeProperty('min-height');
        item.style.removeProperty('height');
        item.style.removeProperty('padding');
        item.style.removeProperty('place-items');
        item.style.removeProperty('justify-items');
        item.style.removeProperty('align-items');
        item.style.removeProperty('text-align');
        const img = item.querySelector('img');
        img?.style.removeProperty('max-height');
        img?.style.removeProperty('max-width');
        img?.style.removeProperty('margin');
        img?.style.removeProperty('place-self');
        img?.style.removeProperty('object-position');
      });
    }

    items.forEach(item => item.style.setProperty('border', '0', 'important'));

    if (footer) {
      footer.style.setProperty('width', desktop ? selectedWidth : mobile ? mobileWidth : 'min(100%, var(--gallery-width))', 'important');
      footer.style.setProperty('height', CTA_HEIGHT, 'important');
      footer.style.setProperty('min-height', CTA_HEIGHT, 'important');
      footer.style.setProperty('margin', mobile ? '10px auto 0' : '0 auto', 'important');
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
