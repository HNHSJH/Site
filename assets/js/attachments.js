(() => {
  const initAttachmentManager = () => {
    const form = document.querySelector('#contact-form');
    if (!form || form.dataset.hnhAttachmentFix === '1') return;

    const oldInput = form.querySelector('input[type="file"]');
    if (!oldInput) return;

    form.dataset.hnhAttachmentFix = '1';

    const input = oldInput.cloneNode(true);
    oldInput.replaceWith(input);
    input.multiple = true;

    const MAX_FILE = 5 * 1024 * 1024;
    const MAX_TOTAL = 10 * 1024 * 1024;
    let selectedFiles = [];

    const host =
      input.closest('.contact-field') ||
      input.closest('.attachment-field') ||
      input.parentElement;

    if (!host) return;

    const manager = document.createElement('div');
    manager.className = 'hnh-attachment-manager';

    const list = document.createElement('div');
    list.className = 'hnh-attachment-list';
    list.setAttribute('aria-live', 'polite');

    const message = document.createElement('p');
    message.className = 'hnh-attachment-message';
    message.setAttribute('aria-live', 'polite');

    manager.append(list, message);
    host.append(manager);

    const formatSize = bytes => {
      if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const syncInput = () => {
      if (typeof DataTransfer === 'undefined') {
        input.value = '';
        return;
      }

      const transfer = new DataTransfer();
      selectedFiles.forEach(file => transfer.items.add(file));
      input.files = transfer.files;
    };

    const render = () => {
      list.replaceChildren();

      selectedFiles.forEach((file, index) => {
        const row = document.createElement('div');
        row.className = 'hnh-attachment-row';

        const name = document.createElement('span');
        name.className = 'hnh-attachment-name';
        name.textContent = file.name;
        name.title = file.name;

        const size = document.createElement('span');
        size.className = 'hnh-attachment-size';
        size.textContent = formatSize(file.size);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'hnh-attachment-remove';
        remove.textContent = 'Remove';
        remove.setAttribute('aria-label', `Remove ${file.name}`);

        remove.addEventListener('click', () => {
          selectedFiles.splice(index, 1);
          syncInput();
          message.textContent = selectedFiles.length
            ? `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`
            : 'No files selected';
          message.classList.remove('is-error');
          render();
        });

        row.append(name, size, remove);
        list.append(row);
      });
    };

    input.addEventListener('change', () => {
      const incoming = [...input.files];
      const errors = [];

      incoming.forEach(file => {
        if (file.size > MAX_FILE) {
          errors.push(`${file.name} exceeds the 5MB per-file limit and was not added.`);
          return;
        }

        const duplicate = selectedFiles.some(existing =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
        );

        if (duplicate) return;

        const currentTotal = selectedFiles.reduce(
          (sum, existing) => sum + existing.size,
          0
        );

        if (currentTotal + file.size > MAX_TOTAL) {
          errors.push(`${file.name} would exceed the 10MB total limit and was not added.`);
          return;
        }

        selectedFiles.push(file);
      });

      syncInput();
      render();

      if (errors.length) {
        message.textContent = errors.join(' ');
        message.classList.add('is-error');
      } else {
        message.textContent = selectedFiles.length
          ? `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`
          : 'No files selected';
        message.classList.remove('is-error');
      }
    });

    form.addEventListener('reset', () => {
      selectedFiles = [];
      syncInput();
      render();
      message.textContent = 'No files selected';
      message.classList.remove('is-error');
    });

    message.textContent = 'No files selected';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAttachmentManager, { once: true });
  } else {
    initAttachmentManager();
  }
})();
