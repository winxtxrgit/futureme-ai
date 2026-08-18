#!/usr/bin/env python3
"""Build and validate 01_Research/Adaptive_Questionnaire/bank/items.json.

The bank is generated rather than hand-edited so that the 30 metadata fields stay
consistent across 90 items, and so the 17 machine-checkable rules in SCHEMA.md §5
run as assertions on every build.

    python3 build.py            # write items.json, then validate it
    python3 build.py --check    # validate the existing items.json only

Item text is the payload; everything else in this file is bookkeeping.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "items.json"

# --------------------------------------------------------------------------
# facets — 30, five per dimension. Descriptions mirror SCHEMA.md §4.
# --------------------------------------------------------------------------

FACETS = {
    "R.hardware": ("ต่อ ซ่อม ประกอบอุปกรณ์และวงจร", "Assembling, repairing and wiring equipment"),
    "R.machine": ("เดินเครื่อง ควบคุมเครื่องจักร", "Operating and controlling machinery"),
    "R.outdoor": ("งานนอกอาคาร ธรรมชาติ เกษตร", "Outdoor, agricultural and environmental work"),
    "R.build": ("ก่อสร้าง ประกอบโครงสร้าง", "Building and fabricating structures"),
    "R.body": ("ใช้ร่างกาย ความคล่องแคล่ว ความปลอดภัย", "Physical work, agility and safety"),
    "I.data": ("ดูตัวเลขหาแบบแผน", "Finding patterns in numbers"),
    "I.diagnose": ("หาสาเหตุของปัญหา", "Working out why something fails"),
    "I.experiment": ("ตั้งสมมติฐาน ทดลอง", "Hypothesising and experimenting"),
    "I.theory": ("คิดเชิงนามธรรม คณิตศาสตร์", "Abstract and mathematical reasoning"),
    "I.research": ("สืบค้นเอกสาร รวบรวมความรู้", "Literature search and knowledge gathering"),
    "A.visual": ("วาด ออกแบบภาพ", "Drawing and visual design"),
    "A.digital": ("ออกแบบสื่อดิจิทัล UI ตัดต่อ", "Digital media, UI and editing"),
    "A.perform": ("แสดง ดนตรี เต้น", "Performing, music and dance"),
    "A.write": ("เขียน เล่าเรื่อง", "Writing and storytelling"),
    "A.craft": ("งานฝีมือ ประดิษฐ์ของสวย", "Craft and applied making"),
    "S.teach": ("อธิบาย สอน ทำให้คนเข้าใจ", "Explaining and teaching"),
    "S.care": ("ดูแลร่างกายและสุขภาพผู้อื่น", "Physical and health care of others"),
    "S.counsel": ("รับฟัง ให้คำปรึกษา", "Listening and counselling"),
    "S.community": ("งานชุมชน อาสา พัฒนาสังคม", "Community and volunteer work"),
    "S.facilitate": ("ประสานคน ทำให้ทีมเดินได้", "Coordinating people and teams"),
    "E.persuade": ("ขาย โน้มน้าว", "Selling and persuading"),
    "E.lead": ("นำทีม ตัดสินใจ", "Leading and deciding"),
    "E.venture": ("ริเริ่มธุรกิจ รับความเสี่ยง", "Starting ventures and taking risk"),
    "E.present": ("พูดต่อหน้าคน นำเสนอ", "Public speaking and presenting"),
    "E.negotiate": ("เจรจา ต่อรอง หาข้อตกลง", "Negotiating and reaching agreement"),
    "C.organise": ("จัดของ จัดระบบให้เป็นระเบียบ", "Organising things into systems"),
    "C.verify": ("ตรวจความถูกต้อง ตัวเลข บัญชี", "Checking accuracy, figures, accounts"),
    "C.procedure": ("ทำตามขั้นตอนและมาตรฐาน", "Following procedures and standards"),
    "C.record": ("บันทึก จัดเก็บเอกสารและข้อมูล", "Recording and filing information"),
    "C.schedule": ("วางแผนเวลา ตารางงาน", "Planning time and schedules"),
}

ALL_TIERS = ["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"]

# --------------------------------------------------------------------------
# scales
# --------------------------------------------------------------------------

SCALES = {
    # Identical in values and wording to 03_WebApp/Pre_Present/data/questions.json
    # so items move into the app without a scale conversion.
    "scale5-preference": {
        "kind": "preference",
        "points": [
            {"value": 1, "label": {"en": "Strongly dislike", "th": "ไม่ชอบอย่างยิ่ง"}},
            {"value": 2, "label": {"en": "Dislike", "th": "ไม่ชอบ"}},
            {"value": 3, "label": {"en": "Not sure", "th": "ไม่แน่ใจ"}},
            {"value": 4, "label": {"en": "Like", "th": "ชอบ"}},
            {"value": 5, "label": {"en": "Strongly like", "th": "ชอบอย่างยิ่ง"}},
        ],
    },
    # Self-efficacy is confidence, not preference. Putting it on the like/dislike
    # scale would make "ชอบอย่างยิ่ง" mean "I can do this", which is the exact
    # interest/ability conflation the psychometric review flagged as a high-severity
    # error. It therefore gets its own scale, and never enters a dimension score.
    "scale5-confidence": {
        "kind": "confidence",
        "points": [
            {"value": 1, "label": {"en": "I could not do this yet", "th": "ยังทำไม่ได้เลย"}},
            {"value": 2, "label": {"en": "A little", "th": "ทำได้เล็กน้อย"}},
            {"value": 3, "label": {"en": "Not sure", "th": "ไม่แน่ใจ"}},
            {"value": 4, "label": {"en": "Fairly well", "th": "ทำได้ค่อนข้างดี"}},
            {"value": 5, "label": {"en": "I am sure I could", "th": "ทำได้ดีแน่นอน"}},
        ],
    },
}

# --------------------------------------------------------------------------
# Layer A · dimension-scored interest items
#
# (id, facet, level, direction, source, strength, th, en, flags)
# source: "18rest" | "own"   strength: h | m | l
# The first 30 ids are the items already shipping in the app, kept byte-identical
# in Thai so that any answers already collected stay comparable.
# --------------------------------------------------------------------------

INTEREST = [
    # ---- R ----
    ("INT-R-01", "R.hardware", "L2", "positive", "18rest", "h",
     "ซ่อมจักรยานหรือเครื่องยนต์มอเตอร์ไซค์",
     "Repair a bicycle or a motorbike engine.", []),
    ("INT-R-02", "R.machine", "L2", "positive", "18rest", "m",
     "ควบคุมเครื่องจักรที่ใช้ผลิตหรือตัดชิ้นส่วน",
     "Operate a machine that makes or cuts parts.", []),
    ("INT-R-03", "R.build", "L2", "positive", "own", "m",
     "สร้างของบางอย่างจากไม้หรือโลหะ",
     "Build something from wood or metal.", []),
    ("INT-R-04", "R.hardware", "L2", "positive", "own", "h",
     "ติดตั้งหรือซ่อมระบบไฟฟ้าในอาคาร",
     "Install or fix electrical wiring in a building.", []),
    ("INT-R-05", "R.outdoor", "L2", "positive", "own", "h",
     "ปลูกพืชหรือดูแลสัตว์ในฟาร์ม",
     "Grow plants or look after animals on a farm.", []),
    ("INT-R-06", "R.body", "L3", "positive", "own", "h",
     "ทำงานที่ต้องเดิน ยกของ และขยับตัวเกือบทั้งวัน",
     "Work that has you walking, lifting and moving for most of the day.", []),
    ("INT-R-07", "R.outdoor", "L3", "positive", "own", "h",
     "ทำงานกลางแจ้งท่ามกลางแดดและลมเกือบทั้งวัน",
     "Work outdoors in the sun and wind for most of the day.", []),
    ("INT-R-R1", "R.body", "L4", "reverse", "own", "m",
     "งานที่ได้นั่งอยู่กับที่ตลอดวัน สบายกว่างานที่ต้องเดินและยกของ",
     "A job where you sit in one place all day suits you better than one with walking and lifting.",
     ["ตรวจด้วย CFA ว่าข้อนี้ไม่ตกไปโหลดกับ C"]),
    ("INT-R-R2", "R.hardware", "L4", "reverse", "own", "m",
     "เวลาของใช้พัง เอาไปให้ร้านซ่อมดีกว่าลองแก้เอง",
     "When something breaks, taking it to a shop beats trying to fix it yourself.", []),

    # ---- I ----
    ("INT-I-01", "I.research", "L2", "positive", "18rest", "m",
     "อ่านบทความหรือหนังสือเกี่ยวกับการค้นพบทางวิทยาศาสตร์",
     "Read articles or books about scientific discoveries.", []),
    ("INT-I-02", "I.experiment", "L2", "positive", "18rest", "h",
     "ทำการทดลองในห้องปฏิบัติการ",
     "Run an experiment in a laboratory.", []),
    ("INT-I-03", "I.theory", "L2", "positive", "18rest", "m",
     "หาคำอธิบายว่าปรากฏการณ์ธรรมชาติอย่างแผ่นดินไหวเกิดขึ้นได้อย่างไร",
     "Work out why a natural event such as an earthquake happens.", []),
    ("INT-I-04", "I.data", "L2", "positive", "own", "h",
     "วิเคราะห์ชุดตัวเลขเพื่อหารูปแบบที่ซ่อนอยู่",
     "Study a set of numbers to find a pattern in them.", []),
    ("INT-I-05", "I.diagnose", "L2", "positive", "own", "h",
     "แกะอุปกรณ์ออกดูเพื่อทำความเข้าใจว่ามันทำงานอย่างไร",
     "Take a device apart to understand how it works.",
     ["ใกล้ R.hardware — ตรวจการโหลดข้ามมิติเมื่อมีข้อมูล"]),
    ("INT-I-06", "I.diagnose", "L3", "positive", "own", "h",
     "เครื่องใช้ไฟฟ้าที่บ้านเสีย แล้วคุณเป็นคนหาว่ามันเสียเพราะอะไร",
     "An appliance at home stops working and you are the one who works out why.", []),
    ("INT-I-07", "I.data", "L3", "positive", "own", "h",
     "ดูตารางคะแนนหรือยอดขาย แล้วหาว่ามีแบบแผนอะไรซ่อนอยู่",
     "Look at a table of scores or sales and find the pattern hiding in it.", []),
    ("INT-I-R1", "I.research", "L4", "reverse", "own", "m",
     "รู้แค่วิธีใช้ก็พอแล้ว ส่วนกลไกข้างในปล่อยให้เป็นเรื่องของคนอื่น",
     "Knowing how to use it is enough; how it works inside is someone else's business.", []),
    ("INT-I-R2", "I.data", "L4", "reverse", "own", "m",
     "ตัดสินใจจากความรู้สึกของตัวเองได้เลย เร็วกว่าการไปหาข้อมูลมาดู",
     "Deciding on instinct is faster than going and finding the data.", []),

    # ---- A ----
    ("INT-A-01", "A.craft", "L2", "positive", "18rest", "m",
     "ออกแบบฉากหรือเครื่องแต่งกายสำหรับการแสดงบนเวที",
     "Design the set or the costumes for a stage show.",
     ["คาบเกี่ยว A.visual — facet นี้ตั้งไว้ชั่วคราว รอผล CFA"]),
    ("INT-A-02", "A.perform", "L2", "positive", "18rest", "h",
     "แสดงดนตรี เต้น หรือละครต่อหน้าผู้ชม",
     "Perform music, dance or drama in front of an audience.", []),
    ("INT-A-03", "A.perform", "L2", "positive", "18rest", "m",
     "ร้องเพลงหรือเล่นดนตรีรวมวง",
     "Sing or play music together with a group.", []),
    ("INT-A-04", "A.visual", "L2", "positive", "own", "h",
     "วาดรูป ระบายสี หรือออกแบบกราฟิกสำหรับโปสเตอร์",
     "Draw, paint, or design graphics for a poster.", []),
    ("INT-A-05", "A.write", "L2", "positive", "own", "h",
     "เขียนเรื่องสั้น เพลง หรือบทละคร",
     "Write a story, a song, or a script.", []),
    ("INT-A-06", "A.digital", "L3", "positive", "own", "h",
     "ออกแบบหน้าจอแอปให้คนใช้แล้วเข้าใจได้ทันที",
     "Design an app screen so that people understand it straight away.", []),
    ("INT-A-07", "A.digital", "L3", "positive", "own", "h",
     "ตัดต่อคลิปวิดีโอให้เล่าเรื่องได้น่าติดตาม",
     "Edit a video clip so that it tells a story people want to follow.", []),
    ("INT-A-R1", "A.visual", "L4", "reverse", "own", "m",
     "ทำตามแบบที่มีคนออกแบบไว้แล้ว สบายใจกว่าการคิดรูปแบบใหม่เอง",
     "Following a design someone else made is more comfortable than inventing your own.",
     ["ใกล้ C.procedure — ต้องตรวจว่าเป็นข้อกลับด้านของ A จริง"]),
    ("INT-A-R2", "A.perform", "L4", "reverse", "own", "m",
     "อยู่เบื้องหลังและปล่อยให้คนอื่นเป็นคนออกไปแสดง",
     "Staying behind the scenes and letting others be the ones on stage.", []),

    # ---- S ----
    ("INT-S-01", "S.community", "L2", "positive", "18rest", "m",
     "เป็นอาสาสมัครในโครงการของชุมชนละแวกบ้าน",
     "Volunteer for a community project in your neighbourhood.", []),
    ("INT-S-02", "S.care", "L2", "positive", "18rest", "m",
     "ให้คำแนะนำเรื่องการดูแลสุขภาพแก่คนอื่น",
     "Give people advice about staying healthy.", []),
    ("INT-S-03", "S.teach", "L2", "positive", "18rest", "m",
     "ช่วยเพื่อนร่วมชั้นที่กำลังมีปัญหากับการเรียน",
     "Help a classmate who is struggling with schoolwork.", []),
    ("INT-S-04", "S.care", "L2", "positive", "own", "h",
     "ดูแลเด็กเล็กหรือผู้สูงอายุ",
     "Look after young children or elderly people.", []),
    ("INT-S-05", "S.counsel", "L2", "positive", "own", "h",
     "รับฟังคนที่กำลังเล่าปัญหาของเขาให้ฟัง",
     "Listen to someone talk through a problem they are having.", []),
    ("INT-S-06", "S.facilitate", "L3", "positive", "own", "h",
     "ประสานงานให้ทุกคนในกลุ่มรู้ว่าต้องทำอะไรและงานเดินไปได้",
     "Keep everyone in a group clear on their part so the work keeps moving.",
     ["ใกล้ E.lead — ต่างกันที่ข้อนี้ไม่มีอำนาจตัดสินใจ ต้องตรวจเมื่อมีข้อมูล"]),
    ("INT-S-07", "S.teach", "L3", "positive", "own", "h",
     "อธิบายเรื่องยาก ๆ ให้คนที่ยังไม่รู้อะไรเลยเข้าใจได้",
     "Explain something difficult to a person who knows nothing about it yet.", []),
    ("INT-S-R1", "S.teach", "L4", "reverse", "own", "m",
     "ทำงานของตัวเองให้จบไปเงียบ ๆ ดีกว่าต้องคอยอธิบายให้คนอื่นเข้าใจ",
     "Finishing your own work quietly beats having to keep explaining it to others.", []),
    ("INT-S-R2", "S.counsel", "L4", "reverse", "own", "m",
     "อยู่ห่างจากเรื่องอารมณ์ของคนอื่น แล้วโฟกัสที่งานตรงหน้า",
     "Keeping clear of other people's feelings and focusing on the task in front of you.", []),

    # ---- E ----
    ("INT-E-01", "E.venture", "L2", "positive", "18rest", "m",
     "วางแผนว่าธุรกิจเล็ก ๆ จะเติบโตได้อย่างไร",
     "Plan how a small business could grow.", []),
    ("INT-E-02", "E.lead", "L2", "positive", "18rest", "m",
     "นำทีมและดูแลให้งานเสร็จตามกำหนด",
     "Lead a team and keep its work on schedule.", []),
    ("INT-E-03", "E.persuade", "L2", "positive", "18rest", "h",
     "โน้มน้าวลูกค้าให้ตัดสินใจซื้อสินค้า",
     "Persuade a customer to buy a product.", []),
    ("INT-E-04", "E.venture", "L2", "positive", "own", "m",
     "เริ่มต้นและบริหารชมรมหรือร้านเล็ก ๆ",
     "Start and run a club or a small shop.", []),
    ("INT-E-05", "E.present", "L2", "positive", "own", "h",
     "พูดต่อหน้ากลุ่มคนเพื่อโน้มน้าวให้เห็นด้วยกับความคิดของคุณ",
     "Speak to a group to convince them of your idea.", []),
    ("INT-E-06", "E.negotiate", "L3", "positive", "own", "h",
     "ต่อรองราคาหรือหาข้อตกลงที่ทั้งสองฝ่ายรับได้",
     "Negotiate a price or find a deal both sides can accept.", []),
    ("INT-E-07", "E.lead", "L3", "positive", "own", "h",
     "ตัดสินใจแทนกลุ่มในเรื่องที่ยังไม่มีใครรู้คำตอบ",
     "Make the call for a group on something nobody knows the answer to yet.", []),
    ("INT-E-R1", "E.lead", "L4", "reverse", "own", "m",
     "เป็นคนลงมือทำตามแผนที่คนอื่นวางไว้ สบายกว่าการเป็นคนตัดสินใจเอง",
     "Carrying out a plan someone else made is easier than being the one who decides.", []),
    ("INT-E-R2", "E.persuade", "L4", "reverse", "own", "m",
     "บอกข้อมูลไปตามจริง แล้วปล่อยให้เขาตัดสินใจเอง",
     "Give people the facts and leave the decision entirely to them.", []),

    # ---- C ----
    ("INT-C-01", "C.procedure", "L2", "positive", "18rest", "m",
     "ตรวจสอบว่ามีการทำตามกฎหรือมาตรฐานที่กำหนดไว้หรือไม่",
     "Check that a set of rules or standards is being followed.", []),
    ("INT-C-02", "C.verify", "L2", "positive", "18rest", "h",
     "ทำบัญชีและติดตามรายรับรายจ่าย",
     "Keep accounts and track money coming in and going out.", []),
    ("INT-C-03", "C.record", "L2", "positive", "18rest", "h",
     "จัดระเบียบและจัดเก็บเอกสารให้ค้นหาได้ง่าย",
     "Organise and store records so they can be found easily.", []),
    ("INT-C-04", "C.verify", "L2", "positive", "own", "m",
     "กรอกข้อมูลลงในตารางคำนวณอย่างถูกต้องแม่นยำ",
     "Enter information into a spreadsheet accurately.", []),
    ("INT-C-05", "C.procedure", "L2", "positive", "own", "h",
     "ทำงานตามขั้นตอนที่เขียนไว้อย่างเคร่งครัดทีละขั้น",
     "Follow a written procedure exactly, step by step.", []),
    ("INT-C-06", "C.organise", "L3", "positive", "own", "h",
     "จัดของในห้องหรือในคลังให้เป็นระบบจนหาของได้ในไม่กี่วินาที",
     "Arrange a room or a store so anything can be found in seconds.", []),
    ("INT-C-07", "C.schedule", "L3", "positive", "own", "h",
     "วางตารางเวลาให้งานหลายอย่างเสร็จทันโดยไม่ชนกัน",
     "Build a schedule so several jobs all finish on time without clashing.", []),
    ("INT-C-R1", "C.procedure", "L4", "reverse", "own", "m",
     "เริ่มงานใหม่โดยยังไม่รู้ว่าขั้นตอนจะเป็นอย่างไร แล้วค่อยหาทางไปเรื่อย ๆ",
     "Starting something new with no idea of the steps and working it out as you go.",
     ["ใกล้ A — ต้องตรวจว่าเป็นข้อกลับด้านของ C จริง ไม่ใช่ข้อบวกของ A"]),
    ("INT-C-R2", "C.organise", "L4", "reverse", "own", "m",
     "ปล่อยของให้อยู่ตามที่วางไว้ หาเจอเมื่อไหร่ก็เมื่อนั้น",
     "Leaving things where they land and finding them whenever you find them.", []),
]

REVERSE_PAIRS = {
    "INT-R-R1": "INT-R-06", "INT-R-R2": "INT-R-01",
    "INT-I-R1": "INT-I-01", "INT-I-R2": "INT-I-04",
    "INT-A-R1": "INT-A-04", "INT-A-R2": "INT-A-02",
    "INT-S-R1": "INT-S-07", "INT-S-R2": "INT-S-05",
    "INT-E-R1": "INT-E-07", "INT-E-R2": "INT-E-03",
    "INT-C-R1": "INT-C-05", "INT-C-R2": "INT-C-06",
}

# --------------------------------------------------------------------------
# Layer A · intensity probes (weight 0.6 — they carry persistence as well as
# interest, so they may not count as full evidence)
# --------------------------------------------------------------------------

INTENSITY = [
    ("ITN-R-01", "R", "R.hardware",
     "ถ้าซ่อมแล้วยังไม่หาย ต้องลองใหม่หลายรอบจนเจอจุดที่เสีย คุณยังอยากทำไหม",
     "If the first repair fails and you have to try again and again to find the fault, would you still want to do it?"),
    ("ITN-I-01", "I", "I.research",
     "ถ้าต้องอ่านเรื่องเดิมซ้ำหลายรอบจนกว่าจะเข้าใจ คุณยังอยากทำไหม",
     "If you had to read the same thing over and over until it made sense, would you still want to?"),
    ("ITN-A-01", "A", "A.visual",
     "ถ้างานที่ออกแบบถูกสั่งให้แก้ห้ารอบ คุณยังอยากทำไหม",
     "If a design you made had to be revised five times, would you still want to do it?"),
    ("ITN-S-01", "S", "S.teach",
     "ถ้าต้องอธิบายเรื่องเดิมให้คนที่ยังไม่เข้าใจฟังอีกหลายครั้ง คุณยังอยากทำไหม",
     "If you had to explain the same thing again and again to someone who still did not get it, would you still want to?"),
    ("ITN-E-01", "E", "E.persuade",
     "ถ้าถูกปฏิเสธสิบครั้งก่อนจะมีคนตกลงหนึ่งครั้ง คุณยังอยากทำไหม",
     "If ten people said no before one said yes, would you still want to do it?"),
    ("ITN-C-01", "C", "C.verify",
     "ถ้าต้องตรวจตัวเลขชุดเดิมซ้ำเพื่อให้แน่ใจว่าไม่มีที่ผิด คุณยังอยากทำไหม",
     "If you had to recheck the same figures to be sure nothing was wrong, would you still want to?"),
]

# --------------------------------------------------------------------------
# Layer B · self-efficacy — never scored, never called "skill"
# --------------------------------------------------------------------------

EFFICACY = [
    ("SEF-R-01", "R", "ซ่อมหรือประกอบอุปกรณ์ให้ใช้งานได้", "repair or assemble equipment so it works"),
    ("SEF-I-01", "I", "หาสาเหตุของปัญหาด้วยข้อมูลและเหตุผล", "find the cause of a problem from data and reasoning"),
    ("SEF-A-01", "A", "สร้างงานออกแบบหรืองานเล่าเรื่องของตัวเอง", "create your own design or piece of storytelling"),
    ("SEF-S-01", "S", "ดูแลหรืออธิบายเรื่องต่าง ๆ ให้คนอื่นเข้าใจ", "care for people or explain things so they understand"),
    ("SEF-E-01", "E", "นำกลุ่มหรือโน้มน้าวให้คนเห็นด้วย", "lead a group or bring people round to an idea"),
    ("SEF-C-01", "C", "ทำงานที่ต้องละเอียดและถูกต้องทุกจุด", "do work that has to be accurate in every detail"),
]

# --------------------------------------------------------------------------
# experience checks — turn "not sure" into "never had the chance"
# --------------------------------------------------------------------------

EXPERIENCE_OPTIONS = [
    ("often", "เคย และได้ทำหลายครั้ง", "Yes, many times"),
    ("once", "เคยครั้งเดียวสองครั้ง", "Once or twice"),
    ("never-curious", "ไม่เคย แต่อยากลอง", "Never, but I would like to try"),
    ("never-uninterested", "ไม่เคย และไม่คิดจะลอง", "Never, and I do not plan to"),
]

EXPERIENCE = [
    ("EXP-R-01", "R", "งานซ่อม ประกอบ หรือสร้างของด้วยมือ", "hands-on repairing, assembling or building"),
    ("EXP-I-01", "I", "การทดลอง วิเคราะห์ข้อมูล หรือหาสาเหตุของปัญหา", "experimenting, analysing data or diagnosing a fault"),
    ("EXP-A-01", "A", "งานออกแบบ วาด เขียน ตัดต่อ หรือการแสดง", "designing, drawing, writing, editing or performing"),
    ("EXP-S-01", "S", "การสอน ดูแล หรือรับฟังคนอื่น", "teaching, caring for or listening to other people"),
    ("EXP-E-01", "E", "การขาย นำกลุ่ม หรือจัดกิจกรรมของตัวเอง", "selling, leading a group or running your own activity"),
    ("EXP-C-01", "C", "งานเอกสาร บัญชี หรือการจัดระบบข้อมูล", "paperwork, accounts or organising records"),
]

# --------------------------------------------------------------------------
# scenarios — options may map to more than one dimension, weights sum to <= 1.0
# --------------------------------------------------------------------------

SCENARIOS = [
    ("SCN-01", "งานกลุ่มวิชาวิทยาศาสตร์ ครูให้ทำโครงงานอิสระ คุณอยากรับหน้าที่ไหน",
     "Your science class has a free-choice group project. Which part would you want?",
     [("build", "ประกอบชิ้นงานและทำให้มันทำงานได้จริง", "Build the thing and make it actually work", {"R": 1.0}),
      ("design", "หาข้อมูลและออกแบบวิธีทดลอง", "Find the information and design the method", {"I": 1.0}),
      ("comms", "ทำโปสเตอร์และคลิปให้คนดูเข้าใจง่าย", "Make the poster and clip so people get it", {"A": 1.0}),
      ("coord", "ประสานงานทุกคนและคุมให้เสร็จทันเวลา", "Coordinate everyone and keep it on time", {"E": 0.5, "C": 0.5})]),
    ("SCN-02", "วันเสาร์ว่างทั้งบ่าย ไม่มีการบ้าน คุณอยากใช้เวลาไปกับอะไรมากที่สุด",
     "A free Saturday afternoon, no homework. What would you most want to spend it on?",
     [("make", "ซ่อมหรือประกอบอะไรบางอย่างที่บ้าน", "Fixing or building something at home", {"R": 1.0}),
      ("figure", "หาคำตอบของเรื่องที่ค้างคาใจ", "Chasing down the answer to something you keep wondering about", {"I": 1.0}),
      ("create", "ทำงานออกแบบ วาด เขียน หรือตัดต่อ", "Designing, drawing, writing or editing", {"A": 1.0}),
      ("people", "ไปช่วยงานหรือไปคุยกับคนที่ต้องการคนคุย", "Helping out, or talking with someone who needs company", {"S": 1.0})]),
    ("SCN-03", "โรงเรียนจัดงานเปิดบ้าน ห้องคุณได้ทำซุ้มหนึ่งซุ้ม คุณอยากรับหน้าที่ไหน",
     "Your school has an open house and your class runs a booth. Which job would you take?",
     [("sell", "ชวนคนที่เดินผ่านให้เข้ามาดูซุ้ม", "Pull passers-by in to look at the booth", {"E": 1.0}),
      ("stock", "คุมของ คุมเงิน และคุมบัญชีของซุ้ม", "Run the stock, the cash and the booth's accounts", {"C": 1.0}),
      ("look", "ออกแบบและตกแต่งซุ้มให้สวย", "Design and decorate the booth", {"A": 1.0}),
      ("host", "ดูแลคนที่เข้ามาและตอบคำถามให้เขา", "Look after visitors and answer their questions", {"S": 1.0})]),
]

# --------------------------------------------------------------------------
# forced-choice — hexagon-adjacent pairs only, desirability matched on
# prestige / expected pay / job security / familiarity to Thai students
# --------------------------------------------------------------------------

FORCED = [
    ("FC-RI-01", ("R", "I"),
     ("ประกอบชุดอุปกรณ์ให้ใช้งานได้จริง", "Assemble a piece of equipment so it works"),
     ("หาว่าทำไมชุดอุปกรณ์นี้ทำงานผิดพลาด", "Work out why that equipment is failing")),
    ("FC-IA-01", ("I", "A"),
     ("เขียนโปรแกรมให้ระบบทำงานถูกต้อง", "Write the code so the system behaves correctly"),
     ("ออกแบบหน้าจอให้คนใช้ง่าย", "Design the screen so people find it easy")),
    ("FC-AS-01", ("A", "S"),
     ("ทำสื่อการสอนให้เข้าใจง่าย", "Make teaching material that is easy to grasp"),
     ("นั่งอธิบายให้ผู้เรียนฟังเอง", "Sit with the learner and explain it yourself")),
    ("FC-SE-01", ("S", "E"),
     ("ช่วยเพื่อนในทีมให้ทำงานของตัวเองได้", "Help teammates get their own part done"),
     ("เป็นคนแบ่งงานและตัดสินใจให้ทีม", "Be the one who splits the work and decides")),
    ("FC-EC-01", ("E", "C"),
     ("หาลูกค้าใหม่ให้ร้าน", "Find new customers for the shop"),
     ("ทำให้บัญชีของร้านถูกต้องทุกบาท", "Keep the shop's accounts right to the last baht")),
    ("FC-CR-01", ("C", "R"),
     ("จัดคลังอุปกรณ์ให้เป็นระบบ", "Get the equipment store organised"),
     ("ซ่อมอุปกรณ์ในคลังที่ชำรุด", "Repair the broken equipment in that store")),
]

# --------------------------------------------------------------------------
# integration probes — opposite pairs, never scored
# --------------------------------------------------------------------------

INTEGRATION = [
    ("INTG-RS-01", ("R", "S"),
     "ใช้เครื่องมือและมือของคุณเอง ช่วยให้คนกลับมาเดินได้",
     "Use tools and your own hands to help a person walk again.",
     "กายภาพบำบัด · เวชศาสตร์ฟื้นฟู · วิศวกรรมชีวการแพทย์"),
    ("INTG-IE-01", ("I", "E"),
     "อธิบายงานวิจัยยาก ๆ ให้คนที่จะลงทุนเข้าใจว่าทำไมมันคุ้มค่า",
     "Explain hard research to an investor so they see why it is worth it.",
     "บริหารงานวิจัยสู่การพาณิชย์ · ที่ปรึกษาเชิงปริมาณ"),
    ("INTG-AC-01", ("A", "C"),
     "ออกแบบระบบสีและตัวอักษรให้ทุกหน้าของแอปใช้ตรงกันทั้งหมด",
     "Design a colour and type system so every screen in an app matches.",
     "design system · UX architecture · BIM"),
]

# --------------------------------------------------------------------------
# clarification items — text carries slots filled from earlier answers
# --------------------------------------------------------------------------

CLARIFY = [
    ("CHK-FACET-01", "within-dimension",
     "เมื่อกี้คุณบอกว่าชอบ “{A}” แต่ไม่ชอบ “{B}” ทั้งสองอย่างอยู่ในกลุ่มเดียวกัน อันไหนใกล้กับที่คุณคิดมากกว่า",
     "Earlier you liked “{A}” but not “{B}”. They belong to the same group. Which is closer to what you meant?",
     ["A", "B"],
     [("liked-only-a", "ชอบ “{A}” จริง ส่วน “{B}” ไม่ใช่แนวเลย", "I really do like “{A}”; “{B}” is not for me", "facet-specific"),
      ("misread", "ชอบทั้งสองอย่าง แต่ “{B}” อธิบายไม่ตรงกับที่ผมเข้าใจ", "I like both; “{B}” was just worded oddly", "misread"),
      ("neither", "ไม่ชอบทั้งสองอย่าง เมื่อกี้ตอบพลาด", "I like neither; my earlier answer was a slip", "correct-earlier"),
      ("depends", "ขึ้นกับว่าทำกับใครหรือทำที่ไหน", "It depends who I do it with or where", "environment")]),
    ("CHK-ENV-01", "environment",
     "ถ้างานเดิมนี้ แต่เปลี่ยนที่ทำ อันไหนที่คุณยังอยากทำ",
     "Same work, different setting. Which one would you still want?",
     [],
     [("alone", "ทำคนเดียวเงียบ ๆ", "On my own, quietly", "solo"),
      ("small-team", "ทำเป็นทีมเล็ก", "In a small team", "small-team"),
      ("crowd", "ทำที่มีคนเยอะ ๆ ตลอดเวลา", "Around lots of people all the time", "public"),
      ("none", "ไม่อยากทำเลยไม่ว่าที่ไหน", "I would not want it anywhere", "confirms-negative")]),
    ("CHK-REAL-01", "format-flip",
     "สมมติต้องทำ “{A}” จริง ๆ วันเสาร์ ตั้งแต่เช้าถึงบ่าย และไม่มีใครเห็นว่าคุณทำ คุณจะยังอยากทำไหม",
     "Suppose you actually had to do “{A}” on a Saturday, morning to afternoon, with nobody watching. Would you still want to?",
     ["A"],
     [("full", "อยาก ทำได้เต็มวัน", "Yes, all day", "durable"),
      ("short", "อยาก แต่ไม่นานเท่านั้น", "Yes, but not that long", "moderate"),
      ("watch", "ไม่อยาก ชอบแค่ฟังคนอื่นทำ", "No, I only like hearing about it", "idea-only")]),
]

# --------------------------------------------------------------------------
# context items outside RIASEC
# --------------------------------------------------------------------------

VALUES = [
    ("security", "ความมั่นคงของงาน", "Job security"),
    ("income", "รายได้", "Income"),
    ("autonomy", "ความอิสระในการทำงาน", "Freedom in how I work"),
    ("helping", "การได้ช่วยคนอื่น", "Helping other people"),
    ("learning", "การได้เรียนรู้สิ่งใหม่ตลอด", "Always learning something new"),
    ("near-home", "การได้อยู่ใกล้บ้าน", "Being close to home"),
]

# --------------------------------------------------------------------------
# assembly
# --------------------------------------------------------------------------

STRENGTH = {"h": "high", "m": "medium", "l": "low"}
SRC = {
    "18rest": ("adapted-18rest", "ambiel-2018-18rest", "CC BY 4.0"),
    "own": ("researcher-written", None, "project"),
    "explore": ("exploratory", None, "project"),
}


def base(item_id, dimension, facet, probe_type, level, purpose, th, en, *,
         scoring="none", direction=None, weight=None, strength="medium",
         response="scale5", scale="scale5-preference", source="own",
         tiers=None, reading="m1", sensitivity="none", flags=None,
         options=None, help_text=None, culture=None, triggers=None,
         extra=None):
    source_type, source_ref, licence = SRC[source]
    item = {
        "id": item_id,
        "dimension": dimension,
        "facet": facet,
        "probeType": probe_type,
        "level": level,
        "purpose": purpose,
        "scoring": scoring,
        "responseFormat": response,
        "scaleId": scale if response == "scale5" else None,
        "sourceType": source_type,
        "sourceRef": source_ref,
        "licence": licence,
        "validationStatus": "none",
        "psychometrics": None,
        "text": {"th": th, "en": en},
        "tierScope": tiers or list(ALL_TIERS),
        "readingLevel": reading,
        "sensitivity": sensitivity,
        "reviewFlags": list(flags or []),
    }
    if scoring == "dimension":
        item["direction"] = direction
        item["diagnosticWeight"] = weight
    item["diagnosticStrength"] = STRENGTH.get(strength, strength)
    if options is not None:
        item["options"] = options
    if help_text:
        item["help"] = help_text
    if culture:
        item["culturalNote"] = culture
    if triggers:
        item["triggers"] = triggers
    if extra:
        item.update(extra)
    return item


def build():
    items = []

    # ---- interest items ----
    for (iid, facet, level, direction, source, strength, th, en, flags) in INTEREST:
        dim = facet.split(".")[0]
        triggers = None
        if level == "L3":
            triggers = [{"on": "dimensionHigh", "dimension": dim, "minScore": 4.0},
                        {"on": "response", "item": f"INT-{dim}-01", "values": [5]}]
        elif direction == "reverse":
            triggers = [{"on": "dimensionHigh", "dimension": dim, "minScore": 3.5}]
        item = base(iid, dim, facet, "reverse-keyed" if direction == "reverse" else
                    ("interest-facet" if level == "L3" else "interest-activity"),
                    level, "validate" if direction == "reverse" else "measure",
                    th, en, scoring="dimension", direction=direction, weight=1.0,
                    strength=strength, source=source, flags=flags, triggers=triggers)
        if direction == "reverse":
            item["reverseCounterpart"] = REVERSE_PAIRS[iid]
            item["culturalNote"] = (
                "ข้อกลับด้านในภาษาไทยต้องเขียนเป็นกิจกรรมตรงข้ามเชิงเนื้อหา "
                "ห้ามเติมคำว่า “ไม่ชอบ” ลงในข้อบวก เพราะจะซ้อนกับตัวสเกลที่มีคำว่าไม่ชอบอยู่แล้ว")
        items.append(item)

    # link the positive side back to its reverse counterpart
    by_id = {i["id"]: i for i in items}
    for rev, pos in REVERSE_PAIRS.items():
        by_id[pos]["reverseCounterpart"] = rev

    # ---- intensity ----
    for (iid, dim, facet, th, en) in INTENSITY:
        items.append(base(
            iid, dim, facet, "intensity", "L5", "measure", th, en,
            scoring="dimension", direction="positive", weight=0.6, strength="low",
            triggers=[{"on": "dimensionHigh", "dimension": dim, "minScore": 4.5}],
            flags=["ปนความอึด (persistence) เข้ากับความสนใจ — น้ำหนักจึงลดเหลือ 0.6"]))

    # ---- self-efficacy ----
    for (iid, dim, th_act, en_act) in EFFICACY:
        items.append(base(
            iid, dim, None, "self-efficacy", "L2", "context",
            f"ถ้ามีคนสอนให้ คุณคิดว่าตัวเองจะ{th_act}ได้ดีแค่ไหน",
            f"If someone taught you, how well do you think you could {en_act}?",
            scale="scale5-confidence", strength="medium",
            triggers=[{"on": "dimensionHigh", "dimension": dim, "minScore": 4.0}],
            help_text={"th": "ข้อนี้ถามความมั่นใจ ไม่ได้ถามว่าชอบหรือไม่ชอบ",
                       "en": "This asks about confidence, not about liking."},
            culture=("ห้ามเรียกผลของข้อนี้ว่า “ทักษะ” หรือ “ความสามารถ” — "
                     "เป็นการประเมินตนเองเท่านั้น และห้ามใช้ลดคะแนนความสนใจ"),
            flags=["ต้องแสดงแยกจากคะแนนความสนใจในทุกหน้าจอ"]))

    # ---- experience ----
    for (iid, dim, th_act, en_act) in EXPERIENCE:
        opts = [{"value": v, "label": {"th": t, "en": e}, "maps": {}}
                for (v, t, e) in EXPERIENCE_OPTIONS]
        items.append(base(
            iid, dim, None, "experience", "L4", "context",
            f"เคยได้ลอง{th_act}จริง ๆ ไหม",
            f"Have you actually had a chance to try {en_act}?",
            response="choice", options=opts, strength="medium",
            triggers=[{"on": "uncertain", "dimension": dim},
                      {"on": "dimensionHigh", "dimension": dim, "minScore": 4.0}],
            help_text={"th": "คำตอบนี้ไม่มีผลต่อคะแนน ใช้เพื่อรู้ว่าคุณเคยมีโอกาสลองหรือยัง",
                       "en": "This does not affect any score. It tells us whether you have had the chance."},
            culture=("คำตอบ “ไม่เคย แต่อยากลอง” ต้องนำไปสู่ข้อเสนอให้ไปลอง "
                     "ห้ามตีความว่าไม่สนใจ")))

    # ---- scenarios ----
    for (iid, th, en, opts) in SCENARIOS:
        options = [{"value": v, "label": {"th": t, "en": e}, "maps": m}
                   for (v, t, e, m) in opts]
        items.append(base(
            iid, None, None, "scenario", "L4", "measure", th, en,
            scoring="dimension", direction="positive", weight=0.7,
            response="choice", options=options, strength="medium",
            flags=["ปนบทบาททางสังคมในห้องเรียน — น้ำหนัก 0.7",
                   "ตัวเลือกที่แมปสองมิติให้ 0.5 กับแต่ละมิติ"]))

    # ---- forced choice ----
    for (iid, (d1, d2), (th1, en1), (th2, en2)) in FORCED:
        options = [
            {"value": "a", "label": {"th": th1, "en": en1}, "maps": {d1: 1.0}},
            {"value": "b", "label": {"th": th2, "en": en2}, "maps": {d2: 1.0}},
        ]
        items.append(base(
            iid, None, None, "forced-choice", "L4", "validate",
            "ถ้าเลือกได้อย่างเดียว คุณจะเลือกอะไร",
            "If you could only pick one, which would it be?",
            scoring="tiebreak", response="pair", options=options, strength="medium",
            triggers=[{"on": "tie", "dimensions": [d1, d2]}],
            extra={"desirabilityMatched": True,
                   "desirabilityAxes": ["prestige", "expected-pay", "job-security", "familiarity"]},
            flags=["การจับคู่ความพึงปรารถนายังเป็นการตัดสินของทีม ยังไม่ผ่านการให้ผู้เชี่ยวชาญให้คะแนน"],
            culture="ผลข้อนี้ปรับลำดับระหว่างสองมิติที่เสมอกันเท่านั้น ไม่บวกเข้าคะแนนมิติ"))

    # ---- integration ----
    for (iid, (d1, d2), th, en, fields) in INTEGRATION:
        items.append(base(
            iid, None, None, "integration", "L4", "clarify", th, en,
            strength="medium",
            triggers=[{"on": "oppositePairHigh", "pair": [d1, d2]}],
            extra={"integratesPair": [d1, d2], "integrativeFields": fields},
            help_text={"th": "ข้อนี้ไม่ได้วัดว่าคุณชอบด้านไหนมากกว่า แต่ถามว่าสองด้านนั้นอยู่ในงานเดียวกันได้ไหม",
                       "en": "This does not ask which side you prefer, but whether the two can sit in one job."},
            culture=("คู่ตรงข้ามที่สูงทั้งคู่ไม่ใช่ความผิดพลาดของการวัด "
                     "แต่เป็นโปรไฟล์ความสอดคล้องต่ำที่ชี้ไปสาขาบูรณาการ")))

    # ---- clarification ----
    for (iid, kind, th, en, slots, opts) in CLARIFY:
        options = [{"value": v, "label": {"th": t, "en": e}, "maps": {}, "hypothesis": h}
                   for (v, t, e, h) in opts]
        items.append(base(
            iid, None, None, "environment" if kind == "environment" else "scenario",
            "L4", "clarify", th, en,
            response="choice", options=options, strength="medium",
            triggers=[{"on": "contradiction", "kind": kind}],
            extra={"slots": slots} if slots else None,
            flags=["ข้อความมีช่องเติม {A}/{B} ที่ระบบเติมจากข้อที่ผู้เรียนตอบไปแล้ว"]
            if slots else []))

    # ---- values ----
    items.append(base(
        "VAL-01", None, None, "values-ranking", "L1", "context",
        "เลือกสามอย่างที่สำคัญกับคุณที่สุดเวลาคิดถึงงานในอนาคต",
        "Pick the three things that matter most to you about future work.",
        response="rank3of6",
        options=[{"value": v, "label": {"th": t, "en": e}, "maps": {}} for (v, t, e) in VALUES],
        strength="medium",
        help_text={"th": "คำตอบนี้ไม่ตัดเส้นทางไหนออก ใช้เรียงว่าจะแสดงข้อมูลอะไรก่อน",
                   "en": "This rules nothing out. It orders which information you see first."},
        culture=("ค่านิยมของผู้เรียนวัยนี้เปลี่ยนได้ จึงห้ามใช้กรองเส้นทางออก "
                 "ผู้ที่เลือก “ใกล้บ้าน” ให้แสดงข้อมูลระยะทางและการเดินทางเด่นขึ้น")))

    # ---- open text ----
    items.append(base(
        "OPN-01", None, None, "open-text", "L1", "explore",
        "เล่าเรื่องอะไรก็ได้ที่คุณทำแล้วรู้สึกภูมิใจ ไม่จำเป็นต้องเกี่ยวกับเรื่องเรียน",
        "Tell us about anything you have done that you felt proud of. It does not have to be schoolwork.",
        response="text", source="explore", strength="low",
        help_text={"th": "ข้ามได้ ถ้าไม่อยากเล่า", "en": "You can skip this."},
        culture=("ข้อความนี้ไม่ให้คะแนนและไม่ให้โมเดลภาษาตัดสิน "
                 "ระบบจับเฉพาะคำที่อยู่ในพจนานุกรม facet ที่กำหนดไว้ล่วงหน้า ถ้าไม่พบก็ไม่เดา"),
        flags=["ต้องส่งข้อความดิบให้ครูแนะแนวโดยไม่สรุปแทน"]))
    items.append(base(
        "OPN-02", None, None, "open-text", "L5", "explore",
        "มีอะไรที่คุณอยากลองแต่ยังไม่มีโอกาสได้ลองไหม",
        "Is there anything you want to try but have not had the chance to?",
        response="text", source="explore", strength="low",
        help_text={"th": "ข้ามได้", "en": "You can skip this."},
        culture="คำตอบข้อนี้เป็นทริกเกอร์เปิดสาขาที่ปิดไปแล้วกลับมาได้"))

    return {
        "meta": {
            "id": "futureme-adaptive-bank-v1",
            "construct": "Holland RIASEC vocational interests, with non-scoring support layers",
            "design": "01_Research/Adaptive_Questionnaire/",
            "schema": "01_Research/Adaptive_Questionnaire/bank/SCHEMA.md",
            "generatedBy": "01_Research/Adaptive_Questionnaire/bank/build.py",
            "notice": (
                "Prototype item bank. Only items with scoring=\"dimension\" contribute to a RIASEC "
                "score; every other item is context and must never move a dimension score. No item "
                "in this bank has been psychometrically validated: no IOC, reliability, or validity "
                "evidence exists for it. It must not be presented as a validated RIASEC test, and no "
                "statistic from any source instrument may be reported as a property of this bank."
            ),
            "notValidatedFields": ["validationStatus", "psychometrics"],
            "attribution": (
                "Items marked sourceType=\"adapted-18rest\" are adapted from Ambiel, R. A. M., "
                "Hauck-Filho, N., Barros, L. D. O., Martins, G. H., Abrahams, L., & De Fruyt, F. "
                "(2018). 18REST: a short RIASEC-interest measure. Psicologia: Reflexao e Critica, "
                "31, 6. https://doi.org/10.1186/s41155-018-0086-z - licensed CC BY 4.0. Adapting "
                "these items does not transfer any reliability or validity evidence to this bank."
            ),
            "restrictedSources": (
                "No item is drawn from a copyrighted commercial inventory (Strong Interest "
                "Inventory, Self-Directed Search, or similar). Reproducing their items would be "
                "both a licence breach and a professional-ethics breach."
            ),
            "references": {
                "ambiel-2018-18rest": "Ambiel et al. (2018), 18REST, Psicologia: Reflexao e Critica 31:6, CC BY 4.0",
            },
        },
        "scales": SCALES,
        "facets": {k: {"th": v[0], "en": v[1], "dimension": k.split(".")[0]}
                   for k, v in FACETS.items()},
        "items": items,
    }


# --------------------------------------------------------------------------
# validation — SCHEMA.md §5, rules 1..17
# --------------------------------------------------------------------------

def validate(bank):
    items = bank["items"]
    facets = bank["facets"]
    ids = [i["id"] for i in items]
    errors = []

    def check(cond, rule, msg):
        if not cond:
            errors.append(f"rule {rule}: {msg}")

    check(len(ids) == len(set(ids)), 1, "duplicate id")

    for i in items:
        iid = i["id"]
        if i["facet"] is not None:
            check(i["facet"] in facets, 2, f"{iid} unknown facet {i['facet']}")
        if i["scoring"] == "dimension":
            # The dimension is either on the item, or on each option's `maps`
            # (scenario items, where the chosen option decides which dimension moves).
            mapped = all(o.get("maps") for o in i.get("options", [])) and bool(i.get("options"))
            check((i["dimension"] or mapped) and i.get("direction") and i.get("diagnosticWeight"),
                  3, f"{iid} missing dimension/option maps/direction/weight")
        if i["scoring"] == "none":
            check("diagnosticWeight" not in i, 4, f"{iid} has weight but is not scored")
        if i["probeType"] == "self-efficacy":
            check(i["scoring"] == "none", 5, f"{iid} self-efficacy must not be scored")
        if i["probeType"] == "forced-choice":
            check(i.get("desirabilityMatched") is True and i["scoring"] == "tiebreak",
                  6, f"{iid} forced-choice needs desirabilityMatched and tiebreak")
        if i["probeType"] == "integration":
            check(i["scoring"] == "none" and i["dimension"] is None,
                  7, f"{iid} integration must be unscored and dimensionless")
        if i["sourceType"] == "adapted-18rest":
            check(i["sourceRef"] is not None and i["licence"] == "CC BY 4.0",
                  12, f"{iid} 18REST item missing ref/licence")
        check(i["licence"] != "restricted-do-not-use", 13, f"{iid} restricted source")
        check(bool(i["text"]["th"].strip()) and bool(i["text"]["en"].strip()),
              14, f"{iid} empty text")
        check(i["validationStatus"] == "none" and i["psychometrics"] is None,
              15, f"{iid} claims validation evidence")
        check("reviewFlags" in i, 15, f"{iid} missing reviewFlags")
        for t in i.get("triggers", []):
            if "item" in t:
                check(t["item"] in ids, 16, f"{iid} trigger points at missing {t['item']}")
        for o in i.get("options", []):
            check(sum(o.get("maps", {}).values()) <= 1.0 + 1e-9,
                  17, f"{iid} option {o['value']} maps sum > 1.0")
        if i.get("reverseCounterpart"):
            other = next((x for x in items if x["id"] == i["reverseCounterpart"]), None)
            check(other is not None and other.get("reverseCounterpart") == iid,
                  11, f"{iid} reverseCounterpart not mutual")

    for d in "RIASEC":
        scored = [i for i in items if i["scoring"] == "dimension" and i["dimension"] == d]
        check(len(scored) >= 8, 8, f"{d} has only {len(scored)} scored items")
        rev = [i for i in scored if i.get("direction") == "reverse"]
        check(len(rev) >= 2, 9, f"{d} has only {len(rev)} reverse items")

    used = {i["facet"] for i in items if i["facet"]}
    for f in facets:
        check(f in used, 10, f"facet {f} has no item")

    return errors


def report(bank):
    items = bank["items"]
    print(f"items: {len(items)}   facets: {len(bank['facets'])}")
    for d in "RIASEC":
        scored = [i for i in items if i["scoring"] == "dimension" and i["dimension"] == d]
        rev = sum(1 for i in scored if i.get("direction") == "reverse")
        print(f"  {d}: scored {len(scored):2d}  (reverse {rev})")
    kinds = {}
    for i in items:
        kinds[i["probeType"]] = kinds.get(i["probeType"], 0) + 1
    print("  by probeType: " + ", ".join(f"{k} {v}" for k, v in sorted(kinds.items())))
    unscored = sum(1 for i in items if i["scoring"] == "none")
    print(f"  never scored: {unscored}   tiebreak only: "
          f"{sum(1 for i in items if i['scoring'] == 'tiebreak')}")


def main():
    if "--check" in sys.argv:
        bank = json.loads(OUT.read_text(encoding="utf-8"))
    else:
        bank = build()
        OUT.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {OUT.relative_to(HERE.parent.parent.parent)}")
    errors = validate(bank)
    report(bank)
    if errors:
        print(f"\nFAILED {len(errors)} rule violation(s):")
        for e in errors:
            print("  " + e)
        return 1
    print("\nall 17 schema rules pass")
    return 0


if __name__ == "__main__":
    sys.exit(main())
