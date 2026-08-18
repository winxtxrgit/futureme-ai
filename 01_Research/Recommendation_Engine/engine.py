#!/usr/bin/env python3
"""FuturePath explainable recommender — the deterministic core.

No language model is involved anywhere in this file. Every number a learner sees
is produced here, by arithmetic that can be read, argued with and recomputed by
hand. That is the point: a judge who asks "why did this student get this
programme?" gets a derivation, not an appeal to a model.

The pipeline, and where each step's authority comes from:

  1  item score          Likert 1..5 -> 0..1, reverse items reflected
  2  dimension score     mean over that dimension's scoring items
  3  reliability shrink  Kelley (1947): an unreliable score is pulled toward the
                         population mean in proportion to its unreliability
  4  profile vector      the six shrunk dimension scores
  5  CORE FIT            Holland congruence (cosine) + SCCT self-efficacy
  6  quadrant            interest x efficacy, for explanation only
  7  eligibility         hard boolean gates, each with a reason code
  8  CONTEXT FIT         access / cost / admission / preference, computed only
                         over the sub-scores we actually hold data for
  9  ranking             CoreFit + CONTEXT_MAX x ContextFit, capped so context
                         can never overturn a real academic gap
 10  trace               every intermediate value, per programme

Parameters that are design judgement rather than measurement are named in
PARAMETERS below and repeated in the README. None of them is claimed to be
fitted to outcome data, because no outcome data exists yet.
"""
from __future__ import annotations

import json
import math
import os
from dataclasses import dataclass, field

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BANK = os.path.join(ROOT, "01_Research", "Adaptive_Questionnaire", "bank", "items.json")
PROGRAMMES = os.path.join(HERE, "data", "programmes.json")
GEO = os.path.join(ROOT, "01_Research", "Geography_and_Access", "data")

DIMENSIONS = ["R", "I", "A", "S", "E", "C"]
SCALE_MIN, SCALE_MAX = 1, 5

# ---------------------------------------------------------------------------
# Parameters. Every one of these is a design decision, not a measurement.
# ---------------------------------------------------------------------------

