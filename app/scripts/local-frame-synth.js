const qs = (selector) => document.querySelector(selector);

const PRESET_PROFILES = {
  'adobe-neon-noir': { brightness: 1.0, contrast: 1.16, saturation: 1.22, hue: -2, tintA: [20, 255, 185], tintB: [255, 34, 190], tintStrength: 0.095 },
  'retrowave-pale-blue': { brightness: 1.02, contrast: 1.10, saturation: 1.18, hue: 4, tintA: [68, 238, 255], tintB: [255, 48, 215], tintStrength: 0.085 },
  'crimson-minimum': { brightness: 0.98, contrast: 1.20, saturation: 1.08, hue: -8, tintA: [255, 32, 74], tintB: [80, 0, 22], tintStrength: 0.11 },
  emerald: { brightness: 0.99, contrast: 1.14, saturation: 1.15, hue: -4, tintA: [42, 255, 145], tintB: [0, 106, 78], tintStrength: 0.095 },
  'noir-ink': { brightness: 0.98, contrast: 1.28, saturation: 0.16, hue: 0, tintA: [225, 242, 255], tintB: [18, 25, 42], tintStrength: 0.035 },
  'neon-comic': { brightness: 1.02, contrast: 1.18, saturation: 1.34, hue: 6, tintA: [36, 232, 255], tintB: [255, 28, 202], tintStrength: 0.11 },
  custom: { brightness: 1.0, contrast: 1.08, saturation: 1.08, hue: 0, tintA: [75, 225, 255], tintB: [255, 72, 206], tintStrength: 0.065 }
};

let generatedFiles = [];

function cleanName(value) {
  return (value || 'scene').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'scene';
}

function detectMotion(prompt) {
  const text = (prompt || '').toLowerCase();
  return {
    rain: /rain|storm|drizzle|wet/.test(text),
    haze: /haze|fog|smoke|mist|steam/.test(text),
    flicker: /flicker|blink|pulse|light/.test(text),
    reflections: /reflect|reflection|wet floor|neon/.test(text),
    shadow: /shadow|silhouette|darkness/.test(text),
    scanlines: /retro|vhs|scanline|crt/.test(text)
  };
}

function drawTint(ctx, width, height, rgb, alpha, x0, y0, x1, y1) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawRain(ctx, width, height, frameIndex, count, strength) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = `rgba(165,225,255,${0.07 + strength * 0.07})`;
  ctx.lineWidth = Math.max(1, width / 1400);
  const offset = (frameIndex / count) * height * 0.45;
  const drops = Math.max(36, Math.floor(width / 24));
  for (let i = 0; i < drops; i += 1) {
    const seed = (i * 1103515245 + 12345) >>> 0;
    const x = (seed % 10000) / 10000 * width;
    const baseY = (((seed >>> 8) % 10000) / 10000) * height;
    const y = (baseY + offset) % (height + 80) - 40;
    const len = 10 + ((seed >>> 16) % 26);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * 0.28, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHaze(ctx, width, height, phase, strength) {
  const y = height * (0.48 + 0.08 * Math.sin(phase));
  const gradient = ctx.createRadialGradient(width * 0.5, y, 0, width * 0.5, y, width * 0.72);
  gradient.addColorStop(0, `rgba(190,225,255,${0.035 + 0.05 * strength})`);
  gradient.addColorStop(0.55, `rgba(115,105,180,${0.02 + 0.03 * strength})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawReflections(ctx, width, height, phase, profile, strength) {
  const alpha = profile.tintStrength * (0.45 + 0.35 * Math.sin(phase + Math.PI / 3)) * strength;
  const gradient = ctx.createLinearGradient(0, height * 0.58, width, height);
  gradient.addColorStop(0, `rgba(${profile.tintA.join(',')},0)`);
  gradient.addColorStop(0.55, `rgba(${profile.tintA.join(',')},${Math.max(0, alpha)})`);
  gradient.addColorStop(1, `rgba(${profile.tintB.join(',')},${Math.max(0, alpha * 0.75)})`);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);
  ctx.restore();
}

function drawScanlines(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#00111a';
  const step = Math.max(3, Math.round(height / 260));
  for (let y = 0; y < height; y += step * 2) ctx.fillRect(0, y, width, step);
  ctx.restore();
}

async function sourceBitmap(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Could not read base scene (${response.status})`);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png');
  });
}

