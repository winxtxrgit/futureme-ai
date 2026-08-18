#!/usr/bin/env python3
"""Build the programme-level index the recommender ranks over.

Four registers are joined so the engine can rank real programmes at real
institutions, on measured interest profiles:

  admission_plan.csv   MHESI intake plan — programme, institution, places
  univ_cur_11_01.csv   MHESI curriculum register — the ISCED-F 2013 field code
                       for each programme
  dqe_11_03.csv        MHESI — annual production cost per student, per
                       programme
  institutions.json    1,358 located institutions (province, coordinates,
                       sector) from the VEC and MHESI registers
  isced_riasec.json    RIASEC per ISCED field, measured from O*NET 29.1

## What changed, and why it matters

A programme's RIASEC vector used to be one of twelve route vectors the team
wrote by hand, matched by Thai keyword. Two problems: the numbers were
assigned rather than measured, and the keywords reached only 54.6% of the
register — law, education, political science and languages had no route at
all. Both are now gone. The field comes from the official ISCED code on the
curriculum, and the vector from the occupations in that field.

The hand-assigned vectors were not merely imprecise. Against the measured
profiles, four of nine comparable routes had the *wrong dominant dimension*:
engineering was written Investigative and measures Realistic, business was
written Enterprising and measures Conventional.

## What this still does not invent

Tuition charged to the student, TCAS round, required subjects and scores, and
scholarships are absent from every register we hold, and are written as null.

`cost_per_year` is the institution's *production* cost per student — what the
university spends, not what the learner pays. At a public university the
learner pays a fraction of it. It is named `cost_per_year_production` in the
output for that reason, and must never be rendered as a tuition figure.
"""
import collections
import csv
import io
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
GEO = os.path.join(ROOT, "01_Research", "Geography_and_Access")
OUT = os.path.join(HERE, "..", "data")

ENTRY_LEVELS = {"ปริญญาตรี"}

SECTOR_BAND = {
    "มหาวิทยาลัยรัฐ": "public",
    "มหาวิทยาลัยในกำกับรัฐ": "autonomous",
    "มหาวิทยาลัยราชภัฎ": "rajabhat",
    "มหาวิทยาลัยเทคโนโลยีราชมงคล": "rajamangala",
    "มหาวิทยาลัยเอกชน": "private",
    "อุดมศึกษา": "unknown",
}


def norm(s):
    import re
    return re.sub(r"\s+", "", s or "").replace("ฯ", "")


def read_csv(path, encoding="utf-8-sig"):
    raw = open(path, "rb").read().decode(encoding, errors="replace")
    return list(csv.DictReader(io.StringIO(raw)))


