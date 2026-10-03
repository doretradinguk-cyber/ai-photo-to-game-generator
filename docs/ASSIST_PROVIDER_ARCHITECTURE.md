# ASSIST PROVIDER ARCHITECTURE — CHATGPT + ADOBE

## STATUS

Locked architecture decision.

The project will maintain **two separate assist providers** for now:

1. **ChatGPT Assist Bridge** — active/current path.
2. **Adobe Assist** — separate manual/future-connected path.

They must remain independent until a deliberate pipeline/orchestrator is built above them.

---

# 1. CHATGPT ASSIST BRIDGE

## Role

The ChatGPT Assist Bridge is the working AI Assist path for the app today.

It may:
- analyse an uploaded image or scene brief;
- suggest a preset;
- suggest slider values;
- create prompt text;
- create background/style ideas;
- create Firefly-ready prompt inspiration;
- create Scene Generator prompt inspiration;
- produce a structured preset/recipe;
- provide render notes and identity-preservation instructions.

## Separation rule

ChatGPT Assist must not require Adobe Assist to function.

Its adapter/config/prompt handling remain independent.

If Adobe is unavailable, ChatGPT Assist continues to work normally.

---

# 2. ADOBE ASSIST

## Role

Adobe Assist is a separate provider/module reserved for Adobe-based workflows.

Current phase:
- manual-assisted workflow;
- Firefly prompt generation/inspiration;
- Photoshop finishing instructions/recipes;
- reference image creation outside the automated app path;
- asset generation/testing through connected Adobe tooling during development.

Future phase:
- direct supported Adobe API/bridge integration;
- Firefly generation from inside the app;
- Photoshop/Adobe finishing automation where supported;
- provider health/capability discovery;
- authenticated render jobs without exposing credentials in browser code.

## Separation rule

Adobe Assist must not call, import, or depend on ChatGPT Assist.

If ChatGPT Assist is unavailable, Adobe Assist should still be independently implementable.

---

# 3. NO DIRECT CROSS-DEPENDENCY

The two providers must not interfere with one another.

Do not:
- share mutable provider state;
- make Adobe Assist import ChatGPT Assist logic;
- make ChatGPT Assist require Adobe credentials;
- store one provider's secrets/config inside the other provider;
- hard-code a sequence where one provider must run before the other.

Each provider gets its own:
- adapter/module;
- config;
- prompt mapping;
- capability status;
- error state;
- output validation;
- tests.

---

# 4. FUTURE PIPELINE / ORCHESTRATOR

Later, a separate pipeline layer may coordinate providers.

That layer sits **above** ChatGPT Assist and Adobe Assist.

Possible future paths:

**Source -> ChatGPT Assist -> Adobe Assist -> Final Render**

**Source -> Adobe Assist only -> Final Render**

**Source -> ChatGPT Assist only -> Browser/Local Render**

The provider modules themselves stay independent.

The orchestrator owns sequencing, not the providers.

---

# 5. PROVIDER-NEUTRAL HANDOFF FORMAT

To prepare for a future pipeline, assist providers should be able to exchange only validated, explicit data objects through the orchestrator.

A handoff recipe may contain:
- `name`
- `sourceTool`
- `targetTool`
- `basePreset`
- `userPrompt`
- `promptRecipe`
- `controls`
- `backgroundIntent`
- `effectsIntent`
- `identityRules`
- `sceneIntent`
- `providerNotes`
- `referenceAssets`
- `version`

The exact schema can evolve, but it must remain provider-neutral at the orchestration boundary.

---

# 6. ADOBE DEVELOPMENT METHOD

Adobe is approved as a production/development toolset, but approved live artwork remains protected.

Use Adobe for:
- Firefly reference generations;
- background/scene concepts;
- style exploration;
- Photoshop colour/effect finishing;
- UI/asset development;
- reference images for presets.

Current manual method:

**App prompt/preset -> ChatGPT Assist recipe -> manually recreate/refine in Firefly/Photoshop -> review -> archive -> promote approved result**

Future automated Adobe Assist can replace the manual Adobe step without changing the Image Maker or Scene Generator UI contract.

---

# 7. UI STATUS LANGUAGE

Recommended provider labels:

- **ChatGPT Assist — Active**
- **Adobe Assist — Manual**

Future labels when a supported direct Adobe path is connected:

- **Adobe Assist — Connected**
- **Adobe Assist — Unavailable**

Do not present manual Adobe Assist as if it is already a fully automated in-app backend.

---

# 8. SECURITY

- never commit API keys or OAuth secrets;
- browser code never stores privileged provider credentials;
- provider auth must be isolated;
- validate all provider outputs before applying them;
- manual Adobe development assets must be reviewed before promotion into live production assets.

---

# 9. ACCEPTANCE TEST

Architecture is correct when:
- ChatGPT Assist can be disabled without breaking Adobe Assist code paths;
- Adobe Assist can be absent without breaking ChatGPT Assist;
- Image Maker and Scene Generator can each use ChatGPT Assist independently;
- future Adobe Assist can plug into the same UI without rewriting the tools;
- future pipeline orchestration can sequence providers without introducing circular dependencies.
