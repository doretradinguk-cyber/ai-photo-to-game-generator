const qs = (s) => document.querySelector(s);

const state = {
  base: null,
  frames: [],
  current: 0,
  playing: false,
  timer: null,
  assistRecipe: null
};

const els = {
  sceneName: qs('#sceneName'), frameTarget: qs('#frameTarget'), frameTargetStatus: qs('#frameTargetStatus'),
  defaultHold: qs('#defaultHold'), loopMode: qs('#loopMode'),
  baseInput: qs('#baseInput'), baseDrop: qs('#baseDrop'), baseName: qs('#baseName'),
  basePreview: qs('#basePreview'), framePreview: qs('#framePreview'), stageEmpty: qs('#stageEmpty'),
  frameCounter: qs('#frameCounter'), playBtn: qs('#playBtn'), prevBtn: qs('#prevBtn'), nextBtn: qs('#nextBtn'),
  speedRange: qs('#speedRange'), framesInput: qs('#framesInput'), addFramesBtn: qs('#addFramesBtn'),
  emptyAdd: qs('#emptyAdd'), clearFramesBtn: qs('#clearFramesBtn'), framesGrid: qs('#framesGrid'),
  totalDuration: qs('#totalDuration'), exportManifestBtn: qs('#exportManifestBtn'), newSceneBtn: qs('#newSceneBtn'),
  sceneStatus: qs('#sceneStatus'), loadFirstSceneBtn: qs('#loadFirstSceneBtn'),
  scenePreset: qs('#scenePreset'), scenePrompt: qs('#scenePrompt'), assistStatus: qs('#assistStatus'),
  generateSceneRecipeBtn: qs('#generateSceneRecipeBtn'), copyFramePromptsBtn: qs('#copyFramePromptsBtn'),
  exportRecipeBtn: qs('#exportRecipeBtn'), framePlan: qs('#framePlan'), planMeta: qs('#planMeta')
};

const PRESET_DIRECTIONS = {
  'adobe-neon-noir': 'Illustrated neon-noir game scene with emerald/cyan practical light, hot magenta backlight, deep black shadow shapes, textured surfaces and cinematic depth.',
  'retrowave-pale-blue': 'Retrowave game-art scene with pale cyan highlights, magenta/cyan neon, graphic cel contrast, reflective surfaces and a clean synthwave atmosphere.',
  'crimson-minimum': 'Minimal crimson-and-black game-art scene with hard shadow separation, restrained glow and simplified colour planes.',
  emerald: 'Dark emerald game-art scene with cool green light, dense shadows, selective cyan detail and controlled neon energy.',
  'noir-ink': 'High-contrast monochrome comic-ink scene with confident silhouettes, graphic shadows and restrained highlights.',
  'neon-comic': 'Bold neon comic scene with strong magenta/cyan contrast, graphic shadow masses, glow accents and clear readable forms.',
  custom: 'Follow the user prompt as the primary art direction while keeping the camera, composition and scene geometry consistent across frames.'
};

function targetCount() { return Math.max(4, Number(els.frameTarget?.value || 4)); }
function defaultHold() { return Math.max(40, Number(els.defaultHold?.value || 180)); }

function fileToItem(file, hold) {
  return { id: crypto.randomUUID(), file, name: file.name, url: URL.createObjectURL(file), hold, revocable: true };
}

function remoteItem(name, url, hold) {
  return { id: crypto.randomUUID(), file: null, name, url, hold, revocable: false };
}

function release(item) { if (item?.revocable && item.url) URL.revokeObjectURL(item.url); }

function setBase(file) {
  release(state.base);
  state.base = fileToItem(file, defaultHold());
  els.basePreview.src = state.base.url;
  els.basePreview.hidden = false;
  els.baseName.textContent = file.name;
  updateStatus(); renderStage();
}

