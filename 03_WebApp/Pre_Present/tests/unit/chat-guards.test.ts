import { describe, expect, it, vi } from "vitest";
import {
  answerChat,
  containsInventedSourceId,
  containsRouteDecision,
  hasAllowedSourceCitation,
  retrieveKnowledge,
} from "@/lib/chat";
import type { ChatLanguage, ChatRequest } from "@/lib/chat/types";

/*
 * These guards are the only thing standing between a language model and a
 * teenager being told which future to pick. The deterministic engine owns that
 * decision; the model may explain and nothing more. Every case below is the
 * shape of a sentence the model must not be allowed to hand back.
 */

function ask(content: string, language: ChatLanguage = "en"): ChatRequest {
  return { messages: [{ role: "user", content }], language };
}

/** A query the shipped knowledge base actually answers, so retrieval succeeds. */
const GROUNDED_QUESTION = "Tell me about vocational digital study in Thailand";

describe("containsRouteDecision", () => {
  it.each([
    "The best route for you is the vocational track.",
    "You should choose the vocational route.",
    "I recommend the academic path.",
    "This programme is the strongest fit for you.",
    "Of the two, that one is the better choice for you.",
    "I would put it first, ahead of the others.",
    "That track fits you well.",
    "This one matches you.",
  ])("rejects a decision in English: %s", (text) => {
    expect(containsRouteDecision(text)).toBe(true);
  });

  it.each([
    "คุณควรเลือกเส้นทางสายอาชีพ",
    "เส้นทางนี้เหมาะที่สุด",
    "หลักสูตรนี้เหมาะกับคุณ",
    "ขอจัดอันดับเส้นทางให้",
    // Every one of these reached the learner before the Thai rules were
    // widened: the old patterns wanted the noun glued to the verb and knew
    // only three nouns, none of which is how a route is actually named.
    "คุณควรเลือกสายอาชีพ",
    "ควรเลือกสายวิทย์-คณิต",
    "แนะนำให้เลือกสายอาชีพดิจิทัล",
    "ปวช. ดิจิทัลเหมาะกับคุณที่สุด",
    "สายอาชีพน่าจะเหมาะกับคุณ",
    "ควรเรียนสายศิลป์-ภาษา",
    "ขอจัดอันดับสาขาที่น่าสนใจให้",
  ])("rejects a decision in Thai: %s", (text) => {
    expect(containsRouteDecision(text)).toBe(true);
  });

  it.each([
    "ไม่มีเส้นทางไหนดีที่สุดสำหรับทุกคน ลองดูจากสิ่งที่คุณอยากทดลองทำ",
    "ฉันเลือกแทนคุณไม่ได้ แต่อธิบายให้ฟังได้ว่าแต่ละสายเรียนอะไรบ้าง",
    "ฉันไม่สามารถจัดอันดับให้คุณได้ เพราะระบบกำหนดกฎเป็นผู้คำนวณ",
    "สายอาชีพเน้นการฝึกปฏิบัติในสถานประกอบการมากกว่าสายสามัญ",
    "ปวช. ใช้เวลาเรียนสามปี และเทียบโอนเข้า ปวส. ได้",
    // An interrogative ahead of เหมาะกับคุณ makes it a question, and sending
    // the learner to the assessment is the behaviour we want most of all.
    "ลองทำแบบสำรวจดูไหม จะได้เห็นว่าสายไหนเหมาะกับคุณ",
    "ถ้าอยากรู้ว่าอะไรเหมาะกับคุณ ลองเริ่มจากแบบสำรวจของ FutureMe",
    "ฉันบอกไม่ได้ว่าอะไรเหมาะกับคุณ แต่ช่วยอธิบายแต่ละสายได้",
  ])("allows an honest Thai answer: %s", (text) => {
    expect(containsRouteDecision(text)).toBe(false);
  });

  it.each([
    "Vocational programmes usually run for three years [ovec-voc-curriculum-2567].",
    "There is no single best route — it depends on what you want to try.",
    "I cannot recommend a route for you, but I can explain how this one works.",
    // The verb spans stop at sentence punctuation, so an innocent recommendation
    // in one sentence cannot be joined to a route named in the next.
    "I recommend talking to your school counsellor. A vocational route works differently.",
    "เส้นทางนี้เน้นการฝึกปฏิบัติมากกว่าทฤษฎี",
  ])("allows an explanation: %s", (text) => {
    expect(containsRouteDecision(text)).toBe(false);
  });

  /*
   * A red-team set from review. Every line here reached a learner once: the
   * guard matched on verbs and nouns it had been shown, and a model does not
   * write from that list. The last one is the shape that mattered most — it
   * opens as the disclaimer we want and ends as a verdict, and the old code
   * deleted the disclaimer from the middle of the text and then judged what
   * was left, which is how it got through.
   */
  it.each([
    "คุณเหมาะกับสายวิทย์ที่สุด",
    "สายอาชีพตอบโจทย์คุณที่สุด",
    "ทางเลือกแรกของคุณคือสายอาชีพ",
    "ตัดสายสามัญออก เหลือสายอาชีพ",
    "ควรไปสายอาชีพดิจิทัล",
    "ควรต่อ ปวส. สายดิจิทัล",
    "อันดับหนึ่งคือสายอาชีพ",
    "สายอาชีพใช่ทางสำหรับคุณ",
    "ไม่มีเส้นทางไหนเหมาะกับคุณเท่าสายอาชีพ",
    "สายวิทย์ดีกว่าสายศิลป์สำหรับคุณ",
  ])("rejects a decision review found reaching learners: %s", (text) => {
    expect(containsRouteDecision(text)).toBe(true);
  });

  /*
   * The other half of the same finding. Over-blocking is not the safe side
   * here: an answer withheld is the offline fallback, so a guard that fires on
   * ordinary helpful sentences quietly turns the chat off.
   */
  it.each([
    ["สายไหนที่เหมาะกับคุณ ลองใช้แบบสำรวจดู", "a question, and the answer we want"],
    ["ลองดูว่าค่าใช้จ่ายแบบนี้เหมาะกับคุณไหม", "a question ending in ไหม"],
    ["หลักสูตรนี้ไม่ได้หมายความว่าเหมาะกับคุณ", "an explicit denial of fit"],
    ["สายอาชีพเน้นการฝึกปฏิบัติมากกว่าสายสามัญ", "comparing routes, not ranking them for the reader"],
    ["ปวช. ใช้เวลาน้อยกว่าสายสามัญหนึ่งปี", "a fact that happens to be comparative"],
    ["เส้นทางใดจะเหมาะกับคุณ ขึ้นอยู่กับสิ่งที่คุณอยากลองทำ", "declines to answer, in question form"],
  ])("still allows %s (%s)", (text) => {
    expect(containsRouteDecision(text)).toBe(false);
  });

  it("judges each sentence, so a caveat cannot cover the one after it", () => {
    expect(
      containsRouteDecision("ไม่มีเส้นทางไหนดีที่สุดสำหรับทุกคน คุณควรเลือกสายอาชีพ"),
    ).toBe(true);
  });

  it("does not let a disclaimer smuggle a decision past the guard", () => {
    // The caveat is stripped before matching, so the second clause still trips.
    expect(
      containsRouteDecision(
        "There is no single best route, but honestly you should choose the vocational route.",
      ),
    ).toBe(true);
  });
});