PARAMETERS = {
    "W_INTEREST": (
        0.70,
        "น้ำหนักความสนใจใน CoreFit. SCCT (Lent, Brown & Hackett 1994) ถือว่า "
        "ความสนใจถูกสร้างขึ้นบางส่วนจากความมั่นใจในตนเอง การให้ efficacy "
        "น้ำหนักเต็มจึงเป็นการนับซ้ำ · ยังไม่ได้ fit กับข้อมูลผลลัพธ์",
    ),
    "W_EFFICACY": (
        0.30,
        "น้ำหนัก self-efficacy ใน CoreFit. ต่ำกว่าความสนใจเพราะผู้เรียน ม.4–6 "
        "ประเมินความถนัดของตัวเองจากประสบการณ์ที่ยังน้อย",
    ),
    "PRIOR_MEAN": (
        0.50,
        "ค่ากลางที่คะแนนถูกดึงเข้าหาเมื่อความมั่นใจต่ำ = จุดกึ่งกลางสเกล "
        "(ไม่มีข้อมูล = ไม่เอนไปทางใด) · ควรแทนด้วยค่าเฉลี่ยประชากรไทยจริง "
        "เมื่อเก็บ norm ได้",
    ),
    "CORE_GATE": (
        55.0,
        "CoreFit ขั้นต่ำที่จะถูกเสนอ · ต่ำกว่านี้ระบบบอกว่ายังไม่มีหลักฐานพอ "
        "แทนที่จะเสนอไปก่อน",
    ),
    "CONTEXT_MAX": (
        15.0,
        "เพดานคะแนนที่บริบททั้งหมดรวมกันเพิ่มได้ · เลือกให้เล็กกว่าช่วงห่าง "
        "CoreFit ที่มีความหมาย เพื่อให้บริบท 'จัดลำดับในกลุ่มที่พอ ๆ กัน' "
        "ได้ แต่ 'ยกหลักสูตรที่ไม่เข้ากันขึ้นมาชนะ' ไม่ได้",
    ),
    "MAX_PER_INSTITUTION": (
        2,
        "จำนวนหลักสูตรสูงสุดต่อสถาบันใน Top 5 · เพื่อให้รายการเป็นทางเลือกจริง "
        "ไม่ใช่โบรชัวร์ของมหาวิทยาลัยเดียว",
    ),
    "MAX_PER_FIELD": (
        2,
        "จำนวนหลักสูตรสูงสุดต่อสายใน Top 5 · จำเป็นเพราะความละเอียดของ CoreFit "
        "อยู่ที่ระดับ 'สาย' ไม่ใช่ระดับหลักสูตร ถ้าไม่จำกัด Top 5 จะกลายเป็น "
        "หลักสูตรเดียวกันห้าที่ ซึ่งไม่ใช่ทางเลือกให้ตัดสินใจ",
    ),
    "EFFICACY_DIM_FLOOR": (
        0.15,
        "น้ำหนักขั้นต่ำที่ถือว่าหลักสูตร 'ใช้' มิตินั้นจริง · ต่ำกว่านี้ไม่ถูกนับ "
        "เข้า efficacy เพราะเวกเตอร์สายมีค่าไม่เป็นศูนย์ทั้งหกมิติ การเฉลี่ยทั้งหก "
        "จะทำให้ทุกหลักสูตรได้ efficacy เท่ากันหมด",
    ),
    "CONTEXT_WEIGHTS": (
        {"access": 0.45, "cost_band": 0.30, "intake_room": 0.15, "sector_preference": 0.10},
        "น้ำหนักภายในบริบท · การเดินทางมาก่อนเพราะเป็นข้อจำกัดที่ตัดสินว่า "
        "ไปเรียนได้จริงไหม · จำนวนรับได้น้อยที่สุดเพราะเป็นสัญญาณอ่อนที่สุด "
        "(บอกว่ามีที่ว่างเท่าไร ไม่ได้บอกว่าสอบติดง่ายแค่ไหน) · "
        "ถ่วงน้ำหนักใหม่เฉพาะตัวที่มีข้อมูล",
    ),
    "MIN_ITEMS_PER_DIMENSION": (
        2,
        "จำนวนข้อขั้นต่ำต่อมิติก่อนที่ coverage จะถือว่าเต็ม · ตรงกับ "
        "Adaptive_Questionnaire/02-architecture.md §2.3",
    ),
    "DIFFERENTIATION_GATE": (
        0.20,
        "ค่าต่างระหว่างมิติสูงสุดกับต่ำสุดที่ต้องมี ก่อนจะจัดอันดับให้ได้ · "
        "differentiation เป็นดัชนีของ Holland (1997) เอง: โปรไฟล์ที่ทุกมิติ "
        "เท่ากันไม่ได้แปลว่า 'เข้าได้ทุกสาย' แต่แปลว่า 'ยังไม่รู้' · "
        "ค่า 0.20 เป็นการตัดสินใจออกแบบ ยังไม่ได้ calibrate กับข้อมูลจริง",
    ),
}

W_INTEREST = PARAMETERS["W_INTEREST"][0]
W_EFFICACY = PARAMETERS["W_EFFICACY"][0]
PRIOR_MEAN = PARAMETERS["PRIOR_MEAN"][0]
CORE_GATE = PARAMETERS["CORE_GATE"][0]
CONTEXT_MAX = PARAMETERS["CONTEXT_MAX"][0]
MAX_PER_INSTITUTION = PARAMETERS["MAX_PER_INSTITUTION"][0]
MAX_PER_FIELD = PARAMETERS["MAX_PER_FIELD"][0]
MIN_ITEMS_PER_DIM = PARAMETERS["MIN_ITEMS_PER_DIMENSION"][0]
DIFFERENTIATION_GATE = PARAMETERS["DIFFERENTIATION_GATE"][0]
SCALE_MIDPOINT = 3
EFFICACY_DIM_FLOOR = PARAMETERS["EFFICACY_DIM_FLOOR"][0]
CONTEXT_WEIGHTS = PARAMETERS["CONTEXT_WEIGHTS"][0]


