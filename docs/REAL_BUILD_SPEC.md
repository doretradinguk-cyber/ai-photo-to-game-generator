# REAL BUILD SPEC — AI RADIO RENDER CONSOLE

## Purpose

Build the real production-shaped version of the approved first UI concept. This document turns the visual concept into implementable behaviour.

## Product principle

One screen, one obvious flow, minimal friction:

**drop image -> choose preset -> tune -> render -> compare -> export**

Advanced pipeline details stay internal.

## Application state

The browser app should maintain one serialisable state object:

```js
{
  source: {
    file: null,
    objectUrl: null,
    name: null,
    width: 0,
    height: 0,
    mime: null
  },
  presetId: "retrowave-pale-blue",
  controls: {
    styleStrength: 70,
    detail: 65,
    contrast: 80,
    glow: 55,
    edgeClean: 60,
    skinToneLock: 75,
    backgroundBlend: 40
  },
  analysis: null,
  render: {
    adapterId: "browser-preview",
    status: "idle",
    progress: 0,
    outputUrl: null,
    error: null
  }
}
```

All UI controls read/write this state.

## Render state machine

Allowed states:

- `idle`
- `source-ready`
- `analysing`
- `ready-to-render`
- `rendering`
- `rendered`
- `error`

Do not infer state from button styling. Keep it explicit.

## Preset system

Presets are JSON objects with:

- id
- name
- description
- thumbnail/preview metadata later
- default control values
- browser-preview render recipe
- optional provider hints

Preset switching updates control defaults only when the user has not explicitly chosen to preserve manual adjustments. Initial implementation can reset controls on preset change.

## Browser-preview adapter

Purpose:
- prove UI behaviour;
- provide immediate offline fallback;
- provide deterministic test output;
- not pretend to be the final AI renderer.

It may use Canvas 2D operations such as:
- contrast/saturation/brightness;
- posterisation;
- palette mapping;
- luminance bands;
- edge extraction / overlay;
- glow/bloom approximations;
- selective background tinting;
- split-preservation treatment for skin/source tones.

It must return an output canvas/blob through the same adapter interface future AI adapters use.

## Adapter contract

Each render adapter exports:

```js
{
  id,
  label,
  async health(),
  async capabilities(),
  async render({ image, job, onProgress, signal })
}
```

`render()` returns:

```js
{
  blob,
  width,
  height,
  metadata
}
```

The app controller does not care how the adapter produced the result.

## Analysis service contract

Initial analysis can be local/simple:
- dimensions;
- aspect ratio;
- average/dominant colours;
- simple luminance histogram;
- optional face-detection hooks later;
- optional subject masks later.

Analysis object:

```json
{
  "version": 1,
  "width": 0,
  "height": 0,
  "aspect": 1,
  "dominantColours": [],
  "faces": [],
  "subjects": [],
  "controlMaps": {}
}
```

## AI Assist contract

AI Assist consumes:
- current preset;
- current controls;
- analysis manifest;
- optional small preview image if provider supports it.

It returns preset-schema-compatible JSON only.

The UI must show:
- generating state;
- validation failure;
- apply/save actions when generated successfully.

## Compare behaviour

Initial compare modes:
1. side-by-side (default screen);
2. press/hold or button toggle to temporarily show source in render pane;
3. later draggable wipe slider.

## Export behaviour

Export source is always the render output blob/canvas.

Never screenshot the UI.

Export filename pattern:

`<source-base>-<preset-id>-render.<ext>`

Example:

`airport-family-retrowave-pale-blue-render.png`

## History

Initial version may store in `localStorage`:
- last selected preset;
- control values;
- up to 20 lightweight render metadata entries, not full source files.

Do not persist original photos without explicit user action.

## Error handling

User-facing errors should be concise and recoverable:
- unsupported file type;
- image too large for current browser mode;
- render failed;
- local bridge unavailable;
- AI preset invalid;
- export failed.

Never leave the render panel indefinitely spinning.

## Accessibility

- keyboard reachable sliders/buttons;
- visible focus states;
- labels associated with controls;
- status changes reflected in text, not only colour;
- reduced-motion CSS support.

## Responsive target

Primary target: desktop 1440px+.

Secondary: 1024–1439px with right rail stacking under preview if needed.

Mobile is not a first release target.

## File organisation target

```text
app/
  index.html
  styles/
    tokens.css
    layout.css
    components.css
    effects.css
  scripts/
    app.js
    state.js
    controller.js
    ui/
      controls.js
      drop-zone.js
      presets.js
      preview.js
      workflow.js
      export.js
    services/
      analysis.js
      preset-store.js
      history-store.js
    adapters/
      registry.js
      browser-preview.js
      local-http.js
      remote-http.js
engine/
  contracts/
    render-job.schema.json
    preset.schema.json
    analysis.schema.json
  presets/
    retrowave-pale-blue.json
    noir-ink.json
    neon-comic.json
    soft-portrait.json
    clean-vector.json
plugin/
  browser-extension/
  desktop-bridge/
```

## First real milestone

Milestone M1 is complete when the browser app:
- visually resembles the approved first concept;
- loads a real image;
- exposes all seven controls;
- supports five built-in presets + custom slot;
- creates a deterministic rendered image in-browser;
- compares and exports it;
- uses the adapter/state architecture instead of one monolithic script.
