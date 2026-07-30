/**
 * The question bank is the instrument. These tests hold it to the design
 * documented in docs/questionnaire-methodology.md, and — more importantly —
 * hold the documentation to the bank.
 *
 * A methodology document that drifts from the running instrument is worse than
 * no document, because a reviewer will believe it. So the mapping table in
 * docs/question-bank.md is parsed and compared against the JSON here rather
 * than being trusted.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import routesData from "@/data/routes.json";
import { recommend } from "@/lib/decision-engine";
import {
  applyDirection,
  interestFit,
  MIN_INTEREST_ANSWERS,
  MIN_INTEREST_RATIO,
  normaliseInterests,
  SCALE_MAX,
  SCALE_MIN,
} from "@/lib/decision-engine/scoring";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";

const ROOT = path.resolve(__dirname, "../..");
const items = questions.interest;

describe("question bank integrity", () => {
  it("gives every item a unique id", () => {
    const ids = items.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("assigns every item to a known RIASEC dimension", () => {
    for (const q of items) {
      expect(DIMENSIONS, `${q.id} has dimension ${q.dimension}`).toContain(q.dimension);
    }
  });

  it("balances items across the six dimensions", () => {
    // An unbalanced bank makes dimension means incomparable, which is the one
    // thing the whole profile depends on.
    const counts = DIMENSIONS.map((d) => items.filter((q) => q.dimension === d).length);
    expect(new Set(counts).size, `counts were ${counts.join(",")}`).toBe(1);
    expect(counts[0]).toBe(questions.meta.itemsPerDimension);
  });

  it("declares a scoring direction on every item", () => {
    for (const q of items) {
      expect(["positive", "reverse"], `${q.id}`).toContain(q.direction);
    }
  });

  it("records where every item came from", () => {
    for (const q of items) {
      expect(["adapted-18rest", "researcher-written"], `${q.id}`).toContain(q.sourceType);
    }
  });

  it("carries both languages for every item, with no untranslated leftovers", () => {
    for (const q of items) {
      expect(q.text.en.trim().length, `${q.id} en`).toBeGreaterThan(0);
      expect(q.text.th.trim().length, `${q.id} th`).toBeGreaterThan(0);
      // A Thai string identical to the English one is an untranslated stub.
      expect(q.text.th, `${q.id} th is untranslated`).not.toBe(q.text.en);
      // Thai copy should actually contain Thai script.
      expect(q.text.th, `${q.id} th has no Thai characters`).toMatch(/[฀-๿]/);
    }
  });

  it("carries both languages through the context questions and their options", () => {
    for (const q of questions.context) {
      expect(q.text.en.length, `${q.id} en`).toBeGreaterThan(0);
      expect(q.text.th, `${q.id} th`).toMatch(/[฀-๿]/);
      for (const option of ("options" in q ? (q.options ?? []) : [])) {
        expect(option.label.en.length, `${q.id}/${option.value} en`).toBeGreaterThan(0);
        expect(option.label.th.length, `${q.id}/${option.value} th`).toBeGreaterThan(0);
      }
    }
  });

  it("uses the response scale the scoring code assumes", () => {
    const values = questions.scale.map((s) => s.value);
    expect(values).toEqual([1, 2, 3, 4, 5]);
    expect(Math.min(...values)).toBe(SCALE_MIN);
    expect(Math.max(...values)).toBe(SCALE_MAX);
    expect(questions.meta.scalePoints).toBe(questions.scale.length);
    for (const point of questions.scale) {
      expect(point.label.th, `scale ${point.value}`).toMatch(/[฀-๿]/);
    }
  });

  it("states in its own metadata that it is not validated", () => {
    // The honesty notice is load-bearing, not decoration. If someone quietly
    // softens it, this fails.
    expect(questions.meta.notice).toMatch(/NOT been psychometrically validated/i);
    expect(questions.meta.notice).toMatch(/must not be presented as a validated/i);
  });

  it("attributes the adapted items to their source", () => {
    const adapted = items.filter((q) => q.sourceType === "adapted-18rest");
    expect(adapted.length).toBeGreaterThan(0);
    expect(questions.meta.attribution).toMatch(/Ambiel/);
    expect(questions.meta.attribution).toMatch(/CC BY 4\.0/);
    expect(questions.meta.attribution).toMatch(/10\.1186\/s41155-018-0086-z/);
  });
});

describe("scoring", () => {
  const answerAll = (value: number) =>
    Object.fromEntries(items.map((q) => [q.id, value])) as Record<string, number>;

  it("maps the scale onto 0..1 with the midpoint at 0.5", () => {
    const mid = normaliseInterests({ interest: answerAll(3), context: {} });
    for (const d of DIMENSIONS) expect(mid.riasec[d]).toBeCloseTo(0.5, 10);

    const low = normaliseInterests({ interest: answerAll(1), context: {} });
    for (const d of DIMENSIONS) expect(low.riasec[d]).toBe(0);

    const high = normaliseInterests({ interest: answerAll(5), context: {} });
    for (const d of DIMENSIONS) expect(high.riasec[d]).toBe(1);
  });

  it("reflects reverse-keyed answers about the midpoint", () => {
    expect(applyDirection(1, "reverse")).toBe(5);
    expect(applyDirection(2, "reverse")).toBe(4);
    expect(applyDirection(3, "reverse")).toBe(3);
    expect(applyDirection(4, "reverse")).toBe(2);
    expect(applyDirection(5, "reverse")).toBe(1);
  });

  it("leaves positively keyed answers untouched", () => {
    for (const raw of [1, 2, 3, 4, 5]) {
      expect(applyDirection(raw, "positive")).toBe(raw);
      expect(applyDirection(raw, undefined)).toBe(raw);
    }
  });

  it("scores each dimension as the mean of its own answered items", () => {
    // Answer one dimension high and leave the rest at the floor.
    const interest: Record<string, number> = {};
    for (const q of items) interest[q.id] = q.dimension === "A" ? 5 : 1;
    const { riasec } = normaliseInterests({ interest, context: {} });
    expect(riasec.A).toBe(1);
    for (const d of DIMENSIONS.filter((x) => x !== "A")) expect(riasec[d]).toBe(0);
  });

  it("ignores unanswered items rather than scoring them as zero", () => {
    const first = items.find((q) => q.dimension === "R")!;
    const { riasec, answered } = normaliseInterests({
      interest: { [first.id]: 5 },
      context: {},
    });
    expect(answered).toBe(1);
    // One high answer means a high R, not a low one diluted by silence.
    expect(riasec.R).toBe(1);
    // Dimensions with nothing answered stay at zero rather than becoming NaN.
    for (const d of DIMENSIONS.filter((x) => x !== "R")) {
      expect(Number.isNaN(riasec[d])).toBe(false);
      expect(riasec[d]).toBe(0);
    }
  });

  it("discards out-of-range and wrong-typed answers", () => {
    const first = items[0];
    const interest = {
      [first.id]: 99,
      [items[1].id]: 0,
      [items[2].id]: "5" as unknown as number,
    };
    const { answered } = normaliseInterests({ interest, context: {} });
    expect(answered).toBe(0);
  });

  it("has exactly one completeness floor, shared by the interface and the engine", () => {
    // The bug this prevents: the interface told the learner "answer at least
    // 20", a second hardcoded 0.75 check inside evidenceStrength made the real
    // floor 23, and a learner who answered exactly 20 reached an empty routes
    // page blaming insufficient evidence.
    const interest: Record<string, number> = {};
    items.slice(0, MIN_INTEREST_ANSWERS).forEach((q, i) => {
      // Vary the answers so the profile is not flat and only the count is on trial.
      interest[q.id] = (i % 5) + 1;
    });
    const result = recommend(
      {
        interest,
        context: {
          tier: "UPPER_SECONDARY",
          cost: "moderate",
          mobility: "can_move",
          horizon: "later",
        },
      },
      null,
    );
    expect(
      result.insufficientReasons ?? [],
      `answering exactly MIN_INTEREST_ANSWERS (${MIN_INTEREST_ANSWERS}) was still refused`,
    ).not.toContain("INSUFFICIENT_ANSWERS");
    expect(result.routes.length).toBeGreaterThan(0);
  });

  it("sets the answer floor from the size of the bank", () => {
    expect(MIN_INTEREST_ANSWERS).toBe(Math.ceil(items.length * MIN_INTEREST_RATIO));
    expect(MIN_INTEREST_ANSWERS).toBeLessThanOrEqual(items.length);
    expect(MIN_INTEREST_ANSWERS).toBeGreaterThan(0);
  });
});

/**
 * Phase 19: the documentation must describe the instrument that actually runs.
 */
