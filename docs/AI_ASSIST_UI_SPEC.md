# AI ASSIST UI SPEC — IMAGE MAKER + SCENE GENERATOR

## STATUS

Locked product direction.

This document defines the prompt-driven AI Assist experience for the Image Maker / Photo-to-Game tool and the Scene Generator / Scene Animator.

The two tools may exchange prompts, references and saved recipes later, but they remain separate tools with separate state and separate implementation.

---

## CORE RULE

Both tools support three valid input modes:

1. **Preset only** — use the preset defaults.
2. **Prompt only** — create a custom direction from the user's text.
3. **Preset + prompt** — use the preset as the base and the prompt as a modifier/refinement.

The prompt field is a first-class control, not an afterthought.

---

# IMAGE MAKER / PHOTO-TO-GAME

## Purpose

Transform an uploaded source image into stylised game-art imagery while preserving the source identity, composition and important subject details unless the user explicitly requests a redesign.

## Locked flow

**UPLOAD PHOTO -> CHOOSE PRESET AND/OR ENTER PROMPT -> AI ASSIST -> PREVIEW / RENDER -> COMPARE -> SAVE PRESET / EXPORT**

## Inputs

### Source image
- drag/drop or browse;
- PNG/JPEG/WebP initially;
- source remains visible beside the output;
- never overwrite or mutate the original source file.

### Preset picker
Initial family remains available:
- Retrowave Pale Blue
- Noir Ink
- Neon Comic
- Soft Portrait
- Clean Vector
- Custom AI Preset

Future preset packs can be added without changing the page structure.

### Prompt text area
The Image Maker gets a visible free-text prompt area beside/inside AI Assist.

Example uses:
- "make this look like a neon game poster"
- "put the subject in a cyberpunk alley"
- "change the background to a retro sunset"
- "make it more comic-book and dramatic"
- "add fog, glow and synthwave lighting"

The prompt may influence:
- style;
- mood;
- lighting;
- environment;
- background replacement/inspiration;
- effects;
- composition emphasis;
- render notes;
- preset generation.

## Existing controls remain
- Style Strength
- Detail
- Contrast
- Glow
- Edge Clean
- Skin Tone Lock
- Background Blend

AI Assist may recommend values, but the user remains in control.

## Image Maker AI Assist actions

Recommended actions:
- Analyse Image
- Generate Prompt
- Generate New Preset
- Create Background Idea
- Create Firefly Prompt
- Send Prompt/Reference to Scene Generator
- Render / Preview
- Save Preset

## Structured AI Assist output

AI Assist should be able to return a structured recipe containing:
- suggested preset;
- suggested control values;
- ChatGPT Assist prompt;
- optional Firefly-ready prompt;
- optional Photoshop finishing notes;
- optional Scene Generator prompt;
- subject/identity preservation notes;
- background instructions;
- effect instructions;
- human-readable notes.

All structured output must be validated before it changes app state.

---

# SCENE GENERATOR / SCENE ANIMATOR

## Purpose

Create, plan, preview and animate environments/backgrounds as separate scene assets.

This tool is not the Photo-to-Game renderer. It has its own state, prompt handling, presets and output format.

## Locked flow

**BASE SCENE / UPLOAD -> CHOOSE SCENE PRESET AND/OR ENTER PROMPT -> SCENE ASSIST -> BUILD IDEA / OVERLAYS -> PREVIEW LOOP -> SAVE / EXPORT**

## Inputs

### Base scene
- uploaded or selected scene;
- static base artwork can remain fixed;
- optional aligned transparent overlay frames;
- approved masters remain protected from destructive experimentation.

### Scene preset
Examples:
- Retrowave Street
- Cyber Alley
- Desert Highway
- Neon City
- Fantasy Forest
- Horror Corridor

These are scene concepts/recipes, not hard-coded UI branches.

### Scene prompt text area
The Scene Generator gets its own prompt field.

Example uses:
- "create a rainy cyberpunk street scene"
- "add neon signs and animated reflections"
- "make the skyline more detailed"
- "add fog and pulsing lights"
- "generate a retro desert road at sunset"
- "add blinking signs and moving reflections"

The scene prompt may influence:
- environment;
- time of day;
- weather;
- atmosphere;
- colour direction;
- neon treatment;
- skyline/background objects;
- reflections;
- fog/haze;
- movement concepts;
- looping overlay ideas;
- Firefly inspiration prompts.

## Recommended scene controls

Scene-specific controls may include:
- mood;
- lighting;
- environment type;
- animation intensity;
- overlay effects;
- reflections;
- haze/fog;
- neon intensity;
- light/traffic movement.

These should remain separate from Image Maker controls.

## Scene Generator actions

Recommended actions:
- Generate Scene Prompt
- Build Scene Idea
- Create Overlay Ideas
- Generate Animation Notes
- Create Firefly Background Prompt
- Save Scene Preset
- Preview Scene
- Export Scene Recipe

## Scene Assist output

Scene Assist may return:
- base scene description;
- scene preset recommendation;
- Firefly-ready background prompt;
- overlay list;
- frame-by-frame animation notes;
- suggested loop timing;
- lighting/reflection notes;
- export/archive notes.

---

# SEPARATION RULE

Image Maker and Scene Generator may share terminology, assets and visual direction, but they must not share hidden mutable state.

Each tool has its own:
- adapter;
- state store;
- preset logic;
- prompt state;
- render/output state;
- error handling;
- saved history.

Passing an item between tools must be an explicit handoff, such as:
- prompt text;
- reference image;
- scene recipe;
- preset recipe;
- exported asset.

Never create implicit cross-tool dependencies.

---

# FUTURE PIPELINE

A future pipeline/orchestrator may sit above both tools.

Possible future paths:

**Photo -> Image Maker -> explicit handoff -> Scene Generator**

**Scene Generator -> background asset -> explicit handoff -> Image Maker**

**ChatGPT Assist -> Adobe manual/automated stage -> final asset**

This orchestration layer is future work. Do not merge the tools together now.

---

# TESTING REQUIREMENTS

For each tool, test independently:
- preset-only flow;
- prompt-only flow;
- preset + prompt flow;
- empty prompt handling;
- save/reload of custom recipes;
- no cross-tool state leakage;
- clear error state when an assist provider is unavailable;
- source/master assets remain unchanged unless the user explicitly exports a replacement.
