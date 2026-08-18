# examples/ — โค้ดตัวอย่าง RAG ภาษาไทย

> วันที่ตรวจสอบ: 21 กรกฎาคม 2026 · อ่านคู่กับ `../15_Prototype_Guide.md`

โค้ดเน้นให้เข้าใจ **workflow** ไม่ใช่ระบบ production เขียนแบบ Python ตรง ๆ (sentence-transformers + Chroma + เรียก LLM ผ่าน HTTP) เพื่อลดการผูกกับ framework ที่ API เปลี่ยนบ่อย

## ไฟล์
| ไฟล์ | หน้าที่ |
|------|---------|
| `common.py` | config (.env), embedding, vector store, เรียก LLM (ใช้ร่วมกัน) |
| `document_ingestion_example.py` | chunk เอกสารไทย → embed → เก็บ Chroma (มีข้อมูลตัวอย่างไทยในไฟล์) |
| `vector_search_example.py` | ค้น top-k + คะแนน + จัดการ "ไม่พบข้อมูล" |
| `rag_pipeline_example.py` | RAG ครบวงจร + citation + ปฏิเสธเมื่อไม่มีหลักฐาน |
| `evaluation_example.py` | รันชุดคำถามไทย → recall/refusal/latency → `eval_results.json` |
| `lora_training_example.py` | โครงร่าง QLoRA (ต้องมี GPU + ติดตั้ง dependency เพิ่ม) |

## ติดตั้งและรัน
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # แก้ค่าตามต้องการ

# (ทางเลือก) LLM local ด้วย Ollama:
#   ติดตั้งจาก https://ollama.com แล้ว: ollama pull qwen2.5:7b-instruct
#   ถ้ายังไม่มี LLM ให้ตั้ง LLM_BACKEND=none ใน .env ก็รัน pipeline ได้ (จะแสดง context อย่างเดียว)

python document_ingestion_example.py                       # 1) สร้าง index
python vector_search_example.py "ค่าเบี้ยเลี้ยงต่อวันเท่าไหร่"   # 2) ทดสอบ retrieval
python rag_pipeline_example.py "ใครอนุมัติการเดินทางเกิน 3 วัน"  # 3) RAG เต็ม
python evaluation_example.py                               # 4) ประเมินผล
```

## หมายเหตุ
- ครั้งแรกจะดาวน์โหลด embedding model (BGE-M3 ~2GB) — ต้องต่ออินเทอร์เน็ต
- **ห้าม commit `.env` จริง** (มีใน `.gitignore`)
- โค้ดนี้ยังไม่มี auth/permission เต็ม — สำหรับ production ดู `../11_` และ `../13_`
