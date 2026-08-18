# FutureMe Mascot — Character Specification

Version 1.0 · prototype. The rendered sheets in `../assets/reference/` are the
authority on form and material; the numbers here are the authority on
proportion and part naming.

---

## 1. Identity

A small rounded futuristic AI companion. Oversized helmet with a dark navy face
screen, Aurora purple→blue→cyan body, pink cheeks, a glowing pink heart on the
chest, and a compass emblem mounted on top of the head.

It is a career-discovery companion, not decoration: it communicates emotion,
direction, encouragement and progress, and it must never compete with the text
it sits beside.

**Never**: complex armour, weapons, clothing, logos, baked-in text, human skin
or hair, a detailed humanoid robot, or a permanent background.

---

## 2. Proportions

Canvas `320 × 380`, feet on y=350. These are the values in `G` in `mascot.js`.

| Part | Geometry |
|---|---|
| Compass | centre (160, 54), r 30, stem 14 × 26 |
| Helmet | x 52–268, y 76–218 — dome top, softly squared jaw |
| Face screen | x 84, y 112, 152 × 92, corner radius 34 |
| Eyes | centres (124, 152) and (196, 152), rx 17, ry 21 |
| Mouth | anchored at (160, 180) |
| Cheeks | (99, 180) and (221, 180), rx 13, ry 8 |
| Ear pods | (48, 158) cyan and (272, 158) magenta, rx 18, ry 23 |
| Torso | y 206–320, widest ≈ 118 wide at y 258 |
| Heart | centre (160, 266), 52 wide |
| Shoulders | (94, 232) and (226, 232); arm rx 18, ry 33 |
| Legs | hips at x 142 and 178, y 300, 33 × 50 |
| Ground shadow | (160, 354), rx 68, ry 10 |

Head to full height ≈ **0.55**. That ratio is the character; if it drifts, the
mascot stops reading as itself long before the colours do.

---

## 3. Material palette

| Token | Hex | Used for |
|---|---|---|
| `outline` | `#3743D6` | Every silhouette stroke, 4.5–5 px at this scale |
| `helmetTop → helmetRim` | `#8C68F4` → `#6E85F7` → `#59CDFA` → `#DDFDFF` → white | Helmet gradient, near-vertical |
| `screenTop / screenBottom` | `#5060BE` / `#4453B0` | Face screen |
| `dial` | `#1B2560` | Compass face — deliberately *not* the screen colour |
| `eye` | `#111845` | Eyes, brows, mouth |
| `cheek` | `#FF9ACB` | Blush, 80 % base × 55–100 % by emotion |
| `torsoCore → torsoEdge` | `#FFFFFF` → `#CBF4FF` → `#93CCFB` → `#93A8F7` → `#A484F5` | Torso radial, lit from the heart outward |
| `limbTop / limbBottom` | `#9B82F8` / `#7358E8` (highlight `#B9A6FC`) | Arms, legs, compass stem |
| `earLeft / earRight` | `#8FF2FF` / `#FF8FDC` | Ear pods |
| `heartCore → heartEdge` | `#FFD6EF` → `#FF8AD4` → `#FF56B4` | Heart |
| `needleNorth / needleSouth` | `#FF6FB4` / `#BFF3FF` | Compass needle halves |

The palette is deliberately light. The first pass sat in mid indigo with a heavy
purple edge and read as a *dark* character on a light page; the lit half of every
gradient now starts higher and the outline is lighter. Depth is carried by the
limbs and the helmet crown, which stay saturated so the silhouette does not go
flat — do not lighten those two further.

The face screen was lifted out of near-black for the same reason. Note what this
does and does not buy: the ink against the screen goes from about 1.2:1 to about
3:1, which is a real improvement, but the expressions were never carried by
luminance in the first place. They read by **shape and the white eye
highlights** — which is exactly why every emotion control in the product also
carries a number and a text label.

The character carries no theme tokens. It is one palette that must read on both
the light and dark app canvas — verified in the lab's Light / Dark panel.

### Glow

Three glows only, all soft and none strong enough to compete with body text:

- **Heart** — radial `#FF5FBE` at 55 % → 0, pulsing 0.75→1 opacity over 2.8 s.
- **Right ear pod** — blurred `#FF8FDC` at 40 %, the "listening / active"
  indicator; it dims to 12 % on the two negative emotions.
- **Rim light** — not a glow but a 7 px `helmetRim` stroke along the jaw. This is
  the single strongest read in the reference render; do not lose it.

---

## 4. Construction / part separation

For 2D these are SVG groups; for 3D they are separate meshes or rig controls.
The names are identical across SVG, Rive and GLB.

```
fm-root
└ fm-body                    pose offset (sit, jump landing)
  └ fm-breathe               looping motion only
    ├ fm-leg--left/right
    │  └ fm-leg-place        position   ← never animated
    │     └ fm-leg-limb      rotation   ← animated
    ├ fm-torso
    │  └ fm-heart
    │     └ fm-heart-glow
    ├ fm-listen              listening rings (behind head)
    ├ fm-head                head tilt
    │  ├ fm-ear--left/right
    │  ├ fm-compass
    │  │  ├ fm-compass-stem
    │  │  └ fm-compass-dial
    │  │     └ fm-compass-needle / fm-needle-spin
    │  ├ fm-helmet
    │  │  └ fm-helmet-rim
    │  ├ fm-side-pod         profile view only
    │  └ fm-face
    │     ├ fm-screen
    │     ├ fm-cheeks
    │     ├ fm-eyes → fm-brow, fm-eye (5 shape variants each)
    │     └ fm-mouth (5 shape variants)
    ├ fm-arm--left/right     drawn AFTER the head — a raised arm must pass in front
    │  └ fm-arm-place → fm-arm-limb → fm-hand-point
    ├ fm-thought             thinking dots
    └ fm-sparkles            celebration confetti
```