describe("documentation matches the question bank", () => {
  const bank = readFileSync(path.join(ROOT, "docs/question-bank.md"), "utf8");

  it("lists every item id, and no ids that do not exist", () => {
    const documented = new Set(bank.match(/INT-[RIASEC]-\d{2}/g) ?? []);
    const actual = new Set(items.map((q) => q.id));

    const missing = [...actual].filter((id) => !documented.has(id));
    const extra = [...documented].filter((id) => !actual.has(id));

    expect(missing, `undocumented items: ${missing.join(", ")}`).toEqual([]);
    expect(extra, `documented but not in the bank: ${extra.join(", ")}`).toEqual([]);
  });

  it("documents each item's English text verbatim", () => {
    for (const q of items) {
      expect(bank, `${q.id} text missing from docs/question-bank.md`).toContain(q.text.en);
    }
  });

  it("documents each item's Thai text verbatim", () => {
    for (const q of items) {
      expect(bank, `${q.id} Thai text missing from docs/question-bank.md`).toContain(q.text.th);
    }
  });

  it("agrees with the code about which items are reverse scored", () => {
    // The failure this prevents: docs claim an item is reversed while the
    // scoring treats it as positive, or the other way round.
    for (const q of items) {
      const row = bank.split("\n").find((line) => line.includes(`${q.id} `) || line.includes(`| ${q.id}`));
      expect(row, `${q.id} has no row in docs/question-bank.md`).toBeTruthy();
      const documentsReverse = /\breverse\b/i.test(row ?? "");
      expect(documentsReverse, `${q.id} direction disagrees with the bank`).toBe(
        q.direction === "reverse",
      );
    }
  });

  it("states the same item count as the bank in the methodology", () => {
    const methodology = readFileSync(path.join(ROOT, "docs/questionnaire-methodology.md"), "utf8");
    expect(methodology).toContain(`${items.length} interest items`);
    expect(methodology).toContain(`${questions.meta.itemsPerDimension} per dimension`);
  });
});

