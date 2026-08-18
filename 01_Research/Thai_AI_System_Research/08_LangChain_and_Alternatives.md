# 08 — LangChain และทางเลือก (LangChain and Alternatives)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026
> ⚠️ **เรื่อง API ที่เปลี่ยนบ่อย:** LangChain แตกเป็นแพ็กเกจย่อย (`langchain-core`, `langchain-community`, และ integration แยกเช่น `langchain-huggingface`, `langchain-chroma`, `langchain-qdrant`, `langchain-openai`) และย้าย chain แบบเก่าหลายตัว (เช่น `RetrievalQA`, `create_retrieval_chain`) ไปไว้ใน `langchain-classic` โดยแนะนำ **LCEL** และ **LangGraph** สำหรับงานใหม่ — ก่อนคัดลอกโค้ดจากบทความเก่า **ต้องเทียบกับเอกสารทางการรุ่นปัจจุบันเสมอ** (เอกสารเก่าจำนวนมากใช้ API ที่ deprecated)

## 1. LangChain ทำหน้าที่อะไร

LangChain เป็น framework ที่ให้ "ตัวต่อมาตรฐาน" (abstraction) เพื่อเชื่อมชิ้นส่วนของแอป LLM เข้าด้วยกัน:

| ชิ้นส่วน | บทบาทใน LangChain |
|---------|-------------------|
| **Language Model** | อินเทอร์เฟซเรียกโมเดล (chat model / LLM) เปลี่ยน provider ได้ |
| **Prompt** | `PromptTemplate` / `ChatPromptTemplate` ประกอบ prompt |
| **Document Loader** | โหลดไฟล์หลายรูปแบบ |
| **Embedding** | อินเทอร์เฟซ embedding models |
| **Vector Database** | อินเทอร์เฟซ vector store (Chroma/Qdrant/FAISS/pgvector...) |
| **Retriever** | ค้นเอกสาร (รวม hybrid/reranker ได้) |
| **Tool** | ให้ LLM เรียกฟังก์ชัน/API |
| **Agent** | ให้ LLM ตัดสินใจใช้ tool (แนะนำใช้ **LangGraph** สำหรับ agent ใหม่) |
| **Memory** | เก็บประวัติสนทนา |
| **Evaluation** | เชื่อมกับ LangSmith / เครื่องมือ eval |
| **Observability** | LangSmith สำหรับ trace/monitor |

**ประโยชน์:** ต่อ prototype เร็ว, สลับ component ได้, มี integration เยอะ
**ข้อเสีย:** abstraction เยอะ เรียนรู้เส้นทางยาว, API เปลี่ยนบ่อย, debug ยากเมื่อซ้อนลึก, อาจ "ซับซ้อนเกินจำเป็น"

## 2. เปรียบเทียบกับทางเลือก

| Framework | จุดเด่น | จุดอ่อน | เหมาะกับกรณีใด | ข้อจำกัด |
|-----------|---------|---------|----------------|----------|
| **LangChain** | integration กว้าง, LCEL, LangGraph (agent/stateful), LangSmith (observability) | abstraction หนา, API เปลี่ยนบ่อย | แอปที่ต้องต่อหลายชิ้น/หลาย tool/agent | ต้องตามเวอร์ชันให้ทัน |
| **LlamaIndex** | เจาะ **RAG/indexing/retrieval** โดยเฉพาะ, data connectors เยอะ, query engine ครบ | นอกเหนือ RAG ยืดหยุ่นน้อยกว่า | **ระบบ RAG/ค้นเอกสารเป็นหลัก** | agent/tooling ไม่กว้างเท่า LangChain |
| **Haystack** (deepset) | production-oriented, pipeline ชัดเจน, มี component ครบ | ชุมชนเล็กกว่า | ระบบ search/RAG ระดับ production ที่ต้องการโครงชัด | integration บาง provider ช้ากว่า |
| **Semantic Kernel** (Microsoft) | ผูกกับ .NET/C# ดี, planner, enterprise MS stack | Python ตามหลัง .NET | องค์กรสาย Microsoft/Azure/.NET | ระบบนิเวศเล็กกว่าในฝั่ง Python |
| **เขียนเอง (Python ตรง ๆ)** | ควบคุมเต็ม, dependency น้อย, debug ง่าย, ไม่ต้องกลัว API framework เปลี่ยน | ต้องเขียน glue เอง, ไม่มี integration สำเร็จ | ระบบเล็ก/ชัดเจน, ทีมอยากคุมทุกอย่าง | reinvent บางส่วน |

> ข้อเท็จจริง: LlamaIndex ออกแบบมาเน้น indexing/retrieval สำหรับ RAG โดยเฉพาะ; LangChain เน้นการเป็น orchestration framework ทั่วไปที่มี LangGraph สำหรับ agent (อ้างอิงเอกสารทางการใน `16_...`)

## 3. เมื่อใดควร/ไม่ควรใช้ Framework

**ควรใช้ framework เมื่อ:**
- ต้องต่อหลาย component และสลับไปมา (หลาย vector store/หลายโมเดล)
- ต้องการ observability/eval สำเร็จรูป (LangSmith)
- ทำ agent/multi-step ที่ซับซ้อน (LangGraph)
- อยากได้ data connectors สำเร็จรูปเยอะ (LlamaIndex)

**ไม่ควร (เขียนเองดีกว่า) เมื่อ:**
- pipeline ตรงไปตรงมา: embed → search → prompt → ตอบ
- ทีมเล็ก อยาก dependency น้อย และคุม latency/debug ได้เต็ม
- กังวลเรื่อง API breaking changes ในระยะยาว

> **ข้อเสนอแนะ:** สำหรับ **RAG ภาษาไทยเป็นหลัก** พิจารณา **LlamaIndex** (ตรงกับงาน) หรือ **เขียนเองด้วย Python** (โปร่งใส/คุมได้) สำหรับ prototype; เลือก **LangChain + LangGraph** เมื่อเริ่มมี agent/tool หลายตัวและต้องการ observability — ไม่ว่าเลือกอะไร ให้ **ห่อ (wrap) การเรียก framework ไว้หลัง interface ของเราเอง** เพื่อให้เปลี่ยน/ถอด framework ได้ภายหลัง

## 4. หมายเหตุเรื่องโค้ดตัวอย่าง

โค้ดใน `examples/` ของฐานความรู้นี้ **เขียนแบบ Python ตรง ๆ เป็นหลัก** (ใช้ `sentence-transformers` + FAISS/Chroma) เพื่อให้เห็น workflow ชัดโดยไม่ผูกกับ API ของ framework ที่เปลี่ยนบ่อย — เมื่อเข้าใจ flow แล้วจึงย้ายไป LlamaIndex/LangChain ได้ง่าย

> อ่านต่อ: `09_AI_Ready_Infrastructure.md`
