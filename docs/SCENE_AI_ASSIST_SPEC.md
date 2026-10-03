# Scene AI Assist — Locked Specification

Status: **LOCKED**

This document records the approved Scene Generator / Scene Animator direction so it survives context resets.

## Current truth

The Scene Animator currently **plays and organises separate still image frames**. It does not yet automatically transform one still image into 4, 8 or 16 generated PNG files by itself.

Current working responsibilities:
- load one fixed base scene;
- accept ordered PNG/JPG/WebP/SVG scene frames;
- target exactly 4, 8 or 16 frames;
- play the frames as a loop;
- control frame hold timing;
- export a scene manifest;
- generate a structured scene recipe and per-frame prompt plan from the prompt console.

Future generation responsibility:
- take one base still + preset + prompt + target frame count;
- generate 4, 8 or 16 aligned PNG frames through a dedicated provider pipeline;
- return those frames to Scene Animator without changing the Scene Animator UI contract.

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

ChatGPT Assist Bridge and Adobe Assist remain separate providers. A later orchestration/generation pipeline may consume the Scene Animator recipe and produce image files.

## Locked prompt-console workflow

User can use:
1. preset only;
2. prompt only;
3. preset + prompt.

Inputs:
- source/base scene, optional for planning;
- scene preset;
- prompt / art direction;
- target frames: 4, 8 or 16;
- default frame hold;
- loop mode.

Primary action:
- **Generate Scene Recipe**

Outputs:
- preset direction;
- base/master scene prompt;
- exact target frame count;
- smoothness rule appropriate to the frame count;
- one prompt per frame;
- suggested file name per frame;
- hold duration;
- loop intent;
- provider-neutral recipe JSON.

Additional actions:
- Copy Frame Prompts;
- Export Recipe JSON;
- Export Scene JSON.

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

The selected frame count must drive both:
- Scene Animator capacity/playback;
- AI/prompt frame-plan generation.

Changing the selected target after a recipe exists should regenerate the recipe for the new target.

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

The last frame should move back toward the first frame so loop closure is clean.

## Adobe / Firefly workflow now

Until direct Adobe automation is connected:
1. Scene Animator generates the recipe and frame prompts.
2. User copies the prompts.
3. Frames can be generated/refined manually in Firefly / Photoshop.
4. Export frames as aligned PNGs.
5. Add them to Scene Animator.
6. Preview the loop.
7. Save approved assets through the Drop Zone / archive pipeline.

## Future automatic generation pipeline

Later:

`Base Scene + Preset + Prompt + Target Frames -> Provider Pipeline -> 4/8/16 PNG Frames -> Scene Animator -> Review -> Archive -> Game/Dashboard`

The future provider may be Adobe, ChatGPT image generation, local AI, or another renderer. Scene Animator must remain provider-neutral.

## Current implementation

The committed Scene Animator now includes:
- 4 / 8 / 16 frame selector;
- prompt text area;
- scene preset selector;
- Generate Scene Recipe;
- Copy Frame Prompts;
- Export Recipe JSON;
- per-frame recipe preview;
- recipe regeneration when frame count changes;
- recipe inclusion in exported scene manifest;
- explicit UI note that PNG creation is not yet automatic.

This is the approved baseline for the next generation-pipeline task.
