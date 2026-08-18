# 04 — การออกแบบ RAG Pipeline (RAG Pipeline Design)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026

## 1. ภาพรวม Workflow ครบวงจร

```text
Data Sources
  → Data Ingestion (โหลดไฟล์)
  → Cleaning (ล้าง header/footer/อักขระขยะ)
  → Chunking (ตัดเป็นชิ้น + overlap)
  → Metadata Extraction (ชื่อไฟล์/หน้า/หัวข้อ/สิทธิ์)
  → Embedding (แปลงเป็นเวกเตอร์)
  → Vector Database (จัดเก็บ + index)
  --------- (offline: ทำครั้งเดียว/เมื่ออัปเดตเอกสาร) ---------
  → Retrieval (ค้น top-k ตามคำถาม)
  → Reranking (จัดอันดับใหม่ให้แม่น)
  → Prompt Construction (คำถาม + context + คำสั่ง)
  → Language Model (สร้างคำตอบ)
  → Citation (แนบแหล่งอ้างอิง)
  → Evaluation (วัดผล)
  → Monitoring (เฝ้าระวังในโปรดักชัน)
```

แบ่งเป็น 2 เฟส:
- **Indexing (offline/batch):** Ingestion → Embedding → Vector DB (ทำเมื่อมีเอกสารใหม่)
- **Query (online/realtime):** Retrieval → ... → Citation (ทำทุกครั้งที่ผู้ใช้ถาม)

## 2. อธิบายทีละขั้น (พร้อมข้อพิจารณาภาษาไทย)

| ขั้น | ทำอะไร | ข้อพิจารณา/ทางเลือก |
|------|--------|---------------------|
| **Data Ingestion** | โหลด PDF/DOCX/HTML/CSV/scan | เอกสารสแกน → OCR (ดู `06_...`); เก็บ raw ไว้ตรวจย้อนกลับ |
| **Cleaning** | ลบ header/footer เลขหน้าซ้ำ อักขระควบคุม | รักษาเลขหน้าจริงไว้ใน metadata ก่อนลบ |
| **Chunking** | ตัดชิ้น ~300–800 token + overlap 10–20% | ตัดตามโครงสร้าง (หัวข้อ/ย่อหน้า) ดีกว่าตัดตายตัว; ระวัง token ไทย |
| **Metadata Extraction** | ดึงชื่อไฟล์ หน้า หัวข้อ วันที่ สิทธิ์ | ใช้ทำ filtering + citation + access control |
| **Embedding** | ข้อความ → เวกเตอร์ | ใช้ multilingual (BGE-M3/e5) รองรับไทย (ดู `05_...`) |
| **Vector DB** | เก็บเวกเตอร์+metadata, ทำ index | เลือกตาม scale (ดู `05_...`) |
| **Retrieval** | ค้น top-k (semantic/hybrid) | hybrid + metadata filter ช่วยไทย |
| **Reranking** | cross-encoder จัดอันดับ top-N→top-k | เพิ่ม precision ชัด (เช่น BGE-reranker) |
| **Prompt Construction** | ประกอบ prompt + คำสั่ง "ตอบจาก context เท่านั้น" | ใส่หมายเลขอ้างอิงในแต่ละ chunk |
| **Language Model** | สร้างคำตอบ | ตั้ง temperature ต่ำเพื่อลดมั่ว |
| **Citation** | ผูกคำตอบกับ chunk/หน้า | บังคับ format `[แหล่ง: ไฟล์ หน้า]` |
| **Evaluation** | วัด retrieval/generation | RAGAS + ชุดข้อสอบไทย (ดู `10_...`) |
| **Monitoring** | log latency/cost/feedback | เฝ้าระวัง drift + คำถามที่ตอบไม่ได้ |

## 3. จุดที่ทำให้ระบบตอบผิด และวิธีลดข้อผิดพลาด

> ตารางนี้คือ "diagnostic checklist" — อาการ → สาเหตุ → วิธีแก้

