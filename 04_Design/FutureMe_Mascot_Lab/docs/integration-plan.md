# แผนนำมาสคอตเข้า FutureMe Web App

เป้าหมาย: นำตัวละครจาก `04_Design/FutureMe_Mascot_Lab/` เข้าใช้งานจริงใน
`03_WebApp/Pre_Present` (Next.js App Router)

เอกสารนี้ตรวจกับโค้ดจริงแล้ว ไม่ใช่ข้อสันนิษฐาน — ข้อเท็จจริงที่ตรวจแล้วอยู่ใน §1
ถ้าโค้ดเปลี่ยนหลังจากวันที่เขียน ให้ตรวจ §1 ซ้ำก่อนใช้แผนนี้

ตรวจเมื่อ 1 ส.ค. 2569

## สถานะ: ทำแล้วใน `03_WebApp/With_Mascot`

Phase 0–4 เสร็จ · `npm run verify` ผ่าน (244 unit tests) · `npx playwright test` ผ่าน (20 e2e)

| Phase | สถานะ | หมายเหตุ |
|---|---|---|
| 0 baseline | ✅ | baseline เขียวก่อนเริ่ม (234 tests) |
| 1 ฐาน | ✅ | sync script อยู่ใน `verify` แล้ว |
| 2 Likert | ✅ | หน้ามาสคอต 96px เฉพาะ `sm:` ขึ้นไป ตาม §4.1 ทางเลือกที่แนะนำ |
| 3 companion | ✅ | interview loading, `Notice`, plan, routes |
| 4 QA | ✅ | ตรวจภาพจริงทั้ง light/dark และ mobile |
| 5 ปล่อย | ⬜ | ยังไม่ทำ flag — เป็นงานตอนตัดสินใจ deploy |

**สิ่งที่พบตอนลงมือและไม่ได้อยู่ในแผน:**

- `playwright.config.ts` ใช้ `npm run start` ไม่ใช่ `npm run dev` → ต้อง `npm run build`
  ก่อนถ่ายภาพหรือรัน e2e ทุกครั้ง ไม่งั้นจะทดสอบ build เก่า
- `mascot.js` มีตัวแปรที่ไม่ได้ใช้ ทำให้ lint ของแอปเตือน แก้ที่ lab แล้ว sync กลับ
  ตามกติกา ไม่ได้แก้ที่แอป
- ขนาด 72px ที่กะไว้ตอนแรกเล็กเกินไปจริงตามที่ spec เตือน ต้องขยับเป็น 96px

---

## 1. ข้อเท็จจริงจากแอปจริง (ตรวจแล้ว)

