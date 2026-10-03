# Scene AI Assist — Locked Specification

Status: **LOCKED**

This document records the approved Scene Generator / Scene Animator direction so it survives context resets.

## Current truth

The Scene Animator now has **two separate frame-production paths**:

1. **Local Frame Synth — working now**
   - takes one uploaded/loaded base scene;
   - reads the selected preset, prompt and 4 / 8 / 16 target;
   - creates real same-size PNG frame files in the browser;
   - applies looped colour/light/flicker plus prompt-aware rain, haze, reflection, shadow and scanline effects;
   - injects those PNGs into the existing Scene Frames player;
   - can download the generated PNG set.

2. **AI/provider frame generation — future adapter path**
   - ChatGPT Assist and Adobe Assist remain separate providers;
   - a later provider may use the same scene recipe to make genuinely generative per-frame image changes;
   - it must return 4 / 8 / 16 aligned frames through the same Scene Animator contract.

Local Frame Synth is intentionally **not presented as Firefly/ChatGPT generative image creation**. It is the immediate deterministic browser solution that makes a still image into a usable multi-PNG animated scene today.

## Working responsibilities

Scene Animator can now:
- load one fixed base scene, including Firefly PNG/JPG/WebP artwork;
- accept ordered PNG/JPG/WebP/SVG scene frames;
- target exactly 4, 8 or 16 frames;
- generate a structured scene recipe and per-frame prompt plan;
- use Local Frame Synth to create real 4 / 8 / 16 PNG files from the base still;
- let the prompt influence local effect selection;
- play generated/imported frames as a loop;
- control frame hold timing;
- download locally generated PNG frames;
- export scene recipe JSON and scene manifest JSON.

## Locked architecture

Do not make Scene Animator depend directly on Adobe Assist or ChatGPT Assist internals.

Scene Animator owns:
- scene state;
- prompt text;
- scene preset selection;
- target frame count;
- frame-plan recipe;
- imported/generated frame assets;
- playback;
- manifest export.

**Local Frame Synth is its own provider-neutral browser module** (`app/scripts/local-frame-synth.js`). It must remain independent from ChatGPT Assist and Adobe Assist.

ChatGPT Assist Bridge and Adobe Assist remain separate providers. A later orchestration/generation pipeline may consume the Scene Animator recipe and produce enhanced/replacement image files.

## Locked prompt-console workflow

User can use:
1. preset only;
2. prompt only;
3. preset + prompt.

Inputs:
- source/base scene;
- scene preset;
- prompt / art direction;
- target frames: 4, 8 or 16;
- default frame hold;
- loop mode.

Primary planning action:
- **Generate Scene Recipe**

Immediate frame action:
- **Generate PNG Frames — Local**

Outputs:
- preset direction;
- base/master scene prompt;
- exact target frame count;
- smoothness rule appropriate to the frame count;
- one prompt per frame;
- suggested file name per frame;
- hold duration;
- loop intent;
- provider-neutral recipe JSON;
- local PNG frame set when Local Frame Synth is used.

Additional actions:
- Copy Frame Prompts;
- Export Recipe JSON;
- Download PNG Set;
- Export Scene JSON.

## Prompt-aware Local Frame Synth

The local module keeps geometry/camera fixed and changes presentation/effect layers over a cyclic phase.

Prompt keywords currently recognised include concepts such as:
- rain / storm / drizzle / wet;
- haze / fog / smoke / mist / steam;
- flicker / blink / pulse / light;
- reflection / wet floor / neon;
- shadow / silhouette / darkness;
- retro / VHS / scanline / CRT.

Preset selection also drives colour, contrast, saturation and tint behaviour for:
- Adobe Neon Noir;
- Retrowave Pale Blue;
- Crimson Minimum;
- Emerald;
- Noir Ink;
- Neon Comic;
- Custom.

This mapping is a deterministic baseline and can be extended without changing the frame/player contract.

## Frame-count behaviour

### 4 frames — quick loop
Use broad, clearly visible changes. Best for:
- sign flicker;
- tail-light blink;
- simple glow pulse;
- quick reflection shift.

### 8 frames — smooth scene
Use medium transition steps. Best for:
- lighting cycles;
- reflections;
- rain movement;
- smoke/haze;
- richer environmental loops.

### 16 frames — cinematic loop
Use micro-transitions and restrained changes. Best for:
- smooth living-scene loops;
- layered haze;
- gradual light movement;
- subtle environmental motion;
- high-quality game background animation.

The selected frame count drives:
- Scene Animator capacity/playback;
- AI/prompt frame-plan generation;
- Local Frame Synth output count and per-frame effect strength.

Changing the selected target after a recipe exists regenerates the recipe for the new target.

## Composition lock

All generated frames in one scene must preserve:
- camera angle;
- crop;
- perspective;
- character positions;
- major props;
- architecture;
- overall scene geometry;
- dimensions/aspect ratio.

Only the details intended to animate should change between frames.

Local Frame Synth achieves this by drawing every frame from the exact same source bitmap and varying only effect layers/colour treatment.

## Adobe / Firefly workflow now

There are now two useful Firefly workflows.

### Fast local animation workflow
1. Generate/export one finished scene in Firefly.
2. Upload it as the Scene Animator base.
3. Choose 4 / 8 / 16 frames.
4. Pick a scene preset and/or write the motion prompt.
5. Generate Scene Recipe.
6. Click **Generate PNG Frames — Local**.
7. Preview the loop immediately.
8. Download the PNG set if approved.

### Higher-end manual Firefly workflow
1. Generate Scene Recipe.
2. Copy the per-frame prompts.
3. Create/refine matching frames manually in Firefly / Photoshop.
4. Export aligned PNGs.
5. Add them to Scene Animator, replacing the local synth frames if desired.
6. Review and archive approved assets through the Drop Zone pipeline.

## Future automatic provider pipeline

Later:

`Base Scene + Preset + Prompt + Target Frames -> Provider Pipeline -> 4/8/16 PNG Frames -> Scene Animator -> Review -> Archive -> Game/Dashboard`

Possible providers include Adobe, ChatGPT image generation, local AI, or another renderer. Scene Animator remains provider-neutral.

The Local Frame Synth remains useful as:
- instant fallback;
- offline/browser preview;
- first-pass motion prototype;
- deterministic comparison baseline;
- graceful fallback when a generative provider is unavailable.

## Current implementation

The committed Scene Animator includes:
- 4 / 8 / 16 frame selector;
- prompt text area;
- scene preset selector;
- Generate Scene Recipe;
- Copy Frame Prompts;
- Export Recipe JSON;
- per-frame recipe preview;
- recipe regeneration when frame count changes;
- recipe inclusion in exported scene manifest;
- **Generate PNG Frames — Local**;
- **Download PNG Set**;
- prompt-aware browser effects;
- automatic injection of generated PNG files into Scene Frames for immediate playback.

This is the approved baseline for the future true generative-provider frame pipeline.
