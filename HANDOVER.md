# AI PHOTO-TO-GAME GENERATOR — HANDOVER

## READ THIS FIRST

Repository lock: **ONLY work in `doretradinguk-cyber/ai-photo-to-game-generator`.**

Do not move implementation back into any older `photo-to-game` repository. Older repositories are reference material only.

## PRODUCT DIRECTION

This project is the simpler, faster, out-of-the-box successor to the earlier Photo-to-Game experiments.

The approved UI direction is the **FIRST AI RADIO RENDER CONSOLE concept**: a futuristic digital radio / video-comms console with a dark navy/black shell, electric cyan, blue, purple and magenta accents, crisp segmented panels, glowing controls, scanline/comms details and a large central source/render screen.

The later airport mock-up is reference only. The first concept is the visual target.

## WHAT THIS TOOL IS

A photo-to-stylised-game-art console that lets the user:

1. drag/drop or browse for a source image;
2. keep the source visible beside the output;
3. select a preset;
4. adjust simple visual controls with sliders;
5. optionally ask AI Assist to analyse the image and create a preset;
6. render using the selected engine/provider;
7. compare source vs result;
8. export a clean game-art image;
9. later use the same tool from a browser extension or desktop bridge.

The product must feel immediate. A user should be able to load a photo and get a useful result without understanding the underlying pipeline.

## HOW THIS DIFFERS FROM THE OLDER PROTOTYPE

The older `dorejames25-netizen/photo-to-game` project proved several important things: identity/pose/composition must be protected; blind edge filters are not enough for professional comic illustration; AI should be provider-neutral; deterministic post-processing is useful; and outputs should be validated rather than accepted only because they look impressive.

This new tool keeps those lessons but changes the product shape:

- simpler UI;
- preset-first workflow;
- one direct render experience instead of exposing every research stage;
- AI Assist is optional and should create settings/presets rather than own the whole product;
- a browser fallback renderer should work immediately;
- real AI/local render engines plug into the same adapter contract;
- the central UI is designed as a reusable desktop/browser console;
- advanced masks/control maps remain internal unless a future Expert Mode exposes them.

## LOCKED USER FLOW

**UPLOAD -> DETECT -> PRESET -> AI RENDER -> EXPORT**

### 1. Upload
- drag and drop or file picker;
- PNG/JPEG/WebP initially;
- preserve original aspect ratio;
- record original dimensions and filename;
- never mutate the source file.

### 2. Detect
Internal analysis creates a render manifest containing useful facts such as:
- image dimensions/aspect;
- rough subject count where available;
- foreground/subject mask if available;
- important edges / silhouette;
- face boxes / pose hints if available;
- dominant/source colour anchors;
- likely background vs subject regions.

Detection must degrade gracefully. The tool must still render when optional detection features are unavailable.

### 3. Preset
The initial locked preset family:
- **Retrowave Pale Blue** — benchmark hero preset;
- **Noir Ink** — monochrome comic-ink target;
- **Neon Comic** — stronger magenta/cyan comic treatment;
- **Soft Portrait** — lower line strength, warmer source-colour retention;
- **Clean Vector** — simplified colour blocks and stronger contour cleanup;
- **Custom AI Preset** — generated from the same preset schema.

Presets are data, not hard-coded UI branches.

### 4. AI Render
The render controller creates a provider-neutral RenderJob and sends it to an adapter.

Initial adapters:
- `browser-preview` — deterministic local canvas renderer; always available; used for UI testing/fallback;
- `local-http` — later local AI endpoint/desktop service;
- `remote-http` — later remote provider/service;
- future provider adapters without changing UI.

The UI must never contain provider secrets.

### 5. Export
- PNG first-class output;
- JPEG optional;
- original or scaled output size;
- optional metadata sidecar later;
- output should be the rendered artwork only, not the UI.

## MAIN CONTROLS

The first concept's left rail is locked as the simple control surface:

- Style Strength
- Detail
- Contrast
- Glow
- Edge Clean
- Skin Tone Lock
- Background Blend

All controls use a normalised 0-100 UI value. Engine adapters translate those values into provider-specific parameters.

### Control intent