| หัวข้อ | สิ่งที่พบ | ผลต่อแผน |
|---|---|---|
| Dependencies | มีแค่ `next`, `react`, `react-dom` | ห้ามเพิ่ม runtime ใหม่โดยไม่มีเหตุผลหนัก → ตัด Rive/Lottie ออกจากรอบนี้ |
| Likert scale | `components/assessment/LikertScale.tsx` มีอยู่แล้ว เป็น `role="radiogroup"` + ปุ่ม `role="radio"` พร้อม roving tabindex, Arrow/Home/End | **ห้ามเขียนใหม่** เสียบมาสคอตเข้าโครงเดิมเท่านั้น |
| ใช้ที่ไหน | `app/interview/page.tsx` บรรทัด ~334 | flow คำถามกับ interview คือหน้าเดียวกัน ไม่ใช่คนละหน้า |
| Preferences | `lib/preferences/index.ts` มีแค่ `lang` กับ `theme` — **ไม่มี motion preference** | อย่าสร้าง pref ใหม่ ใช้ `prefers-reduced-motion` ของ OS |
| ภาษา default | `DEFAULT_PREFERENCES = { lang: "en", theme: "system" }` | **ค่าเริ่มต้นคืออังกฤษ** ข้อความมาสคอตต้องผ่าน `lib/i18n` ห้ามฮาร์ดโค้ดไทย |
| i18n | `lib/i18n/{en,th}.ts` + `dictionaryFor(lang)`, `localised(field, lang)` | เพิ่ม key มาสคอตลง Dictionary ทั้งสองไฟล์ |
| Theme | `data-theme` บน `<html>` ตั้งก่อน first paint ด้วย inline script ใน `layout.tsx` | มาสคอตเป็น theme-agnostic อยู่แล้ว ไม่ต้องทำอะไร แต่ต้อง QA |
| Tailwind | `darkMode: ["class", '[data-theme="dark"]']`, `content: ["./app/**", "./components/**"]` | **`lib/` ไม่อยู่ใน content glob** → class Tailwind ที่อยู่แต่ใน `lib/` จะถูก purge |
| Reduced motion | `globals.css` มี rule global ใช้ `!important` + คอมโพเนนต์ใช้ variant `motion-safe:` | ของเดิมชนะเสมอ ซึ่งเป็นผลที่ต้องการ |
| Scripts | `verify = typecheck && lint && test && build` — **ไม่รวม e2e** | ต้องรัน `npm run test:e2e` แยกทุกเฟส |
| e2e | `e2e/journey.spec.ts` ใช้ `getByTestId` 17 จาก 19 query ที่เหลือเป็น `getByText` regex เฉพาะเจาะจง | ความเสี่ยง query พังต่ำกว่าที่คาด แต่ยังต้องรันจริง |

### สิ่งที่แผนฉบับร่างเข้าใจผิด และแก้แล้วในเอกสารนี้

1. ~~"ต่อสวิตช์เข้า motion preference ที่มีอยู่"~~ → **ไม่มี** motion preference ใช้ OS media query
2. ~~"ความเสี่ยงสูงที่ e2e จะพังเพราะ getByRole"~~ → e2e ใช้ testid เกือบทั้งหมด ความเสี่ยง**ต่ำ**
3. ~~"assessment เป็นหน้าแยกจาก interview"~~ → เป็น `app/interview/page.tsx` หน้าเดียวกัน

---

## 2. การตัดสินใจเชิงสถาปัตยกรรม

### 2.1 สองโหมด ไม่ใช่โหมดเดียว

| การใช้งาน | วิธี | เหตุผล |
|---|---|---|
| Likert 5 ระดับ | ไฟล์ `.svg` static ผ่าน `<img>` ใน `public/mascot/` | ไม่เปลี่ยน state ระหว่าง render, ไม่มีปัญหา hydration, เบาที่สุด |
| Companion (thinking / listening / result / empty / success) | React component | ต้องสลับ emotion+pose ตามสถานะจริง และต้องการ transition |

เริ่มด้วย static ตั้งแต่แรก **อย่าเริ่มด้วย live component แล้วค่อยมา optimize ทีหลัง**
5 instance × (markup ~14KB + 12 gradients + filter blur) บนมือถือกลางล่างคือของจริง

### 2.2 Source of truth และการกัน drift

ให้ `04_Design/FutureMe_Mascot_Lab/` เป็นต้นทางงานออกแบบต่อไป แล้วในแอป:

```
scripts/sync-mascot.mjs     copy mascot.js + mascot.css เข้ามา
                            โหมด --check ใช้ใน verify: ถ้าไฟล์ต่างให้ exit 1
```

ตั้งแต่ Phase 1 ห้ามเลื่อน ถ้าปล่อยให้แก้แยกสองที่ จะ drift ภายในสัปดาห์เดียว

### 2.3 สิ่งที่ยังไม่ทำรอบนี้

Rive / Lottie / GLB — แอปมี dependency 3 ตัว การเพิ่ม runtime ~40KB
เพื่ออนิเมชันที่ CSS ทำได้อยู่แล้วยังไม่คุ้ม เงื่อนไขว่าเมื่อไหร่ควรย้ายอยู่ใน
`production-plan.md`

