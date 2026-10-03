const qs = (s) => document.querySelector(s);

const state = {
  base: null,
  frames: [],
  current: 0,
  playing: false,
  timer: null,
};

const els = {
  sceneName: qs('#sceneName'),
  defaultHold: qs('#defaultHold'),
  loopMode: qs('#loopMode'),
  baseInput: qs('#baseInput'),
  baseDrop: qs('#baseDrop'),
  baseName: qs('#baseName'),
  basePreview: qs('#basePreview'),
  framePreview: qs('#framePreview'),
  stageEmpty: qs('#stageEmpty'),
  frameCounter: qs('#frameCounter'),
  playBtn: qs('#playBtn'),
  prevBtn: qs('#prevBtn'),
  nextBtn: qs('#nextBtn'),
  speedRange: qs('#speedRange'),
  framesInput: qs('#framesInput'),
  addFramesBtn: qs('#addFramesBtn'),
  emptyAdd: qs('#emptyAdd'),
  clearFramesBtn: qs('#clearFramesBtn'),
  framesGrid: qs('#framesGrid'),
  totalDuration: qs('#totalDuration'),
  exportManifestBtn: qs('#exportManifestBtn'),
  newSceneBtn: qs('#newSceneBtn'),
  sceneStatus: qs('#sceneStatus'),
};

function fileToItem(file, hold) {
  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    url: URL.createObjectURL(file),
    hold,
  };
}

function setBase(file) {
  if (state.base?.url) URL.revokeObjectURL(state.base.url);
  state.base = fileToItem(file, Number(els.defaultHold.value || 140));
  els.basePreview.src = state.base.url;
  els.basePreview.hidden = false;
  els.baseName.textContent = file.name;
  updateStatus();
  renderStage();
}

function addFrames(files) {
  const hold = Number(els.defaultHold.value || 140);
  [...files].forEach((file) => state.frames.push(fileToItem(file, hold)));
  if (state.current >= state.frames.length) state.current = Math.max(0, state.frames.length - 1);
  renderFrames();
  renderStage();
  updateStatus();
}

function renderStage() {
  const frame = state.frames[state.current];
  if (frame) {
    els.framePreview.src = frame.url;
    els.framePreview.hidden = false;
  } else {
    els.framePreview.hidden = true;
    els.framePreview.removeAttribute('src');
  }
  els.stageEmpty.hidden = Boolean(state.base || frame);
  els.frameCounter.textContent = `FRAME ${state.frames.length ? state.current + 1 : 0} / ${state.frames.length}`;
}

function updateStatus() {
  if (state.base && state.frames.length) els.sceneStatus.textContent = 'READY';
  else if (state.base || state.frames.length) els.sceneStatus.textContent = 'IN PROGRESS';
  else els.sceneStatus.textContent = 'EMPTY';
}

function renderFrames() {
  els.framesGrid.innerHTML = '';
  if (!state.frames.length) {
    els.framesGrid.appendChild(els.emptyAdd);
    els.emptyAdd.hidden = false;
  } else {
    els.emptyAdd.hidden = true;
    state.frames.forEach((frame, index) => {
      const card = document.createElement('article');
      card.className = 'frame-card';
      card.draggable = true;
      card.dataset.id = frame.id;
      card.innerHTML = `
        <div class="frame-thumb"><img src="${frame.url}" alt="${frame.name}"></div>
        <div class="frame-meta">
          <strong>${String(index + 1).padStart(2, '0')} — ${frame.name}</strong>
          <label>Hold (ms)<input class="hold-input" type="number" min="40" max="2000" step="10" value="${frame.hold}"></label>
          <div class="frame-actions"><button class="preview-btn" type="button">PREVIEW</button><button class="remove-btn" type="button">REMOVE</button></div>
        </div>`;

      card.querySelector('.hold-input').addEventListener('change', (e) => {
        frame.hold = Math.max(40, Number(e.target.value || 140));
        updateDuration();
      });
      card.querySelector('.preview-btn').addEventListener('click', () => {
        state.current = index;
        renderStage();
      });
      card.querySelector('.remove-btn').addEventListener('click', () => {
        URL.revokeObjectURL(frame.url);
        state.frames.splice(index, 1);
        state.current = Math.min(state.current, Math.max(0, state.frames.length - 1));
        renderFrames();
        renderStage();
        updateStatus();
      });

      card.addEventListener('dragstart', () => card.classList.add('dragging'));
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', (e) => e.preventDefault());
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = els.framesGrid.querySelector('.dragging');
        if (!dragging || dragging === card) return;
        const from = state.frames.findIndex((f) => f.id === dragging.dataset.id);
        const to = state.frames.findIndex((f) => f.id === card.dataset.id);
        const [moved] = state.frames.splice(from, 1);
        state.frames.splice(to, 0, moved);
        renderFrames();
      });
      els.framesGrid.appendChild(card);
    });
  }
  updateDuration();
}

