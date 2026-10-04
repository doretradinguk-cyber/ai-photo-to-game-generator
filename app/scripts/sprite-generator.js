const qs = (s) => document.querySelector(s);

const state = {
  background: null,
  backgroundUrl: '',
  sheet: null,
  sheetUrl: '',
  sheetBitmap: null,
  frames: [],
  current: 0,
  playing: false,
  timer: null,
  grid: { cols: 0, rows: 0 }
};

const els = {
  spriteName: qs('#spriteName'), spriteStatus: qs('#spriteStatus'), frameTarget: qs('#frameTarget'),
  sheetLayout: qs('#sheetLayout'), frameHold: qs('#frameHold'), loopMode: qs('#loopMode'),
  backgroundDrop: qs('#backgroundDrop'), backgroundInput: qs('#backgroundInput'), backgroundName: qs('#backgroundName'),
  clearBackgroundBtn: qs('#clearBackgroundBtn'), sheetDrop: qs('#sheetDrop'), sheetInput: qs('#sheetInput'),
  sheetName: qs('#sheetName'), sheetPreview: qs('#sheetPreview'), sheetInfo: qs('#sheetInfo'), sheetStatus: qs('#sheetStatus'),
  spriteCanvas: qs('#spriteCanvas'), stageEmpty: qs('#stageEmpty'), frameCounter: qs('#frameCounter'),
  prevBtn: qs('#prevBtn'), playBtn: qs('#playBtn'), nextBtn: qs('#nextBtn'), speedRange: qs('#speedRange'),
  frameTargetStatus: qs('#frameTargetStatus'), totalDuration: qs('#totalDuration'), framesGrid: qs('#framesGrid'),
  resliceBtn: qs('#resliceBtn'), downloadFrameBtn: qs('#downloadFrameBtn'), exportManifestBtn: qs('#exportManifestBtn'),
  newSpriteBtn: qs('#newSpriteBtn')
};

function targetCount() { return Math.max(4, Number(els.frameTarget.value || 4)); }
function holdMs() { return Math.max(30, Number(els.frameHold.value || 120)); }

function revoke(url) { if (url) URL.revokeObjectURL(url); }
function stop() { state.playing = false; if (state.timer) clearTimeout(state.timer); state.timer = null; els.playBtn.textContent = '▶ PLAY'; }

function possibleGrids(count) {
  const grids = [];
  for (let cols = 1; cols <= count; cols++) {
    if (count % cols === 0) grids.push({ cols, rows: count / cols });
  }
  return grids;
}