function addFrames(files) {
  const hold = defaultHold();
  const max = targetCount();
  const remaining = Math.max(0, max - state.frames.length);
  const accepted = [...files].slice(0, remaining);
  accepted.forEach((file) => state.frames.push(fileToItem(file, hold)));
  if ([...files].length > accepted.length) {
    alert(`This scene is set to ${max} frames. ${[...files].length - accepted.length} extra image(s) were not added.`);
  }
  if (state.current >= state.frames.length) state.current = Math.max(0, state.frames.length - 1);
  renderFrames(); renderStage(); updateStatus();
}

function renderStage() {
  const frame = state.frames[state.current];
  if (frame) { els.framePreview.src = frame.url; els.framePreview.hidden = false; }
  else { els.framePreview.hidden = true; els.framePreview.removeAttribute('src'); }
  els.stageEmpty.hidden = Boolean(state.base || frame);
  els.frameCounter.textContent = `FRAME ${state.frames.length ? state.current + 1 : 0} / ${state.frames.length}`;
}

function updateStatus() {
  const target = targetCount();
  const complete = state.base && state.frames.length === target;
  els.sceneStatus.textContent = complete ? 'READY' : (state.base || state.frames.length ? 'IN PROGRESS' : 'EMPTY');
  if (els.frameTargetStatus) els.frameTargetStatus.textContent = `TARGET ${target} FRAMES`;
  if (els.planMeta) els.planMeta.textContent = `${target} frames • ${defaultHold()} ms`;
}

function renderFrames() {
  els.framesGrid.innerHTML = '';
  if (!state.frames.length) {
    els.framesGrid.appendChild(els.emptyAdd); els.emptyAdd.hidden = false;
  } else {
    els.emptyAdd.hidden = true;
    state.frames.forEach((frame, index) => {
      const card = document.createElement('article');
      card.className = 'frame-card'; card.draggable = true; card.dataset.id = frame.id;
      card.innerHTML = `<div class="frame-thumb"><img src="${frame.url}" alt="${frame.name}"></div><div class="frame-meta"><strong>${String(index + 1).padStart(2, '0')} — ${frame.name}</strong><label>Hold (ms)<input class="hold-input" type="number" min="40" max="2000" step="10" value="${frame.hold}"></label><div class="frame-actions"><button class="preview-btn" type="button">PREVIEW</button><button class="remove-btn" type="button">REMOVE</button></div></div>`;
      card.querySelector('.hold-input').addEventListener('change', (e) => { frame.hold = Math.max(40, Number(e.target.value || 180)); updateDuration(); });
      card.querySelector('.preview-btn').addEventListener('click', () => { state.current = index; renderStage(); });
      card.querySelector('.remove-btn').addEventListener('click', () => { release(frame); state.frames.splice(index, 1); state.current = Math.min(state.current, Math.max(0, state.frames.length - 1)); renderFrames(); renderStage(); updateStatus(); });
      card.addEventListener('dragstart', () => card.classList.add('dragging'));
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', (e) => e.preventDefault());
      card.addEventListener('drop', (e) => { e.preventDefault(); const dragging = els.framesGrid.querySelector('.dragging'); if (!dragging || dragging === card) return; const from = state.frames.findIndex((f) => f.id === dragging.dataset.id); const to = state.frames.findIndex((f) => f.id === card.dataset.id); const [moved] = state.frames.splice(from, 1); state.frames.splice(to, 0, moved); renderFrames(); });
      els.framesGrid.appendChild(card);
    });
  }
  updateDuration();
}

function updateDuration() {
  const ms = state.frames.reduce((sum, frame) => sum + Number(frame.hold || 0), 0);
  const target = targetCount();
  els.totalDuration.textContent = `${state.frames.length} / ${target} FRAMES • ${(ms / 1000).toFixed(2)}S LOOP`;
  if (els.addFramesBtn) els.addFramesBtn.disabled = state.frames.length >= target;
  updateStatus();
}

function stopPlayback() { state.playing = false; if (state.timer) clearTimeout(state.timer); state.timer = null; els.playBtn.textContent = '▶ PLAY'; }

