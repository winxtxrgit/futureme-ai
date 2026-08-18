# คลังผังกระบวนการทำงานระบบ FutureMe AI (Detailed System Flowcharts Master Catalog)

> **เวทีการแข่งขัน:** JUMP THAILAND Hackathon 2026 (AIS Academy x NIA)
> **สถานะเอกสาร:** บูรณาการข้อมูลวิจัย 6 หมวด ([Data/](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/README.md)), คำแนะนำอาจารย์ ([Advice_from_the_teacher.m4a](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Advice_from_the_teacher.m4a)), สเปก [AIS Cloud & CAMARA Open APIs](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md), หลักสูตร [ปวช. 2567 / GED / สกร. / TCAS](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/02_Thai_National_Curricula/04_Non_Formal_and_Alternative_Education.md) และอัลกอริทึม [Roadmap DAG](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/06_AIS_Cloud_and_Infrastructure/02_Interactive_Roadmap_DAG_Algorithm.md) ครบถ้วนแล้ว

---

## 1. ผังกระบวนการทำงานภาพรวมทั้งระบบ (Master System Operations Flowchart)

```mermaid
flowchart TD
    subgraph S1 ["1. Client & Authentication Layer (AIS Open API - CAMARA Standard)"]
        A["นักเรียน / ผู้ปกครอง / ครู เข้าใช้งาน Web App"] --> B{"ผู้ใช้เข้าสู่ระบบผ่านวิธีใด?"}
        B -- "เบอร์มือถือ AIS" --> C["เรียก AIS Number Verify API (CAMARA Standard) - Passwordless"]
        B -- "เบอร์เครือข่ายอื่น" --> D["เรียก AIS OTP API ส่ง SMS รหัสผ่านใช้ครั้งเดียว"]
        C --> E["ตรวจสอบย้อนหลังด้วย AIS SIM Swap API (Anti-fraud Protection)"]
        D --> E
        E --> F["ระบุระดับผู้ใช้ (Student / Parent / Teacher Role) & ตรวจสอบหนังสือยินยอม PDPA"]
    end

    subgraph S2 ["2. Sequential 2-Phase Assessment Engine"]
        F --> G{"เลือกเข้าสู่กระบวนการใด?"}
        G -- "ประเมินค้นหาตัวตน" --> H["Phase 1: Socratic AI Adaptive Chat (5-10 นาที)"]
        H --> I["สกัดข้อมูลพฤติกรรมย้อนหลัง (STAR Methodology) & คะแนน RIASEC Matrix 6 ด้าน"]
        I --> J["Phase 2: Scenario Missions Sandbox (3-5 นาที)"]
        J --> K["เก็บหลักฐานพฤติกรรมปฏิบัติจริง (Multi-Evidence Behavioral Collection)"]
    end

    subgraph S3 ["3. Hybrid Recommendation & RAG Pipeline (FastAPI)"]
        K --> L["ส่งโปรไฟล์สกัดเข้าสู่ Backend FastAPI"]
        L --> M["Rule-based Engine Filter (จำกัดขอบเขตตามระดับชั้น ม.ปลาย / อาชีวะ ปวช.-ปวส. / GED / สกร. / TCAS)"]
        M --> N["Qdrant Hybrid Search (Dense Vector Semantic + Sparse Keyword)"]
        N --> O["ดึงข้อมูล 50+ Career Clusters, หลักสูตรไทย ปวช. 2567 & มหาวิทยาลัย TCAS"]
        O --> P["LLM Synthesis Engine (สร้างคำอธิบายแบบมีหลักฐานรองรับ - Explainable AI)"]
    end

    subgraph S4 ["4. Dynamic Pathfinder Roadmap Generator (roadmap.sh style)"]
        P --> Q["สร้างโครงสร้างข้อมูล Directed Acyclic Graph (DAG)"]
        Q --> R["รันอัลกอริทึม Topological Sort เรียงลำดับ Node เงื่อนไขก่อนหลัง"]
        R --> S["สร้าง Interactive Pathfinder Roadmap (Milestone: ทักษะ / สายเรียน / TCAS / GED / พอร์ตโฟลิโอ / อาชีพ)"]
    end

    subgraph S5 ["5. Multi-Role RBAC & Privacy Notification Layer"]
        S --> T["บันทึกแผนและ Roadmap ลง PostgreSQL บน AIS Cloud Data Center"]
        T --> U{"การเข้าถึงข้อมูลตามสิทธิ์ RBAC"}
        U -- "นักเรียน" --> V["แสดงแผนที่และ Roadmap ส่วนตัวแบบเต็ม (Private View)"]
        U -- "ผู้ปกครอง" --> W["แสดงเฉพาะสรุปความสนใจ & แผน 30 วัน (Parent Summary View)"]
        U -- "ครูแนะแนว" --> X["แสดง Dashboard ภาพรวมชั้นเรียน & คำถามแนะนำ (Counselor View)"]
        T --> Y["เรียก AIS SMS API ส่งการแจ้งเตือนแผน 30 วัน & สรุปผลทาง SMS"]
    end

    subgraph S6 ["6. AIS Cloud Container Infrastructure"]
        V & W & X & Y --> Z["รันแอปพลิเคชันบน Kubernetes (OKE) บน AIS Enterprise/OCI Cloud (100% Data Sovereignty)"]
    end
```

