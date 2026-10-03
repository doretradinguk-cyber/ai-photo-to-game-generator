import { browserPreviewAdapter } from './browser-preview.js';

const adapters = new Map([[browserPreviewAdapter.id, browserPreviewAdapter]]);

export function registerAdapter(adapter) {
  if (!adapter?.id || typeof adapter.render !== 'function') throw new Error('Invalid render adapter.');
  adapters.set(adapter.id, adapter);
}

export function getAdapter(id = 'browser-preview') {
  const adapter = adapters.get(id);
  if (!adapter) throw new Error(`Render adapter not available: ${id}`);
  return adapter;
}

export function listAdapters() {
  return [...adapters.values()].map(({ id, name }) => ({ id, name }));
}
