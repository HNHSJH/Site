(() => {
  const shell = document.getElementById('site-interaction-shell');
  const header = document.querySelector('.site-header');
  if (!shell || !header) return;
  const stack = [];
  const isolated = new Map();
  const selector = 'a[href], button, input, select, textarea, [tabindex]';
  const top = () => stack[stack.length - 1];

  function visible(element) {
    if (!element?.isConnected || element.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
    for (let node = element; node && node !== shell; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
    }
    return true;
  }

  function focusable() {
    return [...shell.querySelectorAll(selector)].filter(element =>
      !element.disabled && element.tabIndex >= 0 && visible(element));
  }

  function initialFocus(entry) {
    const target = entry.element.querySelector(entry.initial || 'button');
    if (visible(target)) target.focus({ preventScroll: true });
    else (focusable().find(node => entry.element.contains(node)) || entry.element).focus({ preventScroll: true });
  }

  function sync() {
    isolated.forEach((wasInert, element) => element.toggleAttribute('inert', wasInert));
    isolated.clear();
    const entry = top();
    shell.removeAttribute('aria-label');
    shell.removeAttribute('aria-labelledby');
    if (!entry) {
      shell.removeAttribute('role');
      shell.removeAttribute('aria-modal');
      return;
    }
    // The shared header belongs to the dialog shell: Home and the menu toggle
    // stay usable, while every underlying panel and sibling popup is inert.
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-modal', 'true');
    if (entry.labelledby) shell.setAttribute('aria-labelledby', entry.labelledby);
    else shell.setAttribute('aria-label', entry.label);
    function isolate(parent) {
      [...parent.children].forEach(child => {
        if (child === entry.element || child === header) return;
        if (child.contains(entry.element) || child.contains(header)) isolate(child);
        else {
          isolated.set(child, child.hasAttribute('inert'));
          child.setAttribute('inert', '');
        }
      });
    }
    isolate(shell);
  }

  window.HnhDialogs = {
    open(element, options) {
      if (!element || stack.some(entry => entry.element === element)) return;
      // Restore previous isolation before changing explicit closed/open state.
      isolated.forEach((wasInert, node) => node.toggleAttribute('inert', wasInert));
      isolated.clear();
      element.removeAttribute('inert');
      element.setAttribute('aria-hidden', 'false');
      element.tabIndex = -1;
      const entry = { element, returnTo: options.trigger || document.activeElement, ...options };
      stack.push(entry);
      sync();
      initialFocus(entry);
    },
    close(element) {
      const index = stack.findIndex(entry => entry.element === element);
      if (index < 0) return;
      const wasTop = index === stack.length - 1;
      const [entry] = stack.splice(index, 1);
      isolated.forEach((wasInert, node) => node.toggleAttribute('inert', wasInert));
      isolated.clear();
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
      sync();
      if (wasTop) {
        if (visible(entry.returnTo)) entry.returnTo.focus({ preventScroll: true });
        else if (top()) initialFocus(top());
        else header.querySelector('.brand')?.focus({ preventScroll: true });
      }
    }
  };

  document.addEventListener('keydown', event => {
    const entry = top();
    if (!entry) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      entry.close();
    } else if (event.key === 'Tab') {
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!first) {
        event.preventDefault();
        entry.element.focus();
      } else if ((event.shiftKey && (active === first || !nodes.includes(active)))
          || (!event.shiftKey && (active === last || !nodes.includes(active)))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  }, true);

  document.addEventListener('focusin', event => {
    const entry = top();
    if (entry && !entry.element.contains(event.target) && !header.contains(event.target)) initialFocus(entry);
  });
})();
