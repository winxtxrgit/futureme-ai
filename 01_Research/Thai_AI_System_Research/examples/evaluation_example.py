"""
evaluation_example.py — รันชุดคำถามทดสอบภาษาไทย แล้วบันทึกผลเพื่อเทียบเวอร์ชัน

ตัวอย่างนี้เน้น "การประเมินแบบเบา" ที่รันได้โดยไม่ต้องมีบริการภายนอก:
  - retrieval: วัดว่าดึงเอกสารที่ 'ถูกต้อง' (expected_doc_id) ติด top-k ไหม → Recall@k อย่างง่าย
  - refusal: คำถามที่ควรตอบ "ไม่พบข้อมูล" ระบบทำถูกไหม
  - บันทึกคำตอบ + แหล่งอ้างอิง + เวลา (latency) ลงไฟล์ JSON

สำหรับ metric ขั้นสูง (faithfulness/answer relevancy) ให้ใช้ RAGAS — ดู 10_Model_Evaluation.md

รัน (ต้อง ingest ก่อน):
    python evaluation_example.py
ผลลัพธ์: eval_results.json
"""
from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass, field

from common import CONFIG
from rag_pipeline_example import answer_question
from vector_search_example import search_with_threshold


@dataclass
class TestCase:
    question: str
    kind: str  # "factual" | "refusal" | "multi_hop" | "code_switch"
    expected_doc_id: str | None = None  # เอกสารที่ควรถูกดึง (สำหรับ retrieval)
    should_refuse: bool = False  # True = ควรตอบ "ไม่พบข้อมูล"


# ชุดทดสอบตัวอย่าง (ดูชุดเต็ม 20+ แบบใน 10_Model_Evaluation.md)
TEST_CASES: list[TestCase] = [
    TestCase("ค่าเบี้ยเลี้ยงเดินทางในประเทศต่อวันเท่าไหร่", "factual", "reg_travel_2567"),
    TestCase("ค่าที่พักเบิกได้คืนละไม่เกินเท่าไหร่", "factual", "reg_travel_2567"),
    TestCase("ใครมีอำนาจอนุมัติการเดินทางเกิน 3 วัน", "factual", "reg_travel_2567"),
    TestCase("ทุนวิจัยประเภท ก วงเงินไม่เกินเท่าไหร่", "factual", "research_grant_2567"),
    TestCase("ขอ requirement ของการ submit proposal ทุนวิจัยหน่อย", "code_switch", "research_grant_2567"),
    # คำถามที่ไม่มีคำตอบในเอกสาร → ควรปฏิเสธ
    TestCase("นโยบายทำงานจากบ้านกี่วันต่อสัปดาห์", "refusal", None, should_refuse=True),
    TestCase("อัตราแลกเปลี่ยนดอลลาร์วันนี้เท่าไหร่", "refusal", None, should_refuse=True),
]


@dataclass
class CaseResult:
    question: str
    kind: str
    retrieval_hit: bool          # ดึง expected_doc_id ติด top-k ไหม
    refusal_correct: bool | None # สำหรับ refusal case
    answer: str
    citations: list[str] = field(default_factory=list)
    latency_sec: float = 0.0


def evaluate_case(tc: TestCase) -> CaseResult:
    start = time.perf_counter()

    # 1) retrieval check
    chunks, found = search_with_threshold(tc.question)
    retrieved_ids = {c.metadata.get("doc_id") for c in chunks}
    retrieval_hit = (
        tc.expected_doc_id in retrieved_ids if tc.expected_doc_id else not found
    )

    # 2) end-to-end answer
    result = answer_question(tc.question)
    latency = time.perf_counter() - start

    # 3) refusal check
    refusal_correct: bool | None = None
    if tc.should_refuse:
        refusal_correct = "ไม่พบข้อมูล" in result.answer

    return CaseResult(
        question=tc.question,
        kind=tc.kind,
        retrieval_hit=retrieval_hit,
        refusal_correct=refusal_correct,
        answer=result.answer,
        citations=result.citations,
        latency_sec=round(latency, 3),
    )


def summarize(results: list[CaseResult]) -> dict[str, float]:
    retrieval_cases = [r for r in results if r.kind != "refusal"]
    refusal_cases = [r for r in results if r.refusal_correct is not None]

    recall = (
        sum(r.retrieval_hit for r in retrieval_cases) / len(retrieval_cases)
        if retrieval_cases else 0.0
    )
    refusal_acc = (
        sum(bool(r.refusal_correct) for r in refusal_cases) / len(refusal_cases)
        if refusal_cases else 0.0
    )
    avg_latency = sum(r.latency_sec for r in results) / len(results) if results else 0.0
    return {
        "retrieval_recall_at_k": round(recall, 3),
        "refusal_accuracy": round(refusal_acc, 3),
        "avg_latency_sec": round(avg_latency, 3),
        "num_cases": len(results),
    }


def main() -> None:
    print(f"รันชุดทดสอบ {len(TEST_CASES)} ข้อ (top_k={CONFIG.top_k}, backend={CONFIG.llm_backend})\n")
    results: list[CaseResult] = []
    try:
        for tc in TEST_CASES:
            r = evaluate_case(tc)
            results.append(r)
            mark = "✅" if r.retrieval_hit else "❌"
            extra = "" if r.refusal_correct is None else f" | refusal={'✅' if r.refusal_correct else '❌'}"
            print(f"{mark} [{r.kind}] {r.question}  ({r.latency_sec}s){extra}")
    except (ValueError, RuntimeError) as exc:
        print(f"❌ การประเมินหยุด: {exc}")
        raise SystemExit(1)

    summary = summarize(results)
    print("\n📊 สรุปผล:")
    for k, v in summary.items():
        print(f"   {k}: {v}")

    out = {"summary": summary, "cases": [asdict(r) for r in results]}
    with open("eval_results.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("\n💾 บันทึกผลละเอียดที่ eval_results.json")


if __name__ == "__main__":
    main()
