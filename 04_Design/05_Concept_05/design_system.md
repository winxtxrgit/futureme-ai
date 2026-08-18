# QuestMap Design System

## Design intent

Tactile 2.5D islands, bright tropical palette, mission badges, and rounded map controls.

## Color tokens

| Token | Value | Use |
|---|---:|---|
| Background | `#FFF4D8` | Page canvas |
| Surface | `#FFFDF6` | Cards, dialogs, forms |
| Primary text | `#2B2740` | Headings and body |
| Muted text | `#716B79` | Supporting copy; verify AA contrast at each size |
| Primary action | `#E95A67` | Main CTA and active states |
| Secondary | `#1FA99A` | Supporting visualization/choice |
| Accent | `#F6C84A` | Small highlights only |
| Border | `#E6D4A7` | Dividers and control outlines |

Never use color alone to represent route status, RIASEC signal, confidence, or progress.

## Typography

- UI/body stack: `"Arial Rounded MT Bold", "Noto Sans Thai", system-ui, sans-serif`
- Display stack: `"Arial Rounded MT Bold", "Noto Sans Thai", system-ui, sans-serif`
- Display: clamp(2.6rem, 6vw, 6.4rem), line-height 0.95–1.08.
- H1: 48–72 px desktop, 38–48 px mobile.
- H2: 30–44 px desktop, 28–34 px mobile.
- Body: 18 px preferred, 16 px minimum; Thai line-height 1.55–1.75.
- Label: 13–14 px with clear casing; avoid excessive letter spacing in Thai.

The prototype uses local system fonts so it runs offline. Production should test an appropriate Thai webfont and performance budget.

## Spacing and shape

- 4 px base grid.
- Content max width: 1240 px.
- Section spacing: 96–144 px desktop; 64–88 px mobile.
- Card padding: 24–32 px.
- Default radius: `28px`.
- Touch target: at least 44 × 44 px; use 48 px for primary mobile controls.

## Components

### Primary button

Solid primary color, high-contrast label, optional arrow, visible focus ring, and clear disabled state.

### Route card

Must include route strategy, short rationale, 2–3 evidence items, open question, trade-off, source state, and a Try next action. A route card never shows a “perfect match” badge.

### Evidence chip

Carries both a label and source type: `เรื่องที่เล่า`, `ภารกิจ`, `ความสนใจ`, or `ข้อจำกัด`. Clicking opens the original editable evidence.

### AI message or prompt

One question per message. Streaming text is announced accessibly after a complete thought, not token by token.

### Roadmap node

Uses icon/label/status text, prerequisite disclosure, and accessible list order. Locked means “requires a previous step,” never “failed.”

### Source/freshness badge

Shows publisher, last checked date, and whether the learner must verify current criteria.

## Illustration and imagery

- Direction: Tactile 2.5D islands, bright tropical palette, mission badges, and rounded map controls.
- Generated hero: `assets/hero-visual.png`.
- Keep headlines, labels, statistics, and calls to action out of generated images.
- Use meaningful alt text when the image communicates content; use empty alt text when purely decorative.
- Avoid prestige cues, gendered job imagery, copied platform layouts, branded uniforms, and fortune-telling symbols.

## Motion

- 160–240 ms for controls, 320–480 ms for layout transitions.
- Animate relationship changes—not decorative loops.
- Respect `prefers-reduced-motion`; maps and timelines must work without animation.

## Accessibility QA

- WCAG 2.2 AA target.
- Test 360 px, 200% zoom, keyboard-only, VoiceOver/TalkBack, reduced motion, and high contrast.
- Focus ring uses a 3 px outline with at least 3:1 contrast.
- Error messages appear in an error summary and beside the field.
- All charts/graphs include a table or list view.