**Style Strength** — how strongly the preset changes source appearance.

**Detail** — amount of meaningful source detail retained.

**Contrast** — shadow/highlight separation and graphic punch.

**Glow** — amount of bloom/neon halo/presentation glow.

**Edge Clean** — contour simplification/cleanup and line confidence.

**Skin Tone Lock** — strength of face/skin colour protection relative to the preset. At 100, preserve source skin colour as strongly as the adapter permits. At lower values, stylised palette shifts are allowed.

**Background Blend** — how much the original background is retained vs stylised/replaced/abstracted.

## SOURCE FIDELITY RULE

The new tool is allowed to stylise, but should not casually redesign the people or composition.

Prefer:
- same subject count;
- same pose;
- same framing;
- recognisable faces;
- retained glasses/hats/jewellery/clothing boundaries;
- retained logos/text only when the source itself clearly contains them and the renderer can preserve them reliably;
- source colour anchors when Skin Tone Lock / detail preservation asks for them.

Reject or warn on obvious drift where future validation can detect it.

## AI ASSIST

AI Assist does **not** replace the render controller.

Its job is to inspect the image/manifest and return a valid preset/settings object, for example:

```json
{
  "name": "Night Terminal Comic",
  "basePreset": "retrowave-pale-blue",
  "controls": {
    "styleStrength": 72,
    "detail": 70,
    "contrast": 78,
    "glow": 52,
    "edgeClean": 68,
    "skinToneLock": 82,
    "backgroundBlend": 46
  },
  "notes": "Protect faces and travel clothing; keep airport geometry recognisable."
}
```

AI Assist output must be schema-validated before applying it.

## PROVIDER-NEUTRAL RENDER JOB

Every real render uses one stable contract. Example:

```json
{
  "version": 1,
  "source": {
    "name": "photo.jpg",
    "width": 4032,
    "height": 3024
  },
  "presetId": "retrowave-pale-blue",
  "controls": {
    "styleStrength": 70,
    "detail": 65,
    "contrast": 80,
    "glow": 55,
    "edgeClean": 60,
    "skinToneLock": 75,
    "backgroundBlend": 40
  },
  "analysis": {},
  "output": {
    "format": "png",
    "scale": 1
  }
}
```

Adapters may add their own internal fields but the UI/controller contract stays stable.

## UI LOCK

The real build should match the first concept, not the plain GitHub Pages placeholder.

### Top bar
- AI RADIO RENDER CONSOLE branding;
- DESKTOP READY / BROWSER READY status cards;
- Create / Presets / History / Settings navigation.

### Left rail
- seven sliders;
- reset;
- clear numeric feedback;
- no clutter.

### Central screen
- source and render side by side;
- large image area;
- drag/drop on source side;
- render side shows selected preset name and status;
- compare action;
- loading/progress overlay when rendering.

### Right rail
- AI Assist status;
- Generate New Preset;
- Render Now;
- six preset cards.

### Bottom strip
- five-step workflow;
- export controls;
- quick tools (crop, upscale hook, variations hook, compare).

## DESKTOP / BROWSER PLUGIN DIRECTION

The browser app remains the primary UI.

Later wrappers:

### Browser extension
A thin extension can open the console, send the current page image/selected image into it, and communicate with the app through a documented message boundary. It must not embed provider secrets.

### Desktop bridge
A small localhost service or packaged desktop shell can:
- expose local AI models/render tools;
- receive RenderJob JSON + image bytes;
- return progress and output;
- let the browser UI use local GPU tools without rebuilding the UI.

Target local contract:
- `GET /health`
- `GET /capabilities`
- `POST /render`
- `GET /jobs/:id`
- `GET /jobs/:id/result`
- later cancellation/history endpoints.

The tool should discover local capability rather than assuming it exists.

## ADOBE CREATIVE TOOLSET — APPROVED PRODUCTION PIPELINE

Adobe is now an approved part of the production workflow for this project and related game/dashboard asset work.

