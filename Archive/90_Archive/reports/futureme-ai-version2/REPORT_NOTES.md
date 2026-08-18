# FutureMe AI Version 2 — Supporting Notes

## Reporting job

- Question: จากข้อมูลที่ตรวจแล้ว FutureMe AI ควรเล่าปัญหา ออกแบบข้อมูล และสร้าง MVP อย่างไร
- Audience: product stakeholders — กรรมการการแข่งขันและทีมที่ไม่ได้มีพื้นฐาน AI ลึก
- Delivery: portable HTML
- Evidence window: แหล่งข้อมูลสาธารณะที่ตรวจถึง 24 กรกฎาคม 2026
- Decision-useful outcome: ทีมรู้ว่าควรใช้ claim ใด แบ่งข้อมูลอย่างไร ทำ RAG ก่อนอะไร และเลื่อน LoRA เพราะอะไร

## Required structure mapping

1. Title — `FutureMe AI Version 2`
2. Executive summary — `Executive Summary`
3. Key findings with visual evidence — ปัญหาเรียน–งาน, การตรวจแหล่ง, รายการแก้ claim, สถาปัตยกรรม RAG
4. Recommended next steps — `สิ่งที่ทีมควรทำต่อ`
5. Further questions — `คำถามที่ต้องตอบก่อนขยายระบบ`
6. Caveats and assumptions — `ข้อจำกัดและสมมติฐาน`

## Chart map

| Section | Analytical question | Family/type | Fields | Supported takeaway | Palette |
|---|---|---|---|---|---|
| ปัญหาการเรียน–งาน | สัดส่วน mismatch สองมิติในประชากรกลุ่มเดียวกันเท่าไร | Comparison / horizontal bar | `indicator`, `share_pct` | ปัญหามีขนาดมากพอให้ระบบช่วยสำรวจเส้นทาง | sequential, single-series |
| การตรวจแหล่ง | แหล่งที่พร้อมใช้และต้องใช้พร้อมเงื่อนไขมีจำนวนเท่าไร | Status / horizontal bar | `status_label`, `source_count` | registry ใหม่แยก readiness ได้ ไม่เหมารวมว่าทุกแหล่ง verified เท่ากัน | categorical styling, no legend |

ทั้งสองกราฟใช้แถบแนวนอนเพราะป้ายภาษาไทยยาว แต่ถามคนละเรื่อง: กราฟแรกเปรียบเทียบสัดส่วนของประชากร กราฟที่สองแสดงสถานะความพร้อมของแหล่งข้อมูล

## Omitted visuals

- ไม่ทำ trend chart เพราะข้อมูลมีเพียง anchor values และต่างปี/ต่างนิยาม
- ไม่ทำแผนภาพสถาปัตยกรรมใน artifact เพราะส่วนนี้เป็นความสัมพันธ์เชิงแนวคิด ไม่ใช่ข้อมูลเชิงปริมาณ ตารางอธิบายบทบาทของ RAG, rules, prompting และ LoRA ได้ตรงกว่า

## Data-quality framing

- Intended use: pitch, product planning และ RAG ingestion
- Grain: หนึ่ง source record ต่อหนึ่งแหล่ง; หนึ่ง quarantine record ต่อหนึ่ง claim
- Main risks: wrong denominator, scope drift, stale admission rules, landing-page citations, unverifiable platform capabilities
- Severity: claim ตัวเลขผิดและตีความ ILO ผิดเป็น High; ลิงก์เข้าไม่ถึงแต่ไม่ถูกใช้เป็น fact เป็น Medium; ไฟล์ local หายเป็น Low/Medium ตามการใช้งาน
