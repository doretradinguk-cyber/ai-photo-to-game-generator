# Scene Package Import — Locked Specification

Status: **LOCKED / IMPLEMENTED**

The Scene Animator has two clear user paths.

## Path A — Create from one still background

1. Upload one PNG/JPG/WebP/SVG still background.
2. Choose a scene preset.
3. Type the motion/art-direction prompt.
4. Select 4, 8 or 16 frames.
5. Generate the scene from the still with Local Frame Synth.
6. Preview the loop.
7. Download the generated scene frames and/or export scene JSON.

This is the standard path for a single Firefly-generated background.

## Path B — Load an existing scene package

The user can drag/drop or choose:
- a `.zip` scene package;
- a folder;
- multiple frame files.

Supported image types:
- PNG;
- JPG/JPEG;
- WebP;
- SVG.

### ZIP/package detection

The importer:
- extracts ZIP contents in the browser;
- ignores directories and macOS metadata folders;
- detects `scene.json` when present;
- detects a base image named `base`, `base-scene`, `background` or `still` when present;
- detects numbered frame files such as `frame-01.png`, `frame-02.png`, etc.;
- sorts numbered frames numerically rather than ZIP order;
- applies scene name, target frame count, hold timing and loop mode from `scene.json` when available;
- falls back to automatic file detection when there is no manifest;
- automatically chooses the 4, 8 or 16-frame target from the imported sequence;
- loads the imported frames into the existing Scene Frames player;
- starts preview playback automatically after a successful import.

A frames-only package is valid. It enters **frame-sequence mode** and does not require a separate base image.

## First drag/drop acceptance test

Prepared test package: `media.zip`

Expected contents:
- 16 PNG files;
- filenames begin with `frame-01-...` through `frame-16-...`;
- files may appear in any order inside the ZIP.

Expected Scene Animator behaviour:
1. Drop `media.zip` into **DROP SCENE ZIP / FOLDER / FRAMES HERE**.
2. Importer opens the ZIP in-browser.
3. All 16 numbered PNGs are found.
4. Frames are sorted 01 → 16.
5. Frame target automatically becomes **16 frames**.
6. Existing scene state is cleared before loading the package.
7. All 16 frames appear in Scene Frames.
8. Preview playback starts.
9. Status reads `16 FRAMES LOADED • FRAME-SEQUENCE MODE` or equivalent success state.
10. The scene can then be exported with Scene JSON.

## Architecture rule

Scene package import is a separate module:

`app/scripts/scene-package-import.js`

It must not be coupled to ChatGPT Assist, Adobe Assist or Local Frame Synth internals. It passes imported files into the existing Scene Animator inputs so all providers continue to use one stable scene/player contract.

ZIP extraction currently uses JSZip 3.10.1 loaded by the Scene Animator page. The rest of the Scene Animator remains static/browser-based and requires no server-side unzip service.
