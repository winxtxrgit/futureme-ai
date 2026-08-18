# 09 — โครงสร้างพื้นฐานพร้อมรองรับ AI (AI-Ready Infrastructure)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026

## 1. องค์ประกอบพื้นฐานที่ต้องมี

| ชั้น | องค์ประกอบ | เครื่องมือ (ตัวอย่าง) | บทบาท |
|------|-----------|----------------------|-------|
| Development | Local Dev | Python venv/conda, Jupyter, VS Code | พัฒนา/ทดลอง |
| Compute | GPU Server / Cloud GPU / CPU Inference | NVIDIA GPU, Colab, RunPod/Vast/Lambda/AWS/GCP | รันโมเดล/เทรน |
| Model Serving | Inference server | Ollama, vLLM, TGI, llama.cpp | เสิร์ฟโมเดล |
| API | API Server | FastAPI/Uvicorn | รับ request จาก frontend |
| Data | Vector DB | Chroma/Qdrant/Milvus/pgvector | เก็บ embedding |
| Data | Object Storage | S3/MinIO/GCS | เก็บไฟล์เอกสารต้นฉบับ |
| Data | Relational DB | Postgres | เก็บ metadata/user/log |
| Security | Authentication | OAuth2/OIDC, JWT, Keycloak | ยืนยันตัวตน |
| Ops | Logging | structured logs, Loki/ELK | บันทึกเหตุการณ์ |
| Ops | Monitoring | Prometheus + Grafana, LangSmith | เฝ้าระวัง |
| Ops | Backup | snapshot DB/object storage | กู้คืน |
| Deploy | Container / Docker | Docker, docker-compose | แพ็ก/รัน |
| Deploy | CI/CD | GitHub Actions/GitLab CI | build/test/deploy |
| Deploy | Autoscaling | Kubernetes/managed | ขยายตามโหลด |
| Security | Secret Management | Vault, cloud secret manager, `.env` (dev เท่านั้น) | เก็บ key/credential |

## 2. เปรียบเทียบ 5 แนวทาง Deployment

| แนวทาง | ข้อมูลอยู่ที่ไหน | ต้นทุน | ความเป็นส่วนตัว | เหมาะกับกรณีใด | ข้อจำกัด |
|--------|-----------------|--------|-----------------|----------------|----------|
| **1. Local ทั้งหมด** | เครื่องตัวเอง/องค์กร | ต่ำ (ลงทุนครั้งเดียว) | สูงสุด | prototype, ข้อมูลลับมาก, offline | scale จำกัด, ต้องดูแลเอง |
| **2. Local model + Cloud vector DB** | โมเดล local, เวกเตอร์ cloud | ปานกลาง | ปานกลาง (เวกเตอร์อยู่นอก) | ทีมกระจาย, ข้อมูลไม่ลับสุด | เวกเตอร์อาจ reverse ได้บางส่วน → ต้องเข้ารหัส |
| **3. Cloud Model API** (เช่น เรียก API ภายนอก) | ส่ง prompt ออกนอก | จ่ายตามใช้ | ต่ำสุด | ต้นแบบเร็ว, ไม่มีข้อมูลลับ | ข้อมูลออกนอกองค์กร (ระวัง PDPA), ราคาผันแปร |
| **4. Open-source model บน Cloud GPU** | โมเดล+ข้อมูลบน VPC ของเรา | ปานกลาง–สูง | ปานกลาง–สูง (คุม VPC ได้) | production ที่ต้องการคุมข้อมูล+scale | ต้อง ops/จัดการ GPU |
| **5. Hybrid** | ผสม (เช่น sensitive → local, ทั่วไป → cloud) | ปรับได้ | ปรับได้ | องค์กรที่ต้องบาลานซ์ต้นทุน/ความลับ | ออกแบบ routing ซับซ้อน |

> **ข้อเสนอแนะ:** งานเอกสารองค์กร/ราชการที่มีข้อมูลลับ ให้เริ่มที่แนวทาง **1 หรือ 4** (โมเดลโอเพนซอร์ส คุมข้อมูลใน VPC/on-prem) หลีกเลี่ยงการส่งเอกสารลับไป Cloud Model API ภายนอกเว้นแต่มีสัญญา/ข้อตกลงชัดเจน (ดู `11_...`)

## 3. Architecture 3 ระดับ

### 3.1 Prototype ราคาประหยัด
```text
[เครื่อง Dev / Colab]
 FastAPI + Chroma(local) + Ollama(SLM 3-7B GGUF) + sentence-transformers(embedding)
 เอกสารเก็บในโฟลเดอร์/SQLite
```
- เป้าหมาย: พิสูจน์แนวคิด, สาธิต, ใช้ในทีมเล็ก
- ต้นทุน: เกือบศูนย์ (ใช้เครื่องที่มี) — ดู `12_...`

### 3.2 ทีมวิจัย / มหาวิทยาลัย (ระบบเล็ก-กลาง)
```text
[GPU server 1 ตัว (เช่น RTX 4090/A10) หรือ Cloud GPU รายเดือน]
 Nginx → FastAPI → vLLM(SLM 7-9B) 
                 → Qdrant (vector) 
                 → Postgres (metadata/log) 
                 → MinIO/S3 (ไฟล์)
 Auth: Keycloak/OIDC | Monitor: Prometheus+Grafana | Docker Compose
```
- เป้าหมาย: ใช้งานจริงในหน่วยงาน, หลายผู้ใช้, มี auth + log
- ขยาย: เพิ่ม replica ของ API/serving ได้

### 3.3 Production องค์กร
```text
[Kubernetes บน Cloud VPC / on-prem]
 Ingress/WAF → API (autoscale) 
   → Model Serving (vLLM/TGI, GPU node pool, autoscale)
   → Vector DB (Qdrant/Milvus cluster) 
   → Postgres (HA) + Object Storage 
   → Reranker service
 CI/CD, Secret Manager(Vault), Central Logging(Loki/ELK), 
 Monitoring(Prometheus/Grafana + LLM tracing), Backup/DR, RBAC
```
- เป้าหมาย: ผู้ใช้จำนวนมาก, SLA, ความปลอดภัย/ตรวจสอบครบ
- เพิ่ม: rate limiting, canary deploy, audit log, DR plan

## 4. ข้อพิจารณา CPU vs GPU (สรุปสั้น — เต็มใน `12_...`)
- **CPU inference**: ทำได้กับ SLM เล็ก (1–7B, quantized ผ่าน llama.cpp) — เหมาะ prototype/โหลดต่ำ, latency สูงกว่า
- **GPU inference**: จำเป็นเมื่อต้องการ throughput/latency ดี, โมเดลใหญ่ขึ้น, หลาย concurrent user

## 5. ข้อเสนอแนะรวม
- เริ่ม **Docker Compose** (single host) ก่อน แล้วค่อยไป Kubernetes เมื่อโหลด/ทีมโตจริง
- **แยก stateless (API/serving) กับ stateful (DB/vector/storage)** เพื่อ scale และ backup ง่าย
- เก็บ **secret ใน secret manager** ไม่ commit ลง repo; `.env` ใช้เฉพาะ dev (ดู `.env.example`)
- วางแผน **backup vector DB + object storage + Postgres** ตั้งแต่ต้น

> อ่านต่อ: `10_Model_Evaluation.md`
