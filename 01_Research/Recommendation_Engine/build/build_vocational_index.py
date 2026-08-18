#!/usr/bin/env python3
"""Build the ปวช./ปวส. side of the programme index.

The bachelor index covers 6,349 programmes. This covers the other half of the
system — the half this project mostly exists for — from สอศ.'s own enrolment
register: `ckan.vec.go.th/dataset/current_student`, college by level by
สาขางาน with headcount, open CSV, 2568.

Enrolment is better evidence of what a college teaches than a prospectus. A
college with sixteen first-year accounting students teaches accounting.

## The crosswalk, and how precise it is per row

RIASEC comes from O*NET as it does for the degree side. The Thai side of the
join is matched at two levels, and which one was used travels with the row:

  สาขาวิชา   186 of them, the specific subject — patterns below cover the
             large ones, and give the sharper vector
  ประเภทวิชา  20 of them, the broad type — the fallback, so coverage is total
             and no programme is silently dropped

`match_level` on every output row says which applied. A reader can tell a
วิศวกรรมยานยนต์ vector matched on its own subject from one that fell back to
"อุตสาหกรรม", and weight the recommendation accordingly.

This mapping is researcher-authored and unreviewed, like the ISCED one.
`vocational_audit.md` lists what every pattern matched.
"""
import collections
import csv
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
GEO = os.path.join(ROOT, "01_Research", "Geography_and_Access")
OUT = os.path.join(HERE, "..", "data")
SRC = os.path.join(HERE, "vec_current_student_2568.csv")
ONET = os.path.join(HERE, "onet")

DIMENSIONS = ["R", "I", "A", "S", "E", "C"]
ONET_ELEMENT = {"Realistic": "R", "Investigative": "I", "Artistic": "A",
                "Social": "S", "Enterprising": "E", "Conventional": "C"}

# Broad type -> O*NET occupation titles. Guarantees every row gets a vector.
BROAD = {
    "อุตสาหกรรม": r"machinist|welder|industrial machinery mechanic|millwright|electrician|mechanical engineer|industrial engineer|automotive|sheet metal|tool and die",
    "พาณิชยกรรม/บริหารธุรกิจ": r"bookkeeping|accountant|retail salesperson|first-line supervisors of retail|sales representative|office clerk|administrative assistant|general and operations manager",
    "อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ": r"computer user support|computer network support|web developer|computer programmer|computer systems analyst|software developer",
    "เทคโนโลยีสารสนเทศและการสื่อสาร": r"computer user support|computer network support|web developer|computer programmer|telecommunications",
    "อุตสาหกรรมท่องเที่ยว": r"travel agent|tour guide|lodging manager|hotel, motel|flight attendant|concierge|reservation and transportation",
    "เกษตรกรรมและประมง": r"farmer|agricultural worker|agricultural equipment operator|animal scientist|fish|aquacultur",
    "เกษตรกรรม": r"farmer|agricultural worker|agricultural equipment operator|animal scientist|soil and plant scientist",
    "ประมง": r"fish|aquacultur|water transportation",
    "ศิลปกรรมและเศรษฐกิจสร้างสรรค์": r"graphic designer|fine artist|craft artist|commercial designer|photographer|art director",
    "ศิลปกรรม": r"graphic designer|fine artist|craft artist|commercial designer|photographer",
    "อุตสาหกรรมโลจิสติกส์": r"logistician|cargo|dispatcher|shipping, receiving|industrial truck|storage and distribution|transportation, storage",
    "อุตสาหกรรมอาหาร": r"food batchmaker|food scien|baker|butcher|food processing|cooks, restaurant|chefs and head cooks",
    "คหกรรม": r"cooks, restaurant|chefs and head cooks|childcare worker|sewing machine|tailor|food preparation",
    "อุตสาหกรรมแฟชั่นและสิ่งทอ": r"sewing machine|tailor|textile|fashion designer|shoe|upholster",
    "อุตสาหกรรมสิ่งทอ": r"sewing machine|textile|tailor|upholster",
    "อุตสาหกรรมสุขภาพและความงาม": r"hairdresser|skincare|manicurist|barber|massage therapist|cosmetolog",
    "อุตสาหกรรมบันเทิง": r"audio and video technician|sound engineering|film and video editor|musician|producer",
    "อุตสาหกรรมบันเทิงและดนตรี": r"musician|singer|audio and video technician|sound engineering|music director",
    "พาณิชยนาวี": r"sailor|marine engineer|ship engineer|captain, mate|water transportation|motorboat",
    "เทคโนโลยีและนวัตกรรมเกษตรอุตสาหกรรม": r"agricultural engineer|agricultural technician|food scien|farmer",
}

