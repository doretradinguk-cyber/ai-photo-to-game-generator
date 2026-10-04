# Animation Scene Overlay Tool

Status: **working first implementation on `main`**

Page: `animation-scene-overlay.html`

This is a simplified companion to the full Scene Animator. It is intentionally kept separate so the larger AI-assisted Scene Animator workflow remains untouched.

## Locked two-process workflow

### Process 1 — Upload Complete Scene

Upload one finished background scene:

- PNG
- JPG / JPEG
- WebP
- SVG

The complete scene remains static while the animation is placed above it.

### Process 2 — Upload Animation

Upload a transparent animation sequence:

- transparent PNG
- transparent WebP
- SVG
- 4, 8 or 16 frames

Frames are sorted in filename order and played as a loop over the complete scene.

## Position and resize controls

The animation layer can be positioned without altering the background scene.

Controls:

- Animation Size — 10% to 250%
- Horizontal Position — 0% to 100%
- Vertical Position — 0% to 100%
- Frame Speed — 50 ms to 500 ms
- Frame Count — 4 / 8 / 16

The animation can also be dragged directly around the live preview with the pointer/mouse.

## Playback

The preview uses:

1. fixed complete scene image;
2. one current transparent animation frame above it;
3. loop timer based on the selected frame speed.

The base scene never moves when the animation is repositioned.

## Export contract

The tool currently exports a JSON manifest containing:

```json
{
  "version": 2,
  "type": "scene-overlay-animation",
  "scene": "complete-scene.png",
  "frameCount": 4,
  "targetFrameCount": 4,
  "frameHoldMs": 140,
  "loop": true,
  "transform": {
    "xPercent": 50,
    "yPercent": 50,
    "scalePercent": 100
  },
  "frames": []
}
```

The transform values are deliberately percentage based so the placement can later be reproduced by the game/runtime independently of preview resolution.

## Files

- `animation-scene-overlay.html` — page structure
- `app/styles/animation-scene-overlay.css` — isolated overlay-tool styling
- `app/scripts/animation-scene-overlay.js` — upload, playback, drag, resize, positioning and JSON export logic
- `index.html` — contains the `ANIMATION OVERLAY` navigation link

## Design rule

Keep this page simple.

It is not the full Scene Animator and should not absorb its AI recipe generator, Firefly import workflow, Local Frame Synth, scene ZIP loader or advanced scene creation controls unless the project direction explicitly changes.

Its job is:

**COMPLETE SCENE + TRANSPARENT ANIMATION -> POSITION / RESIZE -> PREVIEW -> EXPORT TRANSFORM MANIFEST**

## Future upgrades

Useful next additions without breaking the simple workflow:

- animation rotation control;
- flip X / flip Y;
- opacity control;
- multiple independently positioned animation layers;
- layer naming;
- package export containing manifest + scene + animation frames;
- Godot-ready placement/export metadata;
- snap-to-centre and reset-transform buttons.
