#!/usr/bin/env python3
"""Replace the twelve hand-assigned route vectors with measured ones.

Until now a programme's RIASEC vector came from one of twelve route weight
vectors the team wrote by hand. They are the weakest link in the whole
explanation: a judge asking "why is engineering I=0.4 and not 0.5?" gets
"we chose it".

O*NET publishes RIASEC profiles for 923 occupations, *measured*, on the
Occupational Interest scale. The Thai curriculum register classifies every
programme with an ISCED-F 2013 field code. So the chain becomes

    Thai programme  →  ISCED-F detailed field  →  a set of O*NET occupations
                    →  their mean RIASEC profile

and only one link in it is a judgement: which occupations belong to a field.
That judgement is written below as explicit title patterns, and every run
prints what each pattern actually matched, so it can be argued with. The
numbers themselves are nobody's opinion.

## Honest status of this mapping

`ISCED_TO_ONET` is **researcher-authored and unreviewed**. It is a better
class of assumption than the vectors it replaces — the association is legible
and the values are measured — but it is not validated. It should go to a
careers counsellor for review, and the emitted `crosswalk_audit.md` exists to
make that review possible.

Sources
  O*NET 29.1 database (Interests.txt, Occupation Data.txt), US DOL/ETA,
    CC BY 4.0 — https://www.onetcenter.org/database.html
  univ_cur_11_01 หลักสูตรที่เปิดสอนในระดับอุดมศึกษา, MHESI open data
  ISCED-F 2013 field titles, UNESCO UIS
"""
import collections
import csv
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "data")
ONET = os.environ.get("ONET_DIR", os.path.join(HERE, "onet"))
CURRICULUM_CSV = os.environ.get("ISCED_CSV", os.path.join(HERE, "univ_cur_11_01.csv"))

DIMENSIONS = ["R", "I", "A", "S", "E", "C"]
ONET_ELEMENT = {
    "Realistic": "R", "Investigative": "I", "Artistic": "A",
    "Social": "S", "Enterprising": "E", "Conventional": "C",
}

# ISCED-F 2013 detailed field titles, from the published code list.
ISCED_TITLES = {
    "0111": "Education science", "0112": "Training for pre-school teachers",
    "0113": "Teacher training without subject specialisation",
    "0114": "Teacher training with subject specialisation",
    "0110": "Education not further defined", "0119": "Education n.e.c.",
    "0211": "Audio-visual techniques and media production",
    "0212": "Fashion, interior and industrial design", "0213": "Fine arts",
    "0214": "Handicrafts", "0215": "Music and performing arts",
    "0210": "Arts not further defined", "0219": "Arts n.e.c.",
    "0221": "Religion and theology", "0222": "History and archaeology",
    "0223": "Philosophy and ethics",
    "0231": "Language acquisition", "0232": "Literature and linguistics",
    "0230": "Languages not further defined",
    "0311": "Economics", "0312": "Political sciences and civics",
    "0313": "Psychology", "0314": "Sociology and cultural studies",
    "0310": "Social and behavioural studies not further defined",
    "0321": "Journalism and reporting",
    "0322": "Library, information and archival studies",
    "0411": "Accounting and taxation", "0412": "Finance, banking and insurance",
    "0413": "Management and administration", "0414": "Marketing and advertising",
    "0415": "Secretarial and office work", "0416": "Wholesale and retail sales",
    "0417": "Work skills", "0410": "Business and administration n.f.d.",
    "0421": "Law",
    "0511": "Biology", "0512": "Biochemistry", "0521": "Environmental sciences",
    "0522": "Natural environments and wildlife", "0531": "Chemistry",
    "0532": "Earth sciences", "0533": "Physics", "0541": "Mathematics",
    "0542": "Statistics",
    "0611": "Computer use",
    "0612": "Database and network design and administration",
    "0613": "Software and applications development and analysis",
    "0610": "ICTs not further defined", "0619": "ICTs n.e.c.",
    "0711": "Chemical engineering and processes",
    "0712": "Environmental protection technology",
    "0713": "Electricity and energy", "0714": "Electronics and automation",
    "0715": "Mechanics and metal trades",
    "0716": "Motor vehicles, ships and aircraft",
    "0710": "Engineering and engineering trades n.f.d.",
    "0719": "Engineering and engineering trades n.e.c.",
    "0721": "Food processing", "0722": "Materials (glass, paper, plastic, wood)",
    "0723": "Textiles (clothes, footwear and leather)",
    "0724": "Mining and extraction", "0720": "Manufacturing and processing n.f.d.",
    "0731": "Architecture and town planning", "0732": "Building and civil engineering",
    "0811": "Crop and livestock production", "0812": "Horticulture",
    "0810": "Agriculture not further defined",
    "0821": "Forestry", "0831": "Fisheries", "0841": "Veterinary",
    "0911": "Dental studies", "0912": "Medicine", "0913": "Nursing and midwifery",
    "0914": "Medical diagnostic and treatment technology",
    "0915": "Therapy and rehabilitation", "0916": "Pharmacy",
    "0917": "Traditional and complementary medicine and therapy",
    "0910": "Health not further defined", "0919": "Health n.e.c.",
    "0921": "Care of elderly and of disabled adults",
    "0922": "Child care and youth services", "0923": "Social work and counselling",
    "1011": "Domestic services", "1012": "Hair and beauty services",
    "1013": "Hotel, restaurants and catering", "1014": "Sports",
    "1015": "Travel, tourism and leisure", "1010": "Personal services n.f.d.",
    "1021": "Community sanitation", "1022": "Occupational health and safety",
    "1031": "Military and defence", "1032": "Protection of persons and property",
    "1041": "Transport services",
}

