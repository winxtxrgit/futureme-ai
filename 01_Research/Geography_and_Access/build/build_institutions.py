#!/usr/bin/env python3
"""Merge every institution source into one file, keeping provenance per record.

Sources differ in what they are good for, so none of them is treated as the
whole truth:

- OVEC's own register is authoritative for vocational colleges and already
  carries coordinates, district and phone. It is the only complete list of the
  ปวช./ปวส. institutions, which are the ones a vocational learner needs and the
  ones general university lists leave out.
- The MHESI register is authoritative for degree-awarding institutions but has
  no coordinates, so those are geocoded separately and marked as such.
- OSM is used only to fill gaps, because its coverage of Thai campuses is
  uneven — a province returning four results does not mean it has four.

Every record says where it came from and how its coordinate was obtained, so a
reader can tell a surveyed location from a geocoded guess.
"""
import csv
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/Users/winter/Desktop/winter/Hackathon_TH/01_Research/Geography_and_Access/data"
os.makedirs(OUT, exist_ok=True)


def load(name, encodings=("utf-8-sig", "cp874", "tis-620")):
    for encoding in encodings:
        try:
            with open(os.path.join(HERE, name), encoding=encoding) as fh:
                return list(csv.DictReader(fh))
        except (UnicodeDecodeError, LookupError):
            continue
    raise RuntimeError(f"cannot decode {name}")


provinces = json.load(open(os.path.join(HERE, "provinces.json")))
by_thai_name = {}
for province in provinces:
    by_thai_name[province["th"]] = province
    by_thai_name[province["th_short"]] = province
    by_thai_name[province["th_short"].replace(" ", "")] = province

# The register writes Bangkok several ways.
for alias in ("กรุงเทพฯ", "กรุงเทพ", "กทม.", "กรุงเทพมหานคร"):
    by_thai_name[alias] = by_thai_name["กรุงเทพมหานคร"]


def province_of(raw):
    if not raw:
        return None
    text = raw.strip().replace("จ.", "").replace("จังหวัด", "").strip()
    return by_thai_name.get(text) or by_thai_name.get(raw.strip())


def number(value):
    try:
        result = float(str(value).strip())
        return result if result else None
    except (TypeError, ValueError):
        return None


# ── What a college's name says it teaches ────────────────────────────────────
# Thai institution names are descriptive: the name of a วิทยาลัยเทคนิค tells a
# learner it runs ปวช./ปวส. This is what lets the dataset answer "what can I
# actually study near me" rather than only "what buildings are near me".
KIND_RULES = [
    (r"มหาวิทยาลัยราชภัฏ", "rajabhat", ["ปริญญาตรี", "ปริญญาโท"]),
    (r"มหาวิทยาลัยเทคโนโลยีราชมงคล", "rajamangala", ["ปวส.", "ปริญญาตรี"]),
    (r"วิทยาลัยเทคนิค", "technical_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยอาชีวศึกษา", "vocational_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยการอาชีพ", "career_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยเกษตรและเทคโนโลยี|วิทยาลัยประมง", "agricultural_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยสารพัดช่าง", "polytechnic", ["ปวช.", "ปวส.", "หลักสูตรระยะสั้น"]),
    (r"วิทยาลัยเทคโนโลยีและการจัดการ", "tech_management_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยพยาบาล", "nursing_college", ["ปริญญาตรี"]),
    (r"วิทยาลัยการสาธารณสุข", "public_health_college", ["ปวส.", "ปริญญาตรี"]),
    (r"วิทยาลัยนาฏศิลป|วิทยาลัยช่างศิลป|วิทยาลัยดุริยางค", "arts_college", ["ปวช.", "ปวส."]),
    (r"วิทยาลัยเทคโนโลยี|วิทยาลัยบริหารธุรกิจ|โรงเรียนเทคโนโลยี", "private_vocational", ["ปวช.", "ปวส."]),
    (r"^สถาบัน", "institute", ["ปริญญาตรี"]),
    (r"มหาวิทยาลัย", "university", ["ปริญญาตรี", "ปริญญาโท"]),
    (r"วิทยาลัย", "college", ["ปวช.", "ปวส."]),
]


def classify(name):
    for pattern, kind, offers in KIND_RULES:
        if re.search(pattern, name):
            return kind, offers
    return "other", []


records = []
unmatched_provinces = set()

