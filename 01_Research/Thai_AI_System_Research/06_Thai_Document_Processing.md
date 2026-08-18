# 06 — การประมวลผลเอกสารภาษาไทย (Thai Document Processing)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026

คุณภาพ RAG เริ่มที่คุณภาพข้อมูลนำเข้า — "garbage in, garbage out" ไฟล์นี้ครอบคลุมตั้งแต่โหลดไฟล์จนได้ chunk พร้อม metadata

## 1. ชนิดเอกสารและวิธีโหลด

| ชนิด | เครื่องมือ (ตัวอย่าง) | ข้อควรระวังภาษาไทย |
|------|----------------------|--------------------|
| **PDF (มี text layer)** | `pypdf`, `pdfplumber`, `PyMuPDF(fitz)` | ฟอนต์ไทยบางตัว copy ออกมาสระ/วรรณยุกต์เพี้ยน → ตรวจ normalize |
| **PDF (สแกนเป็นภาพ)** | OCR (ดูข้อ 2) | ต้อง OCR ก่อน |
| **DOCX** | `python-docx`, `unstructured` | รักษาหัวข้อ/ตาราง |
| **TXT** | อ่านตรง (ระบุ encoding `utf-8`) | ระวัง encoding เก่า (TIS-620) → แปลงเป็น UTF-8 |
| **HTML** | `BeautifulSoup`, `unstructured` | ลบ nav/script/style |
| **CSV/ตาราง** | `pandas` | แปลงแต่ละแถวเป็นข้อความมีความหมาย + เก็บ schema |
| **งานวิจัย/บทความ** | `unstructured`, GROBID (สำหรับ metadata อ้างอิง) | ดึง abstract/section/reference |
| **รูปภาพ + คำอธิบาย** | VLM/caption + OCR | เก็บ caption เป็นข้อความค้นได้ |

## 2. OCR ภาษาไทย

> ข้อเท็จจริง (อ้างอิง `16_...`): OCR ไทยยากเพราะสระ/วรรณยุกต์ซ้อนบน-ล่าง และไม่มีช่องว่างคำ ทางเลือก:
> - **Tesseract** (`tha`) — ฟรี, ง่าย, ปานกลาง
> - **PaddleOCR** — layout/หลายภาษา
> - **Typhoon OCR** (scb-10x, โอเพนซอร์ส) — VLM เจาะเอกสารไทย คืน markdown/HTML รองรับตาราง (arXiv 2601.14722, PyPI `typhoon-ocr`)
> - **Cloud** (Google Document AI / Azure Document Intelligence) — แม่นสูง แต่ **ข้อมูลออกนอกองค์กร** (พิจารณา PDPA, ดู `11_...`)

**ข้อเสนอแนะ:** สร้างชุดทดสอบ OCR (เอกสารจริง 10–20 หน้าที่หลากหลาย: ตาราง/ฟอร์ม/สแกนเอียง) แล้ววัด CER/WER ก่อนเลือกเครื่องมือ อย่าเชื่อ benchmark ทั่วไปอย่างเดียว

## 3. การทำความสะอาด (Cleaning)

- **ลบ Header/Footer/watermark ที่ซ้ำทุกหน้า** — ตรวจข้อความที่ปรากฏซ้ำเกือบทุกหน้าแล้วตัด **แต่บันทึกเลขหน้าไว้ก่อน**
- **รักษาเลขหน้า** — เก็บลง metadata (`page`) เพื่อทำ citation
- **Normalize ข้อความไทย** — ใช้ `pythainlp.util.normalize` (จัดสระซ้ำ/รูปวรรณยุกต์), แปลง TIS-620→UTF-8, ตัดอักขระควบคุม
- **รวมบรรทัดที่ถูกตัดจาก PDF** — PDF มัก break บรรทัดกลางประโยค ควรรวมย่อหน้าให้ถูก
- **จัดการตาราง** — แปลงเป็น markdown table หรือประโยคบรรยาย เพื่อไม่ให้ค้นแล้วเสียบริบท

## 4. การแบ่ง Chunk (Chunking Strategies)

