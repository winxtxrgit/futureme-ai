# Aurora Image Prompts and Traceability

All raster assets in this concept were created as an original, internally consistent set. The hero image is the production illustration used in the coded prototype. The six UI generations are preserved in `assets/generative-references/` as art-direction references; the canonical mockups in `mockups/` are rendered from the responsive HTML/CSS/JS prototype so Thai text, hierarchy, and accessibility are accurate.

## Shared STYLE DNA

```text
Modern Gen-Z visual for "Future Me", a Thai teen education and career-discovery app.
Aesthetic: dark-first UI illustration, luminous aurora and mesh-gradient background of
electric violet #6D5EF6, magenta #C13BF0 and coral #FF6B6B on near-black #0B0B14, with a
mint #4FE3C1 accent glow. Glassmorphism bento cards with soft inner light, subtle film
grain, gentle chromatic glow, and a few tasteful 3D spark or star accents used sparingly.
Clean, premium, aspirational, high-energy, editorial technology-magazine feel.
Authentic Thai secondary students in contemporary styled uniforms, natural candid poses.
Not childish, not corporate stock, not a cluttered collage.
```

## Shared NEGATIVE

```text
clip art, cheesy stock photo, watermark, signature, embedded UI text, gibberish letters,
low-quality cartoon, oversaturated neon chaos, cluttered collage, childish kids-book style,
distorted hands, extra fingers, plastic skin, corporate handshake, public social feed,
social-media like buttons, follower counts, ranking, leaderboard
```

## 1. Hero illustration

- **Output:** `assets/hero-visual.png`
- **Subject:** A confident Thai secondary student exploring possible futures.
- **Composition:** Student at center-right; six gently orbiting glass cards for coding, robotics, culinary, design, healthcare, and music; generous negative space on the left.
- **Art style:** Premium cinematic editorial 3D/photographic hybrid with restrained glass UI.
- **Lighting:** Soft aurora rim light and inner card glow.
- **Palette:** Near-black with violet → magenta → coral; mint status accents.
- **Camera:** Eye-level, medium-wide, shallow depth.
- **Background:** Abstract aurora mesh and subtle grain.
- **Intended page:** Landing hero.
- **Aspect ratio:** 16:9.
- **Text:** Exclude all text, logos, and watermarks.

```text
[STYLE DNA]
A confident 15-year-old Thai secondary student standing center-right, surrounded by six
floating 3D glass bento cards previewing possible futures: coding, robotics, culinary,
design, healthcare, and music. The cards orbit gently with soft inner light. Eye-level
medium-wide composition, cinematic depth of field, authentic natural expression, large
clean negative space on the LEFT for a bold Thai HTML headline. 16:9, high detail.
No text inside the image.
[NEGATIVE]
```

## 2. Landing — desktop generative reference

- **Output:** `assets/generative-references/landing-page-desktop.png`
- **Subject:** Full Future Me landing UI.
- **Composition:** Slim glass navigation; two-line Thai hero copy left; hero illustration right; mint CTA; three bento feature cards below.
- **Art style:** Figma-quality product presentation using the hero as a style reference.
- **Lighting:** Subtle edge glow; content surfaces remain legible.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on screen view.
- **Background:** Near-black mesh field.
- **Intended page:** Desktop landing art direction.
- **Aspect ratio:** 16:10.
- **Text:** UI text may be suggested, but canonical text is rendered in HTML.

```text
Using the supplied Aurora hero as the strict visual style reference, create a polished
responsive web landing-page UI mockup for Future Me, dark-first theme. Slim glass navbar
with an original abstract brand mark. Hero has a bold two-line Thai headline on the left,
the matching Aurora student illustration on the right, and one mint pill CTA. Below is a
clean bento grid of three glass feature cards for คุย, ลอง, and วางแผน. Rounded 24px cards,
generous spacing, WCAG-AA visual contrast, restrained violet-magenta-coral light, no public
feed. Straight-on Figma-style product screen, 16:10. Avoid important text baked into art;
no copied logos.
[NEGATIVE]
```

## 3. Landing — mobile generative reference

- **Output:** `assets/generative-references/landing-page-mobile.png`
- **Subject:** Mobile landing screen.
- **Composition:** App bar, compact illustration card, “3 routes” concept chip, Thai headline, mint CTA, bottom navigation.
- **Art style:** Premium native-web mobile UI.
- **Lighting:** Controlled aurora glow.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on portrait device screen.
- **Background:** Near-black.
- **Intended page:** Mobile landing art direction.
- **Aspect ratio:** 9:19.5.
- **Text:** Canonical labels rendered in HTML.

```text
Using the supplied Aurora hero as the strict style and character reference, create a
mobile Future Me landing-screen UI mockup, dark-first. A slim glass app bar; a rounded
hero image card with one floating concept chip for three alternative routes; bold Thai
headline; short supportive copy; one mint pill CTA; compact trust note; bottom tab bar
for หน้าแรก, ค้นหา, เส้นทาง, ของฉัน. Portrait 9:19.5, realistic responsive web UI,
clean 24px glass cards, readable hierarchy, no social feed, likes, ranks, or leaderboards.
[NEGATIVE]
```

