# Thai AI System Research — ฐานความรู้การสร้างระบบ AI ภาษาไทยด้วยโมเดลขนาดเล็ก + RAG

> **วันที่จัดทำ/ตรวจสอบข้อมูลล่าสุด:** 21 กรกฎาคม 2026
> **ขอบเขต:** ศึกษาและออกแบบระบบ AI ภาษาไทยที่ใช้ Small Language Model (SLM) ร่วมกับ Retrieval-Augmented Generation (RAG) และการปรับแต่งด้วย LoRA/QLoRA เพื่อตอบคำถามจากเอกสารเฉพาะทาง งานวิจัย และฐานข้อมูลองค์กร บนทรัพยากรที่จำกัด
> **สถานะ:** เอกสารเชิงวิชาการ/วิศวกรรม (knowledge base) — มีทั้ง "ข้อเท็จจริงที่อ้างอิงได้" และ "ข้อเสนอแนะเชิงออกแบบ" ซึ่งแยกกันชัดเจนในแต่ละไฟล์

---

## ฐานความรู้นี้คืออะไร

ชุดเอกสารนี้เป็น **ฐานความรู้ (knowledge base)** สำหรับทีมที่ต้องการสร้างผู้ช่วย AI ภาษาไทยแบบ "ถาม-ตอบจากเอกสารของเราเอง" (private/domain-specific Q&A) โดยเน้น:

1. **โมเดลขนาดเล็ก (Small Language Model)** ที่รันได้บนเครื่องทั่วไปหรือ GPU ราคาไม่แพง
2. **RAG เป็น "สมองที่สอง"** — ให้ความรู้เฉพาะทางแก่โมเดลโดยไม่ต้องเทรนใหม่
3. **LoRA/QLoRA** สำหรับปรับ "สไตล์/รูปแบบ/พฤติกรรม" ของโมเดลเมื่อจำเป็น
4. ความถูกต้อง (accuracy), ความปลอดภัย (security/privacy), ต้นทุน (cost) และการขยายระบบ (scalability)

⚠️ **ข้อควรระวังเรื่องความเป็นปัจจุบัน:** โมเดล ไลบรารี และราคาเปลี่ยนแปลงเร็วมาก ทุกไฟล์ระบุ "วันที่ตรวจสอบ" ก่อนนำตัวเลข เวอร์ชัน หรือชื่อ API ไปใช้จริง ให้ตรวจสอบกับเอกสารทางการอีกครั้งเสมอ

---

## สารบัญไฟล์

| ไฟล์ | ศึกษาเรื่อง |
|------|------------|
| `00_Project_Overview.md` | ภาพรวมปัญหา เหตุผลใช้โมเดลเล็ก บทบาท RAG/Fine-tuning และความแตกต่างของ Prompt/RAG/Fine-tuning |
| `01_Thai_Language_AI_Fundamentals.md` | อุปสรรคภาษาไทย: การตัดคำ ไม่มีช่องว่าง คำทับศัพท์ OCR tokenization hallucination |
| `02_Small_Language_Models.md` | SLM คืออะไร + เปรียบเทียบโมเดลไทย/หลายภาษา ≥5 ตัว พร้อมเกณฑ์เลือกตามฮาร์ดแวร์ |
| `03_RAG_Fundamentals.md` | องค์ประกอบ RAG ตั้งแต่ retrieval ถึง citation + Naive/Advanced/Agentic/Graph RAG |
| `04_RAG_Pipeline_Design.md` | ออกแบบ pipeline ครบวงจร + วิเคราะห์จุดที่ตอบผิดและวิธีแก้ |
| `05_Embedding_and_Vector_Database.md` | Embedding ไทย + เปรียบเทียบ Vector DB ≥5 ตัว (FAISS/Chroma/Qdrant/Milvus/Weaviate/pgvector) |
| `06_Thai_Document_Processing.md` | นำเข้าเอกสารไทย PDF/DOCX/scan, OCR, chunking, metadata schema |
| `07_LoRA_and_QLoRA.md` | LoRA/QLoRA แบบเข้าใจง่าย + เปรียบเทียบกับ Full FT/Prompt/RAG + ประมาณทรัพยากร |
| `08_LangChain_and_Alternatives.md` | บทบาท LangChain vs LlamaIndex/Haystack/Semantic Kernel vs เขียนเอง |
| `09_AI_Ready_Infrastructure.md` | โครงสร้างพื้นฐาน Local/Cloud/Hybrid + Architecture 3 ระดับ |
| `10_Model_Evaluation.md` | วัดผล retrieval/generation/end-to-end + ชุดคำถามทดสอบไทย ≥20 แบบ |
| `11_Security_Privacy_and_Governance.md` | ความเสี่ยงข้อมูล PDPA prompt injection + มาตรการป้องกัน |
| `12_Cost_and_Resource_Planning.md` | ประมาณต้นทุน 3 ระดับงบประมาณ (ระบุวันที่/สกุลเงิน/เงื่อนไข) |
| `13_Recommended_System_Architecture.md` | Architecture ที่แนะนำ + Mermaid + Tech Stack 2 ทางเลือก |
| `14_Implementation_Roadmap.md` | แผน 9 Phase พร้อม input/output/ความเสี่ยง/เกณฑ์สำเร็จ/งานคู่ขนาน |
| `15_Prototype_Guide.md` | คู่มือสร้าง prototype ใช้งานได้จริง 12 ขั้นตอน |
| `16_Research_Papers_and_References.md` | รายการอ้างอิงแยกหมวด (APA 7) พร้อมวันที่เข้าถึงและระดับความน่าเชื่อถือ |
| `17_Glossary.md` | อภิธานศัพท์ English–Thai |
| `examples/` | โค้ดตัวอย่าง Python (ingestion, vector search, RAG, LoRA, evaluation) |
| `diagrams/` | Mermaid diagrams: RAG / training workflow / deployment |