# ---------------------------------------------------------------------------
# Step 1-4 · answers -> profile
# ---------------------------------------------------------------------------

@dataclass
class DimensionScore:
    dimension: str
    raw_mean: float           # theta_d  before shrinkage
    shrunk: float             # theta_hat_d
    n_items: int              # items asked in this dimension
    n_informative: int        # of those, how many were not the midpoint
    coverage: float
    consistency: float
    confidence: float
    item_ids: list[str] = field(default_factory=list)


def item_value(raw: int, direction: str | None) -> float:
    """Likert 1..5 -> 0..1, reflecting reverse-keyed items about the midpoint."""
    directed = (SCALE_MIN + SCALE_MAX - raw) if direction == "reverse" else raw
    return (directed - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)


def score_dimensions(answers: dict[str, int], items: list[dict]) -> dict[str, DimensionScore]:
    """Steps 1-3. Aggregate items into a shrunk score per RIASEC dimension.

    Only items with scoring == "dimension" move a dimension score. Context items
    (self-efficacy, experience, environment) are read elsewhere and can never
    move an interest score — invariant I10 of the simulation.

    ## A midpoint answer is not evidence

    03-branching-rules.md §3.2 already says a "3" does not count as evidence,
    and the 5,000-session simulation gives midpoint respondents a confidence of
    0.33 for exactly that reason. The first version of this function ignored
    that and scored a "3" as x = 0.5, which produced the worst failure the
    engine can have: a learner who answered 3 to all ninety items came out with
    consistency 1.00 (identical answers never disagree), confidence 1.00, and a
    confident Top 5. Undecided became certain.

    So the midpoint is counted as *asked* but not as *informative*: it fills no
    coverage and takes no part in the consistency or the mean.
    """
    by_dim: dict[str, list[tuple[str, float, bool]]] = {d: [] for d in DIMENSIONS}

    for item in items:
        if item.get("scoring") != "dimension":
            continue
        d = item.get("dimension")
        if d not in by_dim:
            continue
        raw = answers.get(item["id"])
        if raw is None or not (SCALE_MIN <= raw <= SCALE_MAX):
            continue
        informative = raw != SCALE_MIDPOINT or item.get("responseFormat") != "scale5"
        by_dim[d].append((item["id"], item_value(raw, item.get("direction")), informative))

    out: dict[str, DimensionScore] = {}
    for d, vals in by_dim.items():
        n = len(vals)
        informative = [(i, v) for i, v, ok in vals if ok]
        k = len(informative)

        if k == 0:
            # asked, but told nothing
            out[d] = DimensionScore(d, PRIOR_MEAN, PRIOR_MEAN, n, 0, 0.0, 0.0, 0.0,
                                    [i for i, _, _ in vals])
            continue

        xs = [v for _, v in informative]
        mean = sum(xs) / k

        # coverage — enough *informative* answers in this dimension
        coverage = min(1.0, k / MIN_ITEMS_PER_DIM)

        # consistency — do the answers within the dimension agree.
        # Mean absolute deviation, rescaled: MAD of 0 -> 1.0, MAD of 0.5 -> 0.0.
        # A single item cannot disagree with itself, so it is treated as neutral
        # (0.5) rather than perfectly consistent, which would let one answer
        # produce full confidence.
        if k == 1:
            consistency = 0.5
        else:
            mad = sum(abs(x - mean) for x in xs) / k
            consistency = max(0.0, 1.0 - 2.0 * mad)

        confidence = coverage * consistency

        # Step 3 · Kelley (1947) reliability shrinkage. A score we are not
        # confident in is pulled toward the prior in proportion to that lack of
        # confidence, so an unreliable extreme cannot out-rank a reliable
        # moderate one.
        shrunk = confidence * mean + (1 - confidence) * PRIOR_MEAN

        out[d] = DimensionScore(
            dimension=d, raw_mean=mean, shrunk=shrunk, n_items=n, n_informative=k,
            coverage=coverage, consistency=consistency, confidence=confidence,
            item_ids=[i for i, _ in informative],
        )
    return out