async function renderFrame(bitmap, index, count, presetId, prompt) {
  const profile = PRESET_PROFILES[presetId] || PRESET_PROFILES.custom;
  const motion = detectMotion(prompt);
  const phase = (index / count) * Math.PI * 2;
  const pulse = Math.sin(phase);
  const softPulse = (1 + pulse) / 2;
  const intensity = count === 4 ? 1 : count === 8 ? 0.72 : 0.5;

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { alpha: false });

  const brightnessWave = motion.flicker ? pulse * 0.045 * intensity : pulse * 0.018 * intensity;
  const saturationWave = softPulse * 0.08 * intensity;
  const hueWave = pulse * 2.5 * intensity;
  ctx.filter = `brightness(${profile.brightness + brightnessWave}) contrast(${profile.contrast}) saturate(${profile.saturation + saturationWave}) hue-rotate(${profile.hue + hueWave}deg)`;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';

  const tintPulse = profile.tintStrength * (0.72 + softPulse * 0.55) * intensity;
  drawTint(ctx, canvas.width, canvas.height, profile.tintA, tintPulse, 0, 0, canvas.width, canvas.height);
  drawTint(ctx, canvas.width, canvas.height, profile.tintB, tintPulse * 0.8, canvas.width, 0, 0, canvas.height);

  if (motion.reflections || presetId.includes('neon') || presetId.includes('retrowave')) drawReflections(ctx, canvas.width, canvas.height, phase, profile, intensity);
  if (motion.haze) drawHaze(ctx, canvas.width, canvas.height, phase, intensity);
  if (motion.rain) drawRain(ctx, canvas.width, canvas.height, index, count, intensity);
  if (motion.shadow) {
    ctx.save();
    ctx.globalAlpha = 0.025 + softPulse * 0.025 * intensity;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  if (motion.scanlines) drawScanlines(ctx, canvas.width, canvas.height);

  return canvasBlob(canvas);
}

function dispatchFiles(files) {
  const input = qs('#framesInput');
  if (!input) throw new Error('Scene frame input is unavailable');
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function setStatus(text, tone = 'normal') {
  const status = qs('#localSynthStatus');
  if (!status) return;
  status.textContent = text;
  status.dataset.tone = tone;
}

async function generateLocalFrames() {
  const base = qs('#basePreview');
  if (!base || base.hidden || !base.src) {
    setStatus('UPLOAD A BASE SCENE FIRST', 'error');
    return;
  }

  const target = Math.max(4, Number(qs('#frameTarget')?.value || 4));
  const presetId = qs('#scenePreset')?.value || 'custom';
  const prompt = qs('#scenePrompt')?.value || '';
  const sceneName = cleanName(qs('#sceneName')?.value || 'scene');
  const recipeButton = qs('#generateSceneRecipeBtn');
  if (recipeButton) recipeButton.click();

  const generateButton = qs('#generateLocalFramesBtn');
  const downloadButton = qs('#downloadLocalFramesBtn');
  if (generateButton) generateButton.disabled = true;
  if (downloadButton) downloadButton.disabled = true;
  setStatus(`BUILDING ${target} PNG FRAMES…`);

  try {
    const bitmap = await sourceBitmap(base.src);
    const files = [];
    for (let index = 0; index < target; index += 1) {
      setStatus(`RENDERING FRAME ${index + 1} / ${target}`);
      const blob = await renderFrame(bitmap, index, target, presetId, prompt);
      files.push(new File([blob], `${sceneName}-frame-${String(index + 1).padStart(2, '0')}.png`, { type: 'image/png' }));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    bitmap.close?.();
    generatedFiles = files;
    qs('#clearFramesBtn')?.click();
    dispatchFiles(files);
    if (downloadButton) downloadButton.disabled = false;
    setStatus(`${target} PNG FRAMES READY • LOCAL FRAME SYNTH`, 'success');
  } catch (error) {
    console.error(error);
    setStatus(`FRAME SYNTH ERROR • ${error.message}`, 'error');
  } finally {
    if (generateButton) generateButton.disabled = false;
  }
}

async function downloadGeneratedFrames() {
  if (!generatedFiles.length) {
    setStatus('GENERATE FRAMES FIRST', 'error');
    return;
  }
  setStatus(`DOWNLOADING ${generatedFiles.length} PNG FILES…`);
  for (const file of generatedFiles) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    await new Promise((resolve) => setTimeout(resolve, 90));
  }
  setStatus(`${generatedFiles.length} PNG FILES SENT TO DOWNLOADS`, 'success');
}

qs('#generateLocalFramesBtn')?.addEventListener('click', generateLocalFrames);
qs('#downloadLocalFramesBtn')?.addEventListener('click', downloadGeneratedFrames);
qs('#frameTarget')?.addEventListener('change', () => {
  generatedFiles = [];
  const downloadButton = qs('#downloadLocalFramesBtn');
  if (downloadButton) downloadButton.disabled = true;
  setStatus('READY • FRAME COUNT UPDATED');
});
qs('#baseInput')?.addEventListener('change', () => {
  generatedFiles = [];
  const downloadButton = qs('#downloadLocalFramesBtn');
  if (downloadButton) downloadButton.disabled = true;
  setStatus('READY • BASE SCENE LOADED');
});
