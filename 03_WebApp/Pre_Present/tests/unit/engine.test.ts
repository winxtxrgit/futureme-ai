import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import routesData from "@/data/routes.json";
import { MAX_ROUTES, recommend } from "@/lib/decision-engine";
import { evaluateEligibility, isStale } from "@/lib/decision-engine/eligibility";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine/scoring";
import type { InterviewInput, MissionInput } from "@/lib/decision-engine/types";

const FIXED_NOW = new Date("2026-02-01T00:00:00Z");

/** Answer every item, with the named dimensions high and the rest low. */
function profileFor(high: string[], highValue = 5, lowValue = 1): InterviewInput["interest"] {
  const out: Record<string, number> = {};
  for (const q of questions.interest) {
    out[q.id] = high.includes(q.dimension) ? highValue : lowValue;
  }
  return out;
}

function build(
  high: string[],
  context: InterviewInput["context"] = {},
  interestOverride?: Record<string, number>,
): InterviewInput {
  return {
    interest: interestOverride ?? profileFor(high),
    context: {
      tier: "LOWER_SECONDARY",
      cost: "flexible",
      mobility: "can_move",
      horizon: "unsure",
      ...context,
    },
  };
}

const handsOnMission: MissionInput = {
  missionId: "mission-school-problem",
  completed: true,
  answers: {
    problem: "The tool cupboard is chaos and people waste time looking for things.",
    approach: ["build", "organise"],
    evidence: "I would count how long it takes to find a tool before and after.",
    energy: "making",
  },
};

const peopleMission: MissionInput = {
  missionId: "mission-school-problem",
  completed: true,
  answers: {
    problem: "Younger students do not know who to ask for help with homework.",
    approach: ["interview", "recruit"],
    evidence: "I would ask them each week whether they found someone to help.",
    energy: "people",
  },
};

describe("evidence gates", () => {
  it("returns no routes when too few interview items are answered", () => {
    const partial: Record<string, number> = {};
    questions.interest.slice(0, MIN_INTEREST_ANSWERS - 1).forEach((q) => (partial[q.id] = 5));
    const r = recommend(build([], {}, partial), null, FIXED_NOW);

    expect(r.insufficientEvidence).toBe(true);
    expect(r.routes).toHaveLength(0);
    expect(r.insufficientReasons).toContain("INSUFFICIENT_ANSWERS");
  });

  it("returns no routes when every answer is identical, leaving no signal", () => {
    const flat: Record<string, number> = {};
    questions.interest.forEach((q) => (flat[q.id] = 3));
    const r = recommend(build([], {}, flat), null, FIXED_NOW);

    expect(r.insufficientEvidence).toBe(true);
    expect(r.routes).toHaveLength(0);
    expect(r.insufficientReasons).toContain("INSUFFICIENT_EVIDENCE");
  });

  it("never returns more than three routes", () => {
    const r = recommend(build(["R", "I", "A", "S", "E", "C"]), handsOnMission, FIXED_NOW);
    expect(r.routes.length).toBeLessThanOrEqual(MAX_ROUTES);
  });
});

describe("hard constraints", () => {
  it("filters out high-cost routes when cost is a hard constraint", () => {
    const r = recommend(build(["I"], { cost: "tight" }), handsOnMission, FIXED_NOW);
    const blocked = r.ineligible.filter((x) => x.reasons.includes("COST_CONSTRAINT"));

    expect(blocked.length).toBeGreaterThan(0);
    for (const route of r.routes) expect(route.costBand).not.toBe("high");
  });

  it("filters out routes requiring relocation when the learner cannot move", () => {
    const r = recommend(build(["I"], { mobility: "local_only" }), handsOnMission, FIXED_NOW);

    expect(r.ineligible.some((x) => x.reasons.includes("LOCATION_CONSTRAINT"))).toBe(true);
    for (const route of r.routes) expect(route.requiresRelocation).toBe(false);
  });

  it("filters out routes not offered at the learner's stage", () => {
    const r = recommend(build(["A"], { tier: "VOCATIONAL" }), handsOnMission, FIXED_NOW);
    expect(r.ineligible.some((x) => x.reasons.includes("TIER_MISMATCH"))).toBe(true);
  });

  /*
   * These used to pin the exact number of survivors, which made them a test of
   * how many routes the catalogue happens to hold rather than of the filtering.
   * Growing the catalogue from six to twelve broke them without anything being
   * wrong. What matters is the invariant and the reasons, so that is what they
   * assert now.
   */
  it("narrows the catalogue and never offers more than the cap", () => {
    const r = recommend(
      build(["I"], { tier: "UPPER_SECONDARY", cost: "tight", mobility: "can_move" }),
      handsOnMission,
      FIXED_NOW,
    );
    expect(r.routes.length).toBeGreaterThan(0);
    expect(r.routes.length).toBeLessThanOrEqual(MAX_ROUTES);
    // Something was actually filtered — otherwise the constraints did nothing.
    expect(r.ineligible.length).toBeGreaterThan(0);
    expect(r.insufficientEvidence).toBe(false);
  });

  it("says why each rejected route was rejected", () => {
    const r = recommend(
      build(["E", "C"], { tier: "UPPER_SECONDARY", cost: "tight", mobility: "local_only" }),
      peopleMission,
      FIXED_NOW,
    );
    expect(r.routes.length).toBeGreaterThan(0);
    expect(r.routes.length).toBeLessThanOrEqual(MAX_ROUTES);
    expect(r.insufficientEvidence).toBe(false);

    // A tight budget and no ability to move are the constraints in play, so
    // every exclusion should name one of the reasons the engine can give. A
    // route dropped with an empty reason list would be the engine refusing
    // without saying why, which is the thing this product is not allowed to do.
    expect(r.ineligible.length).toBeGreaterThan(0);
    for (const rejected of r.ineligible) {
      expect(rejected.reasons.length, `${rejected.routeId} rejected with no reason`)
        .toBeGreaterThan(0);
    }
    // Both constraints have to be visible in the reasons, not just one of them.
    const reasons = new Set(r.ineligible.flatMap((x) => x.reasons));
    expect(reasons).toContain("COST_CONSTRAINT");
    expect(reasons).toContain("LOCATION_CONSTRAINT");
  });

  /**
   * Zero routes is reachable through the evidence gates (covered above) but NOT
   * through the constraint filters with the current six-route demo catalogue:
   * `business-admin` is offered at every tier, is moderate cost and needs no
   * relocation, so it survives every constraint combination. This test pins
   * that fact so the claim in the docs stays honest as data changes.
   */
  it("documents that the demo catalogue always leaves at least one eligible route", () => {
    const combos = (["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"] as const).flatMap((tier) =>
      (["tight", "moderate", "flexible"] as const).flatMap((cost) =>
        (["local_only", "can_move"] as const).map((mobility) => ({ tier, cost, mobility })),
      ),
    );
    for (const c of combos) {
      const r = recommend(build(["I", "C"], c), handsOnMission, FIXED_NOW);
      expect(r.routes.length, JSON.stringify(c)).toBeGreaterThanOrEqual(1);
    }
  });

  it("treats unknown answers as a notice, never as a blocker", () => {
    const r = recommend(
      build(["I"], { cost: "unknown", mobility: "unknown" }),
      handsOnMission,
      FIXED_NOW,
    );
    expect(r.notices).toContain("MISSING_COST_DATA");
    expect(r.notices).toContain("MISSING_LOCATION_DATA");
    expect(r.ineligible.every((x) => !x.reasons.includes("COST_CONSTRAINT"))).toBe(true);
  });
});

