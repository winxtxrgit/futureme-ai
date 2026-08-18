"""
document_ingestion_example.py — นำเอกสารภาษาไทยเข้าสู่ระบบ (Indexing เฟส)

Workflow: ข้อความ → chunk + overlap (เคารพประโยคไทย) → metadata → embedding → Chroma

รัน:
    python document_ingestion_example.py
ผลลัพธ์: สร้าง/อัปเดต Chroma collection ตามค่าใน .env

หมายเหตุ: ใช้ข้อความไทยตัวอย่างฝังในไฟล์ เพื่อให้รันได้ทันทีโดยไม่ต้องมีไฟล์ภายนอก
สำหรับเอกสารจริง ให้เขียน loader (pypdf/python-docx/OCR) แล้วส่งเข้า `ingest_documents`
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from common import CONFIG, embed_texts, get_collection


@dataclass
class SourceDoc:
    """เอกสารต้นฉบับ 1 ชิ้น พร้อม metadata สำหรับทำ citation"""
    doc_id: str
    source_file: str
    title: str
    text: str
    page: int = 1
    section: str = ""
    doc_type: str = "เอกสาร"
    effective_date: str = ""
    access_level: str = "internal"
    metadata_extra: dict[str, Any] = field(default_factory=dict)


# ตัวอย่างเอกสารภาษาไทย (จำลองระเบียบองค์กร) — แทนที่ด้วยเอกสารจริงของคุณ
SAMPLE_DOCS: list[SourceDoc] = [
    SourceDoc(
        doc_id="reg_travel_2567",
        source_file="ระเบียบการเบิกจ่ายค่าเดินทาง_2567.pdf",
        title="ระเบียบการเบิกจ่ายค่าใช้จ่ายในการเดินทางไปปฏิบัติงาน",
        section="หมวด 3 ค่าเบี้ยเลี้ยง",
        page=12,
        doc_type="ระเบียบ",
        effective_date="2024-06-01",
        text=(
            "ค่าเบี้ยเลี้ยงเดินทางไปปฏิบัติงานภายในประเทศ ให้เบิกได้ในอัตราวันละ 240 บาท "
            "ต่อคน โดยนับตามจำนวนวันที่ปฏิบัติงานจริง กรณีเดินทางไม่ถึงหนึ่งวันแต่เกิน "
            "12 ชั่วโมง ให้นับเป็นหนึ่งวัน สำหรับค่าที่พักให้เบิกตามที่จ่ายจริงไม่เกินคืนละ "
            "1,200 บาท ทั้งนี้ต้องมีใบเสร็จรับเงินประกอบการเบิกจ่ายทุกครั้ง"
        ),
    ),
    SourceDoc(
        doc_id="reg_travel_2567",
        source_file="ระเบียบการเบิกจ่ายค่าเดินทาง_2567.pdf",
        title="ระเบียบการเบิกจ่ายค่าใช้จ่ายในการเดินทางไปปฏิบัติงาน",
        section="หมวด 4 การอนุมัติ",
        page=15,
        doc_type="ระเบียบ",
        effective_date="2024-06-01",
        text=(
            "การอนุมัติการเดินทางไปปฏิบัติงานที่มีระยะเวลาไม่เกิน 3 วัน ให้หัวหน้าส่วนงาน "
            "เป็นผู้มีอำนาจอนุมัติ หากเกิน 3 วันหรือเป็นการเดินทางไปต่างประเทศ ต้องได้รับ "
            "การอนุมัติจากผู้อำนวยการหรือผู้ที่ได้รับมอบหมายก่อนออกเดินทางทุกกรณี"
        ),
    ),
    SourceDoc(
        doc_id="research_grant_2567",
        source_file="ประกาศทุนวิจัย_2567.pdf",
        title="ประกาศหลักเกณฑ์การให้ทุนสนับสนุนงานวิจัย",
        section="ข้อ 5 ประเภททุน",
        page=3,
        doc_type="ประกาศ",
        effective_date="2024-03-01",
        text=(
            "ทุนวิจัยแบ่งออกเป็นสองประเภท ได้แก่ ทุนประเภท ก สำหรับนักวิจัยรุ่นใหม่ วงเงิน "
            "ไม่เกิน 150,000 บาทต่อโครงการ ระยะเวลาไม่เกิน 1 ปี และทุนประเภท ข สำหรับ "
            "นักวิจัยทั่วไป วงเงินไม่เกิน 500,000 บาทต่อโครงการ ระยะเวลาไม่เกิน 2 ปี "
            "ผู้ขอรับทุนต้องส่งข้อเสนอโครงการ (proposal) ตามแบบฟอร์มที่กำหนด"
        ),
    ),
]


def split_thai_text(text: str, chunk_size: int = 400, overlap: int = 60) -> list[str]:
    """
    แบ่งข้อความไทยเป็น chunk โดยพยายามตัดตามขอบเขตประโยค (ไม่ตัดกลางคำ)
    ใช้ pythainlp ถ้ามี ไม่งั้น fallback เป็นตัดตามจำนวนอักขระ

    chunk_size/overlap นับเป็น "จำนวนอักขระ" เพื่อความง่ายในตัวอย่าง
    (งานจริงควรนับเป็น token ของ tokenizer ที่ใช้ — ดู 01_Thai_Language_AI_Fundamentals.md)
    """
    text = text.strip()
    if len(text) <= chunk_size:
        return [text] if text else []

    try:
        from pythainlp.tokenize import sent_tokenize

        sentences = sent_tokenize(text, engine="crfcut")
    except Exception:
        sentences = [text]  # fallback: ก้อนเดียว แล้วให้ตัวตัดอักขระด้านล่างจัดการ

    chunks: list[str] = []
    current = ""
    for sent in sentences:
        if len(current) + len(sent) <= chunk_size:
            current += sent
        else:
            if current:
                chunks.append(current.strip())
            # เริ่ม chunk ใหม่ โดยเก็บ overlap ท้ายของ chunk ก่อนหน้า
            tail = current[-overlap:] if overlap and current else ""
            current = tail + sent
    if current.strip():
        chunks.append(current.strip())

    # ถ้าประโยคเดียวยาวเกิน chunk_size ให้ตัดตามอักขระเป็น fallback
    final: list[str] = []
    for c in chunks:
        if len(c) <= chunk_size * 1.5:
            final.append(c)
        else:
            step = chunk_size - overlap
            for i in range(0, len(c), step):
                final.append(c[i : i + chunk_size].strip())
    return [c for c in final if c]


def ingest_documents(docs: list[SourceDoc]) -> int:
    """แปลงเอกสารเป็น chunk → embed → บันทึกลง Chroma พร้อม metadata. คืนจำนวน chunk ที่เพิ่ม"""
    collection = get_collection()

    ids: list[str] = []
    texts: list[str] = []
    metadatas: list[dict[str, Any]] = []

    for doc in docs:
        chunks = split_thai_text(doc.text)
        for idx, chunk in enumerate(chunks):
            chunk_id = f"{doc.doc_id}__p{doc.page}__c{idx:03d}"
            ids.append(chunk_id)
            texts.append(chunk)
            metadatas.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": doc.doc_id,
                    "source_file": doc.source_file,
                    "title": doc.title,
                    "section": doc.section,
                    "page": doc.page,
                    "doc_type": doc.doc_type,
                    "effective_date": doc.effective_date,
                    "access_level": doc.access_level,
                    **doc.metadata_extra,
                }
            )

    if not texts:
        print("⚠️ ไม่มีข้อความให้ ingest")
        return 0

    print(f"กำลังสร้าง embedding สำหรับ {len(texts)} chunk ...")
    vectors = embed_texts(texts, is_query=False)

    # upsert: ถ้ามี id เดิมจะเขียนทับ (ทำ incremental re-index ได้)
    collection.upsert(ids=ids, embeddings=vectors, documents=texts, metadatas=metadatas)
    print(f"✅ บันทึก {len(texts)} chunk ลง collection '{CONFIG.chroma_collection}' แล้ว")
    return len(texts)


def main() -> None:
    print(f"Embedding model : {CONFIG.embedding_model}")
    print(f"Chroma path     : {CONFIG.chroma_path}")
    try:
        n = ingest_documents(SAMPLE_DOCS)
        print(f"รวม chunk ทั้งหมดใน collection ตอนนี้: {get_collection().count()}")
        print(f"เพิ่มรอบนี้: {n} chunk")
    except RuntimeError as exc:
        print(f"❌ Ingestion ล้มเหลว: {exc}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