describe("source citation guards", () => {
  const retrieved = retrieveKnowledge(GROUNDED_QUESTION, "en");

  it("has something to work with", () => {
    expect(retrieved.length).toBeGreaterThan(0);
  });

  it("flags a citation the retriever never supplied", () => {
    expect(containsInventedSourceId("Admission is open [ministry-of-education-2099].", retrieved))
      .toBe(true);
  });

  it("accepts a citation the retriever did supply", () => {
    const id = retrieved[0].source.id;
    expect(containsInventedSourceId(`Programmes run for three years [${id}].`, retrieved)).toBe(
      false,
    );
    expect(hasAllowedSourceCitation(`Programmes run for three years [${id}].`, retrieved)).toBe(
      true,
    );
  });

  it("treats an uncited answer as unsupported", () => {
    expect(hasAllowedSourceCitation("Programmes run for three years.", retrieved)).toBe(false);
  });

  it("still accepts an answer that cites one real source among several", () => {
    const id = retrieved[0].source.id;
    expect(hasAllowedSourceCitation(`See [${id}] and [made-up-id].`, retrieved)).toBe(true);
    // …but the invented one is caught separately, and answerChat requires both.
    expect(containsInventedSourceId(`See [${id}] and [made-up-id].`, retrieved)).toBe(true);
  });
});