| ปัญหา | อาการ | สาเหตุที่พบบ่อย | วิธีลดข้อผิดพลาด |
|-------|-------|----------------|------------------|
| **Chunk ไม่เหมาะสม** | คำตอบขาดบริบท/ตัดกลางประโยค | chunk เล็ก/ใหญ่เกิน, ตัดตายตัวไม่ดูโครงสร้าง | ใช้ semantic/structure-aware chunking, เพิ่ม overlap, parent-child (ดู `06_...`) |
| **Embedding ไม่รองรับไทย** | ค้นคำพ้องความหมายไทยพลาด | ใช้ embedding อังกฤษล้วน | เปลี่ยนเป็น multilingual (BGE-M3/e5), วัด recall (ดู `05_,10_`) |
| **ดึงเอกสารผิด** | context ไม่เกี่ยวกับคำถาม | retrieval อ่อน, ไม่มี rerank | hybrid search + reranker + query rewriting |
| **Context มากเกินไป** | ตอบสับสน/lost in the middle | ใส่ chunk เยอะเกิน | ลด k, rerank เลือกเฉพาะดี, context compression |
| **เอกสารขัดแย้งกัน** | คำตอบขัดกันเอง | มีหลายเวอร์ชัน/แหล่ง | ใส่ metadata วันที่+เวอร์ชัน, เลือกใหม่สุด, ให้โมเดลรายงานความขัดแย้ง |
| **ข้อมูลล้าสมัย** | ตอบข้อมูลเก่า | ไม่ได้อัปเดต index/ไม่มีวันที่ | reindex ตามรอบ, filter ตามวันที่, แสดงวันที่เอกสาร |
| **โมเดลมั่วเกินหลักฐาน** | ตอบเกินสิ่งที่ context มี | prompt หลวม, temperature สูง | prompt เข้ม "ตอบเฉพาะจาก context, ไม่มีให้บอกไม่พบ", temp ต่ำ, วัด faithfulness |
| **ไม่มี Citation** | ตรวจสอบไม่ได้ | ไม่ได้ออกแบบ citation | บังคับรูปแบบ citation + ตรวจว่าตรงกับ chunk จริง |
| **Prompt Injection จากเอกสาร** | เอกสารสั่งให้โมเดลทำตาม | ข้อความในเอกสารมีคำสั่งซ่อน | แยก system/user/context อย่างชัด, treat context เป็นข้อมูลไม่ใช่คำสั่ง, input/output filtering (ดู `11_...`) |

## 4. Query-side pipeline (Advanced) — ลำดับที่แนะนำ

```text
คำถามผู้ใช้
 → (option) Query Rewriting/Expansion  # ให้ LLM เขียนคำถามให้เป็นทางการ/แตกหลายคำถาม
 → Hybrid Retrieval (semantic + BM25)  # top-N เช่น 20–50
 → Metadata Filter (สิทธิ์/วันที่/ประเภท)
 → Reranker (cross-encoder)            # เหลือ top-k เช่น 3–8
 → (option) Context Compression        # ตัดส่วนไม่เกี่ยว
 → Prompt Construction (+ citation ids)
 → LLM Generation (temp ต่ำ)
 → Citation binding + Guardrail check   # ตรวจว่าอ้างอิงตรง + ไม่หลุด PII
 → ตอบผู้ใช้ + log
```

## 5. ข้อเสนอแนะการออกแบบ (Design Recommendations)

- **เริ่ม minimal**: loader → chunk → embed → vector search → prompt → ตอบ + citation ให้ครบก่อน แล้ววัดผล
- **เพิ่มทีละชั้น** ตามตัวเลข: hybrid → rerank → query rewrite (อย่าใส่หมดตั้งแต่แรก)
- **ทำ evaluation ตั้งแต่วันแรก** — ไม่งั้นจะไม่รู้ว่าการเพิ่มความซับซ้อนช่วยจริงไหม
- **แยก context ออกจากคำสั่งเสมอ** เพื่อกัน prompt injection
- **เก็บ trace** (คำถาม → chunk ที่ดึง → prompt → คำตอบ) เพื่อ debug และ audit

> อ่านต่อ: `05_Embedding_and_Vector_Database.md`
