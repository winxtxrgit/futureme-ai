# กติกาสร้าง Career–Skill–Program Mapping

> สถานะ: ข้อกำหนดข้อมูลของโครงการ  
> ตรวจล่าสุด: 24 กรกฎาคม 2026

ไฟล์ตัวอย่างอาชีพในหมวดนี้ช่วยกำหนดหน้าตาข้อมูล แต่ยังไม่ใช่ฐานอาชีพที่ครอบคลุมและยังไม่ได้ตรวจทุก skill/หลักสูตรกับแหล่งตรง

## แหล่งแกนกลาง

- [O*NET Database 30.3](https://www.onetcenter.org/database.html): งาน ทักษะ ความรู้ ความสนใจ บริบทงาน และ metadata คุณภาพ
- [O*NET License](https://www.onetcenter.org/license_db.html): CC BY 4.0 พร้อม attribution และระบุการดัดแปลง
- [ESCO v1.2.1](https://esco.ec.europa.eu/en/about-esco/what-esco): 3,039 อาชีพ 13,939 ทักษะ และความสัมพันธ์อาชีพ–ทักษะ
- [TPQI](https://www.tpqi.go.th/): ใช้เพิ่มมาตรฐานวิชาชีพไทยทีละอาชีพเมื่อมีหน้ามาตรฐานตรง

## ความสัมพันธ์ที่ต้องแยก

- `required_by_law`: ต้องมีตามกฎหมาย/ใบอนุญาต
- `required_by_program`: คุณสมบัติรับเข้าหรือจบหลักสูตร
- `commonly_requested`: พบบ่อยในตลาดงานที่มีช่วงเวลา
- `helpful_preparation`: ทางเตรียมตัวหนึ่งทาง ไม่ใช่ข้อบังคับ
- `example_only`: ตัวอย่างจากทีม ยังไม่ผ่าน validation

ห้ามเขียนว่า “ต้องเรียนคณะ X เท่านั้น” เว้นแต่มีข้อกำกับวิชาชีพรองรับ อาชีพดิจิทัล ธุรกิจ และครีเอทีฟมักมีหลายทางเข้า ขณะที่อาชีพควบคุมต้องอ้างสภาวิชาชีพและหลักสูตรรับรอง

## schema ขั้นต่ำ

`occupation_id`, `label_th`, `label_en`, `tasks`, `skills`, `knowledge`, `work_context`, `regulated`, `license_requirements`, `program_edges`, `source_ids`, `taxonomy_version`, `review_status`

ทุก edge ระหว่างอาชีพกับหลักสูตรต้องมีชนิดความสัมพันธ์ น้ำหนัก เหตุผล และแหล่งอ้างอิง ไม่ใช้ similarity ของ embeddings เพียงอย่างเดียว
