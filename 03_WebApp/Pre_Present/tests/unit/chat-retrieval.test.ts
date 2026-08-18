import { describe, expect, it } from "vitest";
import { retrieveKnowledge } from "@/lib/chat/knowledge";

/*
 * Retrieval decides whether the chat answers at all.
 *
 * With no source the request never reaches the model — the pipeline returns a
 * fixed "I have no reviewed material for that" reply. So a miss here is not a
 * slightly worse answer, it is silence, and the Thai side used to go silent on
 * the most ordinary way to ask.
 *
 * Both halves of this file matter equally. Widening the vocabulary is only
 * safe while the refusal still fires: a retriever that matches everything
 * hands the model a citable source for questions it has no business answering,
 * and the guards downstream check that a citation *exists*, not that it is apt.
 */

const th = (q: string) => retrieveKnowledge(q, "th");
const en = (q: string) => retrieveKnowledge(q, "en");

describe("retrieveKnowledge — the way learners ask", () => {
  it.each([
    ["หนูชอบวาดรูป ควรเรียนอะไรดี", "art, in the words a learner uses"],
    ["สนใจงานสายเทคโนโลยี ควรเริ่มยังไงดี", "technology, phrased as a plan not a subject"],
    ["อยากเป็นหมอต้องเรียนอะไร", "a job title rather than a field"],
    ["จบมาทำงานอะไรได้บ้าง", "outcomes, with no subject named at all"],
    ["ยังไม่รู้ว่าชอบอะไรเลย", "no topic — the learner is asking for a way in"],
    ["อยากเรียนต่อมหาลัย ต้องทำยังไง", "admission, colloquially"],
    ["สายอาชีพกับสายสามัญต่างกันยังไง", "the comparison the product exists for"],
    ["ชอบขายของ เรียนอะไรดี", "business, in shop-floor words"],
    ["อยากเรียนไปทำงานไปด้วย", "dual study, described rather than named"],
  ])("finds something for %s (%s)", (query) => {
    expect(th(query).length).toBeGreaterThan(0);
  });

  it("still answers the formal vocabulary the sources use", () => {
    expect(th("ปวช. กับ ม.ปลาย ต่างกันยังไง").length).toBeGreaterThan(0);
    expect(th("TCAS คืออะไร").length).toBeGreaterThan(0);
    expect(en("What is the RIASEC interest model?").length).toBeGreaterThan(0);
  });

  it("points art questions at the art route rather than at whatever ranks first", () => {
    const ids = th("หนูชอบวาดรูป ควรเรียนอะไรดี").map((r) => r.source.id);
    expect(ids).toContain("route-arts-design");
  });

  it("points a doctor question at health care", () => {
    expect(th("อยากเป็นหมอต้องเรียนอะไร").map((r) => r.source.id)).toContain("route-health-care");
  });
});

describe("retrieveKnowledge — what it must still refuse", () => {
  it.each([
    "วันนี้อากาศเป็นยังไง",
    "ช่วยแต่งกลอนวันแม่ให้หน่อย",
    "2+2 เท่ากับเท่าไหร่",
    "ราคาบิตคอยน์ตอนนี้เท่าไหร่",
    "แปลประโยคนี้เป็นภาษาญี่ปุ่นให้หน่อย",
  ])("returns nothing for an off-topic question: %s", (query) => {
    expect(th(query)).toEqual([]);
  });

  it("returns nothing for an empty or whitespace query", () => {
    expect(th("")).toEqual([]);
    expect(th("   ")).toEqual([]);
  });

  it("never returns more than the caller asked for", () => {
    expect(th("เรียนอะไรดี อยากทำงานสายไอที").length).toBeLessThanOrEqual(4);
    expect(retrieveKnowledge("ปวช", "th", 2).length).toBeLessThanOrEqual(2);
    expect(retrieveKnowledge("ปวช", "th", 0)).toEqual([]);
  });
});

describe("retrieveKnowledge — what it hands the model", () => {
  const [first] = th("อยากเรียนสายอาชีพดิจิทัล");

  it("returns a source the guards can check a citation against", () => {
    expect(first.source.id).toBeTruthy();
    expect(first.source.title).toBeTruthy();
    expect(first.source.status).toBeTruthy();
  });

  it("labels the context with the id, so an invented citation is detectable", () => {
    expect(first.context).toContain(`SOURCE_ID: ${first.source.id}`);
    expect(first.context).toContain("STATUS:");
  });

  it("localises the source the learner is shown", () => {
    const [thai] = th("ปวช");
    const [english] = en("vocational");
    expect(thai.source.title).toMatch(/[฀-๿]/);
    expect(english.source.title).not.toMatch(/[฀-๿]/);
  });

  it("says so when a demo route has no source url to point at", () => {
    const routes = th("อยากเรียนสายอาชีพดิจิทัล").filter((r) => r.source.id.startsWith("route-"));
    for (const r of routes) {
      if (!r.source.url) expect(r.context).toContain("URL: none");
    }
  });
});