---

## 2. ผังแยกรายระบบย่อย (Detailed Sub-system Flowcharts)

### ระบบย่อยที่ 1: ระบบยืนยันตัวตนและการจัดการสิทธิ์ (IAM & AIS Open API Authentication Flowchart)

```mermaid
flowchart TD
    A1["ผู้ใช้เริ่มต้นเข้าสู่ระบบ (Web / Mobile)"] --> B1{"ตรวจสอบประเภทผู้ใช้"}
    B1 -- "นักเรียน (Student)" --> C1{"เบอร์โทรศัพท์ AIS?"}
    B1 -- "ผู้ปกครอง / ครู" --> D1["กรอกเบอร์มือถือเพื่อรับ OTP"]
    
    C1 -- "ใช่" --> E1["เรียก AIS Number Verify API (CAMARA Endpoint)"]
    E1 --> F1["ระบบตรวจสอบเบอร์กับ SIM Card ผ่านโครงข่าย AIS"]
    F1 --> G1{"ตรวจสอบสำเร็จหรือไม่?"}
    G1 -- "สำเร็จ" --> H1["เข้าสู่ระบบแบบ Passwordless Seamless Login"]
    G1 -- "ล้มเหลว" --> D1

    C1 -- "ไม่ใช่" --> D1
    D1 --> I1["เรียก AIS OTP API"]
    I1 --> J1["ส่ง SMS รหัส OTP 6 หลักไปยังมือถือ"]
    J1 --> K1["ผู้ใช้กรอกรหัส OTP บนหน้าเว็บ"]
    K1 --> L1{"รหัสถูกต้องหรือไม่?"}
    L1 -- "ถูกต้อง" --> M1["ยืนยันตัวตนสำเร็จ"]
    L1 -- "ไม่ถูกต้อง" --> N1["แสดงข้อผิดพลาด & ให้ส่ง OTP ใหม่"]

    H1 & M1 --> O1["เรียก AIS SIM Swap API"]
    O1 --> P1{"มีการเปลี่ยน SIM ใน 24 ชม. ที่ผ่านมาหรือไม่?"}
    P1 -- "มี (สุ่มเสี่ยง)" --> Q1["แจ้งเตือนความปลอดภัย & ให้ยืนยันผ่านผู้ปกครอง/ครู"]
    P1 -- "ไม่มี" --> R1["ตรวจสอบหนังสือยินยอมคัดกรองข้อมูลตามกฎหมาย PDPA"]
    R1 --> S1["กำหนดสิทธิ์ใช้งาน (Student Role / Parent Role / Teacher Role)"]
```

---

### ระบบย่อยที่ 2: ระบบประเมิน 2 เฟสและการโค้ชด้วย AI (Sequential 2-Phase Assessment Flowchart)