## 4. AI interview generative reference

- **Output:** `assets/generative-references/ai-interview-desktop.png`
- **Subject:** Trustworthy conversational guidance UI.
- **Composition:** Chat/prompt on left; live evidence drawer on right.
- **Art style:** Calm product UI, not a hype chatbot.
- **Lighting:** Low-glow surfaces with mint active states.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on screen.
- **Background:** Near-black application shell.
- **Intended page:** AI interview.
- **Aspect ratio:** 16:10.
- **Text:** Canonical Thai rendered in HTML.

```text
Using the supplied Aurora hero as the strict visual reference, create a warm,
trustworthy AI-interview desktop UI mockup for Future Me. Dark-first. Left two-thirds:
a calm Thai conversation between a clearly labeled guidance coach and student, one
large Socratic question, speech bubbles, progress, pause control, and text composer.
Right third: a live editable evidence drawer showing strengths and uncertainties as
glass rows and mint status chips, plus privacy and human-counselor handoff. Rounded
24px cards, readable Thai-label hierarchy, 16:10. Not a hype chatbot and not therapy.
[NEGATIVE]
```

## 5. Career result generative reference

- **Output:** `assets/generative-references/career-result-desktop.png`
- **Subject:** Three explainable path strategies.
- **Composition:** Equal glass cards for Balanced, Interest Growth, and Practical Access, each with evidence and an unknown.
- **Art style:** Honest decision-support UI.
- **Lighting:** Restrained aurora border emphasis.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on screen.
- **Background:** Near-black application shell.
- **Intended page:** Career recommendation results.
- **Aspect ratio:** 16:10.
- **Text:** Canonical Thai rendered in HTML.

```text
Using the supplied Aurora hero as the strict style reference, create a Future Me
career-results desktop UI mockup with THREE equal route strategies side by side as
glass bento cards: Balanced Next Step, Interest Growth, and Practical Access. Each card
has a Thai route title, small original icon, evidence count explicitly not a match score,
a “ทำไมถึงเสนอทางนี้” link, an uncertainty, a trade-off, and a reversible next mission.
Aurora gradient borders used sparingly, mint active control, honest explainable tone,
clear hierarchy, 16:10. No ranking, guaranteed outcome, salary promise, or social metric.
[NEGATIVE]
```

## 6. Dashboard generative reference

- **Output:** `assets/generative-references/dashboard-desktop.png`
- **Subject:** Private student action dashboard.
- **Composition:** Bento cards for next mission, RIASEC/list evidence, 30-day plan, saved paths, and privacy status.
- **Art style:** Organized and energetic product UI.
- **Lighting:** Calm glow with one high-energy mission card.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on screen.
- **Background:** Near-black application shell.
- **Intended page:** Student dashboard.
- **Aspect ratio:** 16:10.
- **Text:** Canonical Thai rendered in HTML.

```text
Using the supplied Aurora hero as the strict visual reference, create a private student
dashboard UI mockup for Future Me, dark-first. An asymmetric clean bento grid of glass
cards: one large next mission, an accessible RIASEC/evidence summary, a 30-day trial
checklist, three saved routes, recent evidence, and a clear “ยังเป็นส่วนตัว” sharing
status. Aurora gradients and mint highlights, Thai-label hierarchy, calm and organized,
16:10. This is a personal action workspace, not a social feed. No likes, ranking, streak,
followers, or leaderboard.
[NEGATIVE]
```

## 7. Future roadmap — mobile generative reference

- **Output:** `assets/generative-references/future-roadmap-mobile.png`
- **Subject:** Editable prerequisite-aware future plan.
- **Composition:** Vertical light-node timeline from now to skills, study routes, portfolio, experience, and review; one visible branch.
- **Art style:** Cinematic but usable mobile product UI.
- **Lighting:** Connected aurora light trail with mint active node.
- **Palette:** Locked Aurora tokens.
- **Camera:** Straight-on portrait screen.
- **Background:** Near-black.
- **Intended page:** Personal future roadmap.
- **Aspect ratio:** 9:19.5.
- **Text:** Canonical Thai rendered in HTML.

```text
Using the supplied Aurora hero as the strict visual reference, create a mobile Future Me
roadmap UI mockup, dark-first. A vertical glowing timeline of milestone nodes: now,
30-day skill mission, study track, TCAS or vocational branch, portfolio, real experience,
and reflection. Each node is an interactive glass card with a Thai label, prerequisite,
status text, and check-in action. Include one clearly labeled alternate branch and a
small “ภาพจำลอง ไม่ใช่คำทำนาย” note. Portrait 9:19.5, cinematic yet highly readable,
mint active node, no fixed destiny language.
[NEGATIVE]
```

## Reproduction notes

- A single generated hero asset was established first, then supplied as the visual reference for all six UI generations.
- The source image model may not preserve deterministic seeds between environments; the hero file and SHA-256 manifest are therefore the authoritative visual reference.
- Important interface text is not sourced from the generated UI images. It lives in the prototype and is used for the canonical screenshots.
- Do not regenerate into `mockups/`; use `assets/generative-references/` for future AI art studies and render product mockups from code.

