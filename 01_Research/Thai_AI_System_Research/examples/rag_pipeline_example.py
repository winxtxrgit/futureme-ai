"""
rag_pipeline_example.py — RAG ครบวงจร: คำถาม → ค้น → prompt → LLM → คำตอบ + citation

รวมทุกขั้นของ Query เฟส และบังคับให้โมเดล:
  (1) ตอบจาก context เท่านั้น
  (2) ใส่หมายเลขอ้างอิง [n]
  (3) ถ้าไม่มีข้อมูลให้ตอบ "ไม่พบข้อมูลในเอกสาร"

รัน (ต้อง ingest ก่อน; ตั้ง LLM_BACKEND ใน .env):
    python rag_pipeline_example.py "ใครมีอำนาจอนุมัติการเดินทางเกิน 3 วัน"

ถ้า LLM_BACKEND=none จะแสดง context/citation ที่ retrieve ได้ โดยไม่เรียกโมเดล
"""
from __future__ import annotations

import sys
from dataclasses import dataclass

from common import CONFIG, call_llm
from vector_search_example import RetrievedChunk, search_with_threshold, _format_citation

SYSTEM_PROMPT = (
    "คุณเป็นผู้ช่วยตอบคำถามจากเอกสารภาษาไทย ให้ตอบเป็นภาษาไทยเท่านั้น\n"
    "กฎที่ต้องปฏิบัติอย่างเคร่งครัด:\n"
    "1) ตอบโดยอ้างอิงจาก 'เอกสารอ้างอิง' ที่ให้มาเท่านั้น ห้ามใช้ความรู้ภายนอกหรือเดา\n"
    "2) แทรกหมายเลขอ้างอิง เช่น [1] [2] ท้ายข้อความที่นำมาจากเอกสารนั้น\n"
    "3) หากเอกสารอ้างอิงไม่มีข้อมูลเพียงพอ ให้ตอบว่า 'ไม่พบข้อมูลในเอกสาร' เท่านั้น\n"
    "4) ห้ามแต่งตัวเลข ชื่อ หรือข้อเท็จจริงที่ไม่ปรากฏในเอกสาร"
)


@dataclass
class RagAnswer:
    answer: str
    citations: list[str]
    used_chunks: list[RetrievedChunk]


def build_context(chunks: list[RetrievedChunk]) -> tuple[str, list[str]]:
    """ประกอบ context ที่มีหมายเลขกำกับ + รายการ citation ให้แสดงท้ายคำตอบ"""
    lines: list[str] = []
    citations: list[str] = []
    for i, c in enumerate(chunks, 1):
        cite = _format_citation(c.metadata)
        citations.append(f"[{i}] {cite}")
        lines.append(f"[{i}] (แหล่ง: {cite})\n{c.text}")
    return "\n\n".join(lines), citations


def answer_question(query: str, access_levels: list[str] | None = None) -> RagAnswer:
    """ฟังก์ชันหลักของ RAG: คืนคำตอบ + citation หรือ 'ไม่พบข้อมูล'"""
    chunks, found = search_with_threshold(query, access_levels=access_levels)

    if not found:
        return RagAnswer(
            answer="ไม่พบข้อมูลในเอกสาร",
            citations=[],
            used_chunks=[],
        )

    context, citations = build_context(chunks)
    user_prompt = (
        f"เอกสารอ้างอิง:\n{context}\n\n"
        f"คำถาม: {query}\n\n"
        f"คำตอบ (ภาษาไทย พร้อมหมายเลขอ้างอิง):"
    )

    try:
        answer = call_llm(SYSTEM_PROMPT, user_prompt)
    except RuntimeError as exc:
        # ถ้าเรียก LLM ไม่ได้ ยังคืน context ให้ผู้ใช้เห็น (ไม่ให้ระบบล่มเงียบ)
        answer = f"[เรียกโมเดลไม่สำเร็จ: {exc}]\n\nบริบทที่ค้นได้:\n{context}"

    return RagAnswer(answer=answer, citations=citations, used_chunks=chunks)


def main() -> None:
    query = sys.argv[1] if len(sys.argv) > 1 else "ใครมีอำนาจอนุมัติการเดินทางเกิน 3 วัน"
    print(f"❓ คำถาม: {query}")
    print(f"⚙️  LLM backend: {CONFIG.llm_backend}\n")

    try:
        result = answer_question(query)
    except (ValueError, RuntimeError) as exc:
        print(f"❌ {exc}")
        raise SystemExit(1)

    print("💬 คำตอบ:")
    print(result.answer)
    print()
    if result.citations:
        print("📚 แหล่งอ้างอิง:")
        for c in result.citations:
            print(f"   {c}")
    else:
        print("(ไม่มีแหล่งอ้างอิง — ระบบไม่พบข้อมูลที่เกี่ยวข้อง)")


if __name__ == "__main__":
    main()