---

## 3. เฟสงาน

### Phase 0 — ยืนยันสมมติฐาน (2–3 ชม.)

ทำก่อนเสมอ เพราะทุกเฟสหลังขึ้นกับผลตรงนี้

- [ ] `npm run verify` และ `npm run test:e2e` บน main ให้เขียวก่อน — ต้องรู้ว่าอะไรพังอยู่แล้ว
- [ ] `npm run screenshots` เก็บ baseline
- [ ] อ่าน `app/interview/page.tsx` รอบ ๆ บรรทัด 334 ว่า `points` มาจากไหน และ `testIdPrefix` เป็นรูปแบบใด (e2e ใช้ `q-${id}-5`)
- [ ] อ่าน `lib/i18n/en.ts` ดูโครง Dictionary ว่าจะเพิ่ม key มาสคอตตรงไหน
- [ ] วัดขนาดจริงของปุ่ม Likert บนมือถือ (ดู §4.1)

**เสร็จเมื่อ:** รู้โครง Likert, รู้ที่วาง i18n key, มี baseline

---

### Phase 1 — วางฐาน ยังไม่แสดงผลให้ผู้ใช้ (1 วัน)

| # | งาน | ไฟล์ |
|---|---|---|
| 1.1 | sync script + hook เข้า `verify` | `scripts/sync-mascot.mjs`, `package.json` |
| 1.2 | คัดลอกตัวละคร | `lib/mascot/mascot.js`, `app/mascot.css` |
| 1.3 | types + state map | `lib/mascot/states.ts` (จาก `nextjs/mascot-states.ts`) |
| 1.4 | import CSS **หลัง** `@tailwind utilities` | `app/globals.css` |
| 1.5 | React component | `components/mascot/FutureMeMascot.tsx` |
| 1.6 | คัดลอก 5 ไฟล์ `face_*` | `public/mascot/` |
| 1.7 | unit test: ทุก key ใน `MASCOT_PRODUCT_STATES` ต้อง map เป็น emotion/pose ที่มีจริง | `tests/unit/mascot.test.ts` |