# Specific subject -> O*NET. Sharper where it matters; these cover the largest
# สาขาวิชา, which between them are most of the enrolment.
SUBJECT = {
    r"บัญชี": r"bookkeeping|accountant|auditor|tax preparer|billing and posting",
    r"การตลาด": r"marketing specialist|advertising sales|market research analyst|sales representative|retail salesperson",
    r"ค้าปลีก|ธุรกิจค้าปลีก": r"retail salesperson|first-line supervisors of retail|cashier|stock",
    r"โลจิสติกส์|ซัพพลายเชน": r"logistician|cargo|shipping, receiving|dispatcher|storage and distribution|industrial truck",
    r"ช่างยนต์|เทคนิคเครื่องกล|เทคนิคยานยนต|ยานยนต": r"automotive service technician|bus and truck mechanic|automotive body|engine and other machine assembler",
    r"ไฟฟ้า": r"electrician|electrical power-line|electrical and electronics repairer|electrical engineering technolog",
    r"อิเล็กทรอนิกส": r"electrical and electronic engineering technolog|electronics engineer|electrical and electronics repairer|avionics",
    r"เมคคาทรอนิกส|หุ่นยนต": r"robotics technician|robotics engineer|automation|mechatronic|electro-mechanical",
    r"ช่างกลโรงงาน|เทคนิคการผลิต|เทคนิคโลหะ|เทคนิคอุตสาหกรรม": r"machinist|tool and die|computer numerically controlled|industrial engineering technolog|welder",
    r"ช่างเชื่อม": r"welder|solderer|brazer|sheet metal",
    r"ช่างก่อสร้าง|โยธา": r"construction laborer|carpenter|construction manager|civil engineering technolog|construction and building inspector",
    r"สถาปัตยกรรม": r"architectural and civil drafter|architect|interior designer",
    r"เทคโนโลยีธุรกิจดิจิทัล|คอมพิวเตอร์ธุรกิจ|สำนักงานดิจิทัล": r"computer user support|office clerk|administrative assistant|web developer|desktop publisher",
    r"เทคโนโลยีสารสนเทศ|เทคโนโลยีคอมพิวเตอร์|ช่างเทคนิคคอมพิวเตอร์": r"computer user support|computer network support|computer programmer|computer systems analyst|computer, automated teller",
    r"ดิจิทัลกราฟิก|กราฟิก": r"graphic designer|desktop publisher|web and digital interface|special effects artist",
    r"การโรงแรม": r"lodging manager|hotel, motel|concierge|maids and housekeeping|food service manager",
    r"การท่องเที่ยว": r"travel agent|tour guide|reservation and transportation|meeting, convention",
    r"อาหารและโภชนาการ": r"chefs and head cooks|cooks, restaurant|food batchmaker|dietetic|baker",
    r"เกษตรศาสตร|พืชศาสตร": r"farmer|soil and plant scientist|agricultural worker|agricultural technician|nursery",
    r"สัตวศาสตร": r"animal scientist|animal caretaker|veterinary technolog|farmworkers, farm, ranch",
    r"คหกรรมศาสตร": r"childcare worker|cooks, restaurant|sewing machine|food preparation",
}


def read_tsv(p):
    return list(csv.DictReader(open(os.path.join(ONET, p), encoding="utf-8"), delimiter="\t"))


def compile_pattern(pattern):
    """Anchor each alternative to a word start — see build_isced_riasec.py."""
    return re.compile("|".join(a if a.startswith(("\\b", "(")) else r"\b" + a
                               for a in pattern.split("|")), re.I)


def norm(s):
    return re.sub(r"\s+", "", s or "").replace("ฯ", "")


