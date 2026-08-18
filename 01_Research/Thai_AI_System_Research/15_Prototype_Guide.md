# 15 — คู่มือสร้าง Prototype (Prototype Guide)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026
> เป้าหมาย: สร้างระบบ RAG ภาษาไทยที่ **รันได้จริงบนเครื่องตัวเอง/Colab** และแสดง citation — เน้นเข้าใจ workflow

## สแตกที่ใช้ในคู่มือนี้
- **Python 3.10+**
- **FastAPI** (API) — ไฟล์ตัวอย่างเน้น script ก่อน ต่อ API ภายหลัง
- **Embedding:** `sentence-transformers` + BGE-M3 หรือ `multilingual-e5-base` (รองรับหลายภาษา/ไทย)
- **Vector DB:** Chroma (local) หรือ FAISS
- **LLM:** SLM ผ่าน **Ollama** (local, เช่น Qwen2.5/Typhoon GGUF) หรือ Model API (ตั้งค่าใน `.env`)
- **Web Interface:** Streamlit (ง่ายสุด)

> โค้ดทั้งหมดอยู่ใน `examples/` — คู่มือนี้อธิบายลำดับ อ่านคู่กับไฟล์โค้ด

## ขั้นตอน 1–12

### 1) เตรียม Environment
```bash
cd Thai_AI_System_Research/examples
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
python --version               # ควร >= 3.10
```

### 2) ติดตั้ง Dependency
```bash
pip install -r requirements.txt
cp .env.example .env           # แก้ค่าใน .env ตามการใช้งาน
```
ถ้าใช้ Ollama (local LLM):
```bash
# ติดตั้ง Ollama จาก https://ollama.com แล้วดึงโมเดล เช่น
ollama pull qwen2.5:7b-instruct    # หรือโมเดลไทยที่มีใน registry
```

### 3) เตรียมเอกสาร
- วางไฟล์ `.txt`/`.md`/`.pdf` ภาษาไทยไว้ในโฟลเดอร์ `examples/data/`
- ตัวอย่างมีข้อความไทยฝังใน `document_ingestion_example.py` ให้รันได้ทันทีโดยไม่ต้องมีไฟล์

### 4) แบ่ง Chunk
- `document_ingestion_example.py` ตัด chunk ตามย่อหน้า + overlap และเก็บ metadata (source/page/section)
- ปรับ `CHUNK_SIZE`, `OVERLAP` ได้ในไฟล์

### 5) สร้าง Embedding
- ใช้ `sentence-transformers` โหลด model จาก `.env` (`EMBEDDING_MODEL`)
- โค้ดใส่ prefix `passage:`/`query:` ให้อัตโนมัติเมื่อใช้ตระกูล e5

### 6) บันทึกลง Vector Database
- เก็บลง Chroma (persistent) พร้อม metadata
- รัน: `python document_ingestion_example.py`

### 7) รับคำถามภาษาไทย
- `rag_pipeline_example.py` รับคำถามผ่าน argument หรือ input()

### 8) ค้นหาเอกสาร
- embed คำถาม → ค้น top-k จาก Chroma → (ตัวอย่างมีตัวเลือกกรอง metadata)
- **ถ้าไม่พบ/คะแนนต่ำกว่าเกณฑ์ → ตอบ "ไม่พบข้อมูลในเอกสาร"** (มีใน `vector_search_example.py`)

### 9) สร้าง Prompt
- ประกอบ system prompt (ตอบจาก context เท่านั้น + ตอบไทย + ใส่ citation) + context ที่มีหมายเลข + คำถาม

### 10) ให้โมเดลตอบ
- เรียก Ollama (หรือ API ตาม `.env`) ด้วย temperature ต่ำ
- โค้ดมี error handling เมื่อเรียกโมเดลไม่สำเร็จ

### 11) แสดง Citation
- แนบรายการแหล่งอ้างอิง `[n] source หน้า page` ใต้คำตอบ ให้ตรวจย้อนได้

### 12) บันทึกผลการทดสอบ
- `evaluation_example.py` รันชุดคำถามตัวอย่าง แล้วบันทึกผล (คำตอบ + แหล่ง + เวลา) ลงไฟล์เพื่อเทียบเวอร์ชัน

## รันแบบครบวงจร
```bash
python document_ingestion_example.py     # สร้าง index
python rag_pipeline_example.py "ค่าเบี้ยเลี้ยงเดินทางในประเทศต่อวันเท่าไหร่"
python evaluation_example.py             # รันชุดทดสอบ
# (ทางเลือก) เว็บ:
# streamlit run app_streamlit.py   ← ต่อยอดเองจาก rag_pipeline_example
```

## เคล็ดลับสำหรับ Prototype
- เริ่มด้วย **Naive RAG** ก่อน (ยังไม่ต้อง rerank/hybrid) ให้ครบ flow → แล้ววัดผล
- ถ้า LLM ตอบมั่ว: ลด temperature, ทำ prompt ให้เข้มขึ้น, ลด k
- ถ้าค้นไม่เจอ: ลองเปลี่ยน embedding เป็น BGE-M3, ตรวจการตัดคำ, เพิ่ม overlap
- อย่าลืม **แสดง citation ทุกคำตอบ** — เป็นหัวใจความน่าเชื่อถือ

> อ่านต่อ: `16_Research_Papers_and_References.md` และเริ่มที่ `examples/`