# The one judgement in the chain: which O*NET occupations represent a field.
# Patterns are matched case-insensitively against the O*NET occupation title.
# Every match is printed by the audit, so a reviewer can see and change them.
ISCED_TO_ONET = {
    "0111": r"\beducation\b.*\b(administrator|researcher)|instructional coordinator",
    "0112": r"preschool teacher|kindergarten teacher|childcare worker",
    "0113": r"elementary school teacher|teaching assistant",
    "0114": r"(secondary|middle) school teacher|career/technical education teacher|special education teacher",
    "0110": r"teacher|instructional coordinator", "0119": r"teacher",
    "0211": r"(film|video|audio|broadcast|camera|sound) (editor|operator|technician|engineer)|producer|media programming|photographer",
    "0212": r"(fashion|interior|industrial|commercial|graphic) designer|set and exhibit designer",
    "0213": r"fine artist|craft artist|art director|sculptor|painter, ",
    "0214": r"craft artist|jeweler|potter",
    "0215": r"musician|singer|dancer|choreographer|music director|actor",
    "0210": r"designer|artist", "0219": r"designer|artist",
    "0221": r"clergy|director, religious|religious worker",
    "0222": r"historian|archeologist|archivist|curator|anthropolog",
    "0223": r"philosophy and religion teacher",
    "0231": r"interpreter and translator|foreign language and literature teacher",
    "0232": r"english language and literature teacher|writer|editor|interpreter",
    "0230": r"interpreter and translator",
    "0311": r"economist|economics teacher|financial analyst",
    "0312": r"political scientist|political science teacher|urban and regional planner|legislator",
    "0313": r"psycholog", "0314": r"sociolog|anthropolog|social science research",
    "0310": r"social scientist|sociolog",
    "0321": r"news analyst|reporter|journalis|editor|broadcast announcer|public relations specialist",
    "0322": r"librarian|library technician|archivist|information scientist",
    "0411": r"accountant|auditor|bookkeeping|tax preparer|tax examiner",
    "0412": r"financial (analyst|manager|examiner|risk)|credit analyst|insurance underwriter|loan officer|actuar|securities",
    "0413": r"general and operations manager|management analyst|administrative services|human resources|operations research|project management specialist|business operations",
    "0414": r"marketing (manager|specialist)|advertising|market research analyst|sales manager|public relations manager",
    "0415": r"secretar|administrative assistant|office clerk",
    "0416": r"retail salesperson|first-line supervisors of retail|wholesale|sales representative",
    "0417": r"training and development", "0410": r"general and operations manager|management analyst",
    "0421": r"lawyer|judge|judicial law clerk|paralegal|arbitrator|administrative law",
    "0511": r"biolog|microbiolog|zoolog|botan|geneticist",
    "0512": r"biochemist|biophysicist|medical scientist",
    "0521": r"environmental scientist|environmental engineer|conservation scientist|environmental science teacher",
    "0522": r"wildlife|forest and conservation|park naturalist|conservation scientist|zoolog",
    "0531": r"chemist|chemistry teacher|materials scientist",
    "0532": r"geoscientist|geolog|hydrolog|atmospheric|geographer",
    "0533": r"physicist|astronom|physics teacher",
    "0541": r"mathematic", "0542": r"statistic|data scientist",
    "0611": r"computer user support|computer operator|desktop publisher",
    "0612": r"database (administrator|architect)|network (architect|administrator|support)|information security",
    "0613": r"software developer|software quality assurance|web developer|computer programmer|computer systems analyst|computer and information research",
    "0610": r"computer (occupations|systems analyst)|information technology project",
    "0619": r"computer occupations",
    "0711": r"chemical engineer|chemical technician|chemical plant",
    "0712": r"environmental engineer|environmental (science and protection )?technician|water/wastewater",
    "0713": r"electrical engineer|electrical power-line|power plant operator|energy engineer|electrician",
    "0714": r"electronics engineer|electrical and electronic|robotics|automation|control and valve|instrument",
    "0715": r"mechanical engineer|machinist|welder|tool and die|industrial machinery mechanic|millwright|sheet metal",
    "0716": r"automotive|aircraft mechanic|aerospace engineer|marine engineer|motorboat|bus and truck mechanic|avionics",
    "0710": r"engineer", "0719": r"engineer",
    "0721": r"food scien|food batchmaker|food processing|baker|butcher|agricultural inspector",
    "0722": r"materials engineer|woodworking|paper goods|plastic|glass|molders",
    "0723": r"textile|sewing machine|shoe|tailor|upholster",
    "0724": r"mining|petroleum engineer|extraction|rock splitter|derrick",
    "0720": r"industrial engineer|production, planning|manufacturing",
    "0731": r"architect|urban and regional planner|architectural and civil drafter|landscape architect",
    "0732": r"civil engineer|construction manager|surveyor|construction and building inspector|civil engineering technolog",
    "0811": r"farmer|agricultural (engineer|technician|inspector|worker)|animal scientist|soil and plant scientist|crop|livestock",
    "0812": r"nursery|greenhouse|landscaping|horticultur|floral designer|tree trimmer",
    "0810": r"farmer|agricultural",
    "0821": r"forest|logging|conservation scientist",
    "0831": r"fish|aquacultur|marine biolog|water transportation",
    "0841": r"veterinar",
    "0911": r"dentist|dental (hygienist|assistant|laboratory)|oral",
    "0912": r"physician|surgeon|internist|pediatrician|anesthesiolog|family medicine|emergency medicine",
    "0913": r"registered nurse|nurse practitioner|nurse midwi|nursing assistant|licensed practical",
    "0914": r"medical and clinical laboratory|radiologic technolog|diagnostic medical sonograph|magnetic resonance|nuclear medicine|cardiovascular technolog",
    "0915": r"physical therapist|occupational therapist|speech-language|respiratory therapist|recreational therapist|athletic trainer|massage therapist",
    "0916": r"pharmacist|pharmacy technician|pharmacy aide",
    "0917": r"acupuncturist|massage therapist|naturopathic|健康",
    "0910": r"healthcare|health (specialties|technologist|diagnosing)|medical",
    "0919": r"healthcare",
    "0921": r"home health|personal care aide|nursing assistant|orderly",
    "0922": r"childcare worker|preschool teacher|social and human service|recreation worker",
    "0923": r"social worker|counselor|community health worker|social and human service assistant|probation officer",
    "1011": r"maid|housekeeping|janitor",
    "1012": r"hairdresser|barber|skincare|manicurist|cosmetolog",
    "1013": r"chef|cook|food service manager|lodging manager|bartender|waiter|hotel",
    "1014": r"athlete|coach|scout|umpire|fitness trainer|exercise physiolog|recreation worker",
    "1015": r"travel (agent|guide)|tour guide|reservation and transportation|meeting, convention|concierge|flight attendant|lodging manager",
    "1010": r"personal (care|service)",
    "1021": r"sanitation|refuse|septic|water treatment|hazardous materials removal",
    "1022": r"occupational health and safety|safety engineer|industrial hygien|fire inspector",
    "1031": r"military|first-line supervisors of (police|fire)",
    "1032": r"police|security guard|firefighter|detective|correctional officer|private detective",
    "1041": r"pilot|air traffic|ship|captain|locomotive|railroad|truck driver|transportation (manager|inspector)|logistician|cargo|dispatcher",
}


