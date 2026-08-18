# สรุปหมวด 6: โครงสร้างพื้นฐานและ Roadmap

AIS ยืนยัน Data Center ในไทย, บริการมากกว่า 100 รายการ และมาตรฐาน ISO 27001/27017/27018, CSA-STAR, dSURE Cloud 3 ดาว ส่วน Open API มีบริการยืนยันหมายเลข/OTP และป้องกัน fraud หลายชนิด

สิ่งที่ต้องไม่เหมารวม:

- การใช้ AIS Cloud ไม่ทำให้ระบบผ่าน PDPA โดยอัตโนมัติ
- ยังยืนยัน sandbox, ราคา และสิทธิ์ AIS Playground ไม่ได้
- Kubernetes/Qdrant/FastAPI/PostgreSQL เป็นตัวเลือกออกแบบของทีม
- Number Verify/OTP เป็น optional integration ไม่ใช่แกนคุณค่าของ FutureMe

Roadmap ควรสร้างจาก node/edge ที่มี evidence และปีข้อมูล แสดงหลายเส้นทางและย้อนกลับได้ ไม่ hard-code คะแนน TCAS ตัวอย่าง