Available/expected uses include:
- **Photoshop / Lightroom** for colour, tone, retouching, masking, consistency passes and batch image treatment;
- **Firefly** for generating new backgrounds, scene variations, props, textures and other original visual assets;
- **Illustrator / vector tools** for dashboard symbols, buttons, tabs, icons and scalable UI artwork;
- **Premiere tools** later for video formatting, promotional clips, trailers and social exports;
- **Acrobat / Express** where documents, presentations or designed reports are useful.

### Locked Adobe rule

**Never destructively experiment on an approved live asset.**

Approved artwork remains the baseline/master. New Adobe edits or generations must be created as a separate, clearly versioned experimental asset set first (for example `v2`, `variant-a`, or an equivalent staging folder).

Production promotion path:

**APPROVED MASTER -> ADOBE EDIT / GENERATION -> REVIEW -> ARCHIVE IN DROP ZONE / ASSET LIBRARY -> PROMOTE INTO LIVE DASHBOARD OR GAME REPO**

Only promote an Adobe-created or Adobe-edited asset into the live app/game after it has been reviewed and accepted.

For the current retrowave console:
- `first-retrowave-scene(2)` is the locked approved baseline;
- do not overwrite its approved live artwork while experimenting;
- create future Adobe improvements as a separate scene/version first;
- possible Adobe-assisted improvements include richer skylines, neon flicker overlays, rain, reflections, smoke, lighting, seamless textures, dashboard buttons/tabs, UI symbols and scene mockups;
- preserve composition and established visual direction unless a task explicitly asks for a redesign.

This Adobe workflow is part of the standard project method and should be remembered after any context reset.

## SECURITY

- never commit API keys/tokens;
- browser code never contains privileged provider keys;
- remote provider calls should eventually be brokered server-side;
- local desktop bridge binds to localhost and should use an explicit pairing/auth mechanism before production;
- validate uploaded file type/size;
- validate AI Assist preset JSON;
- validate adapter responses.

## BUILD ORDER

### Phase A — real UI shell
1. Replace placeholder presentation with first-concept layout.
2. Make responsive enough for desktop widths.
3. Implement working image drag/drop and preview.
4. Implement presets and sliders as state, not decoration.
5. Implement browser-preview render adapter.
6. Implement compare/export.

### Phase B — proper core contracts
1. preset schema;
2. RenderJob schema;
3. adapter registry;
4. analysis manifest;
5. render state machine and progress/error states;
6. persistence for recent settings/history.

### Phase C — real renderer bridge
1. local-http adapter;
2. health/capability discovery;
3. send source image + RenderJob;
4. receive output;
5. test failure/retry/cancel states.

### Phase D — AI Assist
1. preset-generation schema;
2. provider-neutral AI Assist adapter;
3. local or remote provider support;
4. validate generated preset before applying;
5. save custom presets.

### Phase E — plugin wrappers
1. browser extension handoff;
2. desktop bridge packaging;
3. optional context-menu / send-image-to-console flow.

## TESTING RULE

Do not call the tool complete because the UI renders.

Minimum functional test:
1. app loads without console errors;
2. source image can be dropped and browsed;
3. dimensions/filename update correctly;
4. every slider updates state;
5. every preset updates state and visible label;
6. Render Now produces a browser-preview output;
7. compare works;
8. export produces a valid image;
9. reset works;
10. invalid uploads fail cleanly;
11. mobile/tablet does not need to be perfect initially, but desktop must be solid;
12. adapter failure shows a useful recoverable error.

## CURRENT STATE AT THIS HANDOVER

A placeholder/static prototype has already been committed to the new repository. It proves the repository/GitHub Pages path but is not the final UI.

The older repository contains useful R&D and a working prototype/history, but **must not be edited during this project**. Read from it only when a proven behaviour or lesson saves time.

The next implementation task is to replace the placeholder with the real first-concept console and wire the UI to a proper state/render adapter architecture.

## FIRST ACTION AFTER A CONTEXT RESET

Read, in order:
1. `HANDOVER.md`
2. `docs/REAL_BUILD_SPEC.md`
3. `docs/TEST_PLAN.md`
4. `engine/contracts/render-job.schema.json`
5. `engine/contracts/preset.schema.json`
6. current `app/` files

Then continue in `doretradinguk-cyber/ai-photo-to-game-generator` only.
