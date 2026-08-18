# Aurora — Image Prompt Pack (Modern Gen-Z)

> Prompt สร้างภาพชุดใหม่สำหรับทิศทาง **Aurora** ทั้งหมด — วางลง image model ได้เลย (Midjourney / DALL·E / Higgsfield / ฯลฯ)
> อ่าน brief + design tokens ที่ [`README.md`](README.md)
>
> **หลักคุมให้เป็นชุดเดียวกัน:** ทุก prompt = `STYLE DNA` (ข้อ 1) + `เนื้อหาของภาพนั้น` เสมอ, ใช้ `NEGATIVE` (ข้อ 2) ทุกครั้ง, และล็อก seed เดียวกันถ้า model รองรับ

---

## 1. STYLE DNA (วางเป็นคำนำหน้าทุก prompt)

```text
Modern Gen-Z visual for "Future Me", a Thai teen education & career-discovery app.
Aesthetic: dark-first UI illustration, luminous aurora / mesh gradient background of
electric violet #6D5EF6, magenta #C13BF0 and coral #FF6B6B on near-black #0B0B14, with a
mint-lime #4FE3C1 accent glow. Glassmorphism "bento" cards with soft inner light, subtle
film grain, gentle chromatic glow, and a few tasteful 3D sticker accents (spark, star)
used sparingly. Clean, premium, aspirational, high-energy — editorial tech-magazine feel.
Authentic, diverse Thai secondary students (contemporary styled uniforms), natural candid
poses. NOT childish, NOT corporate stock, NOT a cluttered collage.
```

## 2. NEGATIVE PROMPT (ใส่ทุกภาพ)

```text
clip art, cheesy stock photo, watermark, signature, embedded UI text, gibberish letters,
low-quality cartoon, oversaturated neon chaos, cluttered collage, childish kids-book style,
distorted hands, extra fingers, plastic skin, corporate handshake, social-media like-buttons
```

## 3. Technical specs

| ภาพ | ไฟล์ | สัดส่วน | หมายเหตุ |
|---|---|---|---|
| Hero illustration | `assets/hero-visual.png` | 16:9 | เว้นที่ว่างซ้ายไว้ใส่หัวข้อไทย |
| Landing (desktop) | `mockups/landing-page-desktop.png` | 16:10 | UI mockup เต็มหน้า |
| Landing (mobile) | `mockups/landing-page-mobile.png` | 9:19.5 | UI mockup มือถือ |
| AI Interview | `mockups/ai-interview-desktop.png` | 16:10 | UI mockup |
| Career Result | `mockups/career-result-desktop.png` | 16:10 | UI mockup |
| Dashboard | `mockups/dashboard-desktop.png` | 16:10 | UI mockup |
| Roadmap (mobile) | `mockups/future-roadmap-mobile.png` | 9:19.5 | UI mockup |

> **เคล็ดคุมชุด:** gen hero ก่อน แล้วจำ seed/รูปแบบไว้ · ทุกภาพย้ำ palette เดิม (violet→magenta→coral + mint) · UI mockup ให้ระบุ "in-app UI, Thai language labels" และคง radius/ปุ่ม pill เหมือนกัน

---

## 4. Hero & illustration prompts

### 4.1 Hero (assets/hero-visual.png)
```text
[STYLE DNA]
A confident 15-year-old Thai secondary student standing at center, surrounded by floating
3D "bento" glass cards previewing possible futures — coding, robotics, culinary, design,
healthcare, music. Cards orbit gently with soft inner light. Cinematic depth of field,
large negative space on the LEFT for a bold Thai headline. 16:9, high detail.
[NEGATIVE]
```

### 4.2 "Future Self" moment (การ์ดแชร์ลง story — optional)
```text
[STYLE DNA]
Split composition: a present-day Thai student on the left dissolving into a luminous
"future self" on the right (a young professional in one chosen field), connected by a
glowing aurora light-trail. Emotional, aspirational, shareable social-story vibe.
Vertical 9:16, space at the bottom for a Thai caption.
[NEGATIVE]
```

---

## 5. UI mockup prompts (หน้าจอในแอป)

### 5.1 Landing — desktop (mockups/landing-page-desktop.png)
```text
[STYLE DNA]
A polished responsive web landing page UI mockup for "Future Me", dark-first theme.
Top: slim glass navbar with logo. Hero: bold 2-line Thai headline on the left, the Aurora
hero illustration on the right, a mint pill CTA button. Below: a bento grid of 3 glass
feature cards. In-app UI, Thai language labels, rounded 24px cards, generous spacing,
WCAG-AA contrast. Clean product design, Figma-style, 16:10.
[NEGATIVE]
```

### 5.2 Landing — mobile (mockups/landing-page-mobile.png)
```text
[STYLE DNA]
A mobile app landing screen UI mockup, dark-first. Top glass app bar with logo, a rounded
hero card with the Aurora illustration and a floating "3 เส้นทาง ไม่ใช่ 1" chip, a bold Thai
headline, a mint pill CTA, and a bottom tab bar (หน้าแรก · ค้นหา · เส้นทาง). Portrait 9:19.5,
realistic phone UI, Thai labels.
[NEGATIVE]
```

### 5.3 AI Interview (mockups/ai-interview-desktop.png)
```text
[STYLE DNA]
A warm conversational AI-interview screen UI mockup, dark-first. Left: chat thread between
a friendly AI guidance coach and a student in Thai (speech bubbles, glass surfaces). Right:
a live "evidence drawer" panel showing extracted strengths as glowing tag chips. Calm,
trustworthy, NOT a hype chatbot. Rounded cards, mint active states, 16:10.
[NEGATIVE]
```

### 5.4 Career Result — 3 routes (mockups/career-result-desktop.png)
```text
[STYLE DNA]
A results screen UI mockup showing THREE distinct route cards side by side as glassmorphism
bento cards: "Balanced Next Step", "Interest Growth", "Practical Access", each with a Thai
label, a small icon, a confidence meter, and a "ทำไมถึงแนะนำ" evidence link. Aurora gradient
accents, clear hierarchy, honest and explainable tone, 16:10.
[NEGATIVE]
```

### 5.5 Dashboard (mockups/dashboard-desktop.png)
```text
[STYLE DNA]
A student dashboard UI mockup, dark-first. A bento grid of glass cards: RIASEC profile as a
neon radar/hexagon, a 30-day trial checklist, saved routes, and next mission. Data-viz with
Aurora gradients and mint highlights, Thai labels, calm and organized (not a social feed),
16:10.
[NEGATIVE]
```

### 5.6 Roadmap — mobile (mockups/future-roadmap-mobile.png)
```text
[STYLE DNA]
A mobile roadmap screen UI mockup, dark-first. A vertical glowing timeline of milestone
nodes (now → skills → study track → TCAS/vocational → portfolio → career) as connected
aurora light-nodes, each an interactive glass card with a Thai label and a check-in button.
Portrait 9:19.5, roadmap.sh-style but cinematic, Thai labels.
[NEGATIVE]
```