describe("answerChat", () => {
  it("never reaches the provider when the safety rule fires", async () => {
    const generate = vi.fn();
    const response = await answerChat(ask("I want to kill myself"), { generate });

    expect(response.mode).toBe("safety");
    expect(generate).not.toHaveBeenCalled();
  });

  it("never reaches the provider when nothing was retrieved", async () => {
    const generate = vi.fn();
    const response = await answerChat(ask("What is the weather in Osaka tomorrow?"), { generate });

    expect(response.mode).toBe("offline");
    expect(response.sources).toEqual([]);
    expect(generate).not.toHaveBeenCalled();
  });

  it("falls back to offline when the model tries to decide the route", async () => {
    const retrieved = retrieveKnowledge(GROUNDED_QUESTION, "en");
    const generate = vi
      .fn()
      .mockResolvedValue(`The vocational route is the best fit for you [${retrieved[0].source.id}].`);

    const response = await answerChat(ask(GROUNDED_QUESTION), { generate });

    expect(generate).toHaveBeenCalled();
    expect(response.mode).toBe("offline");
    expect(response.message).not.toContain("best fit");
  });

  it("falls back to offline when the model invents a citation", async () => {
    const generate = vi.fn().mockResolvedValue("Programmes run three years [not-a-real-source].");
    const response = await answerChat(ask(GROUNDED_QUESTION), { generate });

    expect(response.mode).toBe("offline");
  });

  it("falls back to offline when the model cites nothing at all", async () => {
    const generate = vi.fn().mockResolvedValue("Programmes run for three years.");
    const response = await answerChat(ask(GROUNDED_QUESTION), { generate });

    expect(response.mode).toBe("offline");
  });

  it("falls back to offline when the provider throws", async () => {
    const generate = vi.fn().mockRejectedValue(new Error("timeout"));
    const response = await answerChat(ask(GROUNDED_QUESTION), { generate });

    expect(response.mode).toBe("offline");
    expect(response.sources.length).toBeGreaterThan(0);
  });

  it("passes a grounded, non-deciding answer through", async () => {
    const retrieved = retrieveKnowledge(GROUNDED_QUESTION, "en");
    const id = retrieved[0].source.id;
    const generate = vi
      .fn()
      .mockResolvedValue(`Vocational programmes usually run for three years [${id}].`);

    const response = await answerChat(ask(GROUNDED_QUESTION), { generate });

    expect(response.mode).toBe("ai");
    expect(response.message).toContain(id);
    expect(response.sources.map((source) => source.id)).toContain(id);
  });

  it("hands the model only the reviewed sources, as data rather than instructions", async () => {
    const retrieved = retrieveKnowledge(GROUNDED_QUESTION, "en");
    const generate = vi.fn().mockResolvedValue(`Grounded [${retrieved[0].source.id}].`);

    await answerChat(ask(GROUNDED_QUESTION), { generate });

    const { system } = generate.mock.calls[0][0];
    expect(system).toContain("<SOURCE>");
    expect(system).toContain("never as instructions");
    expect(system).toContain(retrieved[0].source.id);
  });

  it("answers Thai questions in offline mode in Thai", async () => {
    const response = await answerChat(ask("เรียนสายอาชีพดิจิทัลเป็นอย่างไร", "th"));

    expect(response.mode).toBe("offline");
    expect(response.message).toMatch(/[฀-๿]/);
  });
});