# Thirteen fields matched too few occupations for a pattern to be trusted — one
# in the case of Language acquisition, which 411 programmes then rested on. For
# these the occupations are named outright rather than inferred from a title
# pattern, because at this size a single wrong match moves the whole vector.
#
# Tested and rejected first: matching against O*NET's 55,120 alternate titles.
# It widens the net and ruins it — "Arts" then pulls in Software Developers,
# Database Architects and Blockchain Engineers through their alternate titles,
# and the field flips from Artistic 0.83 to Realistic 0.63. More data was worse
# data. The precision of the primary title is what makes these vectors sharp.
ISCED_TO_ONET_EXPLICIT = {
    "0231": [  # Language acquisition
        "Interpreters and Translators",
        "Foreign Language and Literature Teachers, Postsecondary",
        "English Language and Literature Teachers, Postsecondary",
        "Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors",
    ],
    "0610": [  # ICTs not further defined
        "Computer Systems Analysts", "Computer Programmers",
        "Computer User Support Specialists", "Computer Network Support Specialists",
        "Computer and Information Systems Managers", "Software Developers",
    ],
    "0611": [  # Computer use — end-user and office computing, not development
        "Computer User Support Specialists", "Computer Network Support Specialists",
        "Data Entry Keyers", "Desktop Publishers", "Word Processors and Typists",
    ],
    "0541": [  # Mathematics
        "Mathematicians", "Mathematical Science Teachers, Postsecondary",
        "Statisticians", "Actuaries", "Operations Research Analysts",
        "Data Scientists",
    ],
    "0410": [  # Business and administration not further defined
        "General and Operations Managers", "Management Analysts",
        "Administrative Services Managers", "Business Teachers, Postsecondary",
        "Project Management Specialists", "Business Intelligence Analysts",
    ],
    "0512": [  # Biochemistry
        "Biochemists and Biophysicists", "Medical Scientists, Except Epidemiologists",
        "Microbiologists", "Chemists",
    ],
    "0221": [  # Religion and theology
        "Clergy", "Directors, Religious Activities and Education",
        "Philosophy and Religion Teachers, Postsecondary",
    ],
    "0919": [  # Health not elsewhere classified
        "Health Education Specialists", "Community Health Workers",
        "Health Specialties Teachers, Postsecondary", "Healthcare Social Workers",
        "Health Informatics Specialists",
        "Health Information Technologists and Medical Registrars",
    ],
    # O*NET has no philosopher. Two occupations is all the taxonomy offers, and
    # that is a limit of the source rather than of this mapping.
    "0223": ["Philosophy and Religion Teachers, Postsecondary", "Sociologists"],
    "0310": [  # Social and behavioural studies not further defined
        "Sociologists", "Political Scientists", "Anthropologists and Archeologists",
        "Survey Researchers", "Social Science Research Assistants",
    ],
    # The two military occupations in O*NET carry no interest profile, so this
    # rests on the adjacent uniformed services. One programme depends on it.
    "1031": ["First-Line Supervisors of Police and Detectives",
             "Emergency Management Directors"],
}