---

## เส้นทางการอ่านตามระดับ

### 🟢 ระดับเริ่มต้น (Beginner) — "เข้าใจว่าระบบทำงานยังไง"
เป้าหมาย: เข้าใจแนวคิดและศัพท์ ก่อนลงมือ
1. `00_Project_Overview.md` — เข้าใจภาพรวมและ "ทำไมต้องใช้ RAG ไม่ใช่ fine-tune ทุกอย่าง"
2. `17_Glossary.md` — ทำความรู้จักศัพท์ (เปิดควบคู่ตลอด)
3. `01_Thai_Language_AI_Fundamentals.md` — เข้าใจว่าทำไมภาษาไทยยาก
4. `03_RAG_Fundamentals.md` — เข้าใจหัวใจของ RAG
5. `02_Small_Language_Models.md` — รู้จักโมเดลที่เลือกได้

### 🟡 ระดับพัฒนา Prototype (Builder) — "สร้างของที่รันได้"
เป้าหมาย: ต่อ pipeline ตัวจริงบนเครื่องตัวเอง/Colab
1. `04_RAG_Pipeline_Design.md`
2. `05_Embedding_and_Vector_Database.md`
3. `06_Thai_Document_Processing.md`
4. `08_LangChain_and_Alternatives.md`
5. `15_Prototype_Guide.md` + โฟลเดอร์ `examples/`
6. `10_Model_Evaluation.md` (วัดผลตั้งแต่เริ่ม)
7. (ถ้าจำเป็น) `07_LoRA_and_QLoRA.md`

### 🔴 ระดับนำไปใช้งานจริง (Production) — "ขึ้นระบบให้คนใช้"
เป้าหมาย: ทำให้ปลอดภัย ขยายได้ คุมต้นทุนได้
1. `09_AI_Ready_Infrastructure.md`
2. `11_Security_Privacy_and_Governance.md`
3. `12_Cost_and_Resource_Planning.md`
4. `13_Recommended_System_Architecture.md`
5. `14_Implementation_Roadmap.md`
6. `16_Research_Papers_and_References.md` (ตรวจสอบย้อนกลับทุกข้อสรุป)

---

## หมายเหตุการใช้งาน

- เนื้อหาหลักเป็น **ภาษาไทย** ศัพท์เทคนิคมีภาษาอังกฤษกำกับครั้งแรกที่กล่าวถึง
- **ข้อเท็จจริง** (มีอ้างอิง) กับ **ข้อเสนอแนะเชิงออกแบบ** (ความเห็นของทีมจัดทำ) แยกกันด้วยหัวข้อ/ป้ายกำกับ
- ตัวเลขทรัพยากรและราคาเป็น **ค่าประมาณ** ขึ้นกับโมเดลและการตั้งค่า — ดูเงื่อนไขในแต่ละไฟล์
- โค้ดใน `examples/` เน้นให้ **เข้าใจ workflow** มากกว่าความสมบูรณ์เชิงวิศวกรรม — อ่าน `examples/README`/comment ก่อนรัน

## เริ่มต้นเร็ว (Quickstart)
ดู `15_Prototype_Guide.md` และรัน:
```bash
cd Thai_AI_System_Research/examples
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # แล้วแก้ค่าตามต้องการ
python document_ingestion_example.py
python rag_pipeline_example.py
```
