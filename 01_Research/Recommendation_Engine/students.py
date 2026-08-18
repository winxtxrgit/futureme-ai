#!/usr/bin/env python3
"""Three synthetic learners, built by answering the real 90-item bank.

These are not hand-written score vectors dropped into the engine. Each learner
is a rule for answering items, the rule is applied to the actual bank, and the
engine reads the answers exactly as it would read a real session. So the trace
that comes out is the trace a real learner would get.

The third learner exists to prove the system can decline. If every persona
produced a confident Top 5, the confidence machinery would be decoration.
"""
from __future__ import annotations

from engine import DIMENSIONS, Student, load_bank


def _answer(target: float, direction: str | None, jitter: int = 0) -> int:
    """Turn a desired 0..1 interest level into a raw Likert answer.

    Reverse-keyed items are answered on the *raw* scale, so expressing high
    interest on a reverse item means answering low. Getting this backwards is
    how a simulator ends up testing its own bug instead of the engine — it
    happened once already, and is written up in sim/README.md §1.
    """
    v = min(1.0, max(0.0, target))
    raw = (5 - 4 * v) if direction == "reverse" else (1 + 4 * v)
    return max(1, min(5, round(raw) + jitter))


def build(target: dict[str, float],
          efficacy: dict[str, float],
          jitter_every: int = 5,
          neutral_dims: set[str] | None = None) -> dict[str, int]:
    """Answer every scoring item and every self-efficacy item in the bank."""
    answers: dict[str, int] = {}
    neutral_dims = neutral_dims or set()
    n = 0

    for item in load_bank():
        d = item.get("dimension")
        if item.get("scoring") == "dimension" and d in DIMENSIONS:
            n += 1
            # a little variation so within-dimension consistency is realistic
            # rather than a perfect 1.0 that no human would produce
            jitter = 1 if (n % jitter_every == 0) else 0
            if d in neutral_dims:
                answers[item["id"]] = 3
            else:
                answers[item["id"]] = _answer(target[d], item.get("direction"), jitter)

        if item.get("probeType") == "self-efficacy" and d in DIMENSIONS:
            answers[item["id"]] = _answer(efficacy[d], item.get("direction"))

    return answers


# --- A · clear Social/Enterprising profile, Bangkok, tight budget -----------

STUDENT_A = Student(
    label="ก · ม.5 · กรุงเทพฯ · โปรไฟล์ชัด S–E",
    answers=build(
        target={"R": 0.15, "I": 0.55, "A": 0.35, "S": 0.90, "E": 0.80, "C": 0.40},
        efficacy={"R": 0.20, "I": 0.55, "A": 0.40, "S": 0.85, "E": 0.75, "C": 0.50},
    ),
    province_iso="TH-10",
    mobility="local_only",
    budget_band="tight",
    note="สื่อสารเก่ง ชอบทำงานกับคน งบจำกัด ไปกลับจากบ้านเท่านั้น",
)

# --- B · Realistic/Investigative, Chiang Mai, willing to move ---------------

STUDENT_B = Student(
    label="ข · ม.6 · เชียงใหม่ · โปรไฟล์ชัด R–I",
    answers=build(
        target={"R": 0.85, "I": 0.85, "A": 0.20, "S": 0.20, "E": 0.30, "C": 0.55},
        efficacy={"R": 0.80, "I": 0.75, "A": 0.25, "S": 0.30, "E": 0.35, "C": 0.60},
    ),
    province_iso="TH-50",
    mobility="can_move",
    budget_band="moderate",
    note="ชอบลงมือทำและหาคำตอบ ย้ายออกจากบ้านได้ถ้าจำเป็น",
)

# --- C · genuinely undecided ------------------------------------------------

STUDENT_C = Student(
    label="ค · ม.4 · แม่ฮ่องสอน · ยังไม่แน่ใจ",
    answers=build(
        # Four dimensions come back as "ไม่แน่ใจ". Two produce real answers, but
        # answers that sit close together — so there IS a signal, it is simply
        # not a signal that separates one field from another. This is the case
        # that matters: not the learner who says nothing, but the learner who
        # says just enough to look answerable.
        target={"R": 0.5, "I": 0.55, "A": 0.5, "S": 0.60, "E": 0.5, "C": 0.5},
        efficacy={"R": 0.4, "I": 0.5, "A": 0.5, "S": 0.5, "E": 0.4, "C": 0.5},
        jitter_every=2,
        neutral_dims={"R", "A", "E", "C"},
    ),
    province_iso="TH-58",
    mobility="unknown",
    budget_band="tight",
    note="ตอบ 'ไม่แน่ใจ' ใน 4 มิติ · อีก 2 มิติตอบจริงแต่คะแนนใกล้กันมาก",
)

ALL = [STUDENT_A, STUDENT_B, STUDENT_C]
