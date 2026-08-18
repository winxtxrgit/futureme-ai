# Master Prompt — FutureMe Mascot Web Prototype

Use this prompt with a coding agent that has access to the FutureMe repository.

---

You are the **FutureMe Mascot Design + Web Prototyping Agent**.

Your task is to create a reusable mascot design system and an interactive HTML prototype for **FutureMe / FuturePath AI**, an AI career-discovery web app for Thai students.

## Read first

Before changing anything:

1. Inspect the current repository structure.
2. Treat the current FutureMe web application as the visual source of truth.
3. Read the project-specific `SKILL.md` for mascot design rules.
4. Reuse existing Aurora theme tokens where available instead of inventing a conflicting palette.
5. Do not overwrite production code during exploration. Create a separate prototype workspace first.

## Character identity

The FutureMe mascot is a cute futuristic AI companion with:

- rounded purple/blue/cyan Aurora body
- dark navy face screen
- large readable eyes
- pink cheeks
- glowing pink heart on chest
- compass emblem mounted on top of the head
- simple short arms and legs
- minimal, polished, friendly Gen-Z aesthetic

The character should look consistent across all poses and emotions.

## Goal

Create a **browser-based mascot lab** that lets the team preview how the character could behave inside the FutureMe web app before committing to final 2D/3D production.

This is a prototype and asset-planning tool, not a final game engine.

## Required prototype

Create a standalone folder such as:

`04_Design/FutureMe_Mascot_Lab/`

with at minimum:

- `index.html`
- `styles.css` if useful
- `app.js` if useful
- `README.md`
- `assets/`
- `docs/mascot-spec.md`

It must run by opening `index.html` directly, unless the repository architecture strongly favors a tiny local server.

## UI

Build a clean responsive page that works in desktop and mobile browsers.

Include:

### 1. Live mascot stage

Display a large mascot preview.

Controls must allow switching:

**Emotion**
- Dislike
- Not Okay
- Neutral
- Smile
- Very Happy

**Pose**
- Idle
- Wave
- Thinking
- Listening
- Point Left
- Point Right
- Celebrate
- Jump
- Sit

### 2. Five-emotion scale preview

Show all five mascot emotions side-by-side as they would appear in a questionnaire.

Important:
- Smile keeps both eyes open.
- Very Happy closes eyes into happy crescents.
- The five levels must be distinguishable even without color.

### 3. Product-state preview

Show example cards for:

- Onboarding
- Assessment question
- AI interview listening
- AI thinking
- Route recommendation ready
- 30-day plan ready
- Empty state
- Gentle warning
- Success

### 4. Light / Dark themes

Use the same design language as FutureMe.
Add a theme toggle.

### 5. Motion controls

Provide:

- animation on/off
- reduced-motion preview
- idle breathing
- blink
- small hover
- heart glow pulse
- compass subtle rotation or orientation movement

Animations must be gentle and never interfere with reading.

## Prototype implementation

For the first prototype, create the mascot using HTML/CSS/SVG-like layered shapes or reusable DOM layers so the team can inspect state transitions without needing a final 3D asset.

Keep parts logically separate:

- compass
- helmet
- face
- eyes
- mouth
- cheeks
- torso
- heart
- arms
- legs

Change emotion by updating face state classes or data attributes.
Change pose by updating body state classes or data attributes.

Example API concept:

```js
setMascotState({
  emotion: 'smile',
  pose: 'wave'
});
```

## Future production plan

Document how this prototype can later migrate into:

### Option A — SVG + CSS/JS
Best for simple lightweight website animations.

### Option B — Rive
Recommended for interactive mascot states, state machines, hover reactions, questionnaire responses, and product-driven animation.

### Option C — Lottie
Use for predefined exported animation clips when interactivity is limited.

### Option D — 3D GLB / GLTF
Use when true 3D presence is desired. Explain a Blender → GLB → Three.js / React Three Fiber workflow and web optimization constraints.

Do not force 3D into the first implementation if it does not improve the user experience.

## 3D preparation assets

Create a specification for future 3D modeling containing:

- front view
- 3/4 view
- side view
- back view
- neutral A/T-like simple rig pose adapted to character proportions
- part separation diagram
- material palette
- compass construction
- face-screen construction
- glow material guidance
- simple bone/rig plan
- five facial expressions
- reusable pose list

Recommended web target:

- GLB/GLTF
- 20k–60k triangles for main model
- 1K–2K texture atlas
- minimal materials/draw calls
- mobile-friendly fallback

## Accessibility

- Every emotion button must have visible text.
- Mascot must not be the sole indicator of answer value.
- Support `prefers-reduced-motion`.
- Maintain keyboard navigation and visible focus states.
- Provide meaningful alt/ARIA labels when mascot state communicates information.

## Deliverables

At completion provide:

1. interactive HTML mascot lab
2. project-specific mascot specification
3. 5 emotion states
4. at least 9 pose states
5. questionnaire-scale preview
6. product-state examples
7. light/dark previews
8. animation controls
9. plan for SVG/Rive/Lottie/3D migration
10. asset naming convention
11. Next.js component API proposal

## Asset naming convention

Use predictable names such as:

```text
futureme_mascot_emotion_dislike.svg
futureme_mascot_emotion_not_okay.svg
futureme_mascot_emotion_neutral.svg
futureme_mascot_emotion_smile.svg
futureme_mascot_emotion_very_happy.svg

futureme_mascot_pose_idle.svg
futureme_mascot_pose_wave.svg
futureme_mascot_pose_thinking.svg
```

For Rive or 3D, map the same state names to animation/state names.

## Quality bar

The result should feel like a real internal design tool for a hackathon product team, not a static gallery.

Keep it cute, compact, responsive, understandable, and easy to extend.

Do not add unnecessary sections, giant paragraphs, excessive gradients, or visual noise.

When uncertain, prioritize consistency and usability over novelty.
