const $ = (id) => document.getElementById(id);

const state = {
  base: null,
  frames: [],
  index: 0,
  timer: null,
  playing: false,
  speed: 140,
  target: 4,
};

const els = {
  name: $('overlaySceneName'),
  target: $('overlayFrameTarget'),
  speed: $('overlaySpeed'),
  speedValue: $('overlaySpeedValue'),
  baseDrop: $('baseOverlayDrop'),
  baseInput: $('baseOverlayInput'),
  baseName: $('baseOverlayName'),
  frameDrop: $('overlayFramesDrop'),
  frameInput: $('overlayFramesInput'),
  frameStatus: $('overlayFramesStatus'),
  basePreview: $('overlayBasePreview'),
  framePreview: $('overlayFramePreview'),
  empty: $('overlayEmpty'),
  counter: $('overlayFrameCounter'),
  grid: $('overlayFrameGrid'),
  playA: $('playOverlayBtn'),
  playB: $('overlayPlayBtn'),
  prev: $('overlayPrevBtn'),
  next: $('overlayNextBtn'),
  clear: $('clearOverlayFramesBtn'),
  reset: $('resetOverlayToolBtn'),
  export: $('exportOverlayManifestBtn'),
};

function revoke(item) {
  if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
}

function stop() {
  clearInterval(state.timer);
  state.timer = null;
  state.playing = false;
  [els.playA, els.playB].forEach((b) => { if (b) b.textContent = '▶ PLAY'; });
}

function render() {
  els.speedValue.textContent = String(state.speed);
  els.frameStatus.textContent = `${state.frames.length} / ${state.target} frames loaded`;

  if (state.base) {
    els.basePreview.src = state.base.url;
    els.basePreview.hidden = false;
    els.baseName.textContent = state.base.name;
    els.empty.hidden = true;
  } else {
    els.basePreview.hidden = true;
    els.baseName.textContent = 'No base loaded';
    els.empty.hidden = false;
  }

  const frame = state.frames[state.index];
  if (frame) {
    els.framePreview.src = frame.url;
    els.framePreview.hidden = false;
    els.counter.textContent = `FRAME ${state.index + 1} / ${state.frames.length}`;
  } else {
    els.framePreview.hidden = true;
    els.counter.textContent = 'FRAME 0 / 0';
  }

  if (!state.frames.length) {
    els.grid.innerHTML = '<div class="overlay-empty-card">Upload transparent frame images. They are played in filename order above the fixed background.</div>';
    return;
  }

  els.grid.innerHTML = '';
  state.frames.forEach((item, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `overlay-frame-card${i === state.index ? ' active' : ''}`;
    card.innerHTML = `<img src="${item.url}" alt="Overlay frame ${i + 1}"><strong>FRAME ${String(i + 1).padStart(2, '0')}</strong><small>${item.name}</small>`;
    card.addEventListener('click', () => { state.index = i; render(); });
    els.grid.appendChild(card);
  });
}

function tick() {
  if (!state.frames.length) return;
  state.index = (state.index + 1) % state.frames.length;
  render();
}

function play() {
  if (!state.frames.length) return;
  if (state.playing) { stop(); return; }
  state.playing = true;
  [els.playA, els.playB].forEach((b) => { if (b) b.textContent = '■ STOP'; });
  state.timer = setInterval(tick, state.speed);
}

function loadBase(file) {
  if (!file) return;
  revoke(state.base);
  state.base = { name: file.name, url: URL.createObjectURL(file) };
  render();
}

function loadFrames(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith('image/'));
  if (!files.length) return;
  stop();
  state.frames.forEach(revoke);
  state.frames = files
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
    .slice(0, state.target)
    .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
  state.index = 0;
  render();
}

function downloadJSON() {
  const manifest = {
    version: 1,
    type: 'scene-overlay-animation',
    name: els.name.value.trim() || 'Overlay Scene',
    base: state.base?.name || null,
    frameCount: state.frames.length,
    targetFrameCount: state.target,
    frameHoldMs: state.speed,
    loop: true,
    frames: state.frames.map((f, i) => ({ index: i + 1, file: f.name, holdMs: state.speed })),
    layering: { base: 'static', overlays: 'transparent frames above base' },
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'overlay-scene'}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

els.baseDrop.addEventListener('click', () => els.baseInput.click());
els.baseInput.addEventListener('change', (e) => loadBase(e.target.files[0]));
els.frameDrop.addEventListener('click', () => els.frameInput.click());
els.frameInput.addEventListener('change', (e) => loadFrames(e.target.files));
els.target.addEventListener('change', () => {
  state.target = Number(els.target.value);
  if (state.frames.length > state.target) {
    stop();
    state.frames.slice(state.target).forEach(revoke);
    state.frames = state.frames.slice(0, state.target);
    state.index = Math.min(state.index, Math.max(0, state.frames.length - 1));
  }
  render();
});
els.speed.addEventListener('input', () => {
  state.speed = Number(els.speed.value);
  if (state.playing) { stop(); play(); }
  render();
});
els.playA.addEventListener('click', play);
els.playB.addEventListener('click', play);
els.prev.addEventListener('click', () => {
  if (!state.frames.length) return;
  stop();
  state.index = (state.index - 1 + state.frames.length) % state.frames.length;
  render();
});
els.next.addEventListener('click', () => { stop(); tick(); });
els.clear.addEventListener('click', () => {
  stop();
  state.frames.forEach(revoke);
  state.frames = [];
  state.index = 0;
  els.frameInput.value = '';
  render();
});
els.reset.addEventListener('click', () => {
  stop();
  revoke(state.base);
  state.frames.forEach(revoke);
  state.base = null;
  state.frames = [];
  state.index = 0;
  state.speed = 140;
  state.target = 4;
  els.name.value = 'My Overlay Scene';
  els.target.value = '4';
  els.speed.value = '140';
  els.baseInput.value = '';
  els.frameInput.value = '';
  render();
});
els.export.addEventListener('click', downloadJSON);

['dragenter', 'dragover'].forEach((type) => {
  [els.baseDrop, els.frameDrop].forEach((el) => el.addEventListener(type, (e) => { e.preventDefault(); el.classList.add('dragging'); }));
});
['dragleave', 'drop'].forEach((type) => {
  [els.baseDrop, els.frameDrop].forEach((el) => el.addEventListener(type, (e) => { e.preventDefault(); el.classList.remove('dragging'); }));
});
els.baseDrop.addEventListener('drop', (e) => loadBase(e.dataTransfer.files[0]));
els.frameDrop.addEventListener('drop', (e) => loadFrames(e.dataTransfer.files));

render();
