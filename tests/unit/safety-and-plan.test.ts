import { describe, expect, it } from "vitest";
import { checkAll, checkText, SUPPORT_MESSAGE } from "@/lib/safety";
import { buildPlan, planProgress } from "@/lib/plan";
import type { RouteResult } from "@/lib/decision-engine/types";

function route(overrides: Partial<RouteResult> = {}): RouteResult {
  return {
    routeId: "vocational-digital",
    name: "Vocational ปวช. — Digital and IT",
    shortName: "ปวช. Digital & IT",
    summary: "s",
    score: { interests: 70, strengths: 65, learningStyle: 60, feasibility: 70, flexibility: 60, total: 67 },
    evidenceStrength: "strong",
    reasons: [],
    supportingEvidence: [],
    strengths: [],
    limitations: [],
    openQuestions: [],
    nextExperiment: "Build one tiny thing.",
    costBand: "low",
    requiresRelocation: false,
    flexibility: 0.6,
    timeToEarning: "soon",
    tiedWith: [],
    stale: false,
    provenance: {
      status: "partially-verified",
      source: "VEC Data Catalog — หลักสูตร ปวช. 2567",
      sourceUrl: "https://ckan.vec.go.th/th/dataset/voc_curriculum",
      lastVerified: "2026-07-24",
      note: "test fixture",
    },
    ...overrides,
  };
}

describe("safety rule", () => {
  it("detects English distress phrasing", () => {
    expect(checkText("sometimes I want to die").triggered).toBe(true);
    expect(checkText("I have been thinking about suicide").triggered).toBe(true);
  });

  it("detects Thai distress phrasing", () => {
    expect(checkText("บางทีก็อยากตาย").triggered).toBe(true);
    expect(checkText("ฉันคิดจะฆ่าตัวตาย").triggered).toBe(true);
  });

  it("does not fire on ordinary answers", () => {
    expect(checkText("I organised the school sports day and it was exhausting").triggered).toBe(false);
    expect(checkText("I killed it at the science fair").triggered).toBe(false);
    expect(checkText("").triggered).toBe(false);
    expect(checkText(undefined).triggered).toBe(false);
  });

  it("reports which rule fired but never echoes the text", () => {
    const r = checkText("I want to die");
    expect(r.ruleIndex).toBeTypeOf("number");
    expect(JSON.stringify(r)).not.toContain("die");
  });

  it("scans multiple fields and stops at the first hit", () => {
    expect(checkAll(["fine", "I want to die", "fine"]).triggered).toBe(true);
    expect(checkAll(["fine", undefined, "also fine"]).triggered).toBe(false);
  });

  it("states plainly that it is not an emergency service", () => {
    expect(SUPPORT_MESSAGE.disclaimer).toMatch(/not a mental-health service/i);
  });
});

describe("30-day plan", () => {
  it("always builds four weekly objectives with tasks", () => {
    const p = buildPlan(route());
    expect(p.weeks).toHaveLength(4);
    for (const w of p.weeks) expect(w.tasks.length).toBeGreaterThan(0);
    expect(p.exploratory).toBe(true);
  });

  it("gives every task a unique id so check-ins cannot collide", () => {
    const ids = buildPlan(route()).weeks.flatMap((w) => w.tasks.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("adds a repeat-the-mission task when the evidence contradicted itself", () => {
    const p = buildPlan(route({ reasons: ["MISSION_CONTRADICTS"] }));
    expect(p.addedForGaps.some((t) => /Redo the mission/i.test(t))).toBe(true);
  });

  it("adds budget and location tasks when those answers were unknown", () => {
    const p = buildPlan(route({ reasons: ["MISSING_COST_DATA", "MISSING_LOCATION_DATA"] }));
    expect(p.addedForGaps.some((t) => /budget/i.test(t))).toBe(true);
    expect(p.addedForGaps.some((t) => /away from home/i.test(t))).toBe(true);
  });

  it("adds the suggested experiment when evidence is weak", () => {
    const strong = buildPlan(route({ evidenceStrength: "strong" }));
    const weak = buildPlan(route({ evidenceStrength: "limited" }));
    expect(weak.weeks[0].tasks.length).toBeGreaterThan(strong.weeks[0].tasks.length);
  });

  it("falls back to a template for an unknown route id", () => {
    expect(buildPlan(route({ routeId: "no-such-route" })).weeks).toHaveLength(4);
  });

  it("tracks progress correctly", () => {
    const p = buildPlan(route());
    expect(planProgress(p, {}).percent).toBe(0);
    const all = Object.fromEntries(p.weeks.flatMap((w) => w.tasks).map((t) => [t.id, true]));
    expect(planProgress(p, all).percent).toBe(100);
  });
});
