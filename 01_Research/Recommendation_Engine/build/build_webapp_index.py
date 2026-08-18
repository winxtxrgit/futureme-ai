#!/usr/bin/env python3
"""Squeeze the programme index down to something a browser can carry.

data/programmes.json is readable JSON sized for a research artefact, far too
heavy for a page bundle. Nothing the engine reads is dropped; the weight is
repetition and fields the browser can derive:

  · institution name, province and sector repeat across every programme at
    that institution, so they move into a table and rows hold an index
  · programme titles repeat across institutions, so they get a table too
  · the ISCED field code, its title and its RIASEC vector are per-field, not
    per-programme, so they move into a field table
  · the null columns (tuition, TCAS round, required scores, scholarships) are
    null for every row, so they are stated once in meta rather than repeated
    thousands of times — the gap is still declared, just not restated

Output, all positional:

  fields[f]       = [iscedCode, title, [R,I,A,S,E,C], occupationsBehindIt,
                     exampleOccupationsInThai]
  institutions[i] = [id, nameTh, provinceIso, provinceTh, tuitionBand, website|""]
  titles[j]       = programme title
  programmes[k]   = [titleIndex, institutionIndex, fieldIndex, seats|null,
                     productionCost|null, levelIndex, outcomeIndex|-1]
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "data", "programmes.json")
OUT = os.path.join(HERE, "..", "..", "..", "03_WebApp", "Pre_Present", "data",
                   "programmes.json")

DIMENSIONS = ["R", "I", "A", "S", "E", "C"]

from occupation_th import OCCUPATION_TH  # noqa: E402


def thai_examples(titles):
    """Only the occupations that have a Thai name reach a Thai learner.

    An untranslated English job title on the card is worse than one fewer
    example, so untranslated ones are dropped rather than passed through.
    """
    return [OCCUPATION_TH[t] for t in (titles or []) if t in OCCUPATION_TH][:3]

# index into this list is stored per programme
LEVELS = ["ปริญญาตรี", "ปวช.", "ปวส."]


def load_websites():
    path = os.path.join(HERE, "..", "..", "Geography_and_Access", "data",
                        "institutions.json")
    with open(path, encoding="utf-8") as fh:
        return {i["id"]: (i.get("website") or "").strip() for i in json.load(fh)}


WEBSITES = {}

# The 2568 enrolment register renamed some ประเภทวิชา that the 2566 outcome
# survey still lists under their old names. Only genuine renames are aliased;
# categories that are actually new (อุตสาหกรรมอาหาร, โลจิสติกส์,
# สุขภาพและความงาม) are left unmapped and simply have no outcome data, because
# borrowing another category's employment rate would be inventing it.
OUTCOME_ALIAS = {
    "อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ": "เทคโนโลยีสารสนเทศและการสื่อสาร",
    "เกษตรกรรมและประมง": "เกษตรกรรม",
    "ศิลปกรรมและเศรษฐกิจสร้างสรรค์": "ศิลปกรรม",
    "อุตสาหกรรมบันเทิง": "อุตสาหกรรมบันเทิงและดนตรี",
    "อุตสาหกรรมแฟชั่นและสิ่งทอ": "อุตสาหกรรมสิ่งทอ",
}

WORKING = ("ทำงานเอกชน", "ทำงานราชการ", "ทำงานรัฐวิสาหกิจ", "อาชีพอิสระ")


def load_outcomes():
    """Employment after graduating, by province x level x field.

    Percentages are of *those the survey reached*, never of all graduates, and
    the source suppresses them below ten. Both facts travel with the number:
    the UI states the tracked count beside the percentage so nobody reads 100%
    off fifteen people as a fact about the field.
    """
    path = os.path.join(HERE, "..", "..", "Geography_and_Access", "data",
                        "vocational_outcomes.json")
    table, index = [], {}
    with open(path, encoding="utf-8") as fh:
        for r in json.load(fh):
            if r.get("percentages_suppressed") or not r.get("of_tracked_percent"):
                continue
            pct = r["of_tracked_percent"]
            working = round(sum(pct.get(k, 0) for k in WORKING), 1)
            index[(r["province_iso"], r["level"], r["field_th"])] = len(table)
            table.append([
                working,
                round(pct.get("ศึกษาต่อ", 0), 1),
                r.get("tracked") or 0,
                r.get("graduates") or 0,
                1 if r.get("small_sample") else 0,
                r.get("academic_year", ""),
            ])
    return table, index


OUTCOMES, OUTCOME_INDEX = [], {}


def main():
    global WEBSITES
    WEBSITES = load_websites()
    global OUTCOMES, OUTCOME_INDEX
    OUTCOMES, OUTCOME_INDEX = load_outcomes()
    with open(SRC, encoding="utf-8") as fh:
        payload = json.load(fh)
    rows = payload["programmes"]

    with open(os.path.join(HERE, "..", "data", "isced_riasec.json"), encoding="utf-8") as fh:
        isced_examples = json.load(fh)["examples"]
    for r in rows:
        r["occupation_examples"] = isced_examples.get(r["isced"], [])

    fields, field_index = [], {}
    institutions, inst_index = [], {}
    titles, title_index = [], {}
    programmes = []

    vocational = []
    voc_path = os.path.join(HERE, "..", "data", "vocational.json")
    if os.path.exists(voc_path):
        with open(voc_path, encoding="utf-8") as fh:
            voc = json.load(fh)
        for v in voc["programmes"]:
            vocational.append({
                "isced": "VEC:" + v["field_subject"],
                "isced_title": v["field_subject"],
                "isced_occupations": 0,   # audited per subject, not per occupation count
                "occupation_examples": v.get("occupation_examples"),
                "name_th": v["name_th"],
                "institution_id": v["institution_id"],
                "institution_th": v["institution_th"],
                "province_iso": v["province_iso"],
                "province_th": v["province_th"],
                "tuition_band": v["tuition_band"],
                "riasec": v["riasec"],
                "seats_planned": v["students_enrolled"],
                "cost_per_year_production": None,
                "level": v["level"],
                "outcome": OUTCOME_INDEX.get(
                    (v["province_iso"], v["level"],
                     OUTCOME_ALIAS.get(v["field_broad"], v["field_broad"]))),
            })

    # Degrees first, then ปวช./ปวส. — the engine sorts on score, so order here
    # only decides tie-break stability.
    for p in rows + vocational:
        code = p["isced"]
        if code not in field_index:
            field_index[code] = len(fields)
            fields.append([code, p["isced_title"],
                           [round(p["riasec"][d], 4) for d in DIMENSIONS],
                           p["isced_occupations"],
                           thai_examples(p.get("occupation_examples"))])

        key = p["institution_id"]
        if key not in inst_index:
            inst_index[key] = len(institutions)
            institutions.append([p["institution_id"], p["institution_th"],
                                 p["province_iso"], p["province_th"],
                                 p["tuition_band"],
                                 # Official site from the VEC/MHESI register, or
                                 # empty. Never guessed: a wrong URL for a real
                                 # institution is worse than no URL.
                                 WEBSITES.get(p["institution_id"], "")])

        title = p["name_th"]
        if title not in title_index:
            title_index[title] = len(titles)
            titles.append(title)

        cost = p["cost_per_year_production"]
        programmes.append([title_index[title], inst_index[key], field_index[code],
                           p["seats_planned"],
                           round(cost) if cost is not None else None,
                           LEVELS.index(p.get("level", "ปริญญาตรี")),
                           p.get("outcome") if p.get("outcome") is not None else -1])

    out = {
        "meta": {
            "generatedBy": "01_Research/Recommendation_Engine/build/build_webapp_index.py",
            "source": payload["meta"]["sources"],
            "programmes": len(programmes),
            "institutions": len(institutions),
            "fields": len(fields),
            "levels": LEVELS,
        # [workingPct, studyingPct, tracked, graduates, smallSample, year]
        "outcomes": OUTCOMES,
            "riasecSource": "O*NET 29.1 Interests, Occupational Interest scale, "
                            "US DOL/ETA, CC BY 4.0 — mapped to ISCED-F 2013 fields",
            "riasecStatus": "ค่า RIASEC วัดมาจริง · การจับคู่สาย ISCED กับกลุ่มอาชีพ "
                            "เป็นงานของทีมและยังไม่ผ่านการตรวจโดยผู้เชี่ยวชาญ",
            "costNote": "productionCost คือต้นทุนที่สถาบันใช้ผลิตนักศึกษาหนึ่งคนต่อปี "
                        "ไม่ใช่ค่าเทอมที่ผู้เรียนจ่าย",
            # Absent for every row. Read by the UI so the gap is visible.
            "missing": [
                "tuition_baht_per_year",
                "tcas_rounds",
                "required_subjects",
                "required_scores",
                "scholarships",
            ],
            "coverageNote": (
                f"ปริญญาตรี {len(rows)} หลักสูตร (88.8% ของที่ไม่ซ้ำในทะเบียน อว.) · "
                f"ปวช./ปวส. {len(vocational)} หลักสูตร จากทะเบียนนักเรียนของ สอศ. ปี 2568"
            ),
        },
        # top level, not inside meta: the engine reads it on every row
        "levels": LEVELS,
        # [workingPct, studyingPct, tracked, graduates, smallSample, year]
        "outcomes": OUTCOMES,
        "fields": fields,
        "institutions": institutions,
        "titles": titles,
        "programmes": programmes,
    }

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    before = os.path.getsize(SRC)
    after = os.path.getsize(OUT)
    print(f"programmes    {len(programmes)}  (ตรี {len(rows)} · อาชีวะ {len(vocational)})")
    print(f"institutions  {len(institutions)}  "
          f"(มีเว็บไซต์ทางการ {sum(1 for i in institutions if i[5])})")
    print(f"fields        {len(fields)}  (ISCED-F detailed, each with its own vector)")
    print(f"  มีชื่ออาชีพไทย {sum(1 for f in fields if f[4])} สาย")
    print(f"titles        {len(titles)} unique of {len(programmes)}")
    print(f"with cost     {sum(1 for r in programmes if r[4] is not None)}")
    print(f"with outcome  {sum(1 for r in programmes if r[6] >= 0)} (ตาราง {len(OUTCOMES)} แถว)")
    print(f"size          {before/1e6:.1f} MB -> {after/1e6:.2f} MB "
          f"({after/before*100:.0f}%)")


if __name__ == "__main__":
    main()