def efficacy_scores(answers: dict[str, int], items: list[dict]) -> dict[str, float | None]:
    """Self-efficacy per dimension, from the SCCT items. None where unasked."""
    out: dict[str, float | None] = {d: None for d in DIMENSIONS}
    for item in items:
        if item.get("probeType") != "self-efficacy":
            continue
        raw = answers.get(item["id"])
        d = item.get("dimension")
        if raw is None or d not in out:
            continue
        out[d] = item_value(raw, item.get("direction"))
    return out


# ---------------------------------------------------------------------------
# Step 5 · CORE FIT
# ---------------------------------------------------------------------------

def cosine(a: dict[str, float], b: dict[str, float]) -> float:
    dot = sum(a[d] * b.get(d, 0.0) for d in DIMENSIONS)
    na = math.sqrt(sum(a[d] ** 2 for d in DIMENSIONS))
    nb = math.sqrt(sum(b.get(d, 0.0) ** 2 for d in DIMENSIONS))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def programme_efficacy(prog_vec: dict[str, float], eff: dict[str, float | None]) -> tuple[float | None, list[str]]:
    """Efficacy relevant to a programme = weighted over the dimensions that
    programme actually loads on. Unanswered dimensions are dropped rather than
    imputed, and the caller is told which ones carried the number."""
    pairs = [(d, prog_vec.get(d, 0.0), eff[d]) for d in DIMENSIONS if eff[d] is not None]
    pairs = [(d, w, e) for d, w, e in pairs if w >= EFFICACY_DIM_FLOOR]
    if not pairs:
        return None, []
    total_w = sum(w for _, w, _ in pairs)
    if total_w == 0:
        return None, []
    value = sum(w * e for _, w, e in pairs) / total_w
    return value, [d for d, _, _ in pairs]


def quadrant(congruence: float, efficacy: float | None) -> str:
    """Dual matrix: interest x self-efficacy. Explanation only — never ranking.

    The burnout-risk cell is the reason this exists: a learner who is capable at
    something they dislike is the classic mis-advised case, and a single blended
    score hides it.
    """
    if efficacy is None:
        return "unknown-efficacy"
    hi_i, hi_e = congruence >= 0.80, efficacy >= 0.60
    if hi_i and hi_e:
        return "golden-fit"
    if hi_i and not hi_e:
        return "growth-area"
    if not hi_i and hi_e:
        return "burnout-risk"
    return "unfavourable"


# ---------------------------------------------------------------------------
# Step 7-8 · CONTEXT — computed separately and capped
# ---------------------------------------------------------------------------

@dataclass
class ContextResult:
    score: float | None
    known: dict[str, float]
    unknown: list[str]


