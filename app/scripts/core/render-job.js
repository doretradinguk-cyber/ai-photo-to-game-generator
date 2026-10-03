import { getPreset } from './presets.js';

export function createRenderJob(state, output = {}) {
  if (!state.sourceFile || !state.sourceBitmap) throw new Error('Load a source image before rendering.');
  const preset = getPreset(state.activePresetId);
  const controls = Object.fromEntries(Object.entries(state.controls).map(([key, value]) => [key, Math.max(0, Math.min(100, Number(value)))]));

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    adapter: output.adapter || 'browser-preview',
    source: {
      name: state.sourceFile.name,
      type: state.sourceFile.type,
      sizeBytes: state.sourceFile.size,
      width: state.sourceBitmap.width,
      height: state.sourceBitmap.height
    },
    preset: {
      id: preset.id,
      name: preset.name
    },
    controls,
    analysis: state.analysis || {},
    fidelity: {
      sourceIsAuthoritative: true,
      preserveSubjectCount: true,
      preservePose: true,
      preserveComposition: true,
      preserveAccessories: true,
      preserveClothing: true,
      allowControlledAbstraction: true,
      forbidIndependentRedesign: true
    },
    output: {
      format: output.format || 'png',
      scale: Number(output.scale || 1),
      cleanMaster: true,
      presentationFxOptional: true
    }
  };
}
