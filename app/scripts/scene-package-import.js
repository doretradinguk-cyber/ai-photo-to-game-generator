const qs = (selector) => document.querySelector(selector);

const IMAGE_RE = /\.(png|jpe?g|webp|svg)$/i;
const FRAME_RE = /(?:^|\/)(?:scene[-_ ]?)?frame[-_ ]?(\d+)/i;
const BASE_RE = /(?:^|\/)(?:base(?:[-_ ]?scene)?|background|still)\.(png|jpe?g|webp|svg)$/i;

const els = {
  drop: qs('#scenePackageDrop'),
  zipBtn: qs('#chooseSceneZipBtn'),
  zipInput: qs('#sceneZipInput'),
  folderBtn: qs('#chooseSceneFolderBtn'),
  folderInput: qs('#sceneFolderInput'),
  framesBtn: qs('#chooseSceneFramesBtn'),
  framesInput: qs('#scenePackageFramesInput'),
  stillBtn: qs('#chooseStillBackgroundBtn'),
  status: qs('#sceneImportStatus'),
  newSceneBtn: qs('#newSceneBtn'),
  baseInput: qs('#baseInput'),
  sceneFramesInput: qs('#framesInput'),
  frameTarget: qs('#frameTarget'),
  sceneName: qs('#sceneName'),
  defaultHold: qs('#defaultHold'),
  loopMode: qs('#loopMode'),
  playBtn: qs('#playBtn'),
  promptConsole: qs('.assist-panel')
};

function setStatus(message, tone = 'normal') {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.dataset.tone = tone;
}

function stripPath(name = '') {
  return name.replace(/\\/g, '/').split('/').filter(Boolean).pop() || name;
}

