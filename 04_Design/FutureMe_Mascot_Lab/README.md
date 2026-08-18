# FutureMe Mascot Lab

Prototype workspace for the FutureMe / FuturePath mascot. It exists so the team
can agree on how the character behaves inside the product **before** anyone
commits to final 2D or 3D production.

Open `index.html` in a browser. No build step, no server.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The lab: stage, 5-point scale, product states, themes, turnaround |
| `mascot.js` | The character. Geometry + SVG markup, one source of truth |
| `mascot.css` | The character's behaviour: emotion map, poses, motion |
| `app.js` | The tool around the character |
| `styles.css` | Lab shell, using the app's Aurora tokens |
| `assets/svg/` | 23 exported SVGs (generated — do not hand-edit) |
| `assets/reference/` | The rendered art direction reference |
| `tools/export-assets.js` | `node tools/export-assets.js` regenerates `assets/svg/` |
| `nextjs/` | Drop-in component + types for the web app |
| `docs/` | Character spec, production plan, naming convention |
| `docs/integration-plan.md` | Phased plan for putting the mascot into the live web app |

`mascot.js` + `mascot.css` are the portable unit. Copy those two files anywhere
and the character works; everything else is scaffolding around them.

## The state API

```js
const m = FutureMeMascot.create(el, { emotion: 'smile', pose: 'wave' });

m.setMascotState({ emotion: 'very-happy', pose: 'celebrate' });
m.blink();
```

| Field | Values |
|---|---|
| `emotion` | `dislike` `not-okay` `neutral` `smile` `very-happy` |
| `pose` | `idle` `wave` `think` `listen` `point-left` `point-right` `celebrate` `jump` `sit` |
| `view` | `front` `three-quarter` `side` `back` |
| `crop` | `full` `face` |

Motion is controlled by attributes on any ancestor, so a page can turn parts of
it off without touching the character:

```html
<body data-fm-anim="on" data-fm-idle="on" data-fm-hover="on"
      data-fm-heart="on" data-fm-compass="on" data-fm-reduced="off">
```

`prefers-reduced-motion` is always respected regardless of these.

## Two rules that are easy to break

1. **Level 4 keeps its eyes open.** Only `very-happy` closes them into crescents,
   otherwise levels 4 and 5 collapse into the same picture. The blink shape is
   deliberately flatter than the crescent for the same reason.
2. **The mascot never carries a value on its own.** Every emotion control has a
   visible number and text label; the character supports them.

## Editing the character

Geometry lives in `G` at the top of `mascot.js`; colours live in `PALETTE` right
below it. Both are quoted in `docs/mascot-spec.md`.

One trap worth knowing: in SVG, a CSS `transform` **replaces** the `transform`
attribute instead of composing with it. That is why placement and animation are
always on separate groups (`.fm-arm-place` positions, `.fm-arm-limb` rotates).
Putting both on one element sends the part to the canvas origin.

## Regenerating assets

```bash
node tools/export-assets.js
```

Writes 23 standalone SVGs into `assets/svg/` with `mascot.css` inlined, so each
file renders correctly on its own in Figma, an `<img>`, or `public/`. They are
generated from the live source, so an exported asset cannot drift from what the
team approved in the lab.