function updateDuration() {
  const ms = state.frames.reduce((sum, frame) => sum + Number(frame.hold || 0), 0);
  els.totalDuration.textContent = `${state.frames.length} FRAME${state.frames.length === 1 ? '' : 'S'} • ${(ms / 1000).toFixed(2)}S LOOP`;
}

function stopPlayback() {
  state.playing = false;
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
  els.playBtn.textContent = '▶ PLAY';
}

function scheduleFrame() {
  if (!state.playing || !state.frames.length) return;
  renderStage();
  const frame = state.frames[state.current];
  const speed = Number(els.speedRange.value || frame.hold || 140);
  state.timer = setTimeout(() => {
    const atEnd = state.current >= state.frames.length - 1;
    if (atEnd && els.loopMode.value === 'once') {
      stopPlayback();
      return;
    }
    state.current = atEnd ? 0 : state.current + 1;
    scheduleFrame();
  }, speed);
}

function togglePlayback() {
  if (state.playing) return stopPlayback();
  if (!state.frames.length) return;
  state.playing = true;
  els.playBtn.textContent = '❚❚ PAUSE';
  scheduleFrame();
}

function step(delta) {
  stopPlayback();
  if (!state.frames.length) return;
  state.current = (state.current + delta + state.frames.length) % state.frames.length;
  renderStage();
}

function resetScene() {
  stopPlayback();
  if (state.base?.url) URL.revokeObjectURL(state.base.url);
  state.frames.forEach((f) => URL.revokeObjectURL(f.url));
  state.base = null;
  state.frames = [];
  state.current = 0;
  els.basePreview.hidden = true;
  els.framePreview.hidden = true;
  els.baseName.textContent = 'No base image loaded';
  els.sceneName.value = 'My Game Scene';
  renderFrames();
  renderStage();
  updateStatus();
}

function exportManifest() {
  const safeName = (els.sceneName.value || 'scene').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'scene';
  const manifest = {
    version: 1,
    tool: 'scene-animator',
    name: els.sceneName.value.trim() || 'My Game Scene',
    method: 'base-scenery-plus-aligned-still-frames-flipbook',
    base: state.base ? { file: state.base.name } : null,
    frames: state.frames.map((frame, index) => ({ order: index + 1, file: frame.name, hold: Number(frame.hold) })),
    loop: els.loopMode.value === 'loop',
    notes: 'Keep every frame the same dimensions and composition. Change only the details that should appear animated.'
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}-scene.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function bindDrop(target, onFiles) {
  ['dragenter','dragover'].forEach((type) => target.addEventListener(type, (e) => { e.preventDefault(); target.classList.add('dragover'); }));
  ['dragleave','drop'].forEach((type) => target.addEventListener(type, (e) => { e.preventDefault(); target.classList.remove('dragover'); }));
  target.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));
}

els.baseDrop.addEventListener('click', () => els.baseInput.click());
els.baseInput.addEventListener('change', (e) => e.target.files[0] && setBase(e.target.files[0]));
els.addFramesBtn.addEventListener('click', () => els.framesInput.click());
els.emptyAdd.addEventListener('click', () => els.framesInput.click());
els.framesInput.addEventListener('change', (e) => addFrames(e.target.files));
els.clearFramesBtn.addEventListener('click', () => { stopPlayback(); state.frames.forEach((f) => URL.revokeObjectURL(f.url)); state.frames = []; state.current = 0; renderFrames(); renderStage(); updateStatus(); });
els.playBtn.addEventListener('click', togglePlayback);
els.prevBtn.addEventListener('click', () => step(-1));
els.nextBtn.addEventListener('click', () => step(1));
els.exportManifestBtn.addEventListener('click', exportManifest);
els.newSceneBtn.addEventListener('click', resetScene);

bindDrop(els.baseDrop, (files) => files[0] && setBase(files[0]));
bindDrop(els.framesGrid, (files) => addFrames(files));

renderFrames();
renderStage();
updateStatus();