function cleanSceneName(value = '') {
  return stripPath(value)
    .replace(/\.zip$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Imported Scene';
}

function frameNumber(name = '') {
  const match = name.replace(/\\/g, '/').match(FRAME_RE);
  return match ? Number(match[1]) : null;
}

function naturalSortFiles(files) {
  return [...files].sort((a, b) => {
    const an = frameNumber(a.relativePath || a.webkitRelativePath || a.name);
    const bn = frameNumber(b.relativePath || b.webkitRelativePath || b.name);
    if (an !== null && bn !== null && an !== bn) return an - bn;
    if (an !== null && bn === null) return -1;
    if (an === null && bn !== null) return 1;
    return (a.relativePath || a.webkitRelativePath || a.name).localeCompare(
      b.relativePath || b.webkitRelativePath || b.name,
      undefined,
      { numeric: true, sensitivity: 'base' }
    );
  });
}

function setTargetFromCount(count) {
  let target = 4;
  if (count >= 16) target = 16;
  else if (count >= 8) target = 8;
  else target = 4;
  if (els.frameTarget) {
    els.frameTarget.value = String(target);
    els.frameTarget.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return target;
}

function dispatchSingleFile(input, file) {
  if (!input || !file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function dispatchManyFiles(input, files) {
  if (!input || !files.length) return;
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function resetForPackage() {
  els.newSceneBtn?.click();
}

function applyManifestSettings(manifest, fallbackName, frameCount) {
  if (els.sceneName) els.sceneName.value = manifest?.name || fallbackName || 'Imported Scene';

  const requestedTarget = Number(manifest?.targetFrames || frameCount || 4);
  const supportedTarget = requestedTarget >= 16 ? 16 : requestedTarget >= 8 ? 8 : 4;
  if (els.frameTarget) {
    els.frameTarget.value = String(supportedTarget);
    els.frameTarget.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const hold = Number(manifest?.defaultHold || manifest?.frames?.[0]?.hold || 180);
  if (els.defaultHold && Number.isFinite(hold)) {
    els.defaultHold.value = String(Math.max(40, hold));
    els.defaultHold.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (els.loopMode && typeof manifest?.loop === 'boolean') {
    els.loopMode.value = manifest.loop ? 'loop' : 'once';
  }
}

function lookupFile(files, requestedPath) {
  if (!requestedPath) return null;
  const wanted = requestedPath.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
  const wantedBase = stripPath(wanted).toLowerCase();
  return files.find((file) => {
    const rel = (file.relativePath || file.webkitRelativePath || file.name).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
    return rel === wanted || stripPath(rel).toLowerCase() === wantedBase;
  }) || null;
}

function findBaseFile(files, manifest) {
  const manifestBase = lookupFile(files, manifest?.base?.file || manifest?.base);
  if (manifestBase) return manifestBase;
  return files.find((file) => BASE_RE.test((file.relativePath || file.webkitRelativePath || file.name).replace(/\\/g, '/'))) || null;
}

function findFrameFiles(files, manifest, baseFile) {
  const images = files.filter((file) => IMAGE_RE.test(file.name) && file !== baseFile);

  if (Array.isArray(manifest?.frames) && manifest.frames.length) {
    const ordered = manifest.frames
      .map((entry) => lookupFile(images, typeof entry === 'string' ? entry : entry?.file))
      .filter(Boolean);
    if (ordered.length) return ordered;
  }

  const numbered = images.filter((file) => frameNumber(file.relativePath || file.webkitRelativePath || file.name) !== null);
  return naturalSortFiles(numbered.length ? numbered : images);
}

function startPreviewWhenReady(frameCount) {
  if (!frameCount) return;
  window.setTimeout(() => {
    if (els.playBtn && /PLAY/i.test(els.playBtn.textContent || '')) els.playBtn.click();
  }, 120);
}

async function importPreparedFiles(files, options = {}) {
  const allFiles = [...files].filter((file) => file && !file.name.startsWith('.'));
  if (!allFiles.length) {
    setStatus('NO SCENE FILES FOUND', 'error');
    return;
  }

  resetForPackage();

  let manifest = options.manifest || null;
  const manifestFile = allFiles.find((file) => /(?:^|\/)scene\.json$/i.test(file.relativePath || file.webkitRelativePath || file.name));
  if (!manifest && manifestFile) {
    try {
      manifest = JSON.parse(await manifestFile.text());
    } catch (error) {
      console.warn('Scene manifest could not be parsed; falling back to file detection.', error);
      setStatus('SCENE.JSON FOUND BUT INVALID — USING FRAME DETECTION', 'warning');
    }
  }

  const baseFile = findBaseFile(allFiles, manifest);
  let frames = findFrameFiles(allFiles, manifest, baseFile);

  if (frames.length > 16) frames = frames.slice(0, 16);
  const packageName = options.packageName || allFiles[0]?.webkitRelativePath?.split('/')[0] || 'Imported Scene';

  if (!baseFile && !frames.length) {
    setStatus('NO SUPPORTED SCENE IMAGES FOUND', 'error');
    return;
  }

  applyManifestSettings(manifest, cleanSceneName(packageName), frames.length);
  if (!manifest) setTargetFromCount(frames.length || 4);

  if (baseFile) dispatchSingleFile(els.baseInput, baseFile);
  if (frames.length) dispatchManyFiles(els.sceneFramesInput, frames);

  const pieces = [];
  if (baseFile) pieces.push('BASE LOADED');
  if (frames.length) pieces.push(`${frames.length} FRAMES LOADED`);
  if (manifestFile || manifest) pieces.push('SCENE.JSON APPLIED');
  if (!baseFile && frames.length) pieces.push('FRAME-SEQUENCE MODE');

  setStatus(pieces.join(' • '), 'success');
  startPreviewWhenReady(frames.length);
}

async function importZip(file) {
  if (!file) return;
  if (!window.JSZip) {
    setStatus('ZIP ENGINE FAILED TO LOAD — CHECK CONNECTION AND REFRESH', 'error');
    return;
  }

  setStatus(`OPENING ${file.name.toUpperCase()}…`);
  try {
    const zip = await window.JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir && !/(?:^|\/)__MACOSX\//i.test(entry.name));
    const files = [];
    let manifest = null;

    for (const entry of entries) {
      if (/scene\.json$/i.test(entry.name)) {
        try {
          manifest = JSON.parse(await entry.async('text'));
        } catch (error) {
          console.warn('Invalid scene.json in ZIP', error);
        }
        continue;
      }
      if (!IMAGE_RE.test(entry.name)) continue;
      const blob = await entry.async('blob');
      const fileObj = new File([blob], stripPath(entry.name), { type: blob.type || 'application/octet-stream' });
      Object.defineProperty(fileObj, 'relativePath', { value: entry.name, configurable: true });
      files.push(fileObj);
    }

    if (!files.length) throw new Error('No supported scene images found in ZIP');
    await importPreparedFiles(files, { manifest, packageName: file.name });
  } catch (error) {
    console.error(error);
    setStatus(`ZIP IMPORT FAILED • ${error.message}`, 'error');
  }
}

async function handleSelection(files) {
  const list = [...files];
  if (!list.length) return;
  if (list.length === 1 && /\.zip$/i.test(list[0].name)) {
    await importZip(list[0]);
    return;
  }
  await importPreparedFiles(list, { packageName: list[0]?.webkitRelativePath?.split('/')[0] || 'Imported Scene' });
}

els.zipBtn?.addEventListener('click', () => els.zipInput?.click());
els.folderBtn?.addEventListener('click', () => els.folderInput?.click());
els.framesBtn?.addEventListener('click', () => els.framesInput?.click());
els.stillBtn?.addEventListener('click', () => {
  els.baseInput?.click();
  setStatus('CREATE MODE • CHOOSE ONE STILL BACKGROUND');
});

els.zipInput?.addEventListener('change', async (event) => {
  await handleSelection(event.target.files);
  event.target.value = '';
});
els.folderInput?.addEventListener('change', async (event) => {
  await handleSelection(event.target.files);
  event.target.value = '';
});
els.framesInput?.addEventListener('change', async (event) => {
  await handleSelection(event.target.files);
  event.target.value = '';
});

if (els.drop) {
  ['dragenter', 'dragover'].forEach((type) => els.drop.addEventListener(type, (event) => {
    event.preventDefault();
    els.drop.classList.add('dragover');
    setStatus('DROP TO LOAD SCENE');
  }));
  ['dragleave', 'dragend'].forEach((type) => els.drop.addEventListener(type, (event) => {
    event.preventDefault();
    els.drop.classList.remove('dragover');
  }));
  els.drop.addEventListener('drop', async (event) => {
    event.preventDefault();
    els.drop.classList.remove('dragover');
    await handleSelection(event.dataTransfer.files);
  });
  els.drop.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    els.zipInput?.click();
  });
}

els.baseInput?.addEventListener('change', () => {
  if (!els.baseInput.files?.length) return;
  setStatus('STILL BACKGROUND LOADED • ADD PROMPT + PRESET + 4/8/16, THEN GENERATE SCENE', 'success');
  window.setTimeout(() => els.promptConsole?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
});
