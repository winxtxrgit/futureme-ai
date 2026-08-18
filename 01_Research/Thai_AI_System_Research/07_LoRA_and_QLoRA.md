# 07 — LoRA และ QLoRA

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026
> อ้างอิงหลัก: LoRA (Hu et al., 2021, arXiv 2106.09685), QLoRA (Dettmers et al., 2023, arXiv 2305.14314), Hugging Face PEFT & bitsandbytes docs (ดู `16_...`)

## 1. Fine-tuning คืออะไร (อธิบายง่าย)

โมเดลภาษาผ่านการเทรนมาแล้ว (pretrained) จนมี "น้ำหนัก" (weights) นับพันล้านตัว **Fine-tuning** = เทรนต่อด้วยข้อมูลเฉพาะของเรา เพื่อปรับพฤติกรรม/สไตล์/ความเชี่ยวชาญเฉพาะโดเมน

**Full Fine-tuning** = ปรับน้ำหนักทุกตัว → คุณภาพดีแต่ **แพงมาก** (ต้องมี VRAM มหาศาล เก็บ optimizer state หลายเท่าของขนาดโมเดล)

## 2. Parameter-Efficient Fine-Tuning (PEFT) และ LoRA

**PEFT** = เทรนแค่ "พารามิเตอร์ส่วนน้อย" แทนที่จะปรับทั้งหมด → ประหยัดทรัพยากรมาก

**LoRA (Low-Rank Adaptation)** — แนวคิด: แทนที่จะแก้เมทริกซ์น้ำหนัก `W` ตรง ๆ เราเพิ่ม "adapter" เล็ก ๆ เป็นเมทริกซ์ low-rank สองตัว `A` และ `B` โดยผลลัพธ์คือ `W + B·A` เทรนเฉพาะ `A, B` (พารามิเตอร์น้อยกว่าเดิมหลายร้อยเท่า) ส่วน `W` เดิม **แช่แข็ง (frozen)**

- **Adapter** = โมดูลเล็กที่เสียบเข้าโมเดลเพื่อปรับพฤติกรรม
- **Low-rank matrices** = เมทริกซ์ `A` (r × k) และ `B` (d × r) ที่ rank `r` เล็ก ทำให้พารามิเตอร์น้อย

**ไฮเปอร์พารามิเตอร์สำคัญของ LoRA**
| พารามิเตอร์ | ความหมาย | ค่าที่พบบ่อย (ค่าประมาณ) |
|-------------|----------|--------------------------|
| **rank (r)** | ขนาด adapter (ยิ่งสูงยิ่งจุความรู้ได้มาก แต่พารามิเตอร์เยอะ) | 8, 16, 32, 64 |
| **alpha** | สเกลของ adapter (มักตั้ง = r หรือ 2r) | 16, 32 |
| **dropout** | กัน overfit | 0.05–0.1 |
| **target_modules** | เลเยอร์ที่ใส่ adapter (เช่น `q_proj,k_proj,v_proj,o_proj`) | attention (+MLP) |

## 3. Quantization และ QLoRA

**Quantization** = ลดความละเอียดของตัวเลขน้ำหนัก (เช่น 16-bit → 8-bit → 4-bit) เพื่อประหยัดหน่วยความจำ แลกกับความแม่นเล็กน้อย
- **8-bit / 4-bit** = จำนวนบิตต่อน้ำหนัก
- **NF4 (NormalFloat4)** = ชนิดข้อมูล 4-bit ที่ออกแบบให้เหมาะกับการกระจายค่าน้ำหนักแบบ normal (quantile quantization) — ให้ผลดีกว่า 4-bit แบบธรรมดา
- **Double Quantization** = quantize "ค่าคงที่ของการ quantize" อีกชั้น ประหยัดเพิ่มเฉลี่ย ~0.37 bit/พารามิเตอร์

**QLoRA** = โหลดโมเดลฐานแบบ **4-bit (NF4) + double quant** (แช่แข็ง) แล้วเทรน **LoRA adapter** ทับ + ใช้ **paged optimizers** จัดการหน่วยความจำ → fine-tune โมเดลใหญ่บนการ์ดเล็กได้

> ข้อเท็จจริง (Dettmers et al., 2023): QLoRA 4-bit NF4 ให้ผลใกล้เคียง 16-bit full fine-tuning บน benchmark วิชาการ ด้วยหน่วยความจำที่น้อยกว่ามาก

**การตั้งค่าทั่วไป (bitsandbytes `BitsAndBytesConfig`):** `load_in_4bit=True`, `bnb_4bit_quant_type="nf4"`, `bnb_4bit_use_double_quant=True`, `bnb_4bit_compute_dtype=torch.bfloat16`

## 4. Dataset สำหรับ fine-tune

- **Training dataset** — ตัวอย่างที่สอนโมเดล (input→output)
- **Instruction dataset** — รูปแบบ {instruction, (input), output} เช่นข้อมูลไทย WangchanThaiInstruct หรือ dataset ที่ทีมสร้างเอง (ตรวจ **license** ก่อนใช้!)
- **Validation set** — ชุดแยกไว้วัดว่า generalize ไหม (ป้องกันหลอกตัวเอง)

**ปัญหาที่ต้องระวัง**
- **Overfitting** — โมเดลจำ training จนตอบข้อมูลใหม่แย่ → ใช้ validation, early stopping, dropout, data พอเพียง/หลากหลาย
- **Catastrophic Forgetting** — เทรนเฉพาะทางจนลืมความสามารถเดิม → LoRA ช่วยลด (weights เดิม frozen), คุมจำนวน epoch, ผสมข้อมูลทั่วไปบ้าง

