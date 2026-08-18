# Aurora Design System

## Design principles

1. **Energy around clarity.** Aurora light may frame content, but never compete with it.
2. **Evidence before confidence.** Show why a conclusion appears, what is missing, and how to challenge it.
3. **One useful action.** Every view has one visually dominant next step.
4. **Private by default.** Consent and sharing status are visible, understandable, and reversible.
5. **Thai-first, not translated-later.** Components are sized for Thai line height, long labels, and mixed Thai/English study terms.
6. **Motion with an exit.** Animation is subtle, nonessential, and disabled by `prefers-reduced-motion`.

## Color tokens

### Dark theme — default

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0B14` | Page canvas |
| `--surface` | `#14141F` | Primary cards and header |
| `--surface-2` | `#1C1C2B` | Raised controls and nested cards |
| `--text` | `#F5F5FA` | Primary text |
| `--muted` | `#A0A0B8` | Secondary text; use at 16px+ |
| `--line` | `#2A2A3C` | Dividers and boundaries |
| `--indigo` | `#6D5EF6` | Aurora start / secondary action |
| `--magenta` | `#C13BF0` | Aurora mid-point; decorative only |
| `--coral` | `#FF6B6B` | Aurora end / attention accent |
| `--mint` | `#4FE3C1` | Primary action and active/completed state |
| `--mint-ink` | `#07130F` | Text on mint controls |
| `--danger` | `#FF8C99` | Destructive/error states |
| `--warning` | `#FFD37A` | Source freshness and uncertainty |

### Light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F6FB` | Page canvas |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-2` | `#EFEDF7` | Nested controls |
| `--text` | `#161522` | Primary text |
| `--muted` | `#5E5B72` | Secondary text |
| `--line` | `#D8D4E5` | Boundaries |
| `--indigo` | `#5142D6` | Accessible link/accent |
| `--mint` | `#087F69` | Accessible active/link color |
| `--mint-fill` | `#4FE3C1` | Filled CTA with dark text |

### Gradient rules

```css
--aurora: linear-gradient(115deg, #6D5EF6 0%, #C13BF0 48%, #FF6B6B 100%);
```

- Use for light fields, borders, illustrations, and at most one hero word—not paragraphs.
- Put readable content on an opaque or 94% opaque surface.
- Mint CTA uses `#07130F` text; never white text on mint.
- Status never relies on hue alone: add an icon, label, and shape.

## Typography

| Role | Stack | Desktop | Mobile | Notes |
|---|---|---:|---:|---|
| Display | `"Arial Black", "Noto Sans Thai", "IBM Plex Sans Thai", system-ui` | 56–88px / .98 | 42–56px / 1.03 | Bold, short, maximum 3 lines |
| H1 page | Same as display | 48–64px / 1.05 | 36–44px / 1.12 | Avoid condensed Thai |
| H2 | `"Noto Sans Thai", system-ui` 750 | 32–44px / 1.2 | 28–34px / 1.25 | |
| H3 | Same, 700 | 20–24px / 1.35 | 19–22px / 1.4 | |
| Body | `"Noto Sans Thai", "IBM Plex Sans Thai", system-ui` | 17px / 1.7 | 16px / 1.65 | Minimum 16px |
| Label | Same, 700 | 13–14px / 1.4 | 13–14px / 1.4 | Avoid all-caps Thai |

Line length is limited to roughly 58–72 Latin characters or 34–46 Thai glyphs for long reading. Mixed Thai/English labels may wrap; controls must grow rather than truncate key meaning.

## Shape, depth, and spacing

- Card radius: `20px`, feature radius: `24px`, control radius: `14px`, pill: `999px`.
- Base spacing: 4px; common steps: 8, 12, 16, 20, 24, 32, 48, 64, 96.
- Glass cards: `background: rgba(20,20,31,.88)`, `border: 1px solid rgba(255,255,255,.10)`, `backdrop-filter: blur(18px)`.
- Use an inner highlight and one soft shadow. Do not stack more than two translucent layers.
- Grain is a 2–3% opacity CSS texture. It never obscures text or focus rings.
- Content width: 1240px; readable prose: 720px.

