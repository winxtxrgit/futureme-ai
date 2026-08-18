import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import {
  MAX_CHOICE_REPLY_LENGTH,
  normalizeInterviewReply,
  parseContextReply,
  parseInterestReply,
  type LikertValue,
  type ReplyChoice,
} from "@/lib/interview/reply-parser";

/*
 * The gate every answer in the conversational interview passes through.
 *
 * Its rule is that a reply it cannot read is asked again rather than guessed
 * at — a wrong guess writes an answer the learner never gave into an
 * assessment that goes on to suggest study routes. Most of what is below
 * therefore pins what must keep being *rejected*; the accepted cases are the
 * narrow set where the learner did answer and only politeness got in the way.
 */

const SCALE = questions.scale as { value: LikertValue; label: { en: string; th: string } }[];
const LIKERT: ReplyChoice<LikertValue>[] = SCALE.map((s) => ({ value: s.value, label: s.label }));

function contextChoices(id: "tier" | "cost" | "mobility" | "horizon") {
  const question = questions.context.find((q) => q.id === id);
  if (!question?.options) throw new Error(`no options for ${id}`);
  return question.options as ReplyChoice<never>[];
}

describe("normalizeInterviewReply", () => {
  it("maps Thai digits onto Arabic ones", () => {
    expect(normalizeInterviewReply("๔")).toBe("4");
  });

  it("collapses whitespace and drops a single trailing full stop", () => {
    expect(normalizeInterviewReply("  I  like   it. ")).toBe("i like it");
  });

  it("keeps a question mark, because it changes the meaning", () => {
    expect(normalizeInterviewReply("Like?")).not.toBe("like");
  });

  it("strips a politeness particle", () => {
    expect(normalizeInterviewReply("ชอบครับ")).toBe("ชอบ");
    expect(normalizeInterviewReply("ชอบค่ะ")).toBe("ชอบ");
  });

  it("strips a run of them, and one written after a space", () => {
    expect(normalizeInterviewReply("ชอบนะครับ")).toBe("ชอบ");
    expect(normalizeInterviewReply("ชอบ ครับ")).toBe("ชอบ");
  });

  it("leaves a reply that is only a particle alone, so it stays a miss", () => {
    expect(normalizeInterviewReply("ครับ")).toBe("ครับ");
  });

  it("leaves a drawn-out spelling alone — the length is the answer", () => {
    expect(normalizeInterviewReply("ชอบบบ")).toBe("ชอบบบ");
  });
});

describe("parseInterestReply", () => {
  it("reads the plain answers", () => {
    expect(parseInterestReply("ชอบ", LIKERT)).toEqual({ ok: true, value: 4 });
    expect(parseInterestReply("ไม่ชอบ", LIKERT)).toEqual({ ok: true, value: 2 });
    expect(parseInterestReply("ไม่แน่ใจ", LIKERT)).toEqual({ ok: true, value: 3 });
  });

  it("reads a number, in either script", () => {
    expect(parseInterestReply("4", LIKERT)).toEqual({ ok: true, value: 4 });
    expect(parseInterestReply("๔", LIKERT)).toEqual({ ok: true, value: 4 });
  });

  it.each(["ชอบครับ", "ชอบค่ะ", "ชอบคะ", "ชอบนะครับ", "ชอบ ค่ะ"])(
    "accepts a polite form of an answer it already knew: %s",
    (reply) => {
      expect(parseInterestReply(reply, LIKERT)).toEqual({ ok: true, value: 4 });
    },
  );

  it("keeps politeness out of the answer at both ends of the scale", () => {
    expect(parseInterestReply("ไม่ชอบครับ", LIKERT)).toEqual({ ok: true, value: 2 });
    expect(parseInterestReply("ชอบมากค่ะ", LIKERT)).toEqual({ ok: true, value: 5 });
  });

  /*
   * เลย is the case this whole change had to be careful about: it is not a
   * particle but an intensifier, and it separates the bottom of the scale from
   * one step up. Stripping it would rewrite a learner's answer.
   */
  it("does not confuse an intensifier with a particle", () => {
    expect(parseInterestReply("ไม่ชอบเลย", LIKERT)).toEqual({ ok: true, value: 1 });
    expect(parseInterestReply("ไม่ชอบ", LIKERT)).toEqual({ ok: true, value: 2 });
    expect(parseInterestReply("ไม่ชอบเลยครับ", LIKERT)).toEqual({ ok: true, value: 1 });
  });

  /*
   * Drawing the word out is how strength gets expressed in writing, so a
   * collapsed "ชอบบบ" would be this parser inventing a point on the scale.
   * Asking again is the only honest response.
   */
  it.each(["ชอบบบ", "ไม่ชอบบบ", "ชอบบบบบ"])("asks again about a drawn-out %s", (reply) => {
    expect(parseInterestReply(reply, LIKERT).ok).toBe(false);
  });

  it.each([
    ["ชอบมั้ง", "hedged — the learner is not sure"],
    ["ก็ชอบ", "hedged"],
    ["น่าจะชอบ", "hedged: probably, not definitely"],
    ["คงไม่ชอบ", "hedged in the other direction"],
    ["ไม่ค่อยชอบเท่าไหร่", "a different degree, not a politer ไม่ชอบ"],
    ["น่าสนใจ", "interesting is not a point on this scale"],
    ["ชอบแต่ไม่มาก", "two answers at once"],
    ["ครับ", "no answer in it at all"],
  ])("still refuses to guess at %s (%s)", (reply) => {
    const result = parseInterestReply(reply, LIKERT);
    expect(result.ok).toBe(false);
  });

  it("reports an empty reply as empty, not as unreadable", () => {
    expect(parseInterestReply("   ", LIKERT)).toEqual({ ok: false, reason: "empty" });
  });

  it("refuses a reply long enough to be prose rather than an answer", () => {
    const long = "ชอบ".repeat(MAX_CHOICE_REPLY_LENGTH);
    expect(parseInterestReply(long, LIKERT)).toEqual({ ok: false, reason: "too_long" });
  });
});

describe("parseContextReply", () => {
  it("reads a polite answer to the situation questions too", () => {
    const tier = parseContextReply("tier", "ปวช.ครับ", contextChoices("tier") as never);
    expect(tier).toEqual({ ok: true, value: "VOCATIONAL" });
  });

  it("does not strip anything from a cost answer that ends in a real word", () => {
    // ค่า is deliberately not in the particle list: it is the word for cost.
    const cost = parseContextReply("cost", "ค่าใช้จ่ายต่ำ", contextChoices("cost") as never);
    expect(cost).toEqual({ ok: true, value: "tight" });
  });

  it("keeps yes and no apart when both are polite", () => {
    const yes = parseContextReply("mobility", "ได้ครับ", contextChoices("mobility") as never);
    const no = parseContextReply("mobility", "ไม่ได้ครับ", contextChoices("mobility") as never);
    expect(yes).toEqual({ ok: true, value: "can_move" });
    expect(no).toEqual({ ok: true, value: "local_only" });
  });
});