## 5. Adapter Merge และ Inference
- **Merge** — รวม adapter เข้ากับน้ำหนักฐานเป็นโมเดลเดียว (deploy ง่าย, ไม่มี overhead) — แต่ถ้าฐานเป็น 4-bit การ merge มีข้อควรระวัง (มัก merge บน FP16)
- **ไม่ merge** — โหลดฐาน + adapter ตอน runtime (สลับ adapter หลายตัวได้ ยืดหยุ่นกว่า)
- **Inference** — ใช้ผ่าน `transformers`+`peft` หรือ export เป็น GGUF/vLLM

## 6. เปรียบเทียบวิธีปรับโมเดล/ให้ความรู้

| วิธี | ปรับอะไร | ต้นทุน | ให้ความรู้ใหม่ | ปรับสไตล์ | เหมาะกับกรณีใด | ข้อจำกัด |
|------|----------|--------|----------------|-----------|----------------|----------|
| **Prompt Engineering** | prompt | ต่ำสุด | ชั่วคราวใน prompt | บ้าง | เริ่มเร็ว, งานทั่วไป | คุมความรู้ไม่ได้ |
| **RAG** | ความรู้ภายนอก | ปานกลาง | ✅ อัปเดตได้ทันที | น้อย | ถาม-ตอบเอกสารที่เปลี่ยน | คุณภาพขึ้นกับ retrieval |
| **LoRA** | adapter (FP16 base) | ปานกลาง | ⚠️ จำกัด | ✅ | สไตล์/format/โดเมน | ใช้ VRAM มากกว่า QLoRA |
| **QLoRA** | adapter (4-bit base) | ต่ำ (การ์ดเล็กได้) | ⚠️ จำกัด | ✅ | fine-tune บนทรัพยากรจำกัด | ช้ากว่า LoRA เล็กน้อย, ซับซ้อนกว่า |
| **Full Fine-tuning** | น้ำหนักทุกตัว | สูงมาก | ⚠️ จำกัด (เสี่ยง forget) | ✅✅ | โดเมนใหญ่, มีทรัพยากร | แพง, ต้อง data เยอะ |

## 7. ปัญหาใดใช้ RAG ปัญหาใดใช้ LoRA/QLoRA

**ใช้ RAG เมื่อ:**
- ต้องการให้ตอบจาก **ข้อเท็จจริงเฉพาะทางที่เปลี่ยนบ่อย** (ระเบียบ, งานวิจัย, ราคา)
- ต้องการ **citation / ตรวจสอบย้อนกลับ**
- เอกสารเยอะและอัปเดตเรื่อย ๆ

**ใช้ LoRA/QLoRA เมื่อ:**
- ต้องการ **รูปแบบ/สไตล์เฉพาะ** (เช่น ตอบเป็นภาษาราชการ, ตอบตาม template, โทนแบรนด์)
- โดเมนมี **ศัพท์เฉพาะ/รูปประโยคที่โมเดลฐานทำได้ไม่ดี** แม้ให้ context แล้ว
- ต้องการให้โมเดล **เชื่อฟังคำสั่ง RAG ได้ดีขึ้น** (เช่น เทรนให้ตอบ "ไม่พบข้อมูล" อย่างสม่ำเสมอ)

> **ข้อเสนอแนะ:** ในงานถาม-ตอบเอกสารไทยส่วนใหญ่ **RAG มาก่อนเสมอ** ใช้ LoRA/QLoRA เป็นตัวเสริมสไตล์/พฤติกรรม ไม่ใช่ตัวยัดข้อเท็จจริง วิธีที่ได้ผลบ่อยคือ **RAG + LoRA เล็ก ๆ** ร่วมกัน

## 8. ประมาณการทรัพยากร (ค่าประมาณ — ขึ้นกับโมเดล/seq len/batch/optimizer)

| งาน | โมเดล | VRAM โดยประมาณ | หมายเหตุ |
|-----|-------|----------------|----------|
| QLoRA (4-bit) | 7–8B | ~10–16 GB | ทำได้บน Colab T4/L4, RTX 3090/4090 |
| QLoRA (4-bit) | 3B | ~6–8 GB | GPU 8–12GB |
| LoRA (FP16 base) | 7–8B | ~20–28 GB | ต้อง A10/3090/4090+ |
| Full FT | 7B | 100+ GB (หลาย GPU) | ไม่แนะนำสำหรับทีมเล็ก |

- **RAM ระบบ:** ≥ 16–32 GB (เตรียม data/paged optimizer)
- **Storage:** โมเดลฐาน ~ขนาดไฟล์ (7B FP16 ~14GB, 4-bit ~4–5GB) + dataset + checkpoints; **adapter LoRA เล็กมาก** (มัก ~10–200 MB) ทำให้เก็บ/แจกจ่ายง่าย

> ⚠️ ทั้งหมดเป็น **ค่าประมาณ** — วัดจริงด้วย config ของคุณ (seq length, batch size, gradient checkpointing มีผลมาก)

**เครื่องมือแนะนำ:** Hugging Face `transformers` + `peft` + `bitsandbytes` + `trl` (SFTTrainer); ทางเลือกเร่งความเร็ว/ประหยัด VRAM เช่น **Unsloth** (ตรวจสอบความเข้ากันได้/เวอร์ชัน)

> ดูโค้ดโครงร่างใน `examples/lora_training_example.py`
> อ่านต่อ: `08_LangChain_and_Alternatives.md`