function scheduleFrame() {
  if (!state.playing || !state.frames.length) return;
  renderStage();
  const frame = state.frames[state.current];
  const speed = Number(els.speedRange.value || frame.hold || 180);
  state.timer = setTimeout(() => {
    const atEnd = state.current >= state.frames.length - 1;
    if (atEnd && els.loopMode.value === 'once') return stopPlayback();
    state.current = atEnd ? 0 : state.current + 1;
    scheduleFrame();
  }, speed);
}

function togglePlayback() { if (state.playing) return stopPlayback(); if (!state.frames.length) return; state.playing = true; els.playBtn.textContent = '❚❚ PAUSE'; scheduleFrame(); }
function step(delta) { stopPlayback(); if (!state.frames.length) return; state.current = (state.current + delta + state.frames.length) % state.frames.length; renderStage(); }

function resetAssist() {
  state.assistRecipe = null;
  if (els.scenePrompt) els.scenePrompt.value = '';
  if (els.scenePreset) els.scenePreset.value = 'adobe-neon-noir';
  if (els.assistStatus) els.assistStatus.textContent = 'READY TO PLAN';
  renderFramePlan();
}

function resetScene() {
  stopPlayback(); release(state.base); state.frames.forEach(release);
  state.base = null; state.frames = []; state.current = 0;
  els.basePreview.hidden = true; els.framePreview.hidden = true; els.baseName.textContent = 'No base image loaded';
  els.sceneName.value = 'My Game Scene';
  els.frameTarget.value = '4';
  els.defaultHold.value = '180';
  els.speedRange.value = '180';
  resetAssist();
  renderFrames(); renderStage(); updateStatus();
}