def main():
    occupations = {r["O*NET-SOC Code"]: r["Title"] for r in read_tsv("Occupation Data.txt")}
    profiles = collections.defaultdict(dict)
    for r in read_tsv("Interests.txt"):
        if r["Scale ID"] == "OI":
            d = ONET_ELEMENT.get(r["Element Name"])
            if d:
                profiles[r["O*NET-SOC Code"]][d] = float(r["Data Value"])
    profiles = {k: v for k, v in profiles.items() if len(v) == 6}

    def vector_for(pattern):
        rx = compile_pattern(pattern)
        matched = [(s, t) for s, t in occupations.items() if s in profiles and rx.search(t)]
        if not matched:
            return None, []
        mean = {d: sum(profiles[s][d] for s, _ in matched) / len(matched) for d in DIMENSIONS}
        return {d: round((mean[d] - 1) / 6, 4) for d in DIMENSIONS}, matched

    broad_vec, subject_vec, audit = {}, {}, []
    for name, pat in BROAD.items():
        v, m = vector_for(pat)
        if v:
            broad_vec[name] = (v, [t for _, t in m[:4]])
            audit.append(("ประเภทวิชา", name, v, m))
    for pat, onet in SUBJECT.items():
        v, m = vector_for(onet)
        if v:
            subject_vec[pat] = (re.compile(pat), v, [t for _, t in m[:4]])
            audit.append(("สาขาวิชา", pat, v, m))

    raw = open(SRC, "rb").read().decode("utf-8-sig", errors="replace")
    rows = list(csv.DictReader(io.StringIO(raw)))

    with open(os.path.join(GEO, "data", "institutions.json"), encoding="utf-8") as fh:
        by_name = {norm(i["name_th"]): i for i in json.load(fh)}

    # Collapse year-groups: one row per college x subject x level band, with the
    # headcount summed. A learner applies to a programme, not to a year of it.
    agg = collections.defaultdict(int)
    for r in rows:
        level = "ปวช." if r["ระดับชั้น"].startswith("ปวช") else "ปวส."
        agg[(r["ชื่อสถานศึกษา"].strip(), r["จังหวัด"].strip(), r["ประเภทสถานศึกษา"].strip(),
             level, r["ประเภทวิชา"].strip(), r["สาขาวิชา"].strip(),
             r["สาขางาน"].strip())] += int(r["จำนวน"] or 0)

    programmes, dropped, levels = [], collections.Counter(), collections.Counter()
    for (college, province, sector, level, broad, subject, work), students in sorted(agg.items()):
        inst = by_name.get(norm(college))
        if inst is None:
            dropped["no_located_college"] += 1
            continue

        vec, how, examples = None, None, []
        for pat, (rx, v, ex) in subject_vec.items():
            if rx.search(subject):
                vec, how, examples = v, f"สาขาวิชา:{pat}", ex
                break
        if vec is None:
            pair = broad_vec.get(broad)
            if pair:
                vec, examples = pair
            how = f"ประเภทวิชา:{broad}"
        if vec is None:
            dropped["no_vector"] += 1
            continue
        levels[how.split(":")[0]] += 1

        programmes.append({
            "programme_id": f"vec-{inst['id']}-{level}-{norm(subject)}-{norm(work)}",
            "name_th": f"{level} {subject}" + (f" ({work})" if work and work != subject else ""),
            "level": level,
            "institution_id": inst["id"],
            "institution_th": inst["name_th"],
            "sector": sector,
            "province_iso": inst.get("province_iso"),
            "province_th": inst.get("province_th") or province,
            "field_broad": broad,
            "field_subject": subject,
            "riasec": vec,
            "match_level": how,
            "occupation_examples": examples,
            "students_enrolled": students,
            "tuition_band": "public" if sector == "รัฐ" else "private",
            "tuition_baht_per_year": None,
            "admission_requirements": None,
            "scholarships": None,
        })

    payload = {
        "meta": {
            "generated_by": "build/build_vocational_index.py",
            "sources": [
                "ckan.vec.go.th current_student — จำนวนนักเรียนอาชีวศึกษาในระบบ ปีการศึกษา 2568",
                "01_Research/Geography_and_Access/data/institutions.json",
                "O*NET 29.1 Interests (CC BY 4.0)",
            ],
            "levels": ["ปวช.", "ปวส."],
            "programmes": len(programmes),
            "colleges": len({p["institution_id"] for p in programmes}),
            "matched_on": dict(levels),
            "dropped": dict(dropped),
            "evidence_note": "หลักสูตรมาจากจำนวนนักเรียนที่ลงทะเบียนจริง ไม่ใช่คู่มือหลักสูตร "
                             "วิทยาลัยที่มีนักเรียนในสาขานั้นย่อมเปิดสอนสาขานั้นจริง",
            "crosswalk_status": "การจับคู่สาขาไทยกับกลุ่มอาชีพเป็นงานของทีมและยังไม่ผ่านการตรวจ "
                                "· match_level บอกว่าแต่ละแถวจับคู่ที่ระดับไหน",
            "unpriced": "ค่าเทอม เกณฑ์รับเข้า และทุน ไม่มีในชุดข้อมูลนี้เช่นกัน",
        },
        "programmes": programmes,
    }

    with open(os.path.join(OUT, "vocational.json"), "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    with open(os.path.join(HERE, "vocational_audit.md"), "w", encoding="utf-8") as fh:
        fh.write("# สาขาอาชีวะ → O\\*NET · ทุกการจับคู่ สำหรับตรวจ\n\n")
        fh.write("ค่า RIASEC วัดมาจริง (O\\*NET 29.1) · **การเลือกว่าอาชีพไหนอยู่ในสาขาไหน "
                 "เป็นงานของทีมและยังไม่ผ่านการตรวจ**\n\n")
        for kind, name, v, matched in audit:
            fh.write(f"## {kind} · {name}\n\n`"
                     + "` · `".join(f"{d} {v[d]:.2f}" for d in DIMENSIONS) + "`\n\n")
            fh.write(f"{len(matched)} อาชีพ: " + ", ".join(t for _, t in matched[:10]))
            fh.write(f", …อีก {len(matched)-10}\n\n" if len(matched) > 10 else "\n\n")

    print(f"แถวลงทะเบียน            {len(rows)}")
    print(f"หลักสูตร (วิทยาลัย×สาขา×ระดับ)  {len(programmes)}")
    print(f"วิทยาลัย                {len({p['institution_id'] for p in programmes})}")
    for k, n in levels.most_common():
        print(f"  จับคู่ที่ระดับ {k:<12} {n}")
    for k, n in dropped.most_common():
        print(f"  ตัดออก · {k:<22} {n}")
    thin = [(k, len(m)) for k, _, _, m in [(a[1], a[0], a[2], a[3]) for a in audit] if len(m) < 3]
    if thin:
        print(f"  สาขาที่หนุนด้วย <3 อาชีพ: {', '.join(k for k, _ in thin)}")


if __name__ == "__main__":
    main()
