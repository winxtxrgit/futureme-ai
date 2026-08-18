import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import {
  findContradictions,
  interestFit,
  keywordEvidence,
  normaliseInterests,
  scoreMissionEvidence,
  topDimensions,
  WEIGHTS,
} from "@/lib/decision-engine/scoring";
import type { Dimension, InterviewInput } from "@/lib/decision-engine/types";

const idsFor = (d: string) => questions.interest.filter((q) => q.dimension === d).map((q) => q.id);

function interview(overrides: Record<string, number> = {}): InterviewInput {
  return { interest: { ...overrides }, context: {} };
}

describe("weights", () => {
  it("sum to exactly 1", () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("match the weights documented in docs/04-ai-system.md", () => {
    expect(WEIGHTS).toEqual({
      interests: 0.3,
      feasibility: 0.25,
      strengths: 0.2,
      learningStyle: 0.15,
      flexibility: 0.1,
    });
  });
});

describe("normaliseInterests", () => {
  it("maps the Likert range onto 0..1", () => {
    const [a, b] = idsFor("R");
    expect(normaliseInterests(interview({ [a]: 1, [b]: 1 })).riasec.R).toBe(0);
    expect(normaliseInterests(interview({ [a]: 5, [b]: 5 })).riasec.R).toBe(1);
    expect(normaliseInterests(interview({ [a]: 3, [b]: 3 })).riasec.R).toBeCloseTo(0.5);
  });

  it("excludes unanswered items rather than scoring them as zero", () => {
    const [a, b] = idsFor("I");
    const partial = normaliseInterests(interview({ [a]: 5 }));
    const both = normaliseInterests(interview({ [a]: 5, [b]: 5 }));
    // One high answer must not be dragged down by the missing second item.
    expect(partial.riasec.I).toBe(1);
    expect(both.riasec.I).toBe(1);
    expect(partial.answered).toBe(1);
  });

  it("ignores out-of-range values", () => {
    const [a] = idsFor("A");
    const r = normaliseInterests(interview({ [a]: 99, unknownId: 3 }));
    expect(r.answered).toBe(0);
  });

  it("reports the true item total", () => {
    expect(normaliseInterests(interview()).total).toBe(questions.interest.length);
  });
});

describe("keywordEvidence", () => {
  it("detects whole words only", () => {
    const kw = { R: ["build"], I: ["data"] };
    expect(keywordEvidence("I build things", kw).R).toBe(1);
    expect(keywordEvidence("rebuilding", kw).R).toBe(0);
  });

  it("is case-insensitive and tolerates punctuation", () => {
    expect(keywordEvidence("BUILD, always.", { R: ["build"] }).R).toBe(1);
  });

  it("returns zeros for empty text", () => {
    expect(keywordEvidence("", { R: ["build"] }).R).toBe(0);
  });
});

describe("scoreMissionEvidence", () => {
  it("returns no signals for a missing or incomplete mission", () => {
    expect(scoreMissionEvidence(null).signals).toBe(0);
    expect(
      scoreMissionEvidence({ missionId: "mission-school-problem", answers: {}, completed: false })
        .signals,
    ).toBe(0);
  });

  it("produces a normalised vector whose maximum is 1", () => {
    const r = scoreMissionEvidence({
      missionId: "mission-school-problem",
      completed: true,
      answers: { approach: ["build", "prototype"], energy: "making" },
    });
    expect(r.signals).toBeGreaterThan(0);
    expect(Math.max(...Object.values(r.vector))).toBeCloseTo(1);
  });

  it("routes hands-on choices to the Realistic dimension", () => {
    const r = scoreMissionEvidence({
      missionId: "mission-school-problem",
      completed: true,
      answers: { approach: ["build"], energy: "making" },
    });
    expect(r.vector.R).toBeGreaterThan(r.vector.S);
  });

  it("routes people-focused choices to the Social dimension", () => {
    const r = scoreMissionEvidence({
      missionId: "mission-school-problem",
      completed: true,
      answers: { approach: ["interview"], energy: "people" },
    });
    expect(r.vector.S).toBeGreaterThan(r.vector.R);
  });

  it("ignores an unknown mission id", () => {
    expect(
      scoreMissionEvidence({ missionId: "does-not-exist", answers: { a: "b" }, completed: true })
        .signals,
    ).toBe(0);
  });
});

describe("findContradictions", () => {
  const flat = (v: number) =>
    ({ R: v, I: v, A: v, S: v, E: v, C: v }) as Record<Dimension, number>;

  it("flags dimensions where the two sources diverge sharply", () => {
    const a = { ...flat(0), A: 1 };
    const b = { ...flat(0), R: 1 };
    expect(findContradictions(a, b)).toEqual(expect.arrayContaining(["A", "R"]));
  });

  it("finds nothing when the sources agree", () => {
    expect(findContradictions(flat(0.5), flat(0.5))).toEqual([]);
  });
});

describe("interestFit and topDimensions", () => {
  it("returns 0 when the weight set is empty", () => {
    expect(interestFit({ R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 }, {})).toBe(0);
  });

  it("orders dimensions by strength", () => {
    const p = { R: 0.1, I: 0.9, A: 0.5, S: 0.2, E: 0.3, C: 0.4 } as Record<Dimension, number>;
    expect(topDimensions(p, 2)).toEqual(["I", "A"]);
  });
});
