# 02_Backend — บริการหลังบ้านและเอนจินคำนวณ (FastAPI & Decision Engine)

> **โครงสร้างระบบ:** FastAPI Backend Architecture สำหรับจัดการ Deterministic Matching, RAG Retrieval และ AI Socratic Prompts

---

## 🧭 สารบัญและโครงสร้างภายใน

```
02_Backend/
├── app/
│   ├── api/               # FastAPI Endpoints (/recommend, /explain, /evaluate)
│   ├── decision_engine/   # Matching Matrix, Multi-Tier Scoring, RIASEC Scorer, STAR Evaluator
│   └── rag/               # RAG Pipeline & Qdrant Vector Store Client
├── schemas/               # Pydantic Data Models (11 ไฟล์) ควบคุม Schema ข้อมูล
├── scripts/               # สคริปต์ตรวจสอบระบบ (verify_system.py), สร้าง Qwen Dataset, แปลงรายงาน
├── tests/                 # Unit Tests สำหรับ Decision Engine, API และ RAG
├── PROJECT.md             # แผนการพัฒนาระบบตาม Milestone M1–M4
├── USER_MANUAL.md         # คู่มือการใช้งานและเอกสารอ้างอิง API (v2.0.0)
└── USER_MANUAL.pdf        # คู่มือฉบับเอกสาร PDF
```

---

## ⚙️ หลักการทำงานของเอนจินคำนวณ

1. **Deterministic Matcher (`app/decision_engine/`):**
   - คำนวณความสอดคล้องระหว่างเวกเตอร์ความสนใจของผู้เรียน (RIASEC + Context) กับเวกเตอร์หลักสูตรอาชีพ
   - ใช้ **Cosine Similarity** ร่วมกับ **Kelley Shrinkage** เพื่อลด Error จากกลุ่มตัวอย่างน้อย
   - กรองด้วย Geolocation Distance และงบประมาณครอบครัว
2. **RAG & Vector Vault (`app/rag/`):**
   - ดึงข้อมูลหลักสูตรและระเบียบการจากฐานข้อมูลเวกเตอร์ Qdrant
   - ป้องกันการหลอนของ AI (Zero Hallucination)
3. **Explainability Engine:**
   - ส่งข้อมูลผลการจับคู่ให้ LLM เพื่อแปลงเป็นคำอธิบายภาษาไทยที่เป็นมิตรและเข้าใจง่ายสำหรับผู้เรียนและผู้ปกครอง

---

## 🚀 การทดสอบและรันระบบ Backend

```bash
# ติดตั้ง dependencies
pip install -r requirements.txt

# รัน Backend Server
uvicorn app.main:app --reload --port 8000

# รันชุดการทดสอบ Unit Tests
pytest tests/
```