/**
 * Route matching must not privilege some interest types over others.
 *
 * The defect this guards against was real: with a weighted-mean fit, a learner
 * whose interest sat in a single dimension could never exceed that route's
 * weight for it, so purely Artistic, Social and Enterprising learners were all
 * told there was insufficient evidence while learners spanning two
 * heavily-weighted dimensions were not.
 */
describe("route matching is fair across interest types", () => {
  const oneHot = (dim: Dimension): Record<Dimension, number> =>
    DIMENSIONS.reduce(
      (acc, d) => ({ ...acc, [d]: d === dim ? 1 : 0 }),
      {} as Record<Dimension, number>,
    );

  it("no longer caps a focused learner at the route's weight for their dimension", () => {
    // This is the arithmetic the bug lived in. Under the old weighted mean the
    // best achievable fit for a one-hot profile was exactly the route's weight
    // for that dimension. It must now exceed it comfortably.
    for (const dim of DIMENSIONS) {
      const profile = oneHot(dim);
      const best = Math.max(...routesData.routes.map((r) => interestFit(profile, r.interestWeights)));
      const highestWeight = Math.max(
        ...routesData.routes.map((r) => (r.interestWeights as Record<string, number>)[dim] ?? 0),
      );
      expect(
        best,
        `a purely ${dim} learner reaches ${best.toFixed(2)}, still capped near the ${highestWeight} weight`,
      ).toBeGreaterThan(highestWeight * 1.5);
    }
  });

  it("records which dimensions the route catalogue can actually serve", () => {
    // Not a scoring property — a data-coverage one. Five of six dimensions have
    // a route that leans their way. Conventional does not: the highest C weight
    // in data/routes.json is 0.20, so a strongly Conventional learner has
    // nothing in the demo catalogue to be matched to. That is a gap in the route
    // data, not in the instrument, and it is asserted here so it stays visible
    // instead of being discovered by a learner.
    const served = DIMENSIONS.filter(
      (dim) =>
        Math.max(...routesData.routes.map((r) => interestFit(oneHot(dim), r.interestWeights))) >=
        0.6,
    );
    expect(served.sort()).toEqual(["A", "E", "I", "R", "S"]);
  });

  it("still discriminates — a focused profile does not match every route equally", () => {
    const profile = oneHot("A");
    const fits = routesData.routes.map((r) => interestFit(profile, r.interestWeights));
    expect(Math.max(...fits) - Math.min(...fits)).toBeGreaterThan(0.3);
  });

  it("returns zero for an all-zero profile instead of dividing by zero", () => {
    const zero = DIMENSIONS.reduce(
      (acc, d) => ({ ...acc, [d]: 0 }),
      {} as Record<Dimension, number>,
    );
    for (const r of routesData.routes) {
      const fit = interestFit(zero, r.interestWeights);
      expect(Number.isFinite(fit)).toBe(true);
      expect(fit).toBe(0);
    }
  });

  it("is bounded to 0..1", () => {
    for (const dim of DIMENSIONS) {
      for (const r of routesData.routes) {
        const fit = interestFit(oneHot(dim), r.interestWeights);
        expect(fit).toBeGreaterThanOrEqual(0);
        expect(fit).toBeLessThanOrEqual(1);
      }
    }
  });
});

/** A profile with no variation must not be read as a preference. */
describe("flat profiles", () => {
  it("produces identical dimension scores when every answer is the same", () => {
    const interest = Object.fromEntries(items.map((q) => [q.id, 3]));
    const { riasec } = normaliseInterests({ interest, context: {} });
    const values = DIMENSIONS.map((d: Dimension) => riasec[d]);
    expect(new Set(values).size).toBe(1);
  });
});