async function loadBundledScene() {
  stopPlayback();
  els.sceneStatus.textContent = 'LOADING';
  const manifestUrl = new URL('./assets/scenes/first-retrowave/scene.json', window.location.href);
  manifestUrl.searchParams.set('v', Date.now().toString());
  const response = await fetch(manifestUrl.href, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Scene manifest failed: ${response.status}`);
  const manifest = await response.json();
  const root = new URL('./assets/scenes/first-retrowave/', window.location.href);
  const baseUrl = new URL(manifest.base.file, root).href;
  const frames = manifest.frames.map((frame) => ({ ...frame, url: new URL(frame.file, root).href }));

  release(state.base);
  state.frames.forEach(release);
  state.base = remoteItem(manifest.base.file.split('/').pop(), baseUrl, 180);
  state.frames = frames.map((frame) => remoteItem(frame.file.split('/').pop(), frame.url, Number(frame.hold || 180)));
  state.current = 0;
  els.sceneName.value = manifest.name || 'First Retrowave Scene';
  els.loopMode.value = manifest.loop === false ? 'once' : 'loop';
  const nearestTarget = state.frames.length <= 4 ? 4 : state.frames.length <= 8 ? 8 : 16;
  els.frameTarget.value = String(nearestTarget);
  els.defaultHold.value = String(manifest.frames?.[0]?.hold || 180);
  els.speedRange.value = String(manifest.frames?.[0]?.hold || 180);
  els.basePreview.src = state.base.url;
  els.basePreview.hidden = false;
  els.baseName.textContent = state.base.name;
  renderFrames(); renderStage(); updateStatus();
}

function interpolationFor(index, count) {
  if (count <= 1) return 0;
  return index / (count - 1);
}

function frameActionFor(index, count) {
  const t = interpolationFor(index, count);
  if (index === 0) return 'Baseline frame. Establish the locked composition, lighting and geometry.';
  if (index === count - 1) return 'Return closely to frame 01 so the loop closes cleanly with no visible jump.';
  if (t < 0.2) return 'Introduce the first subtle movement: a small light, haze, reflection or environmental shift.';
  if (t < 0.4) return 'Build the motion gradually while keeping camera, subject placement and architecture fixed.';
  if (t < 0.6) return 'Reach the peak animation state: strongest flicker, glow, reflection, haze or chosen scene effect.';
  if (t < 0.8) return 'Ease the animation back down with smaller changes than the peak frame.';
  return 'Continue returning toward the baseline state so the final frame can reconnect seamlessly.';
}

function smoothnessRule(count) {
  if (count === 4) return 'Use broad, clearly visible changes. Keep the loop simple and readable.';
  if (count === 8) return 'Use medium-size changes with transition frames for a visibly smoother loop.';
  return 'Use micro-transitions and restrained per-frame movement for the smoothest cinematic loop.';
}

function generateSceneRecipe() {
  const count = targetCount();
  const hold = defaultHold();
  const presetId = els.scenePreset?.value || 'custom';
  const presetDirection = PRESET_DIRECTIONS[presetId] || PRESET_DIRECTIONS.custom;
  const userPrompt = (els.scenePrompt?.value || '').trim();
  const sceneName = (els.sceneName?.value || 'My Game Scene').trim();
  const combinedDirection = userPrompt ? `${presetDirection} User direction: ${userPrompt}` : presetDirection;
  const filePrefix = (sceneName || 'scene').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'scene';

  const frames = Array.from({ length: count }, (_, index) => ({
    index: index + 1,
    file: `${filePrefix}-frame-${String(index + 1).padStart(2, '0')}.png`,
    hold,
    prompt: `${combinedDirection} ${frameActionFor(index, count)} Preserve the same camera angle, crop, perspective, characters, props and major scene geometry as every other frame. Change only details intended to animate.`
  }));

  state.assistRecipe = {
    version: 1,
    tool: 'scene-animator',
    mode: 'frame-plan',
    providerIntent: 'chatgpt-assist-bridge-ready',
    presetId,
    sceneName,
    targetFrames: count,
    loop: els.loopMode.value === 'loop',
    defaultHold: hold,
    scenePrompt: userPrompt,
    presetDirection,
    smoothnessRule: smoothnessRule(count),
    basePrompt: `${combinedDirection} Create the master/base scene first. Lock composition, camera, architecture, subject placement and perspective so all later frames can align exactly.`,
    frames,
    notes: 'Current Scene Animator generates the structured frame recipe and prompt sequence. PNG generation remains a separate/manual Firefly or future provider step until a dedicated generation pipeline is connected.'
  };

  if (els.assistStatus) els.assistStatus.textContent = `PLAN READY • ${count} FRAMES`;
  renderFramePlan();
}

function renderFramePlan() {
  if (!els.framePlan) return;
  els.framePlan.innerHTML = '';
  const recipe = state.assistRecipe;
  if (!recipe) {
    const li = document.createElement('li');
    li.className = 'frame-plan-empty';
    li.textContent = 'Enter a prompt or choose a preset, then generate a scene recipe.';
    els.framePlan.appendChild(li);
    return;
  }
  recipe.frames.forEach((frame) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>FRAME ${String(frame.index).padStart(2, '0')}</b><span>${frame.file}</span><p>${frame.prompt}</p>`;
    els.framePlan.appendChild(li);
  });
}

function recipePromptText() {
  if (!state.assistRecipe) return '';
  return [
    `BASE PROMPT\n${state.assistRecipe.basePrompt}`,
    '',
    ...state.assistRecipe.frames.flatMap((frame) => [`FRAME ${String(frame.index).padStart(2, '0')} — ${frame.file}`, frame.prompt, ''])
  ].join('\n');
}