# ── OVEC public vocational colleges ──────────────────────────────────────────
for row in load("public_college.csv"):
    name = (row.get("ชื่อสถานศึกษา") or "").strip()
    province = province_of(row.get("จังหวัด"))
    if not name:
        continue
    if not province:
        unmatched_provinces.add(row.get("จังหวัด"))
        continue
    kind, offers = classify(name)
    records.append({
        "id": f"ovec-pub-{(row.get('รหัสสถานศึกษา') or '').strip()}",
        "name_th": name,
        "kind": kind,
        "sector": "รัฐ (สอศ.)",
        "offers": offers,
        "province_iso": province["iso"],
        "province_th": province["th_short"],
        "district": (row.get("อำเภอ") or "").strip() or None,
        "subdistrict": (row.get("ตำบล") or "").strip() or None,
        "lat": number(row.get("พิกัดละติจูด")),
        "lon": number(row.get("พิกัดลองจิจูด")),
        "phone": (row.get("โทรศัพท์") or "").strip() or None,
        "website": (row.get("เว็บไซต์") or "").strip() or None,
        "source": "ckan.vec.go.th publicschool",
        "coord_source": "register",
    })

# ── OVEC private vocational colleges ─────────────────────────────────────────
for row in load("private_college.csv"):
    name = (row.get("ชื่อโรงเรียน") or "").strip()
    province = province_of(row.get("จังหวัด"))
    if not name or not province:
        if name:
            unmatched_provinces.add(row.get("จังหวัด"))
        continue
    kind, offers = classify(name)
    records.append({
        "id": f"ovec-pri-{(row.get('รหัสโรงเรียน') or '').strip()}",
        "name_th": name,
        "kind": kind if kind != "other" else "private_vocational",
        "sector": "เอกชน",
        "offers": offers or ["ปวช.", "ปวส."],
        "province_iso": province["iso"],
        "province_th": province["th_short"],
        "district": (row.get("อำเภอ") or "").strip() or None,
        "subdistrict": (row.get("ตำบล") or "").strip() or None,
        "lat": number(row.get("พิกัดละติจูด")),
        "lon": number(row.get("พิกัดลองจิจูด")),
        "phone": (row.get("โทรศัพท์") or "").strip() or None,
        "website": None,
        "source": "ckan.vec.go.th privateschool",
        "coord_source": "register",
    })

# ── MHESI degree-awarding institutions ───────────────────────────────────────
types = {}
for row in load("univ_groups.csv"):
    types[row["UNIV_NAME"].strip()] = row.get("UNIV_TYPE_NAME", "").strip()

geo = {}
geocode_path = os.path.join(HERE, "geocode_cache.json")
if os.path.exists(geocode_path):
    geo = json.load(open(geocode_path))

seen = set()
for row in load("univ_by_province.csv"):
    name = row["UNIV_NAME"].strip()
    raw_province = row["PROVINCE_UNIV_NAME_TH"].strip()
    key = (name, raw_province)
    if key in seen:
        continue
    seen.add(key)
    province = province_of(raw_province)
    if not province:
        unmatched_provinces.add(raw_province)
        continue
    kind, offers = classify(name)
    located = geo.get(f"{name}|{raw_province}")
    records.append({
        "id": f"mhesi-{row['UNIV_ID'].strip()}-{province['iso']}",
        "name_th": name,
        "kind": kind if kind != "other" else "university",
        "sector": types.get(name) or "อุดมศึกษา",
        "offers": offers or ["ปริญญาตรี"],
        "province_iso": province["iso"],
        "province_th": province["th_short"],
        "district": None,
        "subdistrict": None,
        "lat": located["lat"] if located else None,
        "lon": located["lon"] if located else None,
        "phone": None,
        "website": None,
        "source": "data.mhesi.go.th univ_uni_11_03 (2564)",
        "coord_source": "geocoded" if located else None,
    })

records.sort(key=lambda r: (r["province_iso"], r["name_th"]))
with open(os.path.join(OUT, "institutions.json"), "w") as fh:
    json.dump(records, fh, ensure_ascii=False, indent=1)

located = sum(1 for r in records if r["lat"])
print(f"institutions: {len(records)}  with coordinates: {located}")
print("unmatched province strings:", sorted(x for x in unmatched_provinces if x)[:10])
kinds = {}
for record in records:
    kinds[record["kind"]] = kinds.get(record["kind"], 0) + 1
for kind, count in sorted(kinds.items(), key=lambda x: -x[1]):
    print(f"  {count:5d}  {kind}")