def main():
    plan = [r for r in read_csv(os.path.join(GEO, "build", "admission_plan.csv"))
            if r["LEV_NAME_TH"].strip() in ENTRY_LEVELS]

    with open(os.path.join(GEO, "data", "institutions.json"), encoding="utf-8") as fh:
        institutions = json.load(fh)
    by_name = {norm(i["name_th"]): i for i in institutions}

    with open(os.path.join(OUT, "isced_riasec.json"), encoding="utf-8") as fh:
        isced_data = json.load(fh)
    vectors, titles = isced_data["vectors"], isced_data["titles"]
    occupations = isced_data["occupations"]

    curriculum = read_csv(os.path.join(HERE, "univ_cur_11_01.csv"))
    isced_of = {r["CURR_ID"]: r["ISCED_2013"].split("-")[-1]
                for r in curriculum if r.get("ISCED_2013")}

    cost_of = {}
    for r in read_csv(os.path.join(HERE, "dqe_11_03.csv")):
        v = (r.get("COST_PER_YEAR") or "").strip()
        if v.replace(".", "", 1).isdigit():
            cost_of[r["CURR_ID"]] = float(v)

    programmes = []
    dropped = collections.Counter()
    seen = set()

    for row in plan:
        name = row["CURR_NAME"].strip()
        curr_id = row["CURR_ID"]

        inst = by_name.get(norm(row["UNIV_NAME_TH"].strip()))
        if inst is None:
            dropped["no_located_institution"] += 1
            continue

        code = isced_of.get(curr_id)
        if code is None:
            dropped["no_isced_code"] += 1
            continue
        if code not in vectors:
            dropped["isced_field_unmapped"] += 1
            continue

        # The register reuses one CURR_ID across genuinely different variants
        # of a programme — "ดนตรีศึกษา (4 ปี)" and "(5 ปี)" share an id and are
        # different things to apply to — so the title is part of the key.
        key = (curr_id, name, inst["id"])
        if key in seen:
            continue
        seen.add(key)

        seats = row["TOTAL_PLAN"].strip()
        programmes.append({
            "programme_id": curr_id,
            "name_th": name,
            "name_en": row["CURR_NAME_EN"].strip() or None,
            "institution_id": inst["id"],
            "institution_th": inst["name_th"],
            "sector": inst.get("sector"),
            "province_iso": inst.get("province_iso"),
            "province_th": inst.get("province_th"),
            "lat": inst.get("lat"),
            "lon": inst.get("lon"),
            "isced": code,
            "isced_title": titles.get(code),
            "riasec": vectors[code],
            # occupations the field's measured vector rests on
            "isced_occupations": occupations.get(code),
            "seats_planned": int(seats) if seats.isdigit() else None,
            "tuition_band": SECTOR_BAND.get(inst.get("sector"), "unknown"),
            # What the institution spends per student per year. NOT tuition.
            "cost_per_year_production": cost_of.get(curr_id),
            "tuition_baht_per_year": None,
            "tcas_rounds": None,
            "required_subjects": None,
            "required_scores": None,
            "scholarships": None,
        })

    payload = {
        "meta": {
            "generated_by": "01_Research/Recommendation_Engine/build/build_programme_index.py",
            "sources": [
                "data.go.th dqe_11_01 — แผนการรับนักศึกษาของแต่ละหลักสูตร",
                "MHESI univ_cur_11_01 — หลักสูตรที่เปิดสอน (ISCED-F 2013)",
                "MHESI dqe_11_03 — ต้นทุนการผลิตนักศึกษาต่อหัวต่อปี",
                "01_Research/Geography_and_Access/data/institutions.json",
                "O*NET 29.1 Interests (CC BY 4.0) via build/build_isced_riasec.py",
            ],
            "level": sorted(ENTRY_LEVELS),
            "programmes": len(programmes),
            "institutions": len({p["institution_id"] for p in programmes}),
            "with_cost": sum(1 for p in programmes if p["cost_per_year_production"]),
            "dropped": dict(dropped),
            "cost_note": "cost_per_year_production คือต้นทุนที่สถาบันใช้ผลิตนักศึกษาหนึ่งคนต่อปี "
                         "ไม่ใช่ค่าเทอมที่ผู้เรียนจ่าย — ห้ามแสดงเป็นค่าเทอม",
            "unpriced": "tuition_baht_per_year, tcas_rounds, required_subjects, "
                        "required_scores, scholarships เป็น null ทุกแถว — "
                        "ไม่มีชุดข้อมูลเปิดใดในเวิร์กสเปซนี้ที่มี",
        },
        "programmes": programmes,
    }

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "programmes.json"), "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    # The register repeats a programme across intake rows, so "rows read" is
    # the wrong denominator — a duplicate collapsing is not a programme lost.
    # Coverage is measured against distinct (id, title, institution) triples.
    distinct = len({(r["CURR_ID"], r["CURR_NAME"].strip(), r["UNIV_NAME_TH"].strip())
                    for r in plan})
    total = len(plan)
    print(f"bachelor rows read        {total}  ({distinct} distinct programmes)")
    for reason, n in dropped.most_common():
        print(f"  dropped · {reason:<24} {n}")
    print(f"programmes indexed        {len(programmes)}  "
          f"({len(programmes) / distinct * 100:.1f}% of distinct programmes)")
    print(f"institutions covered      {len({p['institution_id'] for p in programmes})}")
    print(f"with a production cost    {payload['meta']['with_cost']} "
          f"({payload['meta']['with_cost'] / len(programmes) * 100:.1f}%)")
    fields = collections.Counter(p["isced"] for p in programmes)
    print(f"distinct ISCED fields     {len(fields)}")


if __name__ == "__main__":
    main()
