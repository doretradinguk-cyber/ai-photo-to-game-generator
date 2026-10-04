# AI Photo-to-Game Generator

Turn photos into stylised scenes, animations or sprites for game projects.

## Current toolset

The project now includes several linked browser tools inside the same repository:

- **AI Radio Render Console** — main photo-to-game stylisation console (`index.html`)
- **Scene Animator** — full scene creation / loading / animation workflow (`scene-animator.html`)
- **Animation Scene Overlay** — simplified complete-scene + transparent-animation compositor (`animation-scene-overlay.html`)
- **Sprite Generator** — sprite-focused generator workflow (`sprite-generator.html`)

The main Render Console now links directly to the Scene Animator and Animation Scene Overlay tools.

## Animation Scene Overlay

The simplified overlay tool uses a locked two-process workflow:

1. **Upload Complete Scene** — one finished static background image.
2. **Upload Animation** — transparent animation frames placed above the scene.

Supported animation targets are **4, 8 or 16 frames**.

The animation layer can be:

- dragged directly around the preview;
- resized from 10% to 250%;
- positioned with horizontal and vertical controls;
- previewed at adjustable frame speed;
- exported as JSON with percentage-based X/Y position and scale metadata.

Implementation files:

- `animation-scene-overlay.html`
- `app/styles/animation-scene-overlay.css`
- `app/scripts/animation-scene-overlay.js`

Full workflow notes: `docs/ANIMATION_SCENE_OVERLAY.md`.

## Render Console working now

- drag-and-drop image loading
- before/after source and render screen
- Style Strength, Detail, Contrast, Glow, Edge Clean, Skin Tone Lock and Background Blend controls
- preset cards
- lightweight browser render preview
- custom preset placeholder
- PNG/JPEG export
- workflow state strip
- future hooks for upscale, local AI and remote AI engines

## Repository rule

This is the single working repository for this project:

`doretradinguk-cyber/ai-photo-to-game-generator`

Do not build this tool in the older photo-to-game repositories.

See `HANDOVER.md` for the project handover and `docs/ARCHITECTURE.md` for the broader folder layout, AI adapter plan, desktop bridge and browser-extension direction.
