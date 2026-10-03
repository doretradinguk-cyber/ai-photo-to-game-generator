# CURRENT UI BENCHMARK — LOCKED

Status: OWNER-APPROVED VISUAL BENCHMARK.

The approved benchmark is the 1672×941 mockup created in the 2026-10-03 session showing the AI RADIO RENDER CONSOLE over a neon retrowave city/road scene, with the layer breakdown strip at the bottom.

## Non-negotiable visual target
- Full-page illustrated retrowave scenery behind the console.
- Dense neon magenta/cyan city lighting, wet-road reflections, synthwave sun, palms, stars, rear-view sports car and RADIO sign.
- Dashboard must feel like a polished futuristic radio/video-comms console, not flat boxes on a dark page.
- Central source/render area is the hero region; side control/AI panels and bottom workflow/export/quick-tools must keep the same hierarchy and proportions.
- Scene is built from still art layers, then animated like a living comic; do not rebuild scenery from CSS primitives.

## Locked scene architecture
1. Layer 1 — BACKGROUND SCENE (STILL): complete artwork composition.
2. Layer 2 — ANIMATED STILLS: car lights, road lines, reflections, sun glow, skyline lights, palms, stars/particles, sign/neon.
3. Layer 3 — UI OVERLAY (HTML/CSS): console and controls only.
4. Layer 4 — ANIMATION CONTROL (JS): timeline, performance settings, reduced-motion, asset swapping.

## Fidelity rule
A future redesign is not acceptable merely because it is cleaner or more modern. It must be compared against this benchmark for scene richness, scale, panel proportions, neon depth, composition and motion language.

## Implementation warning
The old CSS-generated background is deprecated as the primary scene renderer. CSS may animate masks/opacity/transforms, but the visual scenery itself must come from authored still assets.
