import { describe, expect, it } from "vitest";
import { retrieveKnowledge } from "@/lib/chat/knowledge";
import type { ChatLanguage } from "@/lib/chat/types";

/**
 * A fixed set of questions with the sources each one must and must not return.
 *
 * Retrieval is the only gate between a learner's sentence and the model: with
 * no source the chat never calls the provider at all, and with the wrong source
 * it calls it with the wrong grounding. Every other guard in this codebase
 * checks what comes back. Nothing checked what went in.
 *
 * `forbid` is the half that matters most and the half a keyword search cannot
 * get right by accident. Returning a source that contradicts what the learner
 * just said is worse than returning nothing, because the chat then answers
 * fluently and confidently about the thing they rejected.
 *
 * Add a row here before changing keywords or scoring. The point is not that
 * these twenty-odd queries are representative — they are not — but that a
 * change which fixes one of them cannot quietly break another.
 */

interface GoldenCase {
  query: string;
  language: ChatLanguage;
  /** Ids that must appear. */
  expect?: string[];
  /** Ids that must not appear, whatever else does. */
  forbid?: string[];
  /** Assert nothing at all comes back. */
  none?: true;
  why: string;
}

const CASES: GoldenCase[] = [
  // ─── What the learner rejected must not come back as a suggestion ────────
  {
    query: "ไม่ชอบดูแลคนเลย ไม่อยากทำงานกับคนป่วย",
    language: "th",
    forbid: ["route-health-care"],
    none: true,
    why: "Says twice over that care work is not wanted. Nothing else was asked, so nothing is the honest answer.",
  },
  {
    query: "ไม่อยากเป็นหมอ",
    language: "th",
    forbid: ["route-health-care"],
    why: "เป็นหมอ is health-care vocabulary; ไม่อยาก in front of it reverses what it means.",
  },
  {
    query: "เกลียดการดูแลคน",
    language: "th",
    forbid: ["route-health-care"],
    why: "Rejection does not have to be spelled with ไม่.",
  },
  {
    query: "ไม่ชอบเขียนโค้ดเลย",
    language: "th",
    forbid: ["route-vocational-digital"],
    why: "Same shape, different route — the rule cannot be one route's special case.",
  },
  {
    query: "I don't like caring for people",
    language: "en",
    forbid: ["route-health-care"],
    why: "English rejection, same obligation.",
  },
  {
    query: "I hate coding",
    language: "en",
    forbid: ["route-vocational-digital"],
    why: "English rejection without a negator.",
  },

  // ─── A rejection must not swallow the rest of the sentence ───────────────
  {
    query: "ไม่ชอบเลข แต่สนใจสายอาชีพ",
    language: "th",
    expect: ["ovec-voc-curriculum-2567"],
    forbid: ["route-sci-math-engineering"],
    why: "The interesting case: one clause rejects, the next asks. Both have to be read.",
  },
  {
    query: "ไม่ชอบวาดรูป แต่อยากทำธุรกิจ",
    language: "th",
    expect: ["route-business-admin"],
    forbid: ["route-arts-design"],
    why: "Rejection and request in one breath, no punctuation between them.",
  },
  {
    query: "I hate maths but I like design",
    language: "en",
    expect: ["route-arts-design"],
    forbid: ["route-sci-math-engineering"],
    why: "English 'but' is the same boundary as แต่, and forgetting it made the rejection eat the request.",
  },
  {
    query: "ไม่อยากเรียนต่อ อยากทำงานเลย",
    language: "th",
    expect: ["route-dve-dual"],
    forbid: ["mytcas-70"],
    why: "Wanting out of the classroom is what work-based study answers. This used to return the university admission source — to someone who had just said they do not want to continue studying.",
  },
  {
    query: "ไม่ชอบท่องจำ ชอบลงมือทำ",
    language: "th",
    expect: ["route-dve-dual"],
    why: "Hands-on rather than rote, said in a learner's own words.",
  },
  {
    query: "ยังไม่รู้ว่าชอบอะไร แต่ชอบคอมพิวเตอร์",
    language: "th",
    expect: ["route-vocational-digital"],
    why: "Undecided in one clause, specific in the next.",
  },

  // ─── Not knowing is not rejecting ────────────────────────────────────────
  {
    query: "I am not sure about engineering",
    language: "en",
    expect: ["route-sci-math-engineering"],
    forbid: ["route-health-care"],
    why: "Undecided, in English. Health care used to come back because 'not' and 'sure' occur in almost every source's prose.",
  },
  {
    query: "ไม่แน่ใจว่าจะเรียนสายอาชีพดีไหม",
    language: "th",
    expect: ["ovec-voc-curriculum-2567"],
    why: "ไม่แน่ใจ is the learner being undecided about the topic, not refusing it. Suppressing here would answer 'no idea' to someone who named their topic.",
  },
  {
    query: "ไม่รู้จะเรียนอะไรดี",
    language: "th",
    expect: ["onet-interest-profiler-manual"],
    why: "The single most likely opening sentence in the whole product. It contains ไม่ and must still retrieve.",
  },

  // ─── The same question asked briefly ─────────────────────────────────────
  {
    query: "หมอเรียนอะไร",
    language: "th",
    expect: ["route-health-care"],
    why: "Retrieved nothing while the longer อยากเป็นหมอ worked — the vocabulary held phrases, not the word.",
  },
  {
    query: "อยากเป็นหมอ ต้องเรียนอะไร",
    language: "th",
    expect: ["route-health-care"],
    why: "The long form, kept beside the short one so they cannot drift apart again.",
  },
  {
    query: "I want to be a doctor",
    language: "en",
    expect: ["route-health-care"],
    why: "English had no learner vocabulary for health at all — only the source's own words.",
  },

  // ─── Already working. Here so a fix above cannot cost them ───────────────
  {
    query: "ปวช กับ ม.ปลาย ต่างกันยังไง",
    language: "th",
    expect: ["ovec-voc-curriculum-2567", "mytcas-70"],
    why: "The comparison the product exists for.",
  },
  {
    query: "เรียนสายอาชีพแล้วต่อมหาลัยได้ไหม",
    language: "th",
    expect: ["ovec-voc-curriculum-2567", "mytcas-70"],
    why: "ไหม is not ไม่ — different characters, and a negation rule must not confuse them.",
  },
  {
    query: "จบแล้วตกงานไหม",
    language: "th",
    expect: ["tdri-human-capital-2025"],
    why: "Labour-market worry, asked as a question.",
  },
  {
    query: "เรียนวิศวะยากไหม",
    language: "th",
    expect: ["route-sci-math-engineering"],
    why: "Short stem วิศว covering วิศวะ and วิศวกรรม.",
  },
  {
    query: "อยากเป็นพยาบาล",
    language: "th",
    expect: ["route-health-care"],
    why: "Plain want, no negation anywhere near it.",
  },
  {
    query: "สนใจงานออกแบบ",
    language: "th",
    expect: ["route-arts-design"],
    why: "สนใจ is an interest verb; it must not be mistaken for the rejection family.",
  },
  {
    query: "มหาลัยไหนมีสหกิจ",
    language: "th",
    expect: ["mytcas-70"],
    why: "myTCAS is where programme details are actually looked up, so it is the right pointer even though it does not list co-op itself.",
  },
  {
    query: "what is TCAS",
    language: "en",
    expect: ["mytcas-70"],
    why: "English against an ASCII keyword.",
  },
  {
    query: "2+2 เท่ากับเท่าไหร่",
    language: "th",
    forbid: ["hsces-current-2026"],
    why: "Arithmetic once retrieved the credential-equivalency source because Thai tokens were being cut at tone marks. Locked so it stays fixed.",
  },

  // ─── Money ───────────────────────────────────────────────────────────────
  {
    query: "ทุนการศึกษามีอะไรบ้าง",
    language: "th",
    expect: ["institution-scholarships", "studentloan-fund"],
    why: "The question the catalogue had no answer to at all until the funds were added.",
  },
  {
    query: "ไม่มีเงินเรียนต่อ ทำยังไงดี",
    language: "th",
    expect: ["institution-scholarships"],
    why: "How it is actually asked. A learner says they have no money long before they know the word กยศ.",
  },
  {
    query: "กยศ กู้ได้เท่าไหร่",
    language: "th",
    expect: ["studentloan-fund"],
    why: "Asked by name, once someone has heard of it.",
  },
  {
    query: "เรียนสายอาชีพมีทุนไหม",
    language: "th",
    expect: ["studentloan-fund"],
    forbid: ["route-health-care"],
    why: "The loan fund covers ปวช. and ปวส. too, which is the point a vocational learner is usually not told.",
  },
  {
    query: "ที่บ้านจน อยากเรียนต่อ ปวส",
    language: "th",
    expect: ["eef-equity-fund"],
    why: "Grants rather than loans are the answer at the lowest incomes, and กสศ. funds ปวส. specifically.",
  },
  {
    query: "are there any scholarships",
    language: "en",
    expect: ["institution-scholarships"],
    why: "English, asked plainly.",
  },
  {
    query: "ค่าเทอมแพงมาก",
    language: "th",
    expect: ["institution-scholarships"],
    why: "A statement rather than a question, which is how worry about money usually arrives.",
  },
  // ─── What happens after the vocational route ─────────────────────────────
  {
    query: "จบอาชีวะแล้วตกงานไหม",
    language: "th",
    expect: ["vec-graduate-outcomes-2566"],
    why: "The fear the whole record exists to answer, asked the way it is actually asked.",
  },
  {
    query: "เรียน ปวช แล้วต่อปริญญาตรีได้ไหม",
    language: "th",
    expect: ["vec-graduate-outcomes-2566"],
    why: "Roughly seven in ten ปวช. graduates do exactly this, which is the opposite of what the route is assumed to be.",
  },
  {
    query: "ไม่อยากเรียนอาชีวะ กลัวไม่มีอนาคต",
    language: "th",
    forbid: ["route-vocational-digital", "route-dve-dual"],
    why: "A rejection of the route, so no vocational route may be served back as a suggestion — the outcome record is about the fear, not a counter-argument for a route.",
  },
  // ─── The fork a Mathayom 3 student is actually standing at ───────────────
  {
    query: "จบ ม.3 แล้วเลือกสายไหนดี",
    language: "th",
    expect: ["upper-secondary-study-plans"],
    why: "The decision this whole product exists for, and the catalogue returned nothing at all for it.",
  },
  {
    query: "เรียนศิลป์-ภาษา ต่อคณะอะไรได้",
    language: "th",
    expect: ["upper-secondary-study-plans"],
    why: "ศิลป์-ภาษา is a school study plan. It used to retrieve the arts-and-design career route — a different thing with a similar name.",
  },
  {
    query: "TCAS มีกี่รอบ",
    language: "th",
    expect: ["tcas-rounds"],
    why: "Only the generic myTCAS pointer came back before, which does not say what the rounds are.",
  },
  {
    query: "เรียนอาชีวะแพงไหม",
    language: "th",
    expect: ["free-education-15-years"],
    why: "ปวช. sits inside the fifteen-year free education policy, which families choosing between the two tracks are often not told.",
  },
  {
    query: "ไม่มีเงินจ่ายค่าเทอม",
    language: "th",
    expect: ["free-education-15-years"],
    why: "Said as a worry rather than a question about policy.",
  },
  // ─── The routes the expanded catalogue added ─────────────────────────────
  {
    query: "อยากเรียนซ่อมรถไฟฟ้า",
    language: "th",
    expect: ["route-vocational-ev-tech"],
    why: "Said in a learner's words, not the register's — the catalogue calls it ยานยนต์ไฟฟ้าและเทคโนโลยีระบบอัจฉริยะ.",
  },
  {
    query: "อยากเป็นเชฟ ทำอาหาร",
    language: "th",
    expect: ["route-vocational-culinary"],
    why: "A vocational route the six-route catalogue had nowhere to put.",
  },
  {
    query: "สนใจงานคลังสินค้า ขนส่ง",
    language: "th",
    expect: ["route-vocational-logistics"],
    why: "Logistics is also what finally gives a strongly Conventional learner somewhere to be matched.",
  },
  {
    query: "อยากทำ ai วิเคราะห์ข้อมูล",
    language: "th",
    expect: ["route-university-ai-data"],
    why: "Degree-level and distinct from the vocational digital route.",
  },
  {
    query: "อยากเป็นนักกายภาพบำบัด",
    language: "th",
    expect: ["route-university-medtech-rehab"],
    why: "More specific than the general health-care route, and a real programme with only 23 institutions running it.",
  },
  {
    query: "อยากทำคอนเทนต์ ตัดต่อ",
    language: "th",
    expect: ["route-university-digital-comm"],
    why: "How a fifteen-year-old describes นิเทศศาสตร์ดิจิทัล.",
  },
  {
    query: "ไม่ชอบทำอาหารเลย",
    language: "th",
    forbid: ["route-vocational-culinary"],
    why: "The rejection rule has to hold for the new routes too, not only the six it was written against.",
  },
];

describe("retrieval golden set", () => {
  for (const testCase of CASES) {
    it(`[${testCase.language}] ${testCase.query} — ${testCase.why}`, () => {
      const ids = retrieveKnowledge(testCase.query, testCase.language).map(
        ({ source }) => source.id,
      );

      for (const forbidden of testCase.forbid ?? []) {
        expect(ids, `must not retrieve ${forbidden}`).not.toContain(forbidden);
      }
      for (const wanted of testCase.expect ?? []) {
        expect(ids, `must retrieve ${wanted}`).toContain(wanted);
      }
      if (testCase.none) expect(ids).toEqual([]);
    });
  }
});