```mermaid
flowchart TD
    A2["เริ่มต้นประเมินค้นพบตัวตน"] --> B2["ตรวจสอบระดับชั้นและวุฒิการศึกษาของผู้เรียน"]
    B2 --> C2{"จำแนกกลุ่มผู้เรียน"}
    C2 -- "มัธยมต้น (ม.1-ม.3)" --> D2["เน้นการเลือกสาย ม.ปลาย / อาชีวะ ปวช. 2567"]
    C2 -- "มัธยมปลาย (ม.4-ม.6)" --> E2["เน้นเป้าหมายคณะ TCAS / เกณฑ์สอบ TGAT-TPAT-A-Level"]
    C2 -- "สายทางเลือก (GED / สกร. / Homeschool)" --> F2["เน้นเกณฑ์เทียบวุฒิ HSCES / A-Level / พอร์ตโฟลิโอ"]

    D2 & E2 & F2 --> G2["Phase 1: Socratic AI Adaptive Chat (5-10 นาที)"]
    G2 --> H2["คำถามเปิดแบบ Socratic ชวนตกผลึกพฤติกรรมในอดีต (STAR Method)"]
    H2 --> I2["AI สกัดข้อมูลพฤติกรรม: Situation ➔ Task ➔ Action ➔ Result"]
    I2 --> J2["คำนวณคะแนนบุคลิกภาพและความสนใจ RIASEC 6 ด้าน & Ikigai Matching"]
    J2 --> K2["ประมวลผลคำแนะนำทางเลือก 3-5 เส้นทางเบื้องต้น"]

    K2 --> L2["Phase 2: Scenario Missions Sandbox (3-5 นาที)"]
    L2 --> M2["สร้างภารกิจสถานการณ์จำลองตามเส้นทางที่เด็กสนใจ"]
    M2 --> N2["เด็กลงมือปฏิบัติภารกิจบนหน้าเว็บ (เช่น แก้ปัญหาการออกแบบ/โค้ด/การบริหาร)"]
    N2 --> O2["ประเมินหลักฐานพฤติกรรมจริง (Multi-Evidence Collection)"]
    O2 --> P2["รวมคะแนนสัมภาษณ์ + ผลการทำภารกิจ ➔ ส่งเข้า RAG Pipeline"]
```

---

### ระบบย่อยที่ 3: ระบบวิเคราะห์และดึงข้อมูลอัจฉริยะ (Hybrid Recommendation & RAG Pipeline Flowchart)

```mermaid
flowchart TD
    A3["รับโปรไฟล์คะแนน RIASEC & หลักฐานพฤติกรรมจาก Phase 1 & 2"] --> B3["ส่ง Request ไปยัง FastAPI Backend Orchestrator"]
    
    subgraph RuleEngine ["Rule-based Decision Engine"]
        B3 --> C3["ตรวจสอบ Hard Constraints (ระดับชั้น / วุฒิ GED-กศน. / เงื่อนไขเฉพาะสาขา)"]
        C3 --> D3["กรองกลุ่มอาชีพและหลักสูตรที่ไม่ตรงเงื่อนไขออก"]
    end

    subgraph RAGPipeline ["Qdrant Hybrid Search RAG Pipeline"]
        D3 --> E3["สร้าง Vector Embedding จากโปรไฟล์เด็ก"]
        E3 --> F3["ส่ง Query ไปยัง Qdrant Vector Database"]
        F3 --> G3["ทำ Dense Vector Search (Semantic Context Matching)"]
        F3 --> H3["ทำ Sparse Keyword Search (วิชาสอบ / คณะ / คุณวุฒิ TPQI / เกณฑ์ HSCES)"]
        G3 & H3 --> I3["ทำ Reciprocal Rank Fusion (RRF) รวบรวมผลลัพธ์"]
        I3 --> J3["ดึง Context บริบทอาชีพ 50+ Clusters & หลักสูตรการศึกษาไทย"]
    end

    subgraph LLMGenerator ["LLM Synthesis Engine"]
        J3 --> K3["ส่ง Context + โปรไฟล์เด็ก เข้าสู่ LLM (Claude / Typhoon API)"]
        K3 --> L3["ใช้ Prompt Template บังคับการส่งออกข้อมูลแบบ Structured JSON"]
        L3 --> M3["สร้างคำอธิบายจุดแข็ง หลักฐานรองรับ และสิ่งที่ยังไม่แน่ใจ (Explainable AI)"]
    end

    M3 --> N3["ส่งข้อมูลเส้นทางอาชีพ 3-5 ทางพร้อมเหตุผลไปยัง Roadmap Generator"]
```