## Core components

### App chrome

- Glass top bar on desktop; four-tab bottom bar on mobile.
- Brand mark is an abstract aurora aperture, not a third-party logo.
- Theme toggle has visible text or an accessible name and remembers the setting.
- Active page uses both mint indicator and `aria-current="page"`.

### Buttons

- Primary: mint fill, dark text, minimum 48px high.
- Secondary: opaque surface-2, visible border.
- Ghost: transparent with visible border; never used as the only destructive confirmation.
- Focus: 3px mint outline with 3px offset.
- Loading, pressed, disabled, and success states include text labels.

### Glass bento card

- Opaque enough for AA contrast.
- One clear heading and one action.
- Gradient edge is decorative; content order remains logical without CSS grid.
- Mobile order follows task priority, not desktop visual position.

### AI interview

- AI and student messages use label + position + surface, not color alone.
- Prompt appears as an explicit question heading.
- Evidence drawer shows **source, status, edit, delete, and uncertainty**.
- Pause, save, transcript deletion, and “คุยกับครูแนะแนว” remain visible.
- Input is never covered by the mobile keyboard.

### Evidence chip

States: `มีหลักฐาน`, `กำลังสำรวจ`, `ยังไม่พอ`, `ผู้ใช้แก้ไขแล้ว`.
Each chip has an icon, text, and a source link. There is no numerical compatibility score.

### Route card

Three equal strategies:

1. **Balanced Next Step — ทางที่สมดุล**
2. **Interest Growth — ทางขยายความสนใจ**
3. **Practical Access — ทางลงมือและเข้าถึงได้**

Each includes reasons, evidence count, constraints, unknowns, verified-source date, and one reversible next experiment. The highlighted card means “recommended to explore first,” not “best person-job match.”

### Future-self moment

- Shows a conditional scenario: “ถ้าคุณเลือกลอง A และยังรู้สึกมีพลัง…”
- Includes assumptions, alternate path, and “ภาพจำลอง ไม่ใช่คำทำนาย.”
- Share export contains no assessment score, diagnosis, private chat, school ranking, or earnings promise.

### Roadmap node

- Contains status label, milestone, prerequisite, time window, evidence, and action.
- Branches are represented in DOM reading order and have a list-mode equivalent.
- Completion celebrates learning, not streaks or public performance.

### Consent and human handoff

- Sharing panel names recipient, fields, duration, purpose, and revoke control.
- Raw transcript is off by default.
- Support control says who will receive the request and expected response context; emergency messaging follows project safety policy.

## Interaction and motion

- Hover: 2–4px lift and subtle border glow, 160–220ms.
- Page reveal: opacity + 8px translate, max 300ms.
- Future-self light trail: slow ambient movement only.
- No autoplay carousels, scroll hijacking, rapid flashes, parallax on mobile, or essential information revealed only through hover.
- With reduced motion, all transforms and ambient movement stop.

## Accessibility acceptance criteria

- WCAG 2.2 AA target, including contrast, focus appearance, keyboard operation, reflow, target size, and error identification.
- Semantic landmarks, heading hierarchy, `lang="th"`, descriptive page titles, and a skip link.
- Minimum 44×44px targets; primary controls 48px+.
- Full keyboard route through navigation, chat, evidence controls, results, and roadmap.
- Screen-reader status messages for sent replies, saved routes, theme changes, and consent changes.
- No color-only charts; RIASEC and progress always include a text/list alternative.
- `200%` zoom and 320px reflow without loss of content.
- Theme preference plus operating-system contrast/motion preferences.
- Illustrations have meaningful alt text; decorative aurora fields use empty alt or CSS.

## Anti-patterns

- Public feed, likes, view counts, follower counts, rankings, streak anxiety, or leaderboards.
- White type placed directly over bright gradient without a solid layer.
- Glass-on-glass nesting beyond two layers.
- AI confidence percentages that imply scientific precision.
- Career copy such as “คุณเกิดมาเพื่อ…”, “แมตช์ 96%”, or guaranteed salary/outcome claims.