| กลยุทธ์ | วิธี | เหมาะกับกรณีใด | ข้อจำกัด |
|---------|------|----------------|----------|
| **Fixed-size** | ตัดตามจำนวน token/อักขระ + overlap | ง่าย, เอกสารเนื้อเดียว | ตัดกลางประโยค/ความคิด |
| **Recursive/structure-aware** | ตัดตามหัวข้อ→ย่อหน้า→ประโยค | เอกสารมีโครงสร้าง (ระเบียบ/คู่มือ) | ต้องมีโครงสร้างชัด |
| **Semantic chunking** | ตัดเมื่อความหมายเปลี่ยน (วัดจาก embedding) | เนื้อหาต่อเนื่องยาว | คำนวณแพงกว่า |
| **Parent-child** | ค้นด้วย child เล็ก แต่ส่ง parent ใหญ่เข้า context | ต้องการ precision การค้น + บริบทกว้างตอนตอบ | จัดการซับซ้อนขึ้น |

**พารามิเตอร์แนะนำ (ค่าเริ่มต้นให้ทดลอง):**
- ขนาด chunk: ~300–800 token (วัด token ไทยจริง, ดู `01_...`)
- overlap: ~10–20% (กันตัดขาดบริบท)
- ตัดเคารพขอบเขตประโยคไทยด้วย `pythainlp` (sentence tokenize) เพื่อไม่ตัดกลางคำ/ประโยค

**Overlap คืออะไร:** ให้ท้ายของ chunk ก่อนหน้าซ้อนกับต้นของ chunk ถัดไป เพื่อไม่ให้ประโยคที่คร่อมรอยต่อหายบริบท

## 5. Metadata Schema (นำไปใช้ได้จริง)

> เก็บ metadata คู่กับทุก chunk ใน vector DB — ใช้ทำ citation, filtering, และ access control

```json
{
  "chunk_id": "doc_00123__p12__c03",
  "doc_id": "doc_00123",
  "source_file": "ระเบียบการเบิกจ่าย_2567.pdf",
  "title": "ระเบียบการเบิกจ่ายค่าใช้จ่ายในการเดินทาง",
  "section": "หมวด 3 ค่าเบี้ยเลี้ยง",
  "page_start": 12,
  "page_end": 12,
  "doc_type": "ระเบียบ",
  "language": "th",
  "created_date": "2024-05-01",
  "effective_date": "2024-06-01",
  "version": "2567.1",
  "access_level": "internal",
  "department": "การเงิน",
  "url_or_path": "s3://docs/regulations/doc_00123.pdf",
  "checksum": "sha256:...",
  "ingested_at": "2026-07-21T10:00:00+07:00"
}
```

**ทำไมแต่ละฟิลด์สำคัญ**
- `source_file`, `page_start/end`, `section` → ใช้ทำ **citation** ที่ตรวจสอบได้
- `access_level`, `department` → บังคับ **document-level permission** (ดู `11_...`)
- `effective_date`, `version` → แก้ปัญหา **เอกสารขัดแย้ง/ล้าสมัย** (เลือกใหม่สุด)
- `checksum` → กันข้อมูลซ้ำ/เปลี่ยนแปลง, ทำ incremental reindex
- `language` → routing embedding/prompt

## 6. การอ้างอิงชื่อไฟล์และเลขหน้า (Citation-ready)

ทุก chunk ต้องตอบได้ว่า "มาจากไฟล์อะไร หน้าไหน หัวข้ออะไร" เพื่อให้คำตอบสุดท้ายแสดง `[แหล่ง: ระเบียบการเบิกจ่าย_2567.pdf หน้า 12 หมวด 3]` — นี่คือหัวใจของความน่าเชื่อถือในงานราชการ/องค์กร

## 7. ข้อเสนอแนะสรุป (Pipeline การ ingest ที่แนะนำ)

```text
ไฟล์ → ตรวจชนิด → (ถ้าสแกน) OCR → clean/normalize (pythainlp)
 → ตัดตามโครงสร้าง → chunk + overlap (เคารพประโยคไทย)
 → สร้าง metadata (schema ข้างบน) → embed → upsert เข้า vector DB
 → บันทึก log การ ingest (จำนวน chunk, ไฟล์, checksum)
```

> ดูโค้ดจริงใน `examples/document_ingestion_example.py`
> อ่านต่อ: `07_LoRA_and_QLoRA.md`
