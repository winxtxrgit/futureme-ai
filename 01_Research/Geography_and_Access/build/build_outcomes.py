#!/usr/bin/env python3
"""What happened to vocational graduates, by province, level and field.

This is the only dataset here that describes outcomes rather than geography, and
it is the one most easily misused. It reports what a follow-up survey found for
one cohort — not what will happen to a learner, and not which field is "better".

Two things are therefore carried on every row and must survive into any answer
built from it:

- `tracked` versus `graduates`. The percentages are shares of the graduates the
  survey managed to contact, not of everyone who finished. Where tracking is
  thin the percentages describe a small and probably unrepresentative group, so
  `tracked_share` is published beside them and rows below a floor are marked.
- "waiting for work or unemployed" is one of six outcomes, alongside continuing
  to study. A learner who continues to study is not a failure of the field, and
  collapsing these into an employment rate would say they were.

Ranking fields or provinces by these numbers is exactly the use this project
does not permit: the deterministic engine decides routes, and it does not take
labour-market share as an input.
"""
import csv
import math
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/Users/winter/Desktop/winter/Hackathon_TH/01_Research/Geography_and_Access/data"

MIN_TRACKED_SHARE = 0.30       # below this the row is flagged, not dropped

# Two different small-sample problems, and the first version guarded only one.
#
# `tracked_share` catches a field where most graduates were never contacted. It
# says nothing about size: a field with four graduates and four responses scores
# a perfect 1.0 and then reports "100% employed", which is a sentence about four
# people that reads like a fact about a career.
#
# So an absolute floor as well. Below SUPPRESS_BELOW no percentage is published
# at all — the counts stay, because "eleven people finished this here last year"
# is itself worth knowing. Between the two floors percentages are published with
# a Wilson interval attached, because a range is honest where a point estimate
# would not be.
SUPPRESS_BELOW = 10
SMALL_SAMPLE_BELOW = 30

with open(os.path.join(HERE, "workforce2566.csv"), encoding="cp874") as fh:
    rows = list(csv.DictReader(fh))

# The header ships with padding around every name.
def get(row, key):
    for name, value in row.items():
        if name.strip() == key:
            return (value or "").strip()
    return ""


def integer(text):
    try:
        return int(float(text.replace(",", "")))
    except (ValueError, AttributeError):
        return 0


provinces = json.load(open(os.path.join(HERE, "provinces.json")))
by_name = {p["th"]: p for p in provinces}
by_name.update({p["th_short"]: p for p in provinces})

FIELDS = ("ศึกษาต่อ", "รองานหรือว่างงาน", "ทำงานรัฐวิสาหกิจ",
          "ทำงานราชการ", "ทำงานเอกชน", "อาชีพอิสระ", "อื่น ๆ")

grouped = {}
unmatched = set()
for row in rows:
    province_name = get(row, "จังหวัด")
    province = by_name.get(province_name)
    if not province:
        unmatched.add(province_name)
        continue
    key = (province["iso"], get(row, "ระดับชั้น"), get(row, "ประเภทวิชา"))
    bucket = grouped.setdefault(key, {name: 0 for name in FIELDS})
    bucket["graduates"] = bucket.get("graduates", 0) + integer(get(row, "ผู้สำเร็จการศึกษา"))
    bucket["tracked"] = bucket.get("tracked", 0) + integer(get(row, "ติดตามได้"))
    for name in FIELDS:
        bucket[name] += integer(get(row, name))

def wilson(successes, total, z=1.96):
    """95% interval for a proportion, which stays sane when the count is tiny.

    A normal approximation gives nonsense at the edges — 4 of 4 becomes
    100% ± 0% — and the edges are exactly where these rows live.
    """
    if not total:
        return None
    p = successes / total
    denominator = 1 + z ** 2 / total
    centre = (p + z ** 2 / (2 * total)) / denominator
    spread = (z * math.sqrt(p * (1 - p) / total + z ** 2 / (4 * total ** 2))) / denominator
    return [round(100 * max(0.0, centre - spread), 1), round(100 * min(1.0, centre + spread), 1)]


records = []
for (iso, level, field), bucket in sorted(grouped.items()):
    tracked = bucket["tracked"]
    graduates = bucket["graduates"]
    if not tracked or not field:
        continue
    share = round(tracked / graduates, 3) if graduates else None
    suppressed = tracked < SUPPRESS_BELOW
    small = tracked < SMALL_SAMPLE_BELOW

    record = {
        "province_iso": iso,
        "level": level,
        "field_th": field,
        "graduates": graduates,
        "tracked": tracked,
        "tracked_share": share,
        "thinly_tracked": bool(share is not None and share < MIN_TRACKED_SHARE),
        "small_sample": small,
        "percentages_suppressed": suppressed,
        "counts_of_tracked": {name: bucket[name] for name in FIELDS},
        "academic_year": "2566",
        "source": "ckan.vec.go.th employment (workforce2566)",
    }
    if suppressed:
        record["suppression_reason"] = (
            f"ติดตามผู้สำเร็จการศึกษาได้ {tracked} คน ต่ำกว่าเกณฑ์ {SUPPRESS_BELOW} "
            "จึงไม่เผยแพร่เป็นเปอร์เซ็นต์ เพราะสัดส่วนจากคนไม่กี่คนอ่านเหมือนข้อเท็จจริงของทั้งสาขา")
    else:
        record["of_tracked_percent"] = {
            name: round(100 * bucket[name] / tracked, 1) for name in FIELDS
        }
        record["of_tracked_percent_ci95"] = {
            name: wilson(bucket[name], tracked) for name in FIELDS
        }
    records.append(record)

with open(os.path.join(OUT, "vocational_outcomes.json"), "w") as fh:
    json.dump(records, fh, ensure_ascii=False, indent=1)

print(f"outcome rows: {len(records)} from {len(rows)} raw")
print("unmatched provinces:", sorted(x for x in unmatched if x)[:8])
print("thinly tracked rows:", sum(1 for r in records if r["thinly_tracked"]))
totals = {}
for record in records:
    totals[record["field_th"]] = totals.get(record["field_th"], 0) + record["graduates"]
print("fields by graduates:")
for field, count in sorted(totals.items(), key=lambda x: -x[1]):
    print(f"  {count:7d}  {field}")