describe("evidence strength", () => {
  it("is never 'strong' without a completed mission", () => {
    const r = recommend(build(["I", "R"]), null, FIXED_NOW);
    for (const route of r.routes) expect(route.evidenceStrength).not.toBe("strong");
  });

  it("downgrades to 'limited' when the mission contradicts the interview", () => {
    // Interview says creative; mission behaviour says hands-on and organising.
    const r = recommend(build(["A"]), handsOnMission, FIXED_NOW);
    const contradicted = r.routes.filter((x) => x.reasons.includes("MISSION_CONTRADICTS"));

    expect(r.profile.contradictions.length).toBeGreaterThan(0);
    for (const route of contradicted) expect(route.evidenceStrength).toBe("limited");
  });

  it("marks corroboration when the mission agrees with the interview", () => {
    const r = recommend(build(["S"]), peopleMission, FIXED_NOW);
    expect(r.routes.some((x) => x.reasons.includes("MISSION_CORROBORATES"))).toBe(true);
  });
});

describe("determinism and ties", () => {
  it("produces identical output for identical input", () => {
    const input = build(["I", "R"]);
    const a = recommend(input, handsOnMission, FIXED_NOW);
    const b = recommend(input, handsOnMission, FIXED_NOW);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("marks near-equal routes as tied rather than ranking them", () => {
    const r = recommend(build(["R", "I", "A", "S", "E", "C"], { cost: "moderate" }), handsOnMission, FIXED_NOW);
    const tied = r.routes.filter((x) => x.tiedWith.length > 0);
    for (const t of tied) expect(t.reasons).toContain("TIED_SCORES");
  });

  it("keeps every score within 0..100 and the composite consistent", () => {
    const r = recommend(build(["I", "C"]), handsOnMission, FIXED_NOW);
    for (const route of r.routes) {
      for (const [, v] of Object.entries(route.score)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("output contract", () => {
  it("gives every returned route reasons, open questions and an experiment", () => {
    const r = recommend(build(["I", "R"]), handsOnMission, FIXED_NOW);
    expect(r.routes.length).toBeGreaterThan(0);
    for (const route of r.routes) {
      expect(route.reasons.length).toBeGreaterThan(0);
      expect(route.openQuestions.length).toBeGreaterThan(0);
      expect(route.nextExperiment).toBeTruthy();
      expect(route.limitations.length).toBeGreaterThan(0);
    }
  });

  it("never exposes a raw ranking position or a match percentage", () => {
    const r = recommend(build(["I"]), handsOnMission, FIXED_NOW);
    const serialised = JSON.stringify(r.routes);
    expect(serialised).not.toMatch(/"rank"/);
    expect(serialised).not.toMatch(/"matchPercent"/);
    expect(serialised).not.toMatch(/bestMatch/i);
  });
});

describe("staleness", () => {
  it("does not warn while the data is fresh", () => {
    expect(isStale(new Date("2026-02-01"))).toBe(false);
  });

  it("warns once the data passes its shelf life", () => {
    const asOf = new Date(routesData.meta.dataAsOf);
    const past = new Date(
      asOf.getTime() + (routesData.meta.freshnessThresholdDays + 5) * 86_400_000,
    );
    expect(isStale(past)).toBe(true);
    expect(recommend(build(["I"]), handsOnMission, past).notices).toContain("STALE_ROUTE_DATA");
  });
});

describe("eligibility unit behaviour", () => {
  const lowCostRoute = routesData.routes.find((r) => r.costBand === "low")!;

  it("supports a low-cost route when money is tight", () => {
    const v = evaluateEligibility(lowCostRoute, build(["R"], { cost: "tight" }));
    expect(v.eligible).toBe(true);
    expect(v.supporting).toContain("FEASIBLE_COST");
  });
});
