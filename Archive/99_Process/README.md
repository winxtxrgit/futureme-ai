# FuturePath AI (FutureMe AI)

> **เวที:** JUMP Thailand Hackathon 2026 (AIS Academy × NIA) — ธีม *AI เพื่ออนาคตการศึกษาไทย*
> แพลตฟอร์มแนะแนวเส้นทางการศึกษา–อาชีพด้วย AI ที่ช่วยให้นักเรียนไทย **"รู้จักตัวเอง และได้ลองก่อนเลือก"**

---

## 🎯 ระบบทำอะไร

ช่วยผู้เรียน 4 ระดับ (ป.4–ป.6 · ม.1–ม.3 · ม.4–ม.6 · ปวช./ปวส.) ค้นหาความสนใจ จุดแข็ง และวางแผนเส้นทางอนาคต ผ่าน 3 ขั้น:

1. **สัมภาษณ์ AI แบบ Socratic** + แบบประเมิน RIASEC 30 ข้อ → สกัดโปรไฟล์ด้วย STAR
2. **ภารกิจจำลอง (Scenario Missions)** ให้ลองลงมือทำจริง → เก็บหลักฐานพฤติกรรม
3. **เสนอ 3 เส้นทาง** (Balanced Next Step · Interest Growth · Practical Access) + แผนทดลอง 30 วัน + Interactive Roadmap (DAG)

**สถาปัตยกรรม:** Hybrid **Rule-based** (RIASEC, decision matrix 5 มิติ, คัดกรองตามระดับชั้น) + **LLM** (สัมภาษณ์/สังเคราะห์คำอธิบายแบบมีหลักฐาน) · **RAG** (Qdrant hybrid search + BGE-M3) · **Qwen3-4B QLoRA** · FastAPI + PostgreSQL บน AIS Cloud

> จุดยืน: **เสริมครู ไม่ใช่แทนครู** · แยกสิทธิ์ RBAC/PDPA (นักเรียน / ผู้ปกครอง / ครูแนะแนว)

---

## 🚀 เริ่มใช้งาน (Quickstart)

```bash
# จากในโฟลเดอร์ Hackathon_ais/
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn pydantic pytest        # ติดตั้ง dependencies

pytest                                              # รันชุดทดสอบ
python scripts/verify_system.py                     # ตรวจความถูกต้องของข้อมูล + API + benchmark
uvicorn app.main:app --reload --port 8000           # เปิด API dev server → http://localhost:8000/docs
```

---

## 📁 โครงสร้างโปรเจกต์

```
Hackathon_ais/
├── README.md · PROJECT.md · ORIGINAL_REQUEST.md   # ภาพรวม · แผนงาน M1–M4 · โจทย์ตั้งต้น
├── app/          # FastAPI backend
│   ├── main.py · api/router.py
│   ├── decision_engine/   # riasec · matrix · multi_tier · route_generator · star_eval
│   └── rag/               # pipeline · qdrant_client
├── schemas/      # Pydantic schemas
├── tests/        # pytest (api · decision_engine · rag)
├── scripts/      # verify_system · generate_qwen_dataset · convert_data_to_pdf
├── Data/         # ฐานข้อมูลโดเมน 7 หมวด + dataset QLoRA
├── docs/         # คู่มือ + เอกสารต้นฉบับ + งานวิจัยเทคนิค
└── assets/       # ไฟล์เสียงคำแนะนำอาจารย์ · รูปตาราง AIS
```

---

## 📚 เอกสารสำคัญ

| ต้องการ | ไฟล์ |
|---------|------|
| แผนงาน สถาปัตยกรรม สถานะ M1–M4 | [`PROJECT.md`](../02_Backend/PROJECT.md) |
| คู่มือใช้งาน (นักเรียน/ผู้ปกครอง/ครู) + API + วิธีรัน | [`docs/USER_MANUAL.md`](../02_Backend/USER_MANUAL.md) |
| โจทย์ตั้งต้นของงาน | [`ORIGINAL_REQUEST.md`](ORIGINAL_REQUEST.md) |
| ข้อเสนอ + สไลด์นำเสนอ | [`docs/FutureMe_AI_Brief.pdf`](../01_Research/Source_Documents/FutureMe_AI_Brief.pdf) · [`docs/FutureMe_AI_Deck.pdf`](../01_Research/Source_Documents/FutureMe_AI_Deck.pdf) |
| ฐานข้อมูลโดเมน + แหล่งอ้างอิง | [`Data/README.md`](../01_Research/Data/README.md) · [`Data/REFERENCES.md`](../01_Research/Data/REFERENCES.md) |
| ฐานความรู้เทคนิค SLM+RAG+LoRA (18 บท) | [`docs/Thai_AI_System_Research/`](../01_Research/Thai_AI_System_Research/README.md) |

---

## 🔌 API Endpoints

| Method | Path | หน้าที่ |
|--------|------|---------|
| `POST` | `/v1/missions/recommend` | แนะนำภารกิจลองทำจริงตามความสนใจ |
| `POST` | `/v1/missions/{id}/submissions` | ส่งผลภารกิจ → ประเมิน + คำถามปรับตัวถัดไป |
| `POST` | `/v1/future-paths` | คำนวณ decision matrix 5 มิติ → 3 เส้นทาง + Roadmap |
| `GET`  | `/v1/future-paths/{id}` | ดึงแผนเส้นทางที่บันทึกไว้ |

---

## ⚠️ หมายเหตุ

- โปรเจกต์เรียกตัวเองว่า **FuturePath AI** ในโค้ด/คู่มือ (พัฒนาจากคอนเซปต์ **FutureMe AI** ใน Brief)
- เอกสารแยก **"ข้อเท็จจริงมีอ้างอิง"** ออกจาก **"ข้อเสนอแนะเชิงออกแบบ"** — ตรวจวันที่กำกับก่อนใช้ตัวเลข/เวอร์ชันโมเดล
- การเชื่อมต่อ NDLP/DEEP ของกระทรวงศึกษาธิการเป็นความเป็นไปได้ในอนาคต ขึ้นกับเอกสาร API และการอนุมัติความร่วมมือ
- `scripts/convert_data_to_pdf.py` ต้องใช้ headless Chrome/Chromium (ตั้งค่าผ่าน env `CHROME_PATH` ได้)
