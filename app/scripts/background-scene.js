const stages = document.querySelectorAll('[data-scene-manifest]');

for (const stage of stages) initBackgroundScene(stage);

async function initBackgroundScene(stage) {
  const manifestUrl = stage.dataset.sceneManifest;
  if (!manifestUrl) return;

  const base = stage.querySelector('[data-scene-base]');
  const frame = stage.querySelector('[data-scene-frame]');
  const status = stage.querySelector('[data-scene-status]');
  if (!base || !frame) return;

  let timer = null;
  let index = 0;
  let frames = [];
  let reduceMotion = false;

  const setStatus = text => {
    if (status) status.textContent = text;
  };

  const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Scene image failed: ${src}`));
    img.src = src;
  });

  const show = () => {
    const current = frames[index];
    if (!current) return;
    frame.src = current.src;
    frame.classList.add('is-visible');
    stage.dataset.sceneFrame = String(index + 1);
    setStatus(`${stage.dataset.sceneName || 'SCENE'} • FRAME ${index + 1}/${frames.length}`);
  };

  const scheduleNext = () => {
    if (document.hidden || reduceMotion || !frames.length) return;
    const hold = frames[index].hold;
    timer = window.setTimeout(() => {
      index = (index + 1) % frames.length;
      show();
      scheduleNext();
    }, hold);
  };

  try {
    const response = await fetch(manifestUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Scene manifest failed: ${response.status}`);
    const manifest = await response.json();
    const root = new URL('.', new URL(manifestUrl, window.location.href));

    stage.dataset.sceneName = manifest.name || 'SCENE';
    const baseSrc = new URL(manifest.base.file, root).href;
    frames = [...(manifest.frames || [])]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        src: new URL(item.file, root).href,
        hold: Math.max(40, Number(item.hold || 140))
      }));

    setStatus('LOADING FIRST RETROWAVE SCENE…');
    await Promise.all([loadImage(baseSrc), ...frames.map(item => loadImage(item.src))]);

    base.src = baseSrc;

    if (!frames.length) {
      setStatus('STATIC SCENE');
      return;
    }

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    show();
    if (!reduceMotion) scheduleNext();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = null;
        return;
      }
      if (!reduceMotion && !timer) scheduleNext();
    });
  } catch (error) {
    console.error('Background scene failed to load', error);
    setStatus('SCENE LOAD ERROR');
  }
}
