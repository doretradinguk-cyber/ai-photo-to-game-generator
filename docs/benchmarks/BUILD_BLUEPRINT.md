# RETROWAVE CONSOLE BUILD BLUEPRINT

## Goal
Reproduce the approved benchmark as a layered living-comic interface while keeping the current upload/preset/render/export engine intact.

## Runtime stack
- SceneStage: full-viewport stage behind UI.
- base-scene still: complete retrowave city/road/car composition.
- overlay stills: transparent artwork aligned to the exact same canvas.
- Console UI: existing semantic HTML controls above the stage.
- SceneController: requestAnimationFrame/CSS-class controller for motion, quality mode and reduced-motion.

## Asset contract
All scene layers use the same reference canvas and registration point. Recommended authoring size: 1920×1080 or 2560×1440. Never crop individual overlays independently; transparent overlays must retain the full canvas so they register perfectly.

Paths:
assets/retrowave/base/scene.webp
assets/retrowave/layers/car-lights.webp
assets/retrowave/layers/road-lines.webp
assets/retrowave/layers/reflections.webp
assets/retrowave/layers/sun-glow.webp
assets/retrowave/layers/skyline-lights.webp
assets/retrowave/layers/palms.webp
assets/retrowave/layers/stars.webp
assets/retrowave/layers/radio-sign.webp

## Motion
- car-lights: 1.25s pulse/step blink, with reflected glow.
- road-lines: translate toward viewer; seamless loop.
- reflections: low-amplitude opacity/vertical shimmer.
- sun-glow: 5–6s breathing pulse.
- skyline-lights: sparse flicker, random-feeling but deterministic.
- palms: 5–7s tiny sway; less than 2 degrees.
- stars: slow drift plus independent twinkle.
- radio-sign: irregular 2–5s flicker, never full-screen strobe.

## UI fidelity
Desktop benchmark width is treated as a fixed art direction reference. Console max width should occupy roughly 88–92% of viewport and sit centered with visible scenery gutters. Panels are translucent enough to reveal the environment but dark enough for legibility. Cyan = structural/active signal; magenta = accent/energy; white/pale blue = labels and values.

## Development sequence
1. Commit benchmark lock and layer contract.
2. Replace procedural scenery with SceneStage + aligned still layers.
3. Match header and panel geometry to benchmark.
4. Match control density and typography.
5. Add animation controller and reduced-motion.
6. Add visual test checklist against benchmark screenshot.
7. Only after visual parity: reconnect/finish real AI render provider work.
