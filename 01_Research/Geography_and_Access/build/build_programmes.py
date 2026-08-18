#!/usr/bin/env python3
"""Which routes an institution actually runs a programme in.

Until now a route was matched to a place by what the place *is*: every
university in a province appeared under the engineering route because
universities generally teach engineering. Generally is not always — fifty-nine
of the degree institutions here run no health programme at all, and every one of
them was being offered to a learner asking where they could study health care.

MHESI publishes each institution's programmes with its admission plan, so for
those institutions the guess can be replaced with the fact.

## The coverage is uneven, and that decides how it is used

188 institutions appear in the admission plan and all of them award degrees.
None of the 1,013 vocational colleges do — the MHESI admission plan does not
reach them.

That is a fact about *this* register, and it was read for a while as "สอศ. does
not publish programmes per college", which is false. ckan.vec.go.th publishes
`current_student`: enrolment by college, level and สาขางาน, as open CSV, and a
college with sixteen first-year accounting students demonstrably teaches
accounting. See 01_Research/Recommendation_Engine/VOCATIONAL_TRACK.md.

So this is used to *remove* wrong matches, never to display detail. Showing "89
programmes" under a university and nothing under a technical college would read
as the college being less documented, when the difference is only in what
happens to be published, and the vocational learner is the one this project is
mostly for. The learner sees a shorter, more accurate list and no badge.

Institutions with no entry here keep the name-based inference. That is stated in
the consuming code rather than left to be discovered.
"""
import collections
import csv
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
SOURCE = os.path.join(HERE, "admission_plan.csv")

# Levels a learner leaving school could enter. Master's and doctoral programmes
# say nothing about whether a fifteen-year-old could study the subject there.
ENTRY_LEVELS = {"ปริญญาตรี", "อนุปริญญา"}

# Subject words as they appear in Thai programme titles. Matched against the
# programme name, which is where the subject actually lives — the level and the
# institution are separate columns.
ROUTE_SUBJECTS = {
    "sci-math-engineering":
        r"วิศวกรรม|วิทยาศาสตร|คณิตศาสตร|ฟิสิกส|เคมี|ชีววิทยา|สถิติ|เทคโนโลยีอุตสาหกรร",
    "vocational-digital":
        r"คอมพิวเตอร|เทคโนโลยีสารสนเทศ|ซอฟต์แวร|ดิจิทัล|สารสนเทศ|วิทยาการข้อมูล|ปัญญาประดิษฐ",
    "arts-design":
        r"ศิลป|ออกแบบ|นิเทศศาสตร|ดุริยางค|นาฏศิลป|ดนตรี|สถาปัตย|นฤมิต",
    "business-admin":
        r"บริหารธุรกิจ|บัญชี|การตลาด|เศรษฐศาสตร|การจัดการ|โลจิสติกส|การเงิน",
    "health-care":
        r"แพทยศาสตร|พยาบาล|เภสัช|สาธารณสุข|ทันตแพทย|กายภาพบำบัด|เทคนิคการแพทย|สหเวช",
    # Added with the expanded catalogue. Only the degree-level routes appear
    # here — the register covers no vocational college, so the vocational four
    # keep the kind-based inference by design.
    "university-ai-data":
        r"วิทยาการข้อมูล|ปัญญาประดิษฐ|วิทยาการคอมพิวเตอร|วิศวกรรมคอมพิวเตอร|สถิติประยุกต",
    "university-medtech-rehab":
        r"เทคนิคการแพทย|กายภาพบำบัด|กิจกรรมบำบัด|รังสีเทคนิค|สหเวชศาสตร",
    "university-digital-comm":
        r"นิเทศศาสตร|วารสารศาสตร|สื่อสารมวลชน|ดิจิทัลมีเดีย|ภาพยนตร",
}

# dve-dual is absent on purpose. Work-based study is a vocational arrangement and
# the degree register has nothing to say about it; leaving it out means those
# matches keep the name-based inference rather than being wrongly emptied.

PATTERNS = {route: re.compile(pattern) for route, pattern in ROUTE_SUBJECTS.items()}


def main() -> None:
    with open(SOURCE, encoding="utf-8-sig") as fh:
        rows = [row for row in csv.DictReader(fh)
                if row["LEV_NAME_TH"].strip() in ENTRY_LEVELS]

    runs: dict[str, set] = collections.defaultdict(set)
    counted = collections.Counter()
    for row in rows:
        name = row["CURR_NAME"]
        institution = row["UNIV_NAME_TH"].strip()
        for route, pattern in PATTERNS.items():
            if pattern.search(name):
                runs[institution].add(route)
                counted[route] += 1

    payload = {
        "_note": ("Which routes each degree-awarding institution actually runs an "
                  "entry-level programme in. Absent institutions — every vocational "
                  "college — are not covered by this source and keep the name-based "
                  "inference."),
        "_source": "data.go.th dqe_11_01 (แผนการรับนักศึกษาของแต่ละหลักสูตร)",
        "_retrieved": "2026-08-06",
        "_levels": sorted(ENTRY_LEVELS),
        "institutions": {name: sorted(routes) for name, routes in sorted(runs.items())},
    }

    with open(os.path.join(DATA, "programme_routes.json"), "w") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    print(f"entry-level programmes read: {len(rows)}")
    print(f"institutions with at least one matched route: {len(runs)}")
    for route, count in counted.most_common():
        institutions = sum(1 for routes in runs.values() if route in routes)
        print(f"  {institutions:>4} institutions · {count:>5} programmes · {route}")


if __name__ == "__main__":
    main()
