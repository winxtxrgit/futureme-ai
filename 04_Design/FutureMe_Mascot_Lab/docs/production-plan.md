# Production plan — where the mascot goes after the prototype

The prototype is SVG + CSS on purpose. This document is about when to leave it,
and what carries across when we do.

**What carries across, always:** the state names. `smile`, `very-happy`,
`point-left` are the same strings in the SVG classes, in a Rive state machine,
in a Lottie marker and in a GLB animation clip. Any migration that renames them
has broken the contract with the product code.

---

## Option A — SVG + CSS/JS *(current)*

One 320×380 SVG, states driven by `data-emotion` / `data-pose`.

**Good for:** everything the product needs today. ~14 KB of markup, no runtime
dependency, instant state changes, animatable by CSS, greppable in code review.

**Ceiling:** transitions between poses are per-property interpolations, not
animation. There is no way to make an arm travel along an arc, and complex
sequences (wave → point → celebrate) look mechanical.

**Stay here while** the mascot reacts to discrete product states, which is the
whole current design.

---

## Option B — Rive *(recommended next step)*

**Take this when** we want the mascot to react to the *user* rather than to the
app: hover, cursor tracking, answer-in-progress, a scale option that reacts as
you drag across it.

Rive's state machine is the right model for exactly the structure we already
have — inputs map one-to-one onto our states:

| Rive input | Type | Values |
|---|---|---|
| `emotion` | number 1–5 | matches the questionnaire value directly |
| `pose` | trigger set | `wave` `think` `listen` `pointLeft` `pointRight` `celebrate` `jump` `sit` |
| `isListening` | boolean | drives the ear pod rings |
| `lookX` / `lookY` | number −1…1 | gaze, for cursor tracking |

Migration path: import `assets/svg/futureme_mascot_view_front.svg` into Rive as
the base artboard — the layer names come across as-is, so the rig maps onto the
part list in the spec without renaming anything. Bind bones to `arm_L`, `arm_R`,
`leg_L`, `leg_R`, `head`; keep the face as a swap set of the five mouth and eye
shapes rather than as morph targets.

**Cost:** ~40 KB runtime (`@rive-app/canvas`), plus a `.riv` file. Needs a
canvas, so SSR renders nothing until hydration — keep the SVG as the fallback
for first paint.

---

## Option C — Lottie

**Take this only for** fixed non-interactive clips: a splash animation, an
onboarding intro, a success burst that always plays the same way.

Do not use Lottie for the questionnaire or for the interview companion. Every
state combination becomes its own exported clip, and 5 emotions × 9 poses is 45
files that immediately drift out of sync with the spec.

Where it does fit, export from After Effects with the same names
(`futureme_mascot_celebrate.json`) and keep clips under 2 s.

---

## Option D — 3D GLB / glTF

**Take this only when** true 3D presence improves the experience — a mascot the
user can orbit, a spatial "career map" it walks through, or a hero moment that
justifies the download. It does not improve a questionnaire, and it should not
be forced into the first implementation.

### Pipeline

1. **Blender** — model from `assets/reference/turnaround.png` at the proportions
   in the spec. Quad-dominant, subdivision-friendly, face screen as a separate
   mesh from the helmet shell.
2. **Rig** — the twelve controls in spec §7. No elbows, no knees; these limbs
   squash, they do not articulate.
3. **Face** — five blend shapes plus blink, or a UV-offset atlas on the screen
   mesh. The second is cheaper and matches how the character is meant to read:
   the face is a display.
4. **Bake** — rim light and body gradient into the albedo. Emissive stays on the
   heart, ear pods and compass needle only.
5. **Export** — glTF 2.0 → GLB, Draco or Meshopt compression, one 1K–2K atlas.
6. **Web** — `three` + `@react-three/fiber`, `useGLTF` with a suspense fallback
   showing the SVG mascot.

### Budget

| | Desktop | Mobile |
|---|---|---|
| Triangles | 20k–60k | ≤15k (LOD) |
| Texture | 2K atlas | 1K atlas |
| Materials | ≤3 | ≤3 |
| Draw calls | ≤5 | ≤5 |
| GLB size | ≤1.5 MB | ≤600 KB |

### Constraints to decide before modelling

- **First paint.** A GLB cannot be the loading state for itself. The SVG mascot
  stays as the fallback and the low-bandwidth path.
- **Reduced motion.** A 3D scene still has to hold completely still under
  `prefers-reduced-motion` — plan a static camera and a neutral pose.
- **Battery.** Continuous WebGL on a phone is expensive. Idle the render loop
  when the canvas is off-screen.

---

## Recommendation

Ship **A**. Move to **B** when the mascot starts reacting to the user rather
than to the app. Use **C** only for fixed clips. Hold **D** until there is a
product reason for it that a still character cannot serve.
