const stages = document.querySelectorAll('[data-scene-manifest]');

for (const stage of stages) initBackgroundScene(stage);

async function initBackgroundScene(stage) {
  const manifestUrl = stage.dataset.sceneManifest;
  if (!manifestUrl) return;

  try {
    const response = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Scene manifest failed: ${response.status}`);
    const manifest = await response.json();
    const root = new URL('.', new URL(manifestUrl, window.location.href));

    const base = stage.querySelector('[data-scene-base]');
    const frame = stage.querySelector('[data-scene-frame]');
    const status = stage.querySelector('[data-scene-status]');

    if (!base || !frame) return;

    base.src = new URL(manifest.base.file, root).href;

    const frames = [...(manifest.frames || [])]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        src: new URL(item.file, root).href,
        hold: Math.max(40, Number(item.hold || 140))
      }));

    for (const item of frames) {
      const img = new Image();
      img.src = item.src;
    }

    if (!frames.length) {
      if (status) status.textContent = 'STATIC SCENE';
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;

    const show = () => {
      frame.classList.remove('is-visible');
      frame.src = frames[index].src;
      requestAnimationFrame(() => frame.classList.add('is-visible'));
      if (status) status.textContent = `${manifest.name || 'SCENE'} • FRAME ${index + 1}/${frames.length}`;
    };

    const tick = () => {
      if (document.hidden || reduceMotion) return;
      show();
      timer = window.setTimeout(() => {
        index = (index + 1) % frames.length;
        tick();
      }, frames[index].hold);
    };

    if (reduceMotion) {
      show();
      return;
    }

    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && timer) {
        clearTimeout(timer);
        timer = null;
      } else if (!document.hidden && !timer) {
        tick();
      }
    });
  } catch (error) {
    console.error('Background scene failed to load', error);
    const status = stage.querySelector('[data-scene-status]');
    if (status) status.textContent = 'SCENE LOAD ERROR';
  }
}
