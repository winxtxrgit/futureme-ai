# 11 — Aurora (Modern Gen-Z Direction)

> **จุดประสงค์:** ทิศทางการออกแบบใหม่สำหรับ **Future Me / FuturePath AI** ที่ "Gen Z สมัยใหม่มากขึ้น" แต่ยัง **น่าเชื่อถือ** พอให้ครู/ผู้ปกครอง/กรรมการยอมรับ — ใช้เป็น brief + prompt pack สำหรับสั่ง Codex ให้ gen คอนเซปต์/ภาพชุดใหม่
>
> 🎨 **Prompt รูปภาพทั้งหมดแยกไว้ที่ไฟล์ [`image_prompts.md`](image_prompts.md)**

---

## 1. ทำไมต้องทิศทางนี้ (สรุปเหตุผล)

จากการดูภาพจริงของทั้ง 10 คอนเซปต์ (คะแนนถ่วงน้ำหนักไปที่เป้าหมาย "Gen Z สมัยใหม่ + ยังน่าเชื่อถือ"):

| Concept | Gen-Z วิบ | Wow/แชร์ได้ | ทำง่าย | น่าเชื่อถือ | เอกลักษณ์ | รวม |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **Pulse** | 10 | 9 | 6 | 6 | 8 | **8.2** |
| Timefold | 8 | 9 | 4 | 7 | 8 | 7.6 |
| Tomorrow Stories | 8 | 9 | 3 | 8 | 9 | 7.5 |
| QuestMap | 7 | 9 | 4 | 7 | 8 | 7.3 |
| Skill Constellation | 8 | 9 | 2 | 8 | 9 | 7.2 |
| Nara | 7 | 7 | 7 | 9 | 6 | 6.9 |
| Compass Coach | 6 | 6 | 8 | 9 | 5 | 6.8 |
| Clarity | 5 | 5 | 10 | 10 | 4 | 6.4 |

**ข้อสรุป:** Pulse "Gen Z" ที่สุด แต่หน้าตาเสี่ยงเป็น "โซเชียลแอป" (เปรียบเทียบ/ความเป็นส่วนตัว) — จึง **ไม่เอาตัวเดียวทั้งดุ้น**

## 2. ทิศทาง Aurora = ไฮบริด

> โครง/flow ที่น่าเชื่อถือของ **Compass Coach** + โมเมนต์ "ตัวเราในอนาคต" ที่แชร์ได้ของ **Timefold** + ภารกิจของ **QuestMap** → **สกินด้วยภาษาภาพ Gen Z ของ Pulse** แต่คุมให้สะอาด ไม่รก

- **ไม่ใช่** โซเชียลฟีด · ไม่มี like/ranking/leaderboard
- **dark-first** (มี light mode) · gradient เรืองแสง · การ์ด glassmorphism แบบ bento
- ภาษาไทยเป็นหลัก · อ่านง่าย · contrast ผ่าน WCAG AA

## 3. Design Tokens (ระบบ Aurora)

```txt
Color
- bg        #0B0B14      surface   #14141F      surface-2 #1C1C2B
- text      #F5F5FA      muted     #A0A0B8      line      #2A2A3C
- gradient  indigo #6D5EF6 → magenta #C13BF0 → coral #FF6B6B
- accent    mint #4FE3C1  (ใช้เป็น highlight / สถานะ active)

Type
- Display : grotesk หนา (เช่น Clash/Space Grotesk) + Thai "IBM Plex Sans Thai" / "Anuphan" Bold
- Body    : "Noto Sans Thai" / "IBM Plex Sans Thai" Regular–Medium

Shape & FX
- radius การ์ด 20–24px · ปุ่ม pill (999px)
- glassmorphism (blur + inner light) · mesh gradient · film grain เบา · glow
- motion : scroll-reveal, parallax เบา, spring hover (อย่าให้เวียนหัว)
```

## 4. Codex Build Prompt (คัดลอกไปสั่งได้เลย)

```text
สร้างคอนเซปต์ที่ 11 ในไลบรารี FutureMe_Web_Design_Concepts ชื่อ
"11_Concept_11 — Aurora (Modern Gen-Z)" ตามโครงสร้างโฟลเดอร์เดิมของคอนเซปต์ 01–10
(concept_overview.md / design_system.md / sitemap.md / user_flow.md /
page_structure.md / content_guide.md / image_prompts.md / assets/ /
wireframes/ / mockups/ / prototype/).

ทิศทาง: ไฮบริด = flow น่าเชื่อถือแบบ Compass Coach + โมเมนต์ "future self" แชร์ได้แบบ
Timefold + ภารกิจแบบ QuestMap แต่สกินเป็น Gen-Z สมัยใหม่ (ไม่ใช่โซเชียลแอป)

ใช้ Design Tokens ตามไฟล์ 11_GenZ_Aurora_Direction/README.md ข้อ 3
ใช้ image prompt ตามไฟล์ 11_GenZ_Aurora_Direction/image_prompts.md ทุกภาพให้เป็นชุดสไตล์เดียวกัน

สิ่งที่ต้องทำ:
1) gen hero-visual.png + 6 mockups (landing desktop/mobile, ai-interview,
   career-result, dashboard, future-roadmap-mobile) ให้สไตล์ + พาเลตตรงกันทั้งชุด
2) prototype เป็น HTML/CSS/JS ล้วน dark-mode-first responsive ไม่มี build step
3) คงภาษาไทยเป็นหลัก, contrast ผ่าน WCAG AA, และรูปแบบความน่าเชื่อถือ/PDPA
   (consent, ไม่มี like/ranking, human handoff) แบบ Compass Coach/Clarity
4) อัปเดต 99_Final_Comparison/concept_comparison.md ให้รวมคอนเซปต์ใหม่นี้
```

## 5. ข้อควรระวัง (กันพลาด)

- **อย่าให้ดู "แอปโซเชียล"** — ไม่มี feed สาธารณะ, like, ยอดวิว, การจัดอันดับเพื่อน
- คุม gradient/สติกเกอร์ให้ **เป็น accent** ไม่ใช่ทั้งหน้า (ไม่งั้นรก อ่านยาก เสียความน่าเชื่อถือ)
- ทดสอบ contrast ตัวอักษรไทยบนพื้น gradient เสมอ (โดยเฉพาะปุ่ม/หัวข้อ)
- คงหลัก PDPA/child-consent + human handoff ทุกหน้าที่มีข้อมูลเด็ก