def context_fit(programme: dict, student, access: dict) -> ContextResult:
    """Contextual fit in 0..1, over the sub-scores we hold real data for.

    Unknown sub-scores are *excluded from the mean and reported*, not imputed as
    0.5. Imputing a neutral value would let a programme with no cost data score
    the same as one verified affordable, which is the failure mode this whole
    project keeps arguing against.
    """
    known: dict[str, float] = {}
    unknown: list[str] = []

    # --- access: real OSRM road distance where the province file has it
    entry = access.get(programme["institution_id"])
    if entry is not None and entry.get("road_km") is not None:
        km = entry["road_km"]
        # Bands from Geography_and_Access/build/build_access.py — daily return
        # travel by someone who cannot drive a car.
        if km <= 3:
            known["access"] = 1.00
        elif km <= 10:
            known["access"] = 0.85
        elif km <= 30:
            known["access"] = 0.65
        elif km <= 80:
            known["access"] = 0.35
        else:
            known["access"] = 0.15
    elif programme["province_iso"] == student.province_iso:
        known["access"] = 0.60          # same province, distance not computed
    else:
        known["access"] = 0.10          # outside the commute set: relocation

    # --- admission: planned intake is the only admission signal we hold.
    # Larger published intake = more room, not "easier" — the wording matters
    # and the trace says so.
    seats = programme.get("seats_planned")
    if seats is None:
        unknown.append("seats_planned")
    else:
        known["intake_room"] = min(1.0, math.log10(max(seats, 1) + 1) / math.log10(301))

    # --- finance: we hold a sector band only, never a figure
    band = programme.get("tuition_band")
    if student.budget_band is None or band in (None, "unknown"):
        unknown.append("tuition")
    else:
        cheap = {"public", "rajabhat", "rajamangala"}
        mid = {"autonomous"}
        if student.budget_band == "tight":
            known["cost_band"] = 1.0 if band in cheap else (0.4 if band in mid else 0.1)
        elif student.budget_band == "moderate":
            known["cost_band"] = 1.0 if band in cheap | mid else 0.5
        else:
            known["cost_band"] = 1.0

    # --- stated preference on institution type
    if student.prefer_sector:
        known["sector_preference"] = 1.0 if band == student.prefer_sector else 0.3

    # tuition figure, TCAS round and required scores are absent for every
    # programme in the index — named once so the learner sees the gap
    unknown.extend(["tuition_baht", "tcas_round", "required_scores", "scholarships"])

    if not known:
        return ContextResult(None, known, sorted(set(unknown)))

    # Weighted mean over the sub-scores we hold, renormalised so a missing
    # sub-score redistributes its weight instead of counting as zero.
    total_w = sum(CONTEXT_WEIGHTS[k] for k in known)
    value = sum(CONTEXT_WEIGHTS[k] * v for k, v in known.items()) / total_w
    return ContextResult(value, known, sorted(set(unknown)))


# ---------------------------------------------------------------------------
# Student
# ---------------------------------------------------------------------------

@dataclass
class Student:
    label: str
    answers: dict[str, int]
    province_iso: str
    mobility: str = "unknown"          # local_only | can_move | unknown
    budget_band: str | None = None     # tight | moderate | flexible
    prefer_sector: str | None = None
    note: str = ""


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def load_bank() -> list[dict]:
    with open(BANK, encoding="utf-8") as fh:
        return json.load(fh)["items"]


def load_programmes() -> list[dict]:
    with open(PROGRAMMES, encoding="utf-8") as fh:
        return json.load(fh)["programmes"]


def load_access(province_iso: str) -> dict:
    path = os.path.join(GEO, "province_access", f"{province_iso}.json")
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as fh:
        return {o["id"]: o for o in json.load(fh)["options"]}


