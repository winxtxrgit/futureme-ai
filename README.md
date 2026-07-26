<a id="top"></a>

<p align="center">
  <img src="assets/banner/banner.svg" alt="FutureMe AI — explore the next step, not one final answer" width="100%">
</p>

# FutureMe AI

<p align="center">
  <strong>Career and study exploration for Thai students—built around reflection, a short scenario mission, and several routes they can question and compare.</strong>
  <br>
  <strong>เครื่องมือช่วยนักเรียนไทยสำรวจเส้นทางเรียนและอาชีพ ผ่านการทบทวนตัวเอง ภารกิจสถานการณ์สั้น ๆ และหลายทางเลือกที่ตั้งคำถามและเปรียบเทียบได้</strong>
</p>

<p align="center">
  <a href="https://github.com/winxtxrgit/futureme-ai/actions/workflows/ci.yml"><img src="https://github.com/winxtxrgit/futureme-ai/actions/workflows/ci.yml/badge.svg" alt="Continuous integration status"></a>
</p>

<p align="center">
  <strong><a href="#try-the-prototype">Try the prototype · ทดลองใช้ต้นแบบ</a></strong>
  &nbsp;·&nbsp;
  <a href="#how-it-works">See how it works · ดูวิธีทำงาน</a>
  &nbsp;·&nbsp;
  <a href="READMEEN.md">English</a>
  &nbsp;·&nbsp;
  <a href="READMETH.md">ภาษาไทย</a>
</p>

<p align="center">
  <sub>Functional prototype · English interface · guest mode · no API key required<br>
  ต้นแบบที่ใช้งานได้ · อินเทอร์เฟซภาษาอังกฤษ · โหมด guest · ไม่ต้องใช้ API key</sub>
</p>

---

## The idea · แนวคิด

FutureMe does not try to answer **“What should I become?”** It helps a student answer
**“What should I explore next, and what evidence would help?”**

FutureMe ไม่ได้พยายามตอบว่า **“ฉันควรเป็นอะไร?”** แต่ช่วยให้นักเรียนตอบได้ว่า
**“ฉันควรลองสำรวจอะไรต่อ และต้องมีหลักฐานอะไรเพิ่ม?”**

It is designed for Thai lower-secondary, upper-secondary, and vocational students. It supports
exploration; it does not replace a qualified counsellor or predict admission, employment, or income.

ออกแบบสำหรับนักเรียนไทยระดับมัธยมต้น มัธยมปลาย และอาชีวศึกษา
เพื่อช่วยสำรวจทางเลือก ไม่ใช่ทดแทนครูแนะแนวหรือพยากรณ์การสอบติด การได้งาน หรือรายได้

---

<a id="how-it-works"></a>

## How it works · ประสบการณ์ใช้งาน

<p align="center">
  <strong>Reflect · ทบทวน</strong>
  &nbsp;→&nbsp;
  <strong>Try · ลอง</strong>
  &nbsp;→&nbsp;
  <strong>Explore · สำรวจ</strong>
  &nbsp;→&nbsp;
  <strong>Compare · เทียบ</strong>
  &nbsp;→&nbsp;
  <strong>Act · ลงมือ</strong>
</p>

- **Reflect · ทบทวน** — use a fixed interview to capture interests and real constraints · ใช้ interview แบบคงที่เพื่อเก็บความสนใจและข้อจำกัดที่มีผลจริง
- **Try · ลอง** — complete one short scenario mission · ทำภารกิจสถานการณ์สั้น ๆ หนึ่งชิ้น
- **Explore · สำรวจ** — see zero to three directions, never a manufactured winner · เห็นศูนย์ถึงสามทิศทางโดยไม่สร้าง “ผู้ชนะ”
- **Compare · เทียบ** — inspect evidence, trade-offs, unknowns, and sources · ดูหลักฐาน ข้อแลกเปลี่ยน สิ่งที่ยังไม่รู้ และแหล่งข้อมูล
- **Act · ลงมือ** — turn one route into a reversible 30-day experiment · เปลี่ยนหนึ่งเส้นทางเป็นการทดลอง 30 วันที่ย้อนกลับได้

---

<a id="try-the-prototype"></a>

## Try the prototype · ทดลองใช้ต้นแบบ

```bash
git clone https://github.com/winxtxrgit/futureme-ai.git
cd futureme-ai
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Start as guest**.
The complete journey works with no account and no API key.

เปิด [http://localhost:3000](http://localhost:3000) แล้วกด **Start as guest**
เส้นทางผู้ใช้ทำงานครบโดยไม่ต้องมีบัญชีหรือ API key

<p align="center">
  <a href="assets/screenshots/app/routes-desktop.png"><img src="assets/screenshots/app/routes-desktop.png" alt="Current FutureMe routes screen showing several directions with equal visual weight" width="90%"></a>
</p>

<p align="center">
  <sub>Current application screen · ภาพจากแอปปัจจุบัน</sub>
</p>

---

## What is real today · สิ่งที่มีอยู่จริงวันนี้

**Current prototype · ต้นแบบปัจจุบัน**

- Fixed English interview, three rule-selected missions, six illustrative routes
- Deterministic client-side engine with refusal gates, ties, provenance, and data-age warnings
- Route comparison, four-week exploration plan, refresh recovery, and immediate local deletion
- แบบสัมภาษณ์ภาษาอังกฤษ ภารกิจสามชิ้นที่เลือกด้วยกฎ และเส้นทางตัวอย่างหกทาง
- เอนจิน deterministic ฝั่ง client ที่ปฏิเสธการเดา แสดงทางที่สูสี แหล่งข้อมูล และอายุข้อมูล
- หน้าเปรียบเทียบ แผนสำรวจสี่สัปดาห์ การกลับมาทำต่อ และการลบข้อมูลในเครื่องทันที

**Important limits · ข้อจำกัดสำคัญ**

- The assessment and mission rubrics are unvalidated; route constraints include unsourced estimates.
- The interface is not Thai yet, and no real-student pilot or bias audit has run.
- The safety pause is a keyword rule, not a risk assessment.
- เครื่องมือวัดและ rubric ของภารกิจยังไม่ผ่านการตรวจสอบ และข้อจำกัดบางส่วนของเส้นทางเป็นค่าประมาณที่ไม่มีแหล่งอ้างอิง
- อินเทอร์เฟซยังไม่เป็นภาษาไทย และยังไม่เคย pilot กับนักเรียนจริงหรือทำ bias audit
- safety pause เป็นกฎจับคำ ไม่ใช่การประเมินความเสี่ยง

[Implementation details →](docs/06-development-plan.md) ·
[Privacy and data flow →](docs/08-privacy-and-data.md)

---

## Choose your language · เลือกภาษา

<table width="100%">
<tr>
<td align="center" width="50%">
<h3><a href="READMEEN.md">Read in English →</a></h3>
<sub>Product story · prototype · trust · evidence · technical setup</sub>
</td>
<td align="center" width="50%">
<h3><a href="READMETH.md">อ่านภาษาไทย →</a></h3>
<sub>แนวคิดผลิตภัณฑ์ · ต้นแบบ · ความน่าเชื่อถือ · หลักฐาน · วิธีรัน</sub>
</td>
</tr>
</table>

<p align="center">
  <sub>
  Built for <a href="https://www.jumpthailand.com/">JUMP THAILAND Hackathon 2026</a> ·
  AI for the Future of Thai Education · MIT licensed
  </sub>
</p>

<p align="center">
  <a href="#top">Back to top · กลับขึ้นด้านบน</a>
</p>