---

### ระบบย่อยที่ 4: ระบบสร้างแผนที่เส้นทางแบบโต้ตอบ (Dynamic Pathfinder Roadmap Generator Flowchart)

```mermaid
flowchart TD
    A4["รับข้อมูลเส้นทางอาชีพ 3-5 ทางจาก Hybrid Recommendation Engine"] --> B4["สร้างโครงสร้างข้อมูล Directed Acyclic Graph (DAG)"]
    
    subgraph DAGBuilder ["Graph Data Builder"]
        B4 --> C4["สร้าง Node 1: Current State (สถานะปัจจุบันตามระดับชั้น / วุฒิผู้เรียน)"]
        C4 --> D4["สร้าง Node 2: Skill Building Milestones (ทักษะ Hard/Soft + คอร์สเรียนฟรี/Credit Bank)"]
        D4 --> E4["สร้าง Node 3: Academic Track / Equivalence (สายการเรียน ม.ปลาย / ปวช. / GED / สกร.)"]
        E4 --> F4["สร้าง Node 4: Target Faculty & TCAS Criteria (เกณฑ์สอบ TGAT/TPAT/A-Level/HSCES)"]
        F4 --> G4["สร้าง Node 5: Portfolio & Experience (มินิโปรเจกต์ / คุณวุฒิวิชาชีพ TPQI)"]
        G4 --> H4["สร้าง Node 6: Career Entry (เป้าหมายอาชีพและความก้าวหน้า)"]
    end

    subgraph SortEngine ["Topological Sort & Dependency Engine"]
        H4 --> I4["กำหนดเงื่อนไขพึ่งพิง (Prerequisites / Edges) ระหว่าง Node"]
        I4 --> J4["ประมวลผลอัลกอริทึม Topological Sort เพื่อจัดลำดับก่อน-หลัง"]
        J4 --> K4["ตรวจสอบว่าไม่มีเงื่อนไขวนซ้ำ (Acyclic Check)"]
    end

    K4 --> L4["ส่งแปลงข้อมูล JSON Graph ไปยัง Frontend Render Component"]
    L4 --> M4["แสดงผล Interactive Pathfinder Roadmap (Step-by-Step Node UI)"]
    M4 --> N4["เด็กคลิกดูรายละเอียดคอร์สเรียน / กดเช็กอินความก้าวหน้า (Progress Tracker)"]
```

---

### ระบบย่อยที่ 5: ระบบแดชบอร์ดสิทธิ์และการคุ้มครองข้อมูลส่วนบุคคล (Multi-Role RBAC & PDPA Dashboard Flowchart)

```mermaid
flowchart TD
    A5["บันทึกแผนและ Roadmap ลง PostgreSQL บน AIS Cloud Data Center"] --> B5{"ผู้ใช้ร้องขอเข้าดูข้อมูล (Data Request)"}
    
    B5 -- "นักเรียน (Student)" --> C5["ตรวจสอบ Session ยืนยันว่าเป็นเจ้าของบัญชี"]
    C5 --> D5["แสดงผลหน้าจอส่วนตัวครบถ้วน (Full Private Student View)"]
    D5 --> E5{"นักเรียนต้องการแชร์ข้อมูลหรือไม่?"}
    E5 -- "กดแชร์ / ให้ความยินยอม" --> F5["สร้าง Link ปลอดภัย / บันทึก Consent Token ให้ครูหรือผู้ปกครอง"]
    E5 -- "ไม่แชร์" --> G5["คงสถานะข้อมูลเป็นส่วนตัว 100%"]

    B5 -- "ผู้ปกครอง (Parent)" --> H5["ตรวจสอบความสัมพันธ์ผู้ปกครอง-นักเรียน"]
    H5 --> I5{"ระบบยืนยันสิทธิ์ถูกต้องหรือไม่?"}
    I5 -- "ถูกต้อง" --> J5["แสดงผล Parent Summary View (เห็นเฉพาะสรุปความสนใจ & แผน 30 วัน)"]
    J5 --> K5["ซ่อนข้อความสนทนาส่วนตัว (Chat Transcript) ทั้งหมดตาม PDPA"]
    I5 -- "ไม่ถูกต้อง" --> L5["ปฏิเสธการเข้าถึงข้อมูล"]

    B5 -- "ครูแนะแนว (Teacher)" --> M5["ตรวจสอบรายชื่อนักเรียนในความดูแลของครู"]
    M5 --> N5["แสดงผล Counselor Dashboard (ภาพรวมสถิติชั้นเรียน & ระดับความลังเล)"]
    N5 --> O5["แสดงคำถามแนะนำสำหรับการโค้ชรายบุคคล (Guidance Prompts)"]
    O5 --> P5["ซ่อนข้อความสนทนาส่วนตัวของเด็กทั้งหมด เว้นแต่เด็กจะกด Consent แชร์ให้ครู"]

    D5 & J5 & N5 --> Q5["เรียก AIS SMS API ส่ง SMS แจ้งเตือนแผน 30 วัน & สรุปผลทางมือถือ"]
```

