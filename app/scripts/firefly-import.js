const styleHref = './app/styles/firefly-import.css';
if (![...document.styleSheets].some((sheet) => sheet.href?.includes('firefly-import.css'))) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = styleHref;
  document.head.appendChild(link);
}

const bindFireflyImport = ({ buttonId, inputId, targetInputId, statusId, multiple = false }) => {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  const target = document.getElementById(targetInputId);
  const status = statusId ? document.getElementById(statusId) : null;
  if (!button || !input || !target) return;

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const files = [...(input.files || [])];
    if (!files.length) return;

    const transfer = new DataTransfer();
    (multiple ? files : files.slice(0, 1)).forEach((file) => transfer.items.add(file));
    target.files = transfer.files;
    target.dispatchEvent(new Event('change', { bubbles: true }));

    if (status) {
      status.textContent = `${transfer.files.length} FIREFLY ARTWORK${transfer.files.length === 1 ? '' : 'S'} IMPORTED`;
      status.dataset.tone = 'ready';
    }
    input.value = '';
  });
};

bindFireflyImport({
  buttonId: 'fireflyBaseBtn',
  inputId: 'fireflyBaseInput',
  targetInputId: 'baseInput',
  statusId: 'fireflyImportStatus'
});

bindFireflyImport({
  buttonId: 'fireflyFramesBtn',
  inputId: 'fireflyFramesInput',
  targetInputId: 'framesInput',
  statusId: 'fireflyImportStatus',
  multiple: true
});
