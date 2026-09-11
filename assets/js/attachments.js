(() => {
  const form = document.getElementById('contact-form');
  const inputs = document.getElementById('attachment-file-inputs');
  const button = document.getElementById('attachment-button');
  if (!form || !inputs || !button) return;
  const control = inputs.closest('.attachment-control');
  const summary = document.getElementById('attachment-selection');
  const list = document.getElementById('attachment-list');
  const message = document.getElementById('attachment-message');
  const accept = inputs.querySelector('input').accept;
  const MB = 1024 * 1024;
  let sequence = 1;

  // Keep each selected File in its original native input. The removable list and
  // the multipart POST therefore share one source of truth, without DataTransfer.
  const selected = () => [...inputs.querySelectorAll('input')].filter(input => input.files.length);
  const fileKey = file => JSON.stringify([file.name, file.size, file.lastModified]);

  function notify(text, error = false) {
    message.textContent = text;
    message.classList.toggle('is-error', error);
    control.classList.toggle('is-error', error);
  }

  function picker() {
    let input = [...inputs.querySelectorAll('input')].find(item => !item.files.length);
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.id = `enquiry-attachment-${++sequence}`;
      inputs.append(input);
    }
    input.removeAttribute('name');
    input.tabIndex = -1;
    return input;
  }

  function render() {
    const entries = selected();
    list.replaceChildren();
    entries.forEach((input, index) => {
      input.name = `attachment${index + 1}`;
      const file = input.files[0];
      const row = document.createElement('div');
      row.className = 'hnh-attachment-row';
      const name = document.createElement('span');
      name.className = 'hnh-attachment-name';
      name.textContent = file.name;
      const size = document.createElement('span');
      size.className = 'hnh-attachment-size';
      size.textContent = file.size >= MB ? `${(file.size / MB).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'hnh-attachment-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.addEventListener('click', () => {
        input.remove();
        render();
        notify(`${file.name} removed.`);
        (list.querySelectorAll('button')[index] || button).focus();
      });
      row.append(name, size, remove);
      list.append(row);
    });
    summary.textContent = entries.length ? `${entries.length} of 5 files selected` : 'No files selected';
    button.disabled = entries.length >= 5;
    picker();
  }

  button.addEventListener('click', () => picker().click());
  inputs.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files.length) return;
    const file = input.files[0];
    const others = selected().filter(item => item !== input).map(item => item.files[0]);
    let error = '';
    if (others.some(other => fileKey(other) === fileKey(file))) error = `${file.name} is already attached.`;
    else if (others.length >= 5) error = 'You can attach up to 5 files.';
    else if (file.size > 5 * MB) error = `${file.name} exceeds 5 MB. Please choose a smaller file.`;
    else if (file.size + others.reduce((total, other) => total + other.size, 0) > 10 * MB) error = 'Attachments must total 10 MB or less.';
    if (error) input.value = '';
    render();
    notify(error || `${file.name} attached.`, Boolean(error));
  });

  form.addEventListener('reset', () => {
    inputs.replaceChildren();
    render();
    notify('');
  });

  window.HnhAttachments = {
    validate() {
      const files = selected().map(input => input.files[0]);
      const valid = files.length <= 5 && files.every(file => file.size <= 5 * MB)
        && files.reduce((total, file) => total + file.size, 0) <= 10 * MB;
      if (!valid) notify('Please remove attachments above the 5-file, 5 MB each or 10 MB total limit.', true);
      return valid;
    }
  };
  render();
})();
