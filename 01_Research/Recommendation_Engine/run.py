#!/usr/bin/env python3
"""Print the full derivation for each synthetic learner.

Everything printed here is recomputed from the item bank and the programme
index on every run. Nothing is transcribed from a document, so the document
cannot quietly go out of date.

    python3 run.py            all three learners
    python3 run.py A          one learner
"""
from __future__ import annotations

import sys

from engine import (CONTEXT_MAX, CORE_GATE, DIFFERENTIATION_GATE, DIMENSIONS,
                    PARAMETERS, W_EFFICACY,
                    W_INTEREST, recommend)
from students import ALL

QUADRANT_TH = {
    "golden-fit": "ชอบ + ถนัด",
    "growth-area": "ชอบ + ยังไม่ถนัด",
    "burnout-risk": "ถนัด + ไม่ชอบ · ระวัง",
    "unfavourable": "ยังไม่เข้ากัน",
    "unknown-efficacy": "ยังไม่รู้ความถนัด",
}


def bar(v: float, width: int = 22) -> str:
    n = int(round(v * width))
    return "█" * n + "·" * (width - n)


def show(result) -> None:
    s = result["student"]
    print("=" * 78)
    print(f"ผู้เรียน {s.label}")
    print(f"  {s.note}")
    print(f"  จังหวัด {s.province_iso} · การเดินทาง {s.mobility} · งบ {s.budget_band}")
    print()

    print("ขั้น 1-3 · คำตอบ → คะแนนมิติ → หดตามความเชื่อถือได้ (Kelley 1947)")
    print(f"  {'มิติ':<5}{'ถาม':>5}{'ให้ข้อมูล':>10}{'ดิบ':>7}{'cover':>7}{'consist':>9}"
          f"{'conf':>7}{'หลังหด':>9}   โปรไฟล์ที่ใช้จริง")
    for d in DIMENSIONS:
        x = result["dimensions"][d]
        print(f"  {d:<5}{x.n_items:>5}{x.n_informative:>10}{x.raw_mean:>7.2f}"
              f"{x.coverage:>7.2f}{x.consistency:>9.2f}{x.confidence:>7.2f}"
              f"{x.shrunk:>9.2f}   {bar(x.shrunk)}")

    eff = result["efficacy"]
    print()
    print(f"      ถามไป {result['answers_asked']} ข้อ · ให้ข้อมูลจริง "
          f"{result['answers_informative']} ข้อ (ตอบ 3 ไม่นับเป็นหลักฐาน)")
    print("      self-efficacy (SCCT · แกนที่สอง ไม่แตะคะแนนความสนใจ): " +
          "  ".join(f"{d}={eff[d]:.2f}" if eff[d] is not None else f"{d}=—" for d in DIMENSIONS))
    print(f"      ความมั่นใจรวม {result['overall_confidence']:.2f} · "
          f"differentiation {result['differentiation']:.2f} · "
          f"มิติที่อ่อนที่สุด {result['weakest_dimension']}")
    print()

    if not result["confident_enough"]:
        why = {
            "LOW_CONFIDENCE": "ความมั่นใจรวมต่ำกว่า 0.50 — ข้อที่ให้ข้อมูลยังน้อยเกินไป",
            "UNDIFFERENTIATED_PROFILE":
                f"differentiation {result['differentiation']:.2f} < "
                f"{DIFFERENTIATION_GATE:.2f} — ทุกมิติสูสีกันหมด "
                "(Holland 1997) โปรไฟล์แบนไม่ได้แปลว่าเข้าได้ทุกสาย แต่แปลว่ายังไม่รู้",
        }
        print("  ⚠ ระบบไม่จัดอันดับให้")
        for b in result["blockers"]:
            print(f"    · {why[b]}")
        print("    การกระทำที่ถูกต้องคือถามต่อด้วยข้อประสบการณ์และข้อบังคับเลือก "
              "ไม่ใช่เดาให้")
        print(f"    (ถ้าปล่อยผ่าน จะมีหลักสูตรผ่านเกณฑ์ CoreFit ≥ {CORE_GATE:.0f} "
              f"ถึง {result['candidates']} หลักสูตร ซึ่งดูน่าเชื่อถือทั้งที่ไม่มีหลักฐาน)")
        print()
        return

    print(f"ขั้น 4-5 · ความเข้ากันเชิงวิชาการ แยกตามสาย")
    print("  (CoreFit แยกได้ที่ระดับ 'สาย' — ทุกหลักสูตรในสายเดียวกันใช้เวกเตอร์ RIASEC ตัวเดียวกัน)")
    for f in result["field_ranking"][:6]:
        print(f"    {f['core']:>5.1f}  cos {f['congruence']:.3f}  "
              f"{(f['title'] or f['isced'])[:38]:<38} {f['n']:>5} หลักสูตรที่ไปถึงได้  "
              f"[{QUADRANT_TH[f['quadrant']]}]")
    print()

    print(f"ขั้น 6-9 · จัดอันดับหลักสูตร  ({result['candidates']} หลักสูตรผ่านเกณฑ์ · "
          f"ตัดออก {result['rejected']})")
    print(f"  CoreFit = 100 × ({W_INTEREST} × cos + {W_EFFICACY} × efficacy)"
          f"  ·  Final = CoreFit + {CONTEXT_MAX:.0f} × ContextFit")
    print()

    for i, row in enumerate(result["top"], 1):
        p = row["programme"]
        ctx = row["context"]
        print(f"  {i}. {p['name_th']}")
        print(f"     {p['institution_th']} · {p['province_th']}")
        print(f"     {p['isced']} {p['isced_title']}  ·  "
              f"เจตนารับ {p['seats_planned'] if p['seats_planned'] is not None else '—'} คน")
        print(f"     cos(profile, programme) = {row['congruence']:.3f}"
              + (f"   efficacy({''.join(row['efficacy_dims'])}) = {row['efficacy']:.2f}"
                 if row["efficacy"] is not None else "   efficacy = ไม่มีข้อมูล"))
        print(f"     CoreFit {row['core']:.1f}"
              f"  +  บริบท {row['context_component']:.1f}"
              f"  =  {row['final']:.1f}     [{QUADRANT_TH[row['quadrant']]}]")
        if ctx.known:
            print("     บริบทที่คำนวณได้: " +
                  " · ".join(f"{k} {v:.2f}" for k, v in sorted(ctx.known.items())))
        print("     ไม่มีข้อมูล: " + ", ".join(ctx.unknown))
        print()


def main() -> None:
    want = sys.argv[1].upper() if len(sys.argv) > 1 else None
    print()
    print("พารามิเตอร์ที่เป็นการตัดสินใจออกแบบ ไม่ใช่ค่าที่วัดมา")
    for name, (value, why) in PARAMETERS.items():
        print(f"  {name:<24}{value}")
    print()

    for student in ALL:
        if want and not student.label.startswith(want.lower()):
            if want not in ("A", "B", "C"):
                continue
            idx = {"A": 0, "B": 1, "C": 2}[want]
            if ALL.index(student) != idx:
                continue
        show(recommend(student))


if __name__ == "__main__":
    main()
