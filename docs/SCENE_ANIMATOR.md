# Scene Animator — Locked Method

The Scene Animator is a separate tool/page in the AI Photo-to-Game toolset. It is linked from the main render console/dashboard and is intended for artwork created externally (for example, Firefly scene art) that needs to be turned into a simple looping animated scene without regenerating the artwork at runtime.

## Locked production method

1. Create or import one finished base scenery image.
2. Create a sequence of scene stills with the same dimensions and composition.
3. Only change the visual details that should appear animated between frames: lights, road streaks, smoke, reflections, signs, eyes, weather, particles, character pose changes, etc.
4. Upload all stills to Scene Animator.
5. Reorder frames visually.
6. Set a hold time for each frame.
7. Preview them as a repeated flick-book loop.
8. Export the scene JSON manifest so the same timing and order can be reused by the game or web player.

This is the default scene-animation method for this project unless a later task explicitly requires skeletal, video, 3D, shader, or procedural animation.

## Tool responsibilities

The Scene Animator page must support:

- base scene upload;
- multi-image frame upload;
- PNG, JPEG, WebP and SVG artwork;
- thumbnail frame strip/grid;
- drag-to-reorder;
- per-frame hold time;
- previous/next frame preview;
- looping play/pause preview;
- scene name and loop mode;
- JSON manifest export;
- reset/new scene;
- no AI/API dependency for basic use.

## Output contract

```json
{
  "version": 1,
  "tool": "scene-animator",
  "name": "Example Scene",
  "method": "base-scenery-plus-aligned-still-frames-flipbook",
  "base": { "file": "base.png" },
  "frames": [
    { "order": 1, "file": "frame-01.png", "hold": 140 },
    { "order": 2, "file": "frame-02.png", "hold": 140 }
  ],
  "loop": true
}
```

## Art rule

Every frame should share the same canvas size and framing. The still images act like pages of a flick book. Large uncontrolled changes between images will look like cuts rather than animation.

## Future extension points

The same tool can later add named tracks, audio cues, layer masks, transparent overlay mode, onion-skin comparison, per-frame notes, sprite-sheet export, ZIP packaging, game-engine export adapters, and AI-assisted frame analysis. These extensions must preserve the simple upload → order → time → preview → export workflow.
