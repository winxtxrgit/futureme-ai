# AIS Cloud และ AIS Open API: ข้อเท็จจริงกับแบบออกแบบ

> สถานะ: verified เฉพาะคุณสมบัติที่หน้า AIS ระบุ; architecture เป็น design proposal  
> ตรวจล่าสุด: 24 กรกฎาคม 2026

## AIS Cloud powered by OCI

หน้าทางการระบุ:

- ให้บริการบน Data Center ในประเทศไทย
- มีมากกว่า 100 services
- มี local disaster recovery และ local support
- รองรับ ISO 27001, ISO 27017, ISO 27018 และ CSA-STAR
- ได้ dSURE Cloud 3 ดาว
- ใช้ end-to-end encryption และ audited access controls ตามคำอธิบายบริการ

แหล่ง: [AIS Cloud powered by OCI](https://www.ais.th/business/enterprise/technology-and-solution/cloud-and-data-center/ais-cloud/about)

อย่าแปลงข้อความนี้เป็น “ข้อมูลอยู่ไทย 100% ทุกบริการ”, “PDPA compliant โดยอัตโนมัติ”, “SOC 2”, “multi-region availability” หรือสเปกไฟ/ความเย็น หากไม่มีเอกสารบริการที่ทำสัญญารองรับ การปฏิบัติตาม PDPA ขึ้นกับการออกแบบระบบ บทบาทผู้ควบคุม/ผู้ประมวลผล วัตถุประสงค์ และสัญญา ไม่ได้เกิดจากเลือก cloud เพียงอย่างเดียว

## AIS Open API

หน้าทางการแสดง API เช่น:

- Number Verify
- SIM Swap
- Roaming Status
- OTP
- Device Location
- Device Swap
- Mule Account Check

แหล่ง: [AIS Open API](https://www.ais.th/business/enterprise/technology-and-solution/communication/ais-open-api) และ [ประกาศบริการ CAMARA/GSMA](https://www.ais.th/business/news-and-activity/announcements/ais-introduces-open-api)

สำหรับ FutureMe, OTP/Number Verify อาจเป็นตัวเลือกการยืนยันตัวตน ส่วน SIM Swap/Device Location ไม่ใช่ฟังก์ชันหลักของการแนะแนวและไม่ควรดึงข้อมูลตำแหน่งของผู้เยาว์หากไม่มีความจำเป็นชัดเจน

## สถาปัตยกรรม MVP ที่แนะนำ

```text
Web client
  └─ API service
       ├─ rule/recommendation service
       ├─ RAG retrieval with evidence filters
       ├─ relational database
       └─ model API
```

ใช้ managed services หรือ containers ได้ตามข้อกำหนดการแข่งขัน/งบประมาณ อย่าล็อกว่า Kubernetes, FastAPI, Qdrant หรือ PostgreSQL เป็นคุณสมบัติของ AIS โดยตรง สิ่งเหล่านี้คือการตัดสินใจของทีม

## ข้อมูลเด็กที่ต้องป้องกัน

- เก็บข้อมูลเท่าที่จำเป็นและแยก identity ออกจาก learner profile
- มี consent/assent ตามอายุและบริบท
- กำหนด retention/deletion และ export/correction
- เข้ารหัสระหว่างส่งและขณะจัดเก็บ
- จำกัดสิทธิ์ตามบทบาทและมี audit log
- ไม่ใช้บทสนทนาฝึกโมเดลโดยปริยาย
- มี human review และช่องทางโต้แย้งคำแนะนำ
