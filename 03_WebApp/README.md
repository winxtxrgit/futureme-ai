# 03_WebApp — แอปพลิเคชันจำลองและระบบแนะแนวสำหรับผู้เรียน (Next.js 15.5)

> **สถานะ:** ผลิตภัณฑ์ต้นแบบตัวจริงที่รันได้สมบูรณ์ (Production-Ready Prototype) สำหรับ JUMP THAILAND Innovation Hackathon 2026

---

## 🌟 โครงสร้างโฟลเดอร์ Web Application (`Pre_Present/`)

โฟลเดอร์ `Pre_Present/` คือ Next.js Application ตัวหลักที่ขับเคลื่อนด้วย React 19, TypeScript และ Tailwind CSS

```
03_WebApp/Pre_Present/
├── app/                     # Next.js App Router (11 UI Pages & 3 API Routes)
│   ├── page.tsx             # หน้าแรก Landing Page
│   ├── interview/           # แบบประเมิน RIASEC (36 ข้อ) + Self-Efficacy Scale
│   ├── chat/                # แชทสนทนากับ Mascot AI Counselor
│   ├── routes/              # รายการเส้นทาง & จัดอันดับ 23,257 หลักสูตรจริง
│   ├── compare/             # ระบบเปรียบเทียบหลักสูตร โอกาสงาน และค่าใช้จ่าย
│   ├── nearby/              # แผนที่ค้นหาสถาบันตามระยะทาง & ค่าครองชีพ 5 ภาค
│   ├── plan/                # แผนปฏิบัติการ 30 วัน (30-Day Action Roadmap)
│   ├── mission/             # กิจกรรมจำลองเพื่อสะสมหลักฐานความถนัด (Evidence Quests)
│   ├── how-it-works/        # อธิบายสถาปัตยกรรมและหลักการ "Rules decide. AI explains."
│   ├── privacy/             # นโยบายความปลอดภัยและการถือครองข้อมูล (Data Ownership)
│   ├── research/            # หน้าแสดงหลักฐานงานวิจัยและสถิติอ้างอิง
│   └── api/                 # Backend Endpoints (/api/nearby, /api/explain, /api/chat)
├── components/              # UI Components ตามแนวคิด GenZ Aurora + Mascot Lab
├── data/                    # ฐานข้อมูลหลักสูตรและแบบประเมิน
├── lib/                     # Matching Engine, Cosine Engine, Storage และ Utilities
├── assets/                  # ภาพถ่ายหน้าจอและสื่อกราฟิก
└── docs/                    # เอกสารประกอบการออกแบบระบบ 9 ฉบับ
```

---

## 💻 วิธีการรันและทดสอบระบบ

```bash
# 1. เข้าสู่โฟลเดอร์ Web Application
cd 03_WebApp/Pre_Present

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Development Server
npm run dev
```
เปิดใช้งานที่: **`http://localhost:3000`**

### การตรวจสอบคุณภาพโค้ด (Quality Assurance)
* `npm run typecheck` — ตรวจสอบ Type ด้วย TypeScript (0 Errors)
* `npm run lint` — ตรวจสอบมาตรฐานโค้ดด้วย ESLint (0 Warnings)
* `npm run build` — ทดสอบการ Compile Production Build (17/17 Pages ผ่านสมบูรณ์)
