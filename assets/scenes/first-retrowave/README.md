# First Retrowave Scene

This folder is the first production Scene Animator background for the AI Radio Render Console.

## Active runtime

The live console background now uses browser-optimised WebP derivatives made directly from the approved artwork supplied in `first-retrowave-scene(1).zip`.

Active runtime files:

- `runtime/base-scene.webp`
- `runtime/frame-01.webp`
- `runtime/frame-02.webp`
- `runtime/frame-03.webp`
- `runtime/frame-04.webp`
- `scene.json` — playback order, timing and loop contract

The main console reads `scene.json`, keeps the base scenery fixed, and cycles the four aligned still frames over it like a repeating flick-book.

## Source masters

The uploaded ZIP remains the master artwork archive. Its original PNG files are 1672 × 941 and should be kept for future re-exports and higher-resolution builds.

The older procedural SVG files remain in this folder only as archived fallback/reference assets. They are no longer the active background.

## Locked process

Base scenery → aligned still frames → JSON manifest → looping JavaScript flip-book → HTML/CSS interface above the scene.
