export async function analyseSource(file, bitmap) {
  if (!file || !bitmap) throw new Error('A valid source image is required.');

  const aspect = bitmap.width / bitmap.height;
  const orientation = Math.abs(aspect - 1) < 0.08 ? 'square' : aspect > 1 ? 'landscape' : 'portrait';

  return {
    version: 1,
    source: {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
      width: bitmap.width,
      height: bitmap.height,
      aspect,
      orientation
    },
    capabilities: {
      subjectMask: false,
      faceBoxes: false,
      poseHints: false,
      depth: false,
      colourAnchors: true
    },
    fidelityRules: {
      preserveSubjectCount: true,
      preservePose: true,
      preserveComposition: true,
      preserveAccessories: true,
      preserveGarmentBoundaries: true
    },
    notes: ['Browser analysis fallback active. Advanced structural detection can be supplied by a local or remote adapter later.']
  };
}
