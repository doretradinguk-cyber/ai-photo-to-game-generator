# AI Photo-to-Game Generator — Structure

This repository is the only working repository for this tool.

## Goal
Build a simple, reliable photo-to-stylised-game-art tool around the first AI Radio Render Console concept.

## Structure

```text
ai-photo-to-game-generator/
├─ app/
│  ├─ index.html
│  ├─ styles/
│  │  └─ console.css
│  └─ scripts/
│     └─ app.js
├─ assets/
│  ├─ reference/
│  ├─ presets/
│  ├─ samples/
│  ├─ icons/
│  └─ exports/
├─ engine/
│  ├─ adapters/
│  ├─ local-ai/
│  ├─ browser/
│  └─ desktop/
├─ plugin/
│  ├─ browser-extension/
│  └─ desktop-bridge/
├─ docs/
│  └─ ARCHITECTURE.md
└─ README.md
```

Git does not track empty folders, so folders are introduced with `.gitkeep` placeholders until they receive real assets or code.

## Current implementation

The browser UI works without a build step. It provides:
- drag-and-drop image loading
- first-concept neon radio/video-comms interface
- style/detail/contrast/glow/edge/skin/background sliders
- preset selection
- lightweight in-browser render preview
- random custom preset placeholder
- PNG/JPEG export
- hooks for future AI upscale and render engines

## Next engine layer

The UI must stay independent from whichever image engine is plugged in later. The intended adapter contract is:

```text
UI -> render adapter -> local AI OR remote AI -> render result -> UI
```

Possible backends:
- local desktop model via a local HTTP/WebSocket bridge
- ComfyUI-compatible local workflow
- browser-capable lightweight model
- hosted API through a secure backend

Do not place API keys in browser JavaScript.

## Plugin direction

A browser extension can inject/send images into the console, but it cannot directly turn ChatGPT itself into an unrestricted browser plugin. A desktop bridge can expose a local endpoint to approved tools and models. Keep all privileged filesystem/model access behind explicit local permissions.
