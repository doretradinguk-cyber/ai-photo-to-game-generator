import { getPreset } from './presets.js';

const listeners = new Set();

export const state = {
  sourceFile: null,
  sourceBitmap: null,
  sourceMeta: null,
  activePresetId: 'retrowave-pale-blue',
  controls: { ...getPreset('retrowave-pale-blue').defaults },
  analysis: null,
  lastRenderJob: null,
  lastRenderMeta: null,
  currentStep: 1,
  rendering: false,
  error: null
};

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function patchState(patch) {
  Object.assign(state, patch);
  for (const listener of listeners) listener(state);
}

export function setControl(key, value) {
  state.controls[key] = Math.max(0, Math.min(100, Number(value)));
  for (const listener of listeners) listener(state);
}

export function selectPreset(id, { applyDefaults = true } = {}) {
  const preset = getPreset(id);
  state.activePresetId = preset.id;
  if (applyDefaults) state.controls = { ...preset.defaults };
  state.currentStep = Math.max(state.currentStep, 3);
  state.error = null;
  for (const listener of listeners) listener(state);
  return preset;
}

export function resetControls() {
  const preset = getPreset(state.activePresetId);
  state.controls = { ...preset.defaults };
  state.error = null;
  for (const listener of listeners) listener(state);
}