**ต้องแก้ก่อนใช้:** `mascot.js` ใช้ `uidCounter` ที่นับเพิ่มทุกครั้งที่เรียก
คอมโพเนนต์ต้องส่ง `uid` จาก `useId()` เข้าไปเสมอ (ดูความเสี่ยง #1)

**เสร็จเมื่อ:** `npm run verify` ผ่าน และหน้าจอยังไม่เปลี่ยนอะไรเลย

---

### Phase 2 — Likert scale (1–1.5 วัน) ← คุณค่าสูงสุด

จุดที่มาสคอตให้ผลจริงกับนักเรียน ทำก่อนเสมอ

- [ ] เพิ่ม prop `showMascot?: boolean` ใน `LikertScale` (default `false`) เปิดใช้เฉพาะที่เรียกจาก interview
- [ ] แทรก `<img src="/mascot/futureme_mascot_face_*.svg" alt="" />` ใน `<span aria-hidden>` ที่มีอยู่แล้ว **ข้าง ๆ จุดวงกลม ไม่ใช่แทนที่**
- [ ] map ค่า 1–5 → emotion ผ่าน `MASCOT_SCALE` ห้าม hardcode ในคอมโพเนนต์
- [ ] จัดการ layout มือถือ (ดู §4.1 — นี่คือส่วนที่ยากที่สุดของเฟสนี้)
- [ ] ตรวจว่า ring + จุดทึบ + label เดิมยังอยู่ครบ

**ข้อห้ามเด็ดขาด:** จุดวงกลมที่โตขึ้นตามระดับคือ signal ที่ไม่พึ่งสี **ห้ามเอาออกเพื่อให้มีที่ว่างให้มาสคอต**
ถ้าที่ไม่พอ ให้ซ่อนมาสคอต ไม่ใช่ซ่อนจุด

**เสร็จเมื่อ:** ทำ flow จนจบด้วยคีย์บอร์ดอย่างเดียวได้, `test:e2e` เขียว, screenshot diff ตรวจแล้วยอมรับ

---

### Phase 3 — Companion states (2 วัน)

เรียงตามผลกระทบ ไม่ใช่ตามความง่าย

| # | จุด | state | ทำไมลำดับนี้ |
|---|---|---|---|
| 3.1 | `app/interview/page.tsx` ระหว่างรอ AI | `listen` ↔ `think` | จุดที่ผู้ใช้กังวลที่สุด ได้ประโยชน์มากที่สุด |
| 3.2 | `Notice` ใน `components/ui.tsx` | `warning` / `success` / `empty` | จุดเดียวกระจายทั้งแอป คุ้มที่สุดต่อบรรทัดโค้ด |
| 3.3 | `app/plan/page.tsx` | `celebrate` | โมเมนต์ payoff |
| 3.4 | `app/routes/page.tsx` | `point-right` | ชี้นำสายตาไปที่ผลลัพธ์ |
| 3.5 | `app/page.tsx` | `wave` | hero สวยแต่ไม่ได้แก้ปัญหาใคร ทำท้ายสุด |

**ที่ 3.1 มาสคอตสื่อความหมายจริง** (กำลังฟัง ≠ กำลังคิด) จึงต้อง:
- `aria-label` มาจาก `lib/i18n` ตาม `lang` ปัจจุบัน
- ประกาศการเปลี่ยนสถานะที่ **ข้อความสถานะ** ด้วย `aria-live="polite"` ไม่ใช่ที่ตัวมาสคอต
  (ถ้าใส่ `aria-live` บน element ที่มี `role="img"` screen reader จะอ่านซ้ำทุกครั้งที่ animation แตะ DOM)

---

### Phase 4 — ขัดเงาและ performance (1 วัน)

- [ ] หยุด animation เมื่อ tab ซ่อน (`visibilitychange`) และเมื่อหลุด viewport (`IntersectionObserver`)
- [ ] QA บน canvas มืดจริง `#0b0b14` ซึ่งมืดกว่าพื้นหลังใน lab
- [ ] ทดสอบบนมือถือจริง โดยเฉพาะ jank ตอน scroll และแบต
- [ ] **ถ้าวัดแล้วว่าหนักจริง** ค่อยย้าย `<defs>` ไปเป็น sprite เดียวที่ root แล้วอ้างด้วย id — อย่าทำล่วงหน้า

---

### Phase 5 — ปล่อย (ครึ่งวัน)

- [ ] ซ่อนหลัง env flag เพื่อปิดได้ทันทีถ้าเจอปัญหากลางเดโม
- [ ] เก็บ screenshot ชุดใหม่เป็น baseline
- [ ] เขียนใน README ของแอปว่ามาสคอตมาจากไหน และแก้ที่ไหน (ที่ lab ไม่ใช่ที่แอป)

---

## 4. รายละเอียดที่ต้องตัดสินใจตอนลงมือ

### 4.1 พื้นที่บนมือถือ — ปัญหาจริงข้อเดียวของ Phase 2

ปุ่ม Likert ปัจจุบัน:

```
mobile  : flex row,    min-h-[54px]   ← สูงเพียง 54px
sm+     : flex column, min-h-[124px]
จุดวงกลม: อยู่ใน well ขนาด h-8 w-8 (32px)
```

`SKILL.md` กำหนดว่าอารมณ์ต้องอ่านออกที่ **96px** หน้าที่ครอปแล้วขนาด 40px
บนมือถืออ่านไม่ออก และจะกลายเป็นสีมั่ว ๆ ที่ไม่สื่ออะไร

สามทางเลือก เรียงตามที่แนะนำ:

| | ทางเลือก | ผล |
|---|---|---|
| **แนะนำ** | มาสคอตเฉพาะ `sm:` ขึ้นไป (`hidden sm:block`) มือถือใช้จุด+label เดิม | ปลอดภัยที่สุด มือถือไม่เสียอะไร เดสก์ท็อปได้ครบ |
| | เพิ่มความสูงแถวมือถือเป็น ~88px แล้วใส่หน้า 64px ทางซ้าย | ได้มาสคอตบนมือถือ แต่ต้องเลื่อนมากขึ้นในหน้าที่มีหลายคำถาม — ต้องทดสอบกับผู้ใช้จริงก่อน |
| | ย่อหน้าลงเหลือ 40px บนมือถือ | **อย่าทำ** ผิดเกณฑ์ legibility และสร้าง noise โดยไม่ให้ข้อมูล |

ตัดสินใจข้อนี้ **ก่อน** เขียนโค้ด Phase 2 ไม่ใช่ระหว่างทาง

### 4.2 ขนาดที่ใช้จริง

| จุด | ขนาด | crop |
|---|---|---|
| Likert (sm+) | 72–80px | `face` |
| Companion ใน interview | 200px (`md`) | `full` |
| Notice / empty state | 96px (`sm`) | `full` |
| Hero หน้าแรก | 300px (`lg`) | `full` |

### 4.3 i18n key ที่ต้องเพิ่ม

ลงทั้ง `lib/i18n/en.ts` และ `th.ts` — อย่างน้อย:
`mascot.listening`, `mascot.thinking`, `mascot.resultReady`, `mascot.planReady`,
`mascot.empty`, `mascot.warning`, `mascot.success`

---

## 5. ความเสี่ยง เรียงตามความน่าเจ็บ

### #1 Hydration mismatch จาก gradient id — เกือบแน่นอนว่าจะเจอ
`mascot.js` ใช้ `uidCounter` ที่นับเพิ่มทุกครั้งที่เรียก ลำดับการเรียกบน server
กับ client ไม่ตรงกัน → id คนละตัว → React เตือน hydration และ gradient อาจอ้างไม่เจอ
จนตัวละครกลายเป็นสีดำทั้งตัว

**แก้:** คอมโพเนนต์ต้องส่ง `uid` จาก `useId()` เสมอ (`mascotSVG` รับ `opts.uid` อยู่แล้ว)
เพิ่ม test ว่า render ซ้ำด้วย key เดิมได้ id เดิม
**ตรวจเจอได้จาก:** console warning ตอน dev — อย่าเพิกเฉย

### #2 มาสคอตกลายเป็นตัวสื่อค่าคำตอบโดยไม่ตั้งใจ
เมื่อดีไซน์สวย จะมีแรงกดดันให้ลบจุดหรือ label ออกเพื่อความสะอาด
นั่นคือจุดที่ผู้ใช้ตาบอดสีและ screen reader เสียข้อมูลทันที
**แก้:** unit test ว่าทุก option มี text label + จุดยังอยู่ — กันด้วยเทสต์ ไม่ใช่ด้วยความตั้งใจ

### #3 CSS cascade ชนกับ Tailwind
`mascot.css` มี selector ระดับ element และ `@media (prefers-reduced-motion)` แบบ global
**แก้:** import หลัง `@tailwind utilities`, อย่าใส่ใน `@layer base`,
ตรวจว่า preflight ไม่ทับ `svg { display: block }` ที่มาสคอตต้องการ

### #4 Tailwind purge
`content` ไม่รวม `lib/` ถ้าเผลอเขียน class Tailwind ใน `lib/mascot/` จะถูก purge หายเงียบ ๆ
**แก้:** เก็บ class ทั้งหมดไว้ใน `components/` เท่านั้น ตัว SVG ใช้ attribute ล้วนอยู่แล้วจึงไม่กระทบ

### #5 ภาษา default เป็นอังกฤษ
ต้นแบบใน lab ใช้ข้อความไทยทั้งหมด ถ้าคัดลอกมาตรง ๆ ผู้ใช้ที่ใช้ค่าเริ่มต้นจะเจอไทยปนอังกฤษ
**แก้:** ทุกข้อความผ่าน `lib/i18n` ห้ามมี string ไทยใน `components/mascot/`

### #6 e2e — ความเสี่ยงต่ำกว่าที่คาด แต่ยังต้องรัน
`journey.spec.ts` ใช้ `getByTestId` 17/19 query จึงไม่กระทบจากการเพิ่ม element ใหม่
แต่มี `getByText` 2 จุด และ `verify` **ไม่ได้รัน e2e**
**แก้:** รัน `npm run test:e2e` แยกทุกเฟส อย่ารอทำตอนจบ

### #7 น้ำหนัก DOM ในหน้าคำถาม
**แก้:** Phase 2 ใช้ static `<img>` ตั้งแต่แรก (§2.1)

### #8 ไฟล์ drift ระหว่าง lab กับแอป
**แก้:** sync script + check ใน `verify` ตั้งแต่ Phase 1 (§2.2)

### #9 default theme คือ dark
lab เปิดมาเป็น light ตัวละครผ่านการตรวจสองธีมแล้ว แต่ยังไม่เคยเห็นบน `#0b0b14` จริง
พร้อม content รอบข้าง
**แก้:** QA dark เป็นค่าเริ่มต้น ไม่ใช่ทางเลือกท้ายสุด

---

## 6. Definition of done

ทุกข้อต้องผ่านก่อนถือว่าเสร็จ

- [ ] `npm run verify` เขียว
- [ ] `npm run test:e2e` เขียว
- [ ] ทำ flow ทั้งหมดด้วยคีย์บอร์ดอย่างเดียวได้ focus ring เห็นชัดทุกจุด
- [ ] ปิดสีทั้งหมด (greyscale) แล้วยังตอบแบบประเมินได้ถูกต้อง
- [ ] เปิด reduced motion ระดับ OS แล้วไม่มีอะไรขยับ แต่การเปลี่ยนสถานะยังทำงาน
- [ ] อ่านได้ทั้ง `data-theme="light"` และ `"dark"`
- [ ] สลับ `lang` เป็น `en` แล้วไม่มีข้อความไทยหลงเหลือ
- [ ] zoom 200% ไม่มี layout พัง
- [ ] ทดสอบบนมือถือจริงอย่างน้อย 1 เครื่อง
- [ ] ไม่มี console warning เรื่อง hydration

---

## 7. ลำดับความสำคัญถ้าเวลาไม่พอ

1. **Phase 0 + 1 + 2 เท่านั้น** — ได้ผลกับผู้ใช้จริงประมาณ 80% ด้วยความเสี่ยงต่ำสุด (~2 วัน)
2. เพิ่ม 3.1 (interview) และ 3.2 (`Notice`) — คุ้มที่สุดต่อบรรทัดโค้ด (+1 วัน)
3. ที่เหลือทำหลังเดโม

**รวมทั้งหมดประมาณ 5–6 วันทำงาน**

---

## 8. สิ่งที่ตั้งใจไม่ทำ

| ไม่ทำ | เหตุผล |
|---|---|
| เขียน `LikertScale` ใหม่ | ของเดิมทำ ARIA และ keyboard ถูกต้องแล้ว การเขียนใหม่มีแต่เสีย |
| เพิ่ม motion preference ใน `lib/preferences` | เป็นการตัดสินใจระดับโปรดักต์ ไม่ใช่ของมาสคอต ถ้าจะเพิ่มควรเป็นงานแยก |
| ใส่มาสคอตทุกหน้า | ทำให้ความหมายเจือจาง ใส่เฉพาะจุดที่สื่อสารสถานะจริง |
| Rive / Lottie / GLB | ยังไม่มีเหตุผลด้านโปรดักต์ ดู `production-plan.md` |
