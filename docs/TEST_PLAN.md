# TEST PLAN — AI RADIO RENDER CONSOLE

## M1 browser-console acceptance

### Load
- GitHub Pages route loads without 404.
- No uncaught console errors.
- Main console fits desktop viewport without layout collapse.

### Upload
- Click-to-browse accepts PNG/JPEG/WebP.
- Drag/drop accepts valid image.
- Invalid file shows recoverable error.
- Filename and pixel dimensions update.
- Original aspect ratio is preserved.

### Controls
For each control, verify keyboard and pointer operation:
- Style Strength
- Detail
- Contrast
- Glow
- Edge Clean
- Skin Tone Lock
- Background Blend

Reset restores current preset defaults.

### Presets
Verify:
- Retrowave Pale Blue
- Noir Ink
- Neon Comic
- Soft Portrait
- Clean Vector
- Custom AI Preset slot

Built-in preset selection updates active label, selected card and state.

### Render
- Render disabled or guarded until source exists.
- Browser-preview adapter reports progress.
- Render completes and displays output.
- Re-render replaces old object URL safely.
- Adapter exception transitions to error state and leaves app usable.

### Compare
- Source remains visible.
- Compare button temporarily displays source in render area or activates comparison mode.
- Returning from compare restores rendered output.

### Export
- PNG output downloads/opens as a valid rendered image.
- JPEG output works when selected.
- Filename uses source base + preset id.
- Export contains artwork only, no application chrome.

### Persistence
- Refresh may retain last preset/control settings.
- Original uploaded photo is NOT persisted automatically.

### Accessibility
- Tab order reaches upload, controls, presets, render, export.
- Focus is visible.
- Status text announces idle/rendering/rendered/error visually.
- Reduced-motion preference removes nonessential animation.

## Adapter contract tests

Every adapter must satisfy:

- `health()` resolves to structured status.
- `capabilities()` resolves to structured capability data.
- `render()` accepts image + RenderJob.
- progress callback values remain 0..1.
- cancellation signal is respected where technically possible.
- successful output includes Blob, width, height, metadata.
- errors are thrown with a user-safe message/code.

## RenderJob validation

Reject jobs when:
- version unsupported;
- unknown preset id without custom preset payload;
- control outside 0..100;
- missing output format;
- missing source dimensions;
- malformed analysis object.

## Local bridge tests (future M2)

- bridge offline -> browser mode continues;
- `/health` detects bridge;
- `/capabilities` populates available engines;
- render uploads source bytes + job;
- polling/event flow reaches terminal state;
- result is validated before display;
- failure allows retry/fallback;
- localhost security/pairing behaviour is documented.

## AI Assist tests (future M3)

- assistant cannot directly mutate app state before validation;
- malformed JSON rejected;
- unknown fields tolerated/stripped according to schema policy;
- controls clamped/rejected outside bounds;
- generated preset can be previewed/applied/saved;
- secrets absent from client bundle/repo.

## Visual regression checkpoints

Capture screenshots at:
- empty/ready console;
- image loaded;
- Retrowave Pale Blue render;
- Noir Ink render;
- 1024px layout;
- error state.

Compare against approved first concept for:
- panel hierarchy;
- large central visual area;
- cyan/magenta neon balance;
- readable typography;
- uncluttered left slider rail;
- obvious Render Now / AI Assist actions;
- preset cards clearly visible.