def read_tsv(path):
    with open(path, encoding="utf-8") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))


def compile_pattern(pattern: str) -> re.Pattern:
    """Anchor every alternative to a word start.

    Without this, `actor` matched Farm Labor Contractors, Human Factors
    Engineers, Nuclear Power Reactor Operators, Chiropractors, Abstractors and
    Tractor-Trailer Truck Drivers — so "Music and performing arts" came out
    R 0.59 / A 0.40, with lorry drivers in the average.

    Only the *start* is anchored. Several patterns are deliberate prefixes —
    `biolog` is meant to reach biologist and biology — and closing the end
    would silently break them.
    """
    parts = []
    for alt in pattern.split("|"):
        parts.append(alt if alt.startswith(("\\b", "(", "^")) else r"\b" + alt)
    return re.compile("|".join(parts), re.I)


def main():
    interests = read_tsv(os.path.join(ONET, "Interests.txt"))
    occupations = {r["O*NET-SOC Code"]: r["Title"]
                   for r in read_tsv(os.path.join(ONET, "Occupation Data.txt"))}

    # RIASEC per occupation, on the Occupational Interest scale (1..7).
    profiles = collections.defaultdict(dict)
    for row in interests:
        if row["Scale ID"] != "OI":
            continue
        d = ONET_ELEMENT.get(row["Element Name"])
        if d:
            profiles[row["O*NET-SOC Code"]][d] = float(row["Data Value"])
    profiles = {k: v for k, v in profiles.items() if len(v) == 6}

    by_title = {title: soc for soc, title in occupations.items()}

    vectors, counts, examples, audit, unmapped = {}, {}, {}, [], []
    for code, pattern in sorted(ISCED_TO_ONET.items()):
        named = ISCED_TO_ONET_EXPLICIT.get(code)
        if named:
            missing = [t for t in named if by_title.get(t) not in profiles]
            if missing:
                raise SystemExit(
                    f"{code}: named occupations absent or without an interest "
                    f"profile: {missing}")
            matched = [(by_title[t], t) for t in named]
        else:
            rx = compile_pattern(pattern)
            matched = [(soc, title) for soc, title in occupations.items()
                       if soc in profiles and rx.search(title)]
        if not matched:
            unmapped.append(code)
            continue
        # Mean over matched occupations, then rescaled from the 1..7 OI scale
        # to 0..1 so it is comparable with a learner's profile.
        mean = {d: sum(profiles[soc][d] for soc, _ in matched) / len(matched)
                for d in DIMENSIONS}
        vectors[code] = {d: round((mean[d] - 1) / 6, 4) for d in DIMENSIONS}
        # How many occupations the mean rests on. A field averaged from one
        # occupation is not wrong, but it is thin, and a reader ranking on it
        # deserves to see that rather than infer it.
        counts[code] = len(matched)
        # A few example titles travel with the field so the app can show
        # what the vector was averaged from, not only the number.
        examples[code] = [t for _, t in matched[:4]]
        audit.append((code, ISCED_TITLES.get(code, "?"), matched, vectors[code]))

    # How much of the Thai bachelor register this now reaches
    raw = open(CURRICULUM_CSV, "rb").read().decode("utf-8-sig", errors="replace")
    rows = [r for r in csv.DictReader(io.StringIO(raw))
            if r["LEVEL_DESC"].strip() == "ปริญญาตรี" and r.get("ISCED_2013")]
    detailed = [r["ISCED_2013"].split("-")[-1] for r in rows]
    covered = sum(1 for d in detailed if d in vectors)

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "isced_riasec.json"), "w", encoding="utf-8") as fh:
        json.dump({
            "meta": {
                "generatedBy": "build/build_isced_riasec.py",
                "riasecSource": "O*NET 29.1 Interests.txt, Occupational Interest (OI) scale, "
                                "US DOL/ETA, CC BY 4.0",
                "fieldSource": "ISCED-F 2013 detailed fields, UNESCO UIS",
                "scale": "rescaled from the O*NET 1..7 OI scale to 0..1",
                "status": "ISCED→O*NET association is researcher-authored and NOT reviewed; "
                          "the RIASEC values themselves are measured, not assigned",
                "review": "build/crosswalk_audit.md lists every occupation each field matched",
                "fieldsMapped": len(vectors),
                "bachelorRowsCovered": covered,
                "bachelorRowsTotal": len(rows),
            },
            "titles": {c: ISCED_TITLES.get(c, "?") for c in vectors},
            "occupations": counts,
            "examples": examples,
            "vectors": vectors,
        }, fh, ensure_ascii=False, indent=1)

    with open(os.path.join(HERE, "crosswalk_audit.md"), "w", encoding="utf-8") as fh:
        fh.write("# ISCED-F 2013 → O*NET crosswalk · every match, for review\n\n")
        fh.write("The RIASEC numbers are measured (O\\*NET 29.1, Occupational Interest "
                 "scale, rescaled to 0..1). **Which occupations belong to a field is a "
                 "judgement made by this project and has not been reviewed.** Each row "
                 "below shows exactly what was matched so it can be corrected.\n\n")
        for code, title, matched, vec in audit:
            named = " · named explicitly" if code in ISCED_TO_ONET_EXPLICIT else ""
            fh.write(f"## {code} · {title}{named}\n\n")
            fh.write("`" + "` · `".join(f"{d} {vec[d]:.2f}" for d in DIMENSIONS) + "`\n\n")
            fh.write(f"{len(matched)} occupations: ")
            fh.write(", ".join(t for _, t in matched[:12]))
            if len(matched) > 12:
                fh.write(f", …and {len(matched) - 12} more")
            fh.write("\n\n")

    print(f"occupations with a full RIASEC profile   {len(profiles)}")
    print(f"ISCED fields mapped                      {len(vectors)} / {len(ISCED_TO_ONET)}")
    if unmapped:
        print(f"  no occupation matched                  {', '.join(unmapped)}")
    print(f"bachelor programmes reachable            {covered} / {len(rows)} "
          f"({covered / len(rows) * 100:.1f}%)")
    thin = [(c, len(m)) for c, _, m, _ in audit if len(m) < 3]
    if thin:
        print(f"  fields resting on <3 occupations       "
              f"{', '.join(f'{c}({n})' for c, n in thin)}")


if __name__ == "__main__":
    main()
