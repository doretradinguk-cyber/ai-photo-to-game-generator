import { getPreset } from '../core/presets.js';

export const browserPreviewAdapter = {
  id: 'browser-preview',
  name: 'Browser Preview',
  async health() {
    return { ok: true, mode: 'local-browser', capabilities: ['still-image', 'preview', 'export'] };
  },
  async render({ bitmap, job, canvas }) {
    if (!bitmap || !canvas) throw new Error('Browser preview adapter requires a source bitmap and canvas.');

    const preset = getPreset(job.preset.id);
    const c = job.controls;
    const max = 1800;
    const scale = Math.min(1, max / bitmap.width) * Math.max(0.25, Number(job.output.scale || 1));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const style = c.styleStrength / 100;
    const contrast = preset.render.contrast + (c.contrast / 100) * 0.35;
    const saturation = Math.max(0, preset.render.saturation + style * 0.75);
    const hueShift = preset.render.hue * style;

    ctx.filter = `contrast(${contrast}) saturate(${saturation}) hue-rotate(${hueShift}deg)`;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    const detail = c.detail / 100;
    const edge = c.edgeClean / 100;
    const glow = c.glow / 100;
    const background = c.backgroundBlend / 100;
    const skinLock = c.skinToneLock / 100;
    const levels = Math.max(4, Math.round(preset.render.posterLevels + detail * 7));
    const quant = 255 / levels;

    for (let i = 0; i < data.length; i += 4) {
      const sr = data[i], sg = data[i + 1], sb = data[i + 2];
      const lum = sr * 0.299 + sg * 0.587 + sb * 0.114;
      let r = Math.round(sr / quant) * quant;
      let g = Math.round(sg / quant) * quant;
      let b = Math.round(sb / quant) * quant;

      const shadowThreshold = 58 + edge * 48;
      if (lum < shadowThreshold) {
        const ink = 24 + 62 * edge * preset.render.ink;
        r -= ink; g -= ink; b -= ink;
      }

      // Mild source-colour recovery acts as a stand-in for future protected skin/identity regions.
      r = r * (1 - skinLock * 0.12) + sr * (skinLock * 0.12);
      g = g * (1 - skinLock * 0.12) + sg * (skinLock * 0.12);
      b = b * (1 - skinLock * 0.12) + sb * (skinLock * 0.12);

      data[i] = Math.max(0, Math.min(255, r + glow * 16));
      data[i + 1] = Math.max(0, Math.min(255, g + glow * 24 + background * 2));
      data[i + 2] = Math.max(0, Math.min(255, b + glow * 34 + background * 8));
    }

    ctx.putImageData(image, 0, 0);

    if (preset.render.cyanWash || preset.render.magentaWash) {
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, `rgba(0,235,255,${preset.render.cyanWash * style})`);
      grad.addColorStop(0.55, 'rgba(90,25,255,0.04)');
      grad.addColorStop(1, `rgba(255,0,180,${preset.render.magentaWash * style})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }

    return {
      adapter: this.id,
      width: canvas.width,
      height: canvas.height,
      fidelityMode: 'source-preserving-preview',
      warning: 'This is the deterministic browser preview, not the future controlled AI illustration bridge.'
    };
  }
};
