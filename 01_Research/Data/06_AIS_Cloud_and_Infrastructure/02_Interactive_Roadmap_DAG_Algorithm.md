# แบบจำลอง Interactive Roadmap

> สถานะ: design proposal  
> ตรวจล่าสุด: 24 กรกฎาคม 2026  
> [roadmap.sh](https://roadmap.sh/) ใช้เป็นแรงบันดาลใจด้าน UI ไม่ใช่แหล่งหลักสูตรหรือเกณฑ์ TCAS

MVP ใช้ตาราง node/edge ใน relational database ก่อน ไม่จำเป็นต้องใช้ graph database หรือบังคับทุกเส้นทางเป็น DAG เพราะผู้เรียนอาจย้อนกลับ ทดลองเส้นทางใหม่ หรือสะสมทักษะวนซ้ำ

## node

- current state
- exploration activity
- skill milestone
- program/admission milestone
- portfolio evidence
- occupation trial

## edge

```json
{
  "from_id": "skill:python_basic",
  "to_id": "activity:data_project",
  "relation": "helpful_preparation",
  "required": false,
  "conditions": [],
  "evidence_ids": ["src_onet_x", "src_program_y_2570"]
}
```

## กติกา

- edge ที่เป็น `required` ต้องมีแหล่งกฎ/เกณฑ์ตรงและวันหมดอายุ
- skill suggestion ใช้ `helpful_preparation` ไม่เขียนเป็น prerequisite โดยไม่มีหลักฐาน
- TCAS score ห้าม hard-code จากตัวอย่าง ต้องอ้างหลักสูตรและปี
- roadmap ต้องมีหลาย route, จุดลองทำจริง, ทางย้อนกลับ และสถานะ “ข้อมูลไม่พอ”
- แสดงเหตุผลและ evidence ของทุก milestone สำคัญ

Topological sort ใช้ได้เฉพาะส่วนที่เป็น prerequisite จริง ส่วน UI ทั้งแผนสามารถเป็น directed graph ที่มี revision loops ได้