async function copyFramePrompts() {
  if (!state.assistRecipe) generateSceneRecipe();
  const text = recipePromptText();
  try {
    await navigator.clipboard.writeText(text);
    els.assistStatus.textContent = 'FRAME PROMPTS COPIED';
  } catch {
    const area = document.createElement('textarea');
    area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    els.assistStatus.textContent = 'FRAME PROMPTS COPIED';
  }
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function safeSceneName() {
  return (els.sceneName.value || 'scene').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'scene';
}

function exportRecipe() {
  if (!state.assistRecipe) generateSceneRecipe();
  downloadJson(state.assistRecipe, `${safeSceneName()}-scene-recipe.json`);
  els.assistStatus.textContent = 'RECIPE EXPORTED';
}

function exportManifest() {
  const manifest = {
    version: 3,
    tool: 'scene-animator',
    name: els.sceneName.value.trim() || 'My Game Scene',
    method: 'base-scenery-plus-aligned-still-frames-flipbook',
    targetFrames: targetCount(),
    base: state.base ? { file: state.base.name } : null,
    frames: state.frames.map((frame, index) => ({ order: index + 1, file: frame.name, hold: Number(frame.hold) })),
    loop: els.loopMode.value === 'loop',
    assistRecipe: state.assistRecipe,
    notes: 'Scene Animator supports 4, 8 or 16 aligned frames. Frame count drives both player capacity and the AI/prompt frame-plan recipe. Keep every generated frame the same dimensions and composition; change only details intended to animate.'
  };
  downloadJson(manifest, `${safeSceneName()}-scene.json`);
}

function bindDrop(target, onFiles) {
  ['dragenter','dragover'].forEach((type) => target.addEventListener(type, (e) => { e.preventDefault(); target.classList.add('dragover'); }));
  ['dragleave','drop'].forEach((type) => target.addEventListener(type, (e) => { e.preventDefault(); target.classList.remove('dragover'); }));
  target.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));
}

function showLoadError(error) {
  console.error(error);
  els.sceneStatus.textContent = 'LOAD ERROR';
  els.stageEmpty.hidden = false;
  els.stageEmpty.innerHTML = '<b>SCENE MANIFEST FAILED TO LOAD</b><span>Reload the page or use the manual scene button.</span>';
}

els.baseDrop.addEventListener('click', () => els.baseInput.click());
els.baseInput.addEventListener('change', (e) => e.target.files[0] && setBase(e.target.files[0]));
els.addFramesBtn.addEventListener('click', () => els.framesInput.click());
els.emptyAdd.addEventListener('click', () => els.framesInput.click());
els.framesInput.addEventListener('change', (e) => { addFrames(e.target.files); e.target.value = ''; });
els.clearFramesBtn.addEventListener('click', () => { stopPlayback(); state.frames.forEach(release); state.frames = []; state.current = 0; renderFrames(); renderStage(); updateStatus(); });
els.playBtn.addEventListener('click', togglePlayback);
els.prevBtn.addEventListener('click', () => step(-1));
els.nextBtn.addEventListener('click', () => step(1));
els.exportManifestBtn.addEventListener('click', exportManifest);
els.newSceneBtn.addEventListener('click', resetScene);
els.loadFirstSceneBtn.addEventListener('click', () => loadBundledScene().catch(showLoadError));
els.generateSceneRecipeBtn?.addEventListener('click', generateSceneRecipe);
els.copyFramePromptsBtn?.addEventListener('click', copyFramePrompts);
els.exportRecipeBtn?.addEventListener('click', exportRecipe);
els.frameTarget.addEventListener('change', () => {
  const max = targetCount();
  if (state.frames.length > max) {
    const removed = state.frames.splice(max);
    removed.forEach(release);
    state.current = Math.min(state.current, Math.max(0, state.frames.length - 1));
  }
  if (state.assistRecipe) generateSceneRecipe();
  renderFrames(); renderStage(); updateStatus();
});
els.defaultHold.addEventListener('change', () => {
  if (state.assistRecipe) generateSceneRecipe();
  updateStatus();
});
els.scenePreset?.addEventListener('change', () => { if (state.assistRecipe) generateSceneRecipe(); });

bindDrop(els.baseDrop, (files) => files[0] && setBase(files[0]));
bindDrop(els.framesGrid, (files) => addFrames(files));
renderFrames(); renderStage(); renderFramePlan(); updateStatus();

loadBundledScene().catch(showLoadError);