---

### ระบบย่อยที่ 6: โครงสร้างพื้นฐานและการติดตั้งบน AIS Cloud (AIS Cloud Container Deployment Flowchart)

```mermaid
flowchart TD
    subgraph NetworkLayer ["AIS Network & Security Layer"]
        A6["ผู้ใช้ส่ง HTTPS Request ผ่าน AIS 5G / Broadband"] --> B6["เข้าสู่ AIS NaaS (Network as a Service) & Cloud Load Balancer"]
        B6 --> C6["ผ่านระบบป้องกัน DDoS & Stateful Firewall (VMware NSX Micro-segmentation)"]
    end

    subgraph CloudInfra ["AIS Cloud Powered by OCI (THAI Hyperscale Data Center)"]
        C6 --> D6["ส่ง Request เข้าสู่ Kubernetes Cluster (Oracle Container Engine for Kubernetes - OKE)"]
        
        subgraph Pods ["Container Pods Auto-scaling"]
            D6 --> E6["Next.js Frontend Pods (Render UI / Interactive Roadmap)"]
            D6 --> F6["FastAPI Backend Pods (App Logic / Socratic Agent)"]
            D6 --> G6["Qdrant Vector DB Pods (Thai Careers & Curricula Index)"]
            D6 --> H6["PostgreSQL Database Pods (PDPA Data & Multi-Role RBAC)"]
        end

        F6 --> I6["เชื่อมต่อภายนอกไปยัง AIS Open API Gateway (CAMARA Number Verify / SIM Swap / OTP / SMS)"]
        F6 --> J6["เชื่อมต่อภายนอกไปยัง LLM Cloud API (Claude / Typhoon) ผ่าน TLS Encryption"]
    end

    subgraph DataSovereignty ["Data Sovereignty & Compliance"]
        H6 & G6 --> K6["ข้อมูลทั้งหมดจัดเก็บใน Data Center ประเทศไทย 100% (ISO 27001 / ISO 27018 / PDPA)"]
    end
```

---

## 3. การสรุปคุณค่าและการนำไปใช้งานในวันแข่ง Hackathon

ผังการทำงานทั้งหมดถูกออกแบบให้อยู่ในมาตรฐาน **Carrier-Grade & Production Ready** เพื่อให้ทีมสามารถนำเสนอต่อกรรมการในวัน Demo Day ได้ดังนี้:
1. **แสดงภาพรวมความเข้าใจเชิงระบบ (Master Operations Flowchart):** ชี้ให้เห็นว่าระบบเชื่อมโยงตั้งแต่ AIS OTP/Number Verify ➔ Socratic AI ➔ Qdrant RAG ➔ Dynamic Roadmap ➔ SMS Notification
2. **พิสูจน์ความลึกทางวิศวกรรม (Sub-system Flowcharts):** มีผังรองรับการทำงานย่อยครบทั้ง 6 ระบบ โดยเฉพาะการจัดเก็บข้อมูลบน AIS Cloud 100% ในประเทศไทย และการสร้าง Roadmap ด้วย DAG Algorithm