def recommend(student: Student, top_n: int = 5) -> dict:
    items = load_bank()
    programmes = load_programmes()
    access = load_access(student.province_iso)

    dims = score_dimensions(student.answers, items)
    eff = efficacy_scores(student.answers, items)
    profile = {d: dims[d].shrunk for d in DIMENSIONS}

    scored, rejected = [], []

    for p in programmes:
        congruence = cosine(profile, p["riasec"])
        e_val, e_dims = programme_efficacy(p["riasec"], eff)

        if e_val is None:
            core = 100 * congruence
            core_note = "interest only — ยังไม่ได้ถาม self-efficacy ในมิติที่หลักสูตรนี้ใช้"
        else:
            core = 100 * (W_INTEREST * congruence + W_EFFICACY * e_val)
            core_note = None

        # --- eligibility gate (hard)
        reasons = []
        if core < CORE_GATE:
            reasons.append("CORE_FIT_BELOW_GATE")
        if student.mobility == "local_only" and p["institution_id"] not in access:
            reasons.append("OUTSIDE_STATED_TRAVEL_RANGE")
        if reasons:
            rejected.append({"programme": p, "core": core, "reasons": reasons})
            continue

        ctx = context_fit(p, student, access)
        ctx_component = CONTEXT_MAX * (ctx.score if ctx.score is not None else 0.0)
        final = core + ctx_component

        scored.append({
            "programme": p,
            "congruence": congruence,
            "efficacy": e_val,
            "efficacy_dims": e_dims,
            "core": core,
            "core_note": core_note,
            "quadrant": quadrant(congruence, e_val),
            "context": ctx,
            "context_component": ctx_component,
            "final": final,
        })

    scored.sort(key=lambda r: (-r["final"], r["programme"]["programme_id"]))

    # Step 9 · diversity caps.
    #
    # Two caps, for two different reasons. Per institution, so the list is a
    # set of choices rather than one university's brochure. Per route, because
    # CoreFit resolves at route level — every programme in a route shares one
    # RIASEC vector, so without this cap the whole Top 5 is the same field five
    # times and the ordering inside it is being done entirely by context, which
    # is exactly what CONTEXT_MAX exists to prevent.
    top, per_inst, per_field = [], {}, {}
    for row in scored:
        inst = row["programme"]["institution_id"]
        key = row["programme"]["isced"]
        if per_inst.get(inst, 0) >= MAX_PER_INSTITUTION:
            continue
        if per_field.get(key, 0) >= MAX_PER_FIELD:
            continue
        per_inst[inst] = per_inst.get(inst, 0) + 1
        per_field[key] = per_field.get(key, 0) + 1
        top.append(row)
        if len(top) == top_n:
            break

    # Field-level ranking — the layer CoreFit actually discriminates at, and
    # therefore the honest headline. The programme list below it answers
    # "where can I do this", not "which is academically better".
    fields: dict[str, dict] = {}
    for row in scored:
        key = row["programme"]["isced"]
        f = fields.setdefault(key, {"isced": key,
                                    "title": row["programme"]["isced_title"],
                                    "core": row["core"],
                                    "congruence": row["congruence"],
                                    "quadrant": row["quadrant"], "n": 0})
        f["n"] += 1
    field_ranking = sorted(fields.values(), key=lambda f: -f["core"])

    weakest_dim = min(DIMENSIONS, key=lambda d: dims[d].confidence)
    overall_conf = sum(dims[d].confidence for d in DIMENSIONS) / len(DIMENSIONS)

    # Holland (1997) differentiation: highest dimension minus lowest. A flat
    # profile is not "fits everything" — it is "we have not found out yet", and
    # cosine similarity cannot tell the two apart, because a flat all-positive
    # vector sits at a high angle-similarity to every route vector at once.
    # Without this gate the undecided learner gets the most confident-looking
    # recommendations in the whole system.
    differentiation = max(profile.values()) - min(profile.values())

    blockers = []
    if overall_conf < 0.50:
        blockers.append("LOW_CONFIDENCE")
    if differentiation < DIFFERENTIATION_GATE:
        blockers.append("UNDIFFERENTIATED_PROFILE")

    total_asked = sum(dims[d].n_items for d in DIMENSIONS)
    total_informative = sum(dims[d].n_informative for d in DIMENSIONS)

    return {
        "student": student,
        "dimensions": dims,
        "efficacy": eff,
        "profile": profile,
        "top": top,
        "field_ranking": field_ranking,
        "candidates": len(scored),
        "rejected": len(rejected),
        "overall_confidence": overall_conf,
        "weakest_dimension": weakest_dim,
        "differentiation": differentiation,
        "answers_asked": total_asked,
        "answers_informative": total_informative,
        "blockers": blockers,
        # The engine declines rather than guesses. This mirrors the stopping
        # rule in the adaptive questionnaire: low confidence is a reason to ask
        # more, never a reason to answer anyway.
        "confident_enough": not blockers,
    }
