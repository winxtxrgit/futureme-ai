---
name: futureme-mascot-designer
version: 1.0.0
description: Design, prototype, and prepare the FutureMe mascot system for use in the FutureMe / FuturePath web app.
project: FutureMe / FuturePath AI
---

# FutureMe Mascot Designer Skill

## Mission
Create a consistent, cute, lightweight mascot system for FutureMe that can be used across the web app as a guide, emotional feedback character, onboarding companion, loading state, helper, and celebratory character.

The mascot is not decoration only. It acts as a visual career-discovery companion and should communicate emotion, direction, encouragement, and progress without overwhelming the interface.

## Canonical Character

Maintain these visual anchors in every variation:

- Small rounded futuristic AI buddy.
- Oversized rounded helmet/head with dark navy face screen.
- Purple → blue → cyan Aurora body palette with subtle pink highlights.
- Large readable dark eyes with white highlights.
- Pink cheek accents.
- Glowing pink heart on chest.
- Compass emblem mounted on top of the head.
- Rounded short arms and legs.
- Friendly Gen-Z visual language: cute, polished, not childish.
- No complex armor, weapons, text, logos, clothing, or unnecessary accessories.

## Design Goal

Prioritize in this order:

1. Character consistency.
2. Clear emotion at small UI sizes.
3. Simple silhouette.
4. Web performance.
5. Animation readiness.
6. Visual polish.

## Required Emotion Set

Every production mascot pack must include these five core expressions:

1. **Dislike** — clearly unhappy / does not like it; mild frown and lowered or angled brows. Avoid rage.
2. **Not Okay** — uncomfortable or unsure, but softer than Dislike.
3. **Neutral** — calm, no strong positive or negative feeling.
4. **Smile** — happy smile while both eyes remain visibly open.
5. **Very Happy** — delighted smile with closed crescent eyes.

Never let level 4 close its eyes. This is important because level 4 and level 5 must remain visually distinguishable.

## Recommended Pose Library

Build reusable poses rather than creating unrelated illustrations.

### Core
- Idle standing
- Idle breathing / floating
- Blink
- Look left / right
- Wave hello
- Point left
- Point right
- Thinking
- Listening
- Explaining / presenting
- Celebrate
- Small jump
- Happy bounce
- Sit / waiting
- Sleep / inactive

### Product states
- Interview listening
- User is answering
- AI is thinking
- Result ready
- Route discovered
- Plan created
- Evidence missing / uncertain
- Gentle warning
- Success
- Empty state
- Loading

## Character Construction Rules

Treat the mascot as modular parts:

- compass
- helmet shell
- face screen
- left eye
- right eye
- mouth
- cheek left/right
- torso
- heart light
- left/right arms
- left/right legs

For 2D web animation, keep these parts as independent SVG groups or layers.
For 3D production, preserve the same segmentation as separate meshes or rig controls.

## 2D Web Deliverables

Preferred formats:

- SVG for static and CSS/JS animation.
- Rive for interactive state-machine animation.
- Lottie when animations are fixed and non-interactive.
- WebP/AVIF only for raster fallback.

Avoid GIF for production unless there is a compatibility reason.

Recommended export targets:

- icon: 64–96 px
- card mascot: 160–280 px
- interview companion: 220–360 px
- hero: 360–560 px

All static assets should support transparent backgrounds.

## 3D Deliverables

When a 3D mascot is required:

- low-poly / stylized topology
- clean quad-dominant mesh where practical
- separate face display from helmet shell
- separate compass mesh
- arm and leg joints suitable for simple rigging
- minimal material count
- bake complex glow/detail into textures where possible
- export GLB/GLTF for web
- target roughly 20k–60k triangles for the main web model unless visual testing justifies more
- texture target: 1K or 2K atlas
- provide LOD or simplified mobile version when needed

## Animation Principles

Motion should feel soft and encouraging.

- Idle: 2.5–4 s breathing loop.
- Blink: irregular every 3–7 s.
- Hover: 4–6 px equivalent visual movement.
- Wave: 0.8–1.4 s.
- Reaction: 0.4–0.8 s.
- Celebrate: 1–2 s.

Do not make continuous motion strong enough to distract from questionnaire text.
Respect `prefers-reduced-motion`.

## Emotion Mapping for Questionnaire UI

For a five-point preference scale:

| Value | Mascot state | Meaning |
|---|---|---|
| 1 | Dislike | Not like me / strongly negative |
| 2 | Not Okay | Slightly negative / not really me |
| 3 | Neutral | No strong feeling |
| 4 | Smile | Positive / like me |
| 5 | Very Happy | Strongly positive / very like me |

The mascot supports the label; it must never be the only way a response value is communicated.

## Accessibility

- Always pair emotional mascots with readable text labels.
- Do not rely on color alone.
- Decorative mascot images should use empty alt text.
- Meaningful mascot states should receive localized alt text.
- Maintain visible UI focus states independently from mascot animation.
- Disable or reduce nonessential animation for reduced-motion users.

## Web Implementation Guidance

For Next.js, build a reusable API similar to:

```tsx
<FutureMeMascot
  emotion="smile"
  pose="wave"
  size="md"
  animated
  ariaLabel="FutureMe is ready to help"
/>
```

Recommended state types:

```ts
type MascotEmotion =
  | 'dislike'
  | 'not-okay'
  | 'neutral'
  | 'smile'
  | 'very-happy';

type MascotPose =
  | 'idle'
  | 'wave'
  | 'think'
  | 'point-left'
  | 'point-right'
  | 'listen'
  | 'celebrate'
  | 'jump'
  | 'sit';
```

Do not duplicate character assets page-by-page. Maintain one mascot system with state variations.

## Prototype Workflow

When asked to design new mascot variants:

1. Identify the product state and communication goal.
2. Reuse the canonical silhouette.
3. Change only expression, pose, and small state-specific motion.
4. Make a contact sheet first.
5. Select variants.
6. Prepare front / 3-quarter / side / back turnaround if 3D production is planned.
7. Prepare animation key poses.
8. Export web-ready assets.
9. Test at actual UI size in light and dark themes.

## Visual QA Checklist

Before approving a mascot asset, verify:

- Compass is present and readable.
- Heart remains centered on torso.
- Face proportions match the canonical design.
- Same palette and material language.
- Emotion reads at 96 px.
- No extra fingers, limbs, or inconsistent anatomy.
- Pose silhouette is readable.
- Background can be removed cleanly.
- No unwanted text baked into the art.
- Light and dark UI backgrounds both work.
- Asset size is appropriate for web delivery.

## Anti-Patterns

Do not:

- redesign the mascot from scratch for every state
- turn it into a detailed humanoid robot
- add realistic human skin or hair
- add excessive neon effects that compete with UI text
- create five emotion levels differentiated only by mouth curvature
- make level 4 and level 5 both closed-eye smiles
- put permanent backgrounds into production mascot assets
- ship a large 3D model without optimization

## Default Output When No Specific Direction Is Given

Create a compact prototype pack containing:

- 5 core emotions
- 6 useful poses
- 1 turnaround sheet
- 1 animation/state sheet
- light-theme preview
- dark-theme preview
- SVG/Rive-oriented layer plan
- GLB-oriented 3D part plan
- implementation notes for Next.js
