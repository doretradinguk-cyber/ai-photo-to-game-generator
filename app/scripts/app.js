import { CONTROL_DEFS, PRESETS, getPreset } from './core/presets.js';
import { state, patchState, resetControls, selectPreset, setControl, subscribe } from './core/state.js';
import { analyseSource } from './core/analyse.js';
import { createRenderJob } from './core/render-job.js';
import { getAdapter } from './adapters/registry.js';

const $ = (selector) => document.querySelector(selector);
const controlsEl = $('#controls');
const presetGrid = $('#presetGrid');
const dropZone = $('#dropZone');
const fileInput = $('#fileInput');
const sourceImage = $('#sourceImage');
const dropPrompt = $('#dropPrompt');
const canvas = $('#renderCanvas');

function setStep(step) {
  patchState({ currentStep: step });
}

function syncUi() {
  $('#stepNo').textContent = state.currentStep;
  document.querySelectorAll('.step').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.step) === state.currentStep);
  });

  const preset = getPreset(state.activePresetId);
  $('#activePresetLabel').textContent = `(${preset.name})`;

  CONTROL_DEFS.forEach(([key], index) => {
    const input = document.querySelector(`#c${index}`);
    const output = document.querySelector(`#c${index}o`);
    if (input && document.activeElement !== input) input.value = state.controls[key];
    if (output) output.value = state.controls[key];
  });

  document.querySelectorAll('.preset-card').forEach((button) => {
    button.classList.toggle('active', button.dataset.presetId === state.activePresetId);
  });
}

subscribe(syncUi);

document.querySelectorAll('.step').forEach((button) => {
  button.addEventListener('click', () => setStep(Number(button.dataset.step)));
});

CONTROL_DEFS.forEach(([key, label], index) => {
  const row = document.createElement('div');
  row.className = 'control';
  const id = `c${index}`;
  row.innerHTML = `<label for="${id}">${label.toUpperCase()}</label><output id="${id}o">${state.controls[key]}</output><input id="${id}" type="range" min="0" max="100" value="${state.controls[key]}">`;
  row.querySelector('input').addEventListener('input', (event) => {
    setControl(key, event.target.value);
  });
  controlsEl.append(row);
});

PRESETS.forEach((preset, index) => {
  const button = document.createElement('button');
  button.className = `preset-card${index === 0 ? ' active' : ''}`;
  button.dataset.presetId = preset.id;
  button.title = preset.description;
  button.innerHTML = `<div class="preset-thumb preset-${preset.id}"></div><strong>${preset.name}</strong>`;
  button.addEventListener('click', async () => {
    selectPreset(preset.id);
    if (state.sourceBitmap) await renderCurrent();
  });
  presetGrid.append(button);
});

function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file) throw new Error('No file supplied.');
  if (!validTypes.includes(file.type)) throw new Error('Use a PNG, JPEG or WebP image.');
  if (file.size > 30 * 1024 * 1024) throw new Error('Image is larger than the 30 MB browser limit.');
}

async function loadFile(file) {
  try {
    validateImage(file);
    if (state.sourceBitmap?.close) state.sourceBitmap.close();
    const bitmap = await createImageBitmap(file);
    const analysis = await analyseSource(file, bitmap);
    const url = URL.createObjectURL(file);

    sourceImage.src = url;
    sourceImage.hidden = false;
    dropPrompt.hidden = true;
    $('#fileName').textContent = file.name.toUpperCase();
    $('#fileSize').textContent = `${bitmap.width} × ${bitmap.height}`;
    patchState({ sourceFile: file, sourceBitmap: bitmap, sourceMeta: analysis.source, analysis, error: null, currentStep: 2 });
    await renderCurrent();
  } catch (error) {
    patchState({ error: error.message });
    alert(error.message);
  }
}

async function renderCurrent() {
  if (!state.sourceBitmap) return;
  const adapter = getAdapter('browser-preview');
  const job = createRenderJob(state, { adapter: adapter.id, scale: Number($('#sizeSelect').value || 1) });
  patchState({ rendering: true, currentStep: 4, lastRenderJob: job, error: null });
  try {
    const meta = await adapter.render({ bitmap: state.sourceBitmap, job, canvas });
    $('#renderEmpty').hidden = true;
    patchState({ rendering: false, lastRenderMeta: meta });
  } catch (error) {
    patchState({ rendering: false, error: error.message });
    alert(`Render failed: ${error.message}`);
  }
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
}));
dropZone.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));

$('#renderBtn').addEventListener('click', renderCurrent);
$('#compareHandle').addEventListener('click', renderCurrent);
$('#resetBtn').addEventListener('click', async () => {
  resetControls();
  if (state.sourceBitmap) await renderCurrent();
});

$('#generatePresetBtn').addEventListener('click', async () => {
  // Real AI Assist will later return this shape from a provider-neutral adapter.
  selectPreset('custom-ai');
  const suggestions = {
    styleStrength: 68,
    detail: 76,
    contrast: 74,
    glow: 44,
    edgeClean: 72,
    skinToneLock: 86,
    backgroundBlend: 46
  };
  Object.entries(suggestions).forEach(([key, value]) => setControl(key, value));
  if (state.sourceBitmap) await renderCurrent();
});

$('#compareBtn').addEventListener('click', () => {
  sourceImage.style.opacity = sourceImage.style.opacity === '0' ? '1' : '0';
});

$('#variationBtn').addEventListener('click', async () => {
  setControl('styleStrength', Math.round(52 + Math.random() * 34));
  setControl('glow', Math.round(24 + Math.random() * 45));
  if (state.sourceBitmap) await renderCurrent();
});

$('#upscaleBtn').addEventListener('click', () => {
  alert('Upscale is reserved for the local/remote adapter. The browser preview remains source-preserving and lightweight.');
});

$('#exportBtn').addEventListener('click', async () => {
  if (!state.sourceBitmap) return alert('Load an image first.');
  setStep(5);
  const format = $('#formatSelect').value === 'JPEG' ? 'image/jpeg' : 'image/png';
  const extension = format === 'image/jpeg' ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.download = `ai-radio-render-${state.activePresetId}-${Date.now()}.${extension}`;
  link.href = canvas.toDataURL(format, 0.94);
  link.click();
});

syncUi();