function chooseGrid(width, height, count, mode) {
  if (mode === 'row') return { cols: count, rows: 1 };
  if (mode === 'column') return { cols: 1, rows: count };
  const imageRatio = width / height;
  return possibleGrids(count).sort((a, b) => {
    const aScore = Math.abs(Math.log((a.cols / a.rows) / imageRatio));
    const bScore = Math.abs(Math.log((b.cols / b.rows) / imageRatio));
    return aScore - bScore;
  })[0] || { cols: count, rows: 1 };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function setBackground(file) {
  revoke(state.backgroundUrl);
  state.background = file;
  state.backgroundUrl = URL.createObjectURL(file);
  els.backgroundName.textContent = file.name;
  await renderStage();
  updateStatus();
}

async function setSheet(file) {
  stop();
  revoke(state.sheetUrl);
  if (state.sheetBitmap?.close) state.sheetBitmap.close();
  state.sheet = file;
  state.sheetUrl = URL.createObjectURL(file);
  state.sheetBitmap = await createImageBitmap(file);
  els.sheetPreview.src = state.sheetUrl;
  els.sheetPreview.hidden = false;
  els.sheetName.textContent = file.name;
  els.resliceBtn.disabled = false;
  sliceSheet();
}

function sliceSheet() {
  if (!state.sheetBitmap) return;
  const count = targetCount();
  const grid = chooseGrid(state.sheetBitmap.width, state.sheetBitmap.height, count, els.sheetLayout.value);
  const cellW = Math.floor(state.sheetBitmap.width / grid.cols);
  const cellH = Math.floor(state.sheetBitmap.height / grid.rows);
  state.grid = grid;
  state.frames = [];

  for (let i = 0; i < count; i++) {
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    if (row >= grid.rows) break;
    const canvas = document.createElement('canvas');
    canvas.width = cellW;
    canvas.height = cellH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(state.sheetBitmap, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
    state.frames.push({ index: i + 1, canvas, width: cellW, height: cellH });
  }
  state.current = Math.min(state.current, Math.max(0, state.frames.length - 1));
  els.sheetStatus.textContent = `${state.frames.length} FRAMES READY`;
  els.sheetInfo.textContent = `${state.sheetBitmap.width}×${state.sheetBitmap.height} • ${grid.cols}×${grid.rows} GRID • ${cellW}×${cellH} CELLS`;
  els.downloadFrameBtn.disabled = !state.frames.length;
  renderFrames();
  renderStage();
  updateStatus();
}

async function renderStage() {
  const canvas = els.spriteCanvas;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (state.backgroundUrl) {
    try {
      const bg = await loadImage(state.backgroundUrl);
      const scale = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
      const dw = bg.naturalWidth * scale;
      const dh = bg.naturalHeight * scale;
      ctx.drawImage(bg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } catch {}
  }

  const frame = state.frames[state.current];
  if (frame) {
    const maxW = w * 0.42;
    const maxH = h * 0.72;
    const scale = Math.min(maxW / frame.width, maxH / frame.height, 6);
    const dw = frame.width * scale;
    const dh = frame.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frame.canvas, (w - dw) / 2, h - dh - h * 0.08, dw, dh);
  }

  els.stageEmpty.hidden = Boolean(frame || state.backgroundUrl);
  els.frameCounter.textContent = `FRAME ${state.frames.length ? state.current + 1 : 0} / ${state.frames.length}`;
  renderActiveCard();
}

function renderFrames() {
  els.framesGrid.innerHTML = '';
  if (!state.frames.length) {
    const empty = document.createElement('div');
    empty.className = 'sprite-empty';
    empty.textContent = 'Upload a sprite sheet to generate frame thumbnails.';
    els.framesGrid.appendChild(empty);
    return;
  }
  state.frames.forEach((frame, index) => {
    const card = document.createElement('article');
    card.className = 'sprite-frame-card';
    card.dataset.index = String(index);
    const thumb = document.createElement('canvas');
    thumb.width = frame.width;
    thumb.height = frame.height;
    const tctx = thumb.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(frame.canvas, 0, 0);
    const meta = document.createElement('div');
    meta.innerHTML = `<b>FRAME ${String(index + 1).padStart(2, '0')}</b> • ${frame.width}×${frame.height}`;
    card.appendChild(thumb);
    card.appendChild(meta);
    card.addEventListener('click', () => { stop(); state.current = index; renderStage(); });
    els.framesGrid.appendChild(card);
  });
  renderActiveCard();
}

function renderActiveCard() {
  els.framesGrid.querySelectorAll('.sprite-frame-card').forEach((card) => {
    card.classList.toggle('active', Number(card.dataset.index) === state.current);
  });
}

function updateStatus() {
  const target = targetCount();
  els.frameTargetStatus.textContent = `TARGET ${target} FRAMES`;
  els.totalDuration.textContent = `${state.frames.length} / ${target} FRAMES • ${((state.frames.length * holdMs()) / 1000).toFixed(2)}S LOOP`;
  els.spriteStatus.textContent = state.frames.length === target ? 'READY' : (state.sheet || state.background ? 'IN PROGRESS' : 'EMPTY');
  els.speedRange.value = String(holdMs());
}

function schedule() {
  if (!state.playing || !state.frames.length) return;
  renderStage();
  state.timer = setTimeout(() => {
    const atEnd = state.current >= state.frames.length - 1;
    if (atEnd && els.loopMode.value === 'once') return stop();
    state.current = atEnd ? 0 : state.current + 1;
    schedule();
  }, Number(els.speedRange.value || holdMs()));
}

function togglePlay() {
  if (state.playing) return stop();
  if (!state.frames.length) return;
  state.playing = true;
  els.playBtn.textContent = '❚❚ PAUSE';
  schedule();
}

function step(delta) {
  stop();
  if (!state.frames.length) return;
  state.current = (state.current + delta + state.frames.length) % state.frames.length;
  renderStage();
}

function downloadCurrent() {
  const frame = state.frames[state.current];
  if (!frame) return;
  frame.canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const prefix = (els.spriteName.value || 'sprite').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'sprite';
    a.href = url;
    a.download = `${prefix}-frame-${String(state.current + 1).padStart(2, '0')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

function exportManifest() {
  const payload = {
    version: 1,
    tool: 'sprite-generator',
    name: els.spriteName.value.trim() || 'My Animated Sprite',
    frameCount: targetCount(),
    actualFrames: state.frames.length,
    frameHold: holdMs(),
    loop: els.loopMode.value === 'loop',
    background: state.background ? state.background.name : null,
    spriteSheet: state.sheet ? state.sheet.name : null,
    grid: state.grid,
    frameSize: state.frames[0] ? { width: state.frames[0].width, height: state.frames[0].height } : null,
    frames: state.frames.map((f) => ({ index: f.index, file: `frame-${String(f.index).padStart(2, '0')}.png`, hold: holdMs() }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(payload.name || 'sprite').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}-sprite.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function reset() {
  stop();
  revoke(state.backgroundUrl); revoke(state.sheetUrl);
  if (state.sheetBitmap?.close) state.sheetBitmap.close();
  state.background = null; state.backgroundUrl = ''; state.sheet = null; state.sheetUrl = ''; state.sheetBitmap = null;
  state.frames = []; state.current = 0; state.grid = { cols: 0, rows: 0 };
  els.spriteName.value = 'My Animated Sprite';
  els.frameTarget.value = '4'; els.sheetLayout.value = 'auto'; els.frameHold.value = '120'; els.speedRange.value = '120'; els.loopMode.value = 'loop';
  els.backgroundName.textContent = 'No background — transparent preview';
  els.sheetName.textContent = 'Choose a sheet containing 4 / 8 / 16 / 32 frames';
  els.sheetPreview.hidden = true; els.sheetPreview.removeAttribute('src');
  els.sheetInfo.textContent = 'NO SHEET LOADED'; els.sheetStatus.textContent = 'NOT LOADED';
  els.resliceBtn.disabled = true; els.downloadFrameBtn.disabled = true;
  renderFrames(); renderStage(); updateStatus();
}

els.backgroundDrop.addEventListener('click', () => els.backgroundInput.click());
els.backgroundInput.addEventListener('change', () => { const file = els.backgroundInput.files?.[0]; if (file) setBackground(file); });
els.clearBackgroundBtn.addEventListener('click', () => { revoke(state.backgroundUrl); state.background = null; state.backgroundUrl = ''; els.backgroundName.textContent = 'No background — transparent preview'; renderStage(); updateStatus(); });
els.sheetDrop.addEventListener('click', () => els.sheetInput.click());
els.sheetInput.addEventListener('change', () => { const file = els.sheetInput.files?.[0]; if (file) setSheet(file); });
els.frameTarget.addEventListener('change', () => { if (state.sheetBitmap) sliceSheet(); else updateStatus(); });
els.sheetLayout.addEventListener('change', () => { if (state.sheetBitmap) sliceSheet(); });
els.frameHold.addEventListener('change', updateStatus);
els.speedRange.addEventListener('input', () => { els.frameHold.value = els.speedRange.value; updateStatus(); });
els.resliceBtn.addEventListener('click', sliceSheet);
els.prevBtn.addEventListener('click', () => step(-1));
els.nextBtn.addEventListener('click', () => step(1));
els.playBtn.addEventListener('click', togglePlay);
els.downloadFrameBtn.addEventListener('click', downloadCurrent);
els.exportManifestBtn.addEventListener('click', exportManifest);
els.newSpriteBtn.addEventListener('click', reset);

['dragenter','dragover'].forEach((type) => {
  els.backgroundDrop.addEventListener(type, (e) => { e.preventDefault(); els.backgroundDrop.classList.add('dragover'); });
  els.sheetDrop.addEventListener(type, (e) => { e.preventDefault(); els.sheetDrop.classList.add('dragover'); });
});
['dragleave','drop'].forEach((type) => {
  els.backgroundDrop.addEventListener(type, (e) => { e.preventDefault(); els.backgroundDrop.classList.remove('dragover'); });
  els.sheetDrop.addEventListener(type, (e) => { e.preventDefault(); els.sheetDrop.classList.remove('dragover'); });
});
els.backgroundDrop.addEventListener('drop', (e) => { const file = e.dataTransfer?.files?.[0]; if (file) setBackground(file); });
els.sheetDrop.addEventListener('drop', (e) => { const file = e.dataTransfer?.files?.[0]; if (file) setSheet(file); });

updateStatus();
renderFrames();
renderStage();