**Why placement and animation are split:** a CSS `transform` replaces the SVG
`transform` attribute rather than composing with it. One element cannot both
hold its position and be animated, or it snaps to the canvas origin.

---

## 5. Emotions

Five levels. Each differs by **eye shape, brow, mouth, blush and glow** — not by
mouth curvature alone, so the set survives greyscale.

| # | State | Eyes | Brow | Mouth | Blush | Heart glow |
|---|---|---|---|---|---|---|
| 1 | `dislike` | narrowed (ry 17) | angled down to the nose | frown | 70 % | 35 % |
| 2 | `not-okay` | smaller, two highlights | outer end lifted | squiggle | 55 % | 55 % |
| 3 | `neutral` | open | — | flat line | 75 % | 100 % |
| 4 | `smile` | **open** | — | smile arc | 100 % | 100 % |
| 5 | `very-happy` | closed crescents | — | open mouth + tongue | 100 % | 100 % |

Two hard rules:

- Level 4 never closes its eyes. Levels 4 and 5 must stay distinguishable.
- The blink shape is a flatter downward arc, not the level-5 crescent, so a
  blink is never mistaken for an answer.

Emotion must read at **96 px**. Below roughly 140 px of full-body mascot, use
the `face` crop (`viewBox 32 16 256 208`) instead of shrinking the whole
character — the 5-point scale in the lab does exactly this. At 100 px of layout
width, the full body puts the face at ~45 px; the crop puts it at ~90 px.

---

## 6. Poses

| Pose | Reads as | Mechanics |
|---|---|---|
| `idle` | resting, alive | breathing + float only |
| `wave` | greeting | left shoulder out 14 px, arm 136°↔162°, 1.1 s |
| `think` | processing | hand to chin (−100°), head −5°, gaze up, rising dots |
| `listen` | receiving | head +5°, arms slightly out, rings ping from the magenta pod |
| `point-left` | directing | left arm 104°, finger shown, gaze left |
| `point-right` | directing | mirrored |
| `celebrate` | success | both arms up 146°, bounce, confetti |
| `jump` | delight | −34 px hop, legs splayed, shadow shrinks to 60 % |
| `sit` | waiting | body +22 px, legs folded to 48 %, shadow widens |

### Timing

| Motion | Duration |
|---|---|
| Idle breathing | 3.6 s |
| Float / hover | 5 s, ≈6 px |
| Blink | 150 ms, irregular every 3–7 s |
| Wave | 1.1 s |
| Reaction (state change) | 0.45–0.5 s |
| Celebrate / jump | 1.4–1.5 s |
| Heart pulse | 2.8 s |
| Compass drift | 7 s, ±9° |

Nothing loops faster than 1.1 s and nothing moves more than ~6 px while a user
is reading. Blink is scheduled in JS, not CSS — a blink on a fixed interval
reads as a machine.

---

## 7. Turnaround for 3D

`assets/reference/turnaround.png` is the modelling reference: front, 3/4, side,
back. The lab's `data-view` states are CSS approximations for checking part
placement, not art.

What each view has to establish:

- **Front** — symmetry, screen size relative to helmet, heart centred on torso.
- **3/4** — the screen is a shallow inset, not a decal; helmet volume is a
  squashed sphere.
- **Side** — helmet depth ≈ 80 % of its width; the ear pod sits proud of the
  shell; heart wraps slightly around the chest.
- **Back** — no face, no heart. The helmet is a clean shell; the compass stem is
  the only interruption.

### Neutral build pose

Feet flat and shoulder-width, arms hanging at ≈8° from the body, head level,
face neutral. Full T-pose is wrong for these proportions — the arms are short
teardrops and there is no elbow to straighten.

### Web targets

| Constraint | Target |
|---|---|
| Format | GLB / glTF 2.0, Draco or Meshopt |
| Triangles | 20k–60k main model; ≤15k mobile LOD |
| Textures | one 1K–2K atlas |
| Materials | ≤3 — body, screen, emissive (heart + pods + rim) |
| Draw calls | ≤5 |

Bake the rim light and body gradient into the albedo; keep only the heart, ear
pods and compass needle emissive.

### Rig

Twelve controls, matching the part list:

```
root → hips → spine → head → { compass, face_target }
hips → leg_L, leg_R          (1 joint each, squash only)
spine → arm_L, arm_R         (1 joint each, no elbow)
face  → blend shapes: dislike, not_okay, neutral, smile, very_happy, blink
```

Eyes, brows and mouth are blend shapes or UV-swapped screen textures, never
separate geometry — the face is a display, and treating it as one keeps the
five expressions cheap.

---

## 8. Accessibility

- Every emotion control carries a visible number and text label. The mascot
  supports the label; it is never the only carrier of a value.
- Decorative instances: `role="presentation"`, `aria-hidden="true"`.
  Meaningful instances: `role="img"` with a localised `aria-label` that changes
  with the state.
- Focus rings belong to the control, never to the mascot, and are never
  animated.
- `prefers-reduced-motion` stops all looping motion. State changes still happen
  instantly — a reduced-motion user must not lose information.

---

## 9. QA checklist

Before approving any mascot asset:

- [ ] Compass present, needle readable, pointing north-east at rest
- [ ] Heart centred on the torso
- [ ] Rim light along the jaw intact
- [ ] Emotion readable at 96 px
- [ ] Level 4 eyes open, level 5 closed
- [ ] All five levels distinguishable in greyscale
- [ ] Pose silhouette readable — a raised arm clears the head
- [ ] Works on both the light and dark app canvas
- [ ] Transparent background, no baked text
- [ ] No extra limbs, no anatomy drift from §2
