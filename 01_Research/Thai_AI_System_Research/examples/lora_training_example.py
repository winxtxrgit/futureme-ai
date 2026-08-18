"""
lora_training_example.py — โครงร่างการเทรน QLoRA สำหรับโมเดลภาษาไทย (Instruction Tuning)

⚠️ ข้อกำหนด:
  - ต้องมี NVIDIA GPU + CUDA (bitsandbytes 4-bit ใช้บน GPU)
  - ต้องติดตั้ง dependency ที่คอมเมนต์ไว้ใน requirements.txt (torch/transformers/peft/bitsandbytes/trl/datasets/accelerate)
  - ตัวอย่างนี้ใช้ dataset จิ๋วเพื่อ "สาธิต workflow" ไม่ใช่เพื่อได้โมเดลที่ดี
  - ตรวจ LICENSE ของโมเดลฐานและ dataset ก่อนใช้จริงเสมอ (ดู 02_ และ 11_)

แนวคิด QLoRA: โหลดโมเดลฐานแบบ 4-bit (NF4 + double quant) แล้วเทรน LoRA adapter ทับ
ดูรายละเอียดใน 07_LoRA_and_QLoRA.md

รัน (บนเครื่องที่มี GPU และติดตั้ง dependency แล้ว):
    python lora_training_example.py
"""
from __future__ import annotations

import os

# โมเดลฐานเล็กที่รองรับไทย/หลายภาษา (ตรวจ license ก่อนใช้เชิงพาณิชย์)
BASE_MODEL = os.getenv("BASE_MODEL", "Qwen/Qwen2.5-3B-Instruct")
OUTPUT_DIR = os.getenv("LORA_OUTPUT_DIR", "./lora-thai-adapter")

# dataset instruction ภาษาไทยตัวอย่าง (งานจริงควรมีหลักร้อย-พันตัวอย่างที่หลากหลาย)
SAMPLE_DATASET: list[dict[str, str]] = [
    {
        "instruction": "สรุปใจความสำคัญของข้อความต่อไปนี้เป็นภาษาราชการ",
        "input": "ประชุมแล้วตกลงกันว่าจะเลื่อนส่งงานไปอีกสองอาทิตย์เพราะข้อมูลยังไม่ครบ",
        "output": "ที่ประชุมมีมติให้ขยายระยะเวลาการส่งมอบงานออกไปอีก 2 สัปดาห์ เนื่องจากข้อมูลประกอบยังไม่ครบถ้วน",
    },
    {
        "instruction": "ตอบคำถามอย่างสุภาพและกระชับ",
        "input": "ขอเบิกค่าเดินทางต้องใช้เอกสารอะไรบ้าง",
        "output": "การเบิกค่าเดินทางต้องแนบใบเสร็จรับเงินที่จ่ายจริง พร้อมแบบฟอร์มขออนุมัติที่ผ่านการลงนามจากผู้มีอำนาจ",
    },
]


def format_example(ex: dict[str, str]) -> str:
    """จัด prompt template แบบ instruction (ปรับให้ตรง chat template ของโมเดลจริง)"""
    user = ex["instruction"]
    if ex.get("input"):
        user += "\n\n" + ex["input"]
    return f"<|user|>\n{user}\n<|assistant|>\n{ex['output']}"


def main() -> None:
    try:
        import torch
        from datasets import Dataset
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            BitsAndBytesConfig,
        )
        from trl import SFTConfig, SFTTrainer
    except ImportError as exc:
        print(
            "❌ ยังไม่ได้ติดตั้ง dependency สำหรับเทรน "
            f"({exc}).\n"
            "ถอดคอมเมนต์ส่วน training ใน requirements.txt แล้ว pip install "
            "(ต้องมี GPU + CUDA)"
        )
        raise SystemExit(1)

    if not torch.cuda.is_available():
        print("❌ ไม่พบ CUDA GPU — QLoRA 4-bit ต้องใช้ NVIDIA GPU (ดู 07_ และ 12_)")
        raise SystemExit(1)

    print(f"โมเดลฐาน: {BASE_MODEL}")

    # 1) config 4-bit NF4 + double quantization (หัวใจของ QLoRA)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=bnb_config,
        device_map="auto",
    )
    model = prepare_model_for_kbit_training(model)

    # 2) LoRA config (rank/alpha/dropout/target_modules — ดู 07_)
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()  # ยืนยันว่าเทรนแค่ส่วนน้อย

    # 3) เตรียมข้อมูล
    dataset = Dataset.from_list(
        [{"text": format_example(ex)} for ex in SAMPLE_DATASET]
    )

    # 4) เทรน SFT (paged optimizer ช่วยจัดการหน่วยความจำ)
    sft_config = SFTConfig(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        num_train_epochs=1,           # ตัวอย่าง — งานจริงปรับตาม validation
        learning_rate=2e-4,
        logging_steps=1,
        optim="paged_adamw_8bit",
        bf16=True,
        max_length=512,
        report_to="none",
    )
    trainer = SFTTrainer(
        model=model,
        args=sft_config,
        train_dataset=dataset,
        processing_class=tokenizer,
    )

    print("เริ่มเทรน (ตัวอย่างสาธิต)...")
    trainer.train()

    # 5) บันทึกเฉพาะ adapter (ไฟล์เล็กมาก ~MB)
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"✅ บันทึก LoRA adapter ที่ {OUTPUT_DIR}")
    print("ขั้นถัดไป: ประเมินเทียบ baseline ก่อนนำไปใช้ (ดู 10_ และ 14_ Phase 6)")


if __name__ == "__main__":
    main()
