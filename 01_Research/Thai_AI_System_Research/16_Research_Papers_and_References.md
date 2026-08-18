# 16 — งานวิจัยและแหล่งอ้างอิง (Research Papers & References)

> วันที่ตรวจสอบ/เข้าถึงข้อมูล: 21 กรกฎาคม 2026
> รูปแบบอ้างอิง: APA 7 (โดยประมาณ) — ทุกรายการระบุประเภทแหล่ง, URL, วันที่เข้าถึง, สรุป, ความเกี่ยวข้อง, และระดับความน่าเชื่อถือ
> **ระดับความน่าเชื่อถือ:** 🟢 สูง (peer-reviewed/เอกสารทางการ/technical report จากผู้พัฒนา) · 🟡 ปานกลาง (preprint arXiv ที่ยังไม่ผ่าน peer-review เต็ม / บล็อกทางการ) · 🟠 ใช้ประกอบ (บล็อกเปรียบเทียบทั่วไป — ตรวจสอบซ้ำ)
> ⚠️ arXiv preprint = ยังไม่ผ่าน peer-review เต็มรูปแบบ ให้ตรวจสอบเวอร์ชันตีพิมพ์เมื่อมี

---

## หมวด: RAG (พื้นฐาน)

1. **Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.** arXiv:2005.11401. [https://arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint/conference (NeurIPS). สรุป: เสนอ RAG ต้นฉบับ รวม retriever + generator. เกี่ยวข้อง: รากฐานแนวคิด RAG ทั้งโครงการ. 🟢

## หมวด: Advanced RAG

2. **Gao, Y., et al. (2023). Retrieval-Augmented Generation for Large Language Models: A Survey.** arXiv:2312.10997. [https://arxiv.org/abs/2312.10997](https://arxiv.org/abs/2312.10997) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint survey. สรุป: จำแนก Naive/Advanced/Modular RAG. เกี่ยวข้อง: ใช้จัดหมวดสถาปัตยกรรม RAG (`03_,04_`). 🟡
3. **Edge, D., et al. (2024). From Local to Global: A Graph RAG Approach to Query-Focused Summarization.** arXiv:2404.16130. [https://arxiv.org/abs/2404.16130](https://arxiv.org/abs/2404.16130) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint (Microsoft Research). สรุป: GraphRAG ใช้ knowledge graph. เกี่ยวข้อง: เปรียบเทียบ Vector vs Graph RAG (`03_`). 🟡
4. **Liu, N. F., et al. (2023). Lost in the Middle: How Language Models Use Long Contexts.** arXiv:2307.03172. [https://arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint (TACL). สรุป: โมเดลมองข้อมูลกลาง context พลาด. เกี่ยวข้อง: เหตุผลไม่ยัดเอกสารทั้งหมด (`03_,04_`). 🟢

## หมวด: Embedding & Multilingual Retrieval

5. **Chen, J., Xiao, S., Zhang, P., Luo, K., Lian, D., & Liu, Z. (2024). BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation.** arXiv:2402.03216 (Findings of ACL 2024). [https://arxiv.org/abs/2402.03216](https://arxiv.org/abs/2402.03216) — เข้าถึง 21 ก.ค. 2026. ประเภท: peer-reviewed (ACL Findings). สรุป: embedding 100+ ภาษา รวม dense/sparse/multi-vector, context 8192. เกี่ยวข้อง: embedding แนะนำสำหรับไทย (`05_`). 🟢
6. **Wang, L., et al. (2024). Multilingual E5 Text Embeddings: A Technical Report.** arXiv:2402.05672. [https://arxiv.org/abs/2402.05672](https://arxiv.org/abs/2402.05672) — เข้าถึง 21 ก.ค. 2026. ประเภท: technical report (Microsoft). สรุป: mE5 หลายภาษา ใช้ prefix query/passage. เกี่ยวข้อง: ทางเลือก embedding (`05_`). 🟢
7. **Malkov, Yu. A., & Yashunin, D. A. (2016/2018). Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs (HNSW).** arXiv:1603.09320. [https://arxiv.org/abs/1603.09320](https://arxiv.org/abs/1603.09320) — เข้าถึง 21 ก.ค. 2026. ประเภท: peer-reviewed (IEEE TPAMI). สรุป: อัลกอริทึม index HNSW. เกี่ยวข้อง: index ใน vector DB (`05_`). 🟢

## หมวด: Thai NLP & Thai LLM

8. **Lowphansirikul, L., Polpanumas, C., Jantrakulchai, N., & Nutanong, S. (2021). WangchanBERTa: Pretraining transformer-based Thai Language Models.** arXiv:2101.09635. [https://arxiv.org/abs/2101.09635](https://arxiv.org/abs/2101.09635) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint. สรุป: โมเดลภาษาไทย RoBERTa-base บนคอร์ปัส 78GB, เน้นรักษาช่องว่างเป็นขอบเขต. เกี่ยวข้อง: พื้นฐาน NLP ไทย (`01_`). 🟢
9. **Pipatanakul, K., et al. (2023). Typhoon: Thai Large Language Models.** arXiv:2312.13951 (SCB 10X). [https://arxiv.org/abs/2312.13951](https://arxiv.org/abs/2312.13951) — เข้าถึง 21 ก.ค. 2026. ประเภท: technical report. สรุป: LLM ไทย 7B ประสิทธิภาพใกล้ GPT-3.5 ในไทย, tokenizer ไทยมีประสิทธิภาพกว่า. เกี่ยวข้อง: เลือกโมเดลไทย (`02_`). 🟢
10. **Pipatanakul, K., et al. (2024). Typhoon 2: A Family of Open Text and Multimodal Thai Large Language Models.** arXiv:2412.13702 (SCB 10X). [https://arxiv.org/abs/2412.13702](https://arxiv.org/abs/2412.13702) — เข้าถึง 21 ก.ค. 2026. ประเภท: technical report. สรุป: ตระกูล Typhoon 2 บน Llama 3/Qwen2, มี multimodal และรุ่นเล็กสำหรับมือถือ. เกี่ยวข้อง: SLM ไทย (`02_`). 🟢
11. **OpenThaiGPT team. (2024). OpenThaiGPT 1.5: A Thai-Centric Open Source Large Language Model.** arXiv:2411.07238. [https://arxiv.org/abs/2411.07238](https://arxiv.org/abs/2411.07238) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint. สรุป: LLM ไทยโอเพนซอร์ส (ฐาน Qwen2.5) รายงานผล ThaiExam. เกี่ยวข้อง: SLM ไทย + license (`02_`). 🟡
12. **AI Singapore. (2025). SEA-LION: Southeast Asian Languages in One Network.** arXiv:2504.05747. [https://arxiv.org/abs/2504.05747](https://arxiv.org/abs/2504.05747) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint + เอกสารทางการ [https://sea-lion.ai](https://sea-lion.ai). สรุป: โมเดลหลายภาษา SEA รวมไทย (v4 บน Gemma 3). เกี่ยวข้อง: SLM หลายภาษา (`02_`). 🟡
13. **Typhoon team / SCB 10X. (2026). Typhoon OCR: Open Vision-Language Model for Thai Document Extraction.** arXiv:2601.14722; PyPI `typhoon-ocr`; GitHub [scb-10x/typhoon-ocr](https://github.com/scb-10x/typhoon-ocr). [https://arxiv.org/abs/2601.14722](https://arxiv.org/abs/2601.14722) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint + repo ทางการ. สรุป: VLM OCR เอกสารไทย คืน markdown/HTML รองรับตาราง. เกี่ยวข้อง: OCR ไทย (`06_`). 🟡
14. **WangchanThaiInstruct team. (2025). WangchanThaiInstruct: An Instruction-Following Dataset for Culture-Aware, Multitask, and Multi-domain Evaluation in Thai.** arXiv:2508.15239. [https://arxiv.org/abs/2508.15239](https://arxiv.org/abs/2508.15239) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint. สรุป: ชุด instruction ภาษาไทย. เกี่ยวข้อง: dataset สำหรับ LoRA + eval (`07_,10_`) — ⚠️ ตรวจ license ก่อนใช้. 🟡
15. **Cultural/Core Thai LLM Benchmark team. (2024). Representing the Under-Represented: Cultural and Core Capability Benchmarks for Developing Thai LLMs.** arXiv:2410.04795. [https://arxiv.org/abs/2410.04795](https://arxiv.org/abs/2410.04795) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint. สรุป: benchmark ความสามารถ/วัฒนธรรมไทย. เกี่ยวข้อง: การประเมินไทย (`10_`). 🟡

## หมวด: LoRA / QLoRA / Quantization

16. **Hu, E. J., et al. (2021). LoRA: Low-Rank Adaptation of Large Language Models.** arXiv:2106.09685. [https://arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint (ICLR 2022). สรุป: LoRA adapter low-rank. เกี่ยวข้อง: `07_`. 🟢
17. **Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient Finetuning of Quantized LLMs.** arXiv:2305.14314. [https://arxiv.org/abs/2305.14314](https://arxiv.org/abs/2305.14314) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint (NeurIPS 2023). สรุป: 4-bit NF4 + double quant + paged optimizer. เกี่ยวข้อง: `07_`. 🟢

## หมวด: Evaluation

18. **Es, S., James, J., Espinosa-Anke, L., & Schockaert, S. (2023/2024). RAGAS: Automated Evaluation of Retrieval Augmented Generation.** arXiv:2309.15217. [https://arxiv.org/abs/2309.15217](https://arxiv.org/abs/2309.15217) — เข้าถึง 21 ก.ค. 2026. ประเภท: preprint (EACL 2024 demo). สรุป: กรอบวัด faithfulness/relevance อัตโนมัติ. เกี่ยวข้อง: `10_`. 🟡

## หมวด: เอกสารทางการเครื่องมือ (Documentation)

19. **Hugging Face. PEFT Documentation.** [https://huggingface.co/docs/peft](https://huggingface.co/docs/peft) — เข้าถึง 21 ก.ค. 2026. ประเภท: เอกสารทางการ. เกี่ยวข้อง: `07_`. 🟢
20. **Hugging Face. bitsandbytes / Quantization Documentation.** [https://huggingface.co/docs/bitsandbytes](https://huggingface.co/docs/bitsandbytes) — เข้าถึง 21 ก.ค. 2026. ประเภท: เอกสารทางการ. เกี่ยวข้อง: `07_`. 🟢
21. **Hugging Face. Transformers Documentation.** [https://huggingface.co/docs/transformers](https://huggingface.co/docs/transformers) — เข้าถึง 21 ก.ค. 2026. 🟢
22. **PyThaiNLP. Documentation & tokenize API.** [https://pythainlp.org](https://pythainlp.org) — เข้าถึง 21 ก.ค. 2026. ประเภท: เอกสารทางการ/โอเพนซอร์ส. เกี่ยวข้อง: `01_,06_`. 🟢
23. **LangChain. Documentation (core/community/integrations, LCEL, LangGraph).** [https://python.langchain.com](https://python.langchain.com) และ [https://reference.langchain.com](https://reference.langchain.com) — เข้าถึง 21 ก.ค. 2026. ประเภท: เอกสารทางการ. เกี่ยวข้อง: `08_`. 🟢
24. **LlamaIndex. Documentation.** [https://docs.llamaindex.ai](https://docs.llamaindex.ai) — เข้าถึง 21 ก.ค. 2026. เกี่ยวข้อง: `08_`. 🟢
25. **Ragas. Documentation (metrics).** [https://docs.ragas.io](https://docs.ragas.io) — เข้าถึง 21 ก.ค. 2026. เกี่ยวข้อง: `10_`. 🟢
26. **Sentence-Transformers Documentation.** [https://www.sbert.net](https://www.sbert.net) — เข้าถึง 21 ก.ค. 2026. เกี่ยวข้อง: `05_,15_`. 🟢

## หมวด: Vector Database (เอกสารทางการ)

27. **Chroma.** [https://docs.trychroma.com](https://docs.trychroma.com) — เข้าถึง 21 ก.ค. 2026. 🟢
28. **Qdrant.** [https://qdrant.tech/documentation](https://qdrant.tech/documentation) — เข้าถึง 21 ก.ค. 2026. 🟢
29. **Milvus.** [https://milvus.io/docs](https://milvus.io/docs) — เข้าถึง 21 ก.ค. 2026. 🟢
30. **Weaviate.** [https://weaviate.io/developers/weaviate](https://weaviate.io/developers/weaviate) — เข้าถึง 21 ก.ค. 2026. 🟢
31. **FAISS (Meta).** [https://faiss.ai](https://faiss.ai) / [https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss) — เข้าถึง 21 ก.ค. 2026. 🟢
32. **pgvector.** [https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) — เข้าถึง 21 ก.ค. 2026. 🟢

## หมวด: Model Cards (ตรวจ license ก่อนใช้)

33. **BAAI/bge-m3** [https://huggingface.co/BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3) · **intfloat/multilingual-e5-large** [https://huggingface.co/intfloat/multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large) — เข้าถึง 21 ก.ค. 2026. 🟢
34. **scb10x (Typhoon)** [https://huggingface.co/scb10x](https://huggingface.co/scb10x) · **openthaigpt** [https://huggingface.co/openthaigpt](https://huggingface.co/openthaigpt) · **Qwen2.5** [https://huggingface.co/Qwen](https://huggingface.co/Qwen) · **Gemma** [https://huggingface.co/google](https://huggingface.co/google) · **Llama** [https://huggingface.co/meta-llama](https://huggingface.co/meta-llama) — เข้าถึง 21 ก.ค. 2026. 🟢

## หมวด: Security / Governance

35. **สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC). พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA).** [https://www.pdpc.or.th](https://www.pdpc.or.th) — เข้าถึง 21 ก.ค. 2026. ประเภท: เอกสารราชการ. เกี่ยวข้อง: `11_`. 🟢
36. **OWASP. Top 10 for LLM Applications.** [https://owasp.org/www-project-top-10-for-large-language-model-applications/](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — เข้าถึง 21 ก.ค. 2026. ประเภท: มาตรฐานอุตสาหกรรม. เกี่ยวข้อง: prompt injection/security (`11_`). 🟢

---
> ⚠️ **หมายเหตุการตรวจสอบ:** URL และ arXiv ID ตรวจสอบ ณ 21 ก.ค. 2026 — arXiv IDs ที่ขึ้นต้นด้วยปี/เดือนล่าสุด (เช่น 2601.xxxxx) เป็นผลงานใหม่ ควรยืนยันสถานะการตีพิมพ์อีกครั้ง หากลิงก์ใดเปิดไม่ได้ ให้ค้นชื่อผลงานจากฐาน arXiv/ACL Anthology โดยตรง

> อ่านต่อ: `17_Glossary.md`
