import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";
import {
  CONTEXT_MAX,
  CORE_GATE,
  DIFFERENTIATION_GATE,
  MAX_PER_INSTITUTION,
  MAX_PER_FIELD,
  PARAMETERS,
  buildProfile,
  cosine,
  quadrantOf,
  sectorOf,
  recommendProgrammes,
} from "@/lib/recommend";

const interestIds = (d: string) =>
  questions.interest.filter((q) => q.dimension === d).map((q) => q.id);
const efficacyIds = (d: string) =>
  (questions.efficacy ?? []).filter((q) => q.dimension === d).map((q) => q.id);

/** Answer every item so the target dimensions read high and the rest low. */
function learner(high: Dimension[], opts: { midpointAll?: boolean } = {}) {
  const answers: Record<string, number> = {};
  for (const d of DIMENSIONS) {
    const strong = high.includes(d);
    for (const id of interestIds(d)) {
      const item = questions.interest.find((q) => q.id === id)!;
      const reverse = (item as { direction?: string }).direction === "reverse";
      // express interest on the raw scale: a reverse item is agreed with by
      // answering low
      answers[id] = opts.midpointAll ? 3 : strong ? (reverse ? 1 : 5) : reverse ? 5 : 1;
    }
    for (const id of efficacyIds(d)) answers[id] = strong ? 5 : 2;
  }
  return answers;
}

describe("a midpoint answer is not evidence", () => {
  it("gives a learner who answers 3 to everything zero confidence, not full", () => {
    const profile = buildProfile(learner([], { midpointAll: true }));
    expect(profile.informative).toBe(0);
    expect(profile.overallConfidence).toBe(0);
    // The bug this guards: identical answers never disagree, so a naive
    // consistency measure reads 1.00 and the undecided learner comes out the
    // most confident in the system.
    for (const d of DIMENSIONS) expect(profile.dimensions[d].consistency).toBe(0);
  });

  it("still counts those items as asked, so the interface can say so", () => {
    const profile = buildProfile(learner([], { midpointAll: true }));
    expect(profile.asked).toBe(questions.interest.length);
  });

  it("refuses to rank that learner, naming both reasons", () => {
    const result = recommendProgrammes(learner([], { midpointAll: true }), {
      provinceIso: "TH-10",
    });
    expect(result.confidentEnough).toBe(false);
    expect(result.blockers).toContain("LOW_CONFIDENCE");
    expect(result.blockers).toContain("UNDIFFERENTIATED_PROFILE");
    expect(result.top).toHaveLength(0);
  });
});

describe("Holland differentiation gate", () => {
  it("declines a flat profile even when every answer was informative", () => {
    // Every dimension answered 4 — informative, consistent, and useless for
    // telling fields apart.
    const answers: Record<string, number> = {};
    for (const item of questions.interest) {
      answers[item.id] = (item as { direction?: string }).direction === "reverse" ? 2 : 4;
    }
    const profile = buildProfile(answers);
    expect(profile.overallConfidence).toBeGreaterThan(0.5);
    expect(profile.differentiation).toBeLessThan(DIFFERENTIATION_GATE);

    const result = recommendProgrammes(answers, { provinceIso: "TH-10" });
    expect(result.blockers).toEqual(["UNDIFFERENTIATED_PROFILE"]);
    expect(result.top).toHaveLength(0);
  });
});

describe("reliability shrinkage", () => {
  it("pulls a score toward the prior in proportion to its unconfidence", () => {
    const answers: Record<string, number> = {};
    // one informative answer in R, nothing else
    answers[interestIds("R")[0]] = 5;
    const profile = buildProfile(answers);
    const r = profile.dimensions.R;
    expect(r.rawMean).toBe(1);
    expect(r.consistency).toBe(0.5); // a single item cannot disagree with itself
    expect(r.shrunk).toBeLessThan(r.rawMean);
    expect(r.shrunk).toBeGreaterThan(0.5);
  });
});

describe("ranking", () => {
  const social = learner(["S", "E"]);
  const practical = learner(["R", "I"]);

  it("gives two different profiles different programmes", () => {
    const a = recommendProgrammes(social, { provinceIso: "TH-10", budgetBand: "tight" });
    const b = recommendProgrammes(practical, { provinceIso: "TH-50", budgetBand: "moderate" });

    expect(a.confidentEnough).toBe(true);
    expect(b.confidentEnough).toBe(true);
    expect(a.top.length).toBeGreaterThan(0);
    expect(b.top.length).toBeGreaterThan(0);

    const aTitles = a.top.map((r) => r.programme.title);
    const bTitles = b.top.map((r) => r.programme.title);
    expect(aTitles).not.toEqual(bTitles);
  });

  it("is deterministic — the same answers give the same ranking", () => {
    const first = recommendProgrammes(social, { provinceIso: "TH-10" });
    const second = recommendProgrammes(social, { provinceIso: "TH-10" });
    expect(first.top.map((r) => r.programme.title)).toEqual(
      second.top.map((r) => r.programme.title),
    );
    expect(first.top.map((r) => r.final)).toEqual(second.top.map((r) => r.final));
  });

  it("never lets context overturn a CoreFit gap wider than the context cap", () => {
    const result = recommendProgrammes(social, {
      provinceIso: "TH-10",
      budgetBand: "tight",
      mobility: "can_move",
    });
    for (const row of result.top) {
      expect(row.contextComponent).toBeLessThanOrEqual(CONTEXT_MAX + 1e-9);
      expect(row.contextComponent).toBeGreaterThanOrEqual(0);
    }
    // the ranking claim itself: anything ranked above another programme is
    // either the better academic fit, or within the cap of it
    for (let i = 1; i < result.top.length; i += 1) {
      const gap = result.top[i - 1].core - result.top[i].core;
      if (gap < 0) expect(Math.abs(gap)).toBeLessThanOrEqual(CONTEXT_MAX);
    }
  });

  it("keeps every recommendation above the core gate", () => {
    const result = recommendProgrammes(practical, { provinceIso: "TH-50" });
    for (const row of result.top) expect(row.core).toBeGreaterThanOrEqual(CORE_GATE);
  });

  it("honours the diversity caps", () => {
    const result = recommendProgrammes(practical, { provinceIso: "TH-50" });
    const byInstitution = new Map<string, number>();
    const byRoute = new Map<string, number>();
    for (const row of result.top) {
      const i = row.programme.institutionId;
      const r = row.programme.isced;
      byInstitution.set(i, (byInstitution.get(i) ?? 0) + 1);
      byRoute.set(r, (byRoute.get(r) ?? 0) + 1);
    }
    for (const n of byInstitution.values()) expect(n).toBeLessThanOrEqual(MAX_PER_INSTITUTION);
    for (const n of byRoute.values()) expect(n).toBeLessThanOrEqual(MAX_PER_FIELD);
  });

  it("drops everything out of reach when the learner says local only", () => {
    const open = recommendProgrammes(practical, { provinceIso: "TH-50", mobility: "can_move" });
    const closed = recommendProgrammes(practical, {
      provinceIso: "TH-50",
      mobility: "local_only",
    });
    expect(closed.candidates).toBeLessThan(open.candidates);
    expect(closed.rejected).toBeGreaterThan(open.rejected);
  });

  it("reports what nobody has checked on every programme", () => {
    const result = recommendProgrammes(social, { provinceIso: "TH-10", budgetBand: "tight" });
    for (const row of result.top) {
      expect(row.context.unknown).toContain("tcas_rounds");
      expect(row.context.unknown).toContain("tuition_baht_per_year");
    }
  });

  it("ranks fields as well as programmes, highest core first", () => {
    const result = recommendProgrammes(social, { provinceIso: "TH-10" });
    expect(result.fields.length).toBeGreaterThan(1);
    for (let i = 1; i < result.fields.length; i += 1) {
      expect(result.fields[i - 1].core).toBeGreaterThanOrEqual(result.fields[i].core);
    }
  });
});

describe("quadrant", () => {
  it("separates capable-but-uninterested from interested-but-unpractised", () => {
    expect(quadrantOf(0.9, 0.8)).toBe("golden-fit");
    expect(quadrantOf(0.9, 0.3)).toBe("growth-area");
    expect(quadrantOf(0.5, 0.8)).toBe("burnout-risk");
    expect(quadrantOf(0.5, 0.3)).toBe("unfavourable");
    expect(quadrantOf(0.9, null)).toBe("unknown-efficacy");
  });
});

describe("cosine", () => {
  it("compares direction, not magnitude", () => {
    const a = { R: 1, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<Dimension, number>;
    const b = { R: 0.2, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<Dimension, number>;
    expect(cosine(a, b)).toBeCloseTo(1, 10);
  });

  it("returns zero rather than dividing by zero on an empty profile", () => {
    const zero = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<Dimension, number>;
    const other = { R: 1, I: 1, A: 0, S: 0, E: 0, C: 0 } as Record<Dimension, number>;
    expect(cosine(zero, other)).toBe(0);
  });
});

describe("parity with the Python reference", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../../../01_Research/Recommendation_Engine/engine.py"),
    "utf8",
  );

  /** Pull `NAME: (value,` out of the PARAMETERS block in engine.py. */
  function pythonValue(name: string): number {
    const match = source.match(new RegExp(`"${name}":\\s*\\(\\s*([\\d.]+),`));
    if (!match) throw new Error(`${name} not found in engine.py PARAMETERS`);
    return Number(match[1]);
  }

  it.each([
    "W_INTEREST",
    "W_EFFICACY",
    "PRIOR_MEAN",
    "CORE_GATE",
    "CONTEXT_MAX",
    "DIFFERENTIATION_GATE",
    "EFFICACY_DIM_FLOOR",
    "MIN_ITEMS_PER_DIMENSION",
    "MAX_PER_INSTITUTION",
    "MAX_PER_FIELD",
  ])("%s matches engine.py", (name) => {
    expect(PARAMETERS[name].value).toBe(pythonValue(name));
  });

  it("keeps the context weights identical to the reference", () => {
    const block = source.match(/"CONTEXT_WEIGHTS":\s*\(\s*\{([^}]+)\}/);
    expect(block).not.toBeNull();
    const py = Object.fromEntries(
      [...block![1].matchAll(/"(\w+)":\s*([\d.]+)/g)].map((m) => [m[1], Number(m[2])]),
    );
    expect(py).toEqual({
      access: 0.45,
      cost_band: 0.3,
      intake_room: 0.15,
      sector_preference: 0.1,
    });
  });

  it("gives every parameter a stated reason", () => {
    for (const [name, p] of Object.entries(PARAMETERS)) {
      expect(p.why.length, `${name} has no reason`).toBeGreaterThan(20);
    }
  });
});

describe("travel distance on the result", () => {
  const practical = (() => {
    const answers: Record<string, number> = {};
    for (const item of questions.interest) {
      answers[item.id] = ["R", "I"].includes(item.dimension) ? 5 : 1;
    }
    return answers;
  })();

  it("carries the road distance the score was computed from", () => {
    // The card shows this number, so the engine has to return it rather than
    // consume it privately — a reader cannot check a figure they cannot see.
    const result = recommendProgrammes(practical, {
      provinceIso: "TH-50",
      mobility: "local_only",
    });
    expect(result.top.length).toBeGreaterThan(0);
    const withDistance = result.top.filter((r) => r.travel.km !== null);
    expect(withDistance.length).toBeGreaterThan(0);
    for (const row of withDistance) {
      expect(row.travel.km).toBeGreaterThanOrEqual(0);
      expect(row.travel.band).toBeTruthy();
    }
  });

  it("leaves distance null rather than guessing when the province is unknown", () => {
    const result = recommendProgrammes(practical, {});
    for (const row of result.top) expect(row.travel.km).toBeNull();
  });
});

describe("filters narrow the ranking, not the finished list", () => {
  const practical = (() => {
    const a: Record<string, number> = {};
    for (const q of questions.interest) a[q.id] = ["R", "I"].includes(q.dimension) ? 5 : 1;
    return a;
  })();

  it("still fills the Top 5 when a level is chosen", () => {
    // The bug this guards: filtering the finished Top 5 leaves a learner who
    // asks for ปวช. staring at an empty list, while thousands of ปวช.
    // programmes sit one rank below the cut.
    const all = recommendProgrammes(practical, { provinceIso: "TH-50" });
    const voc = recommendProgrammes(practical, { provinceIso: "TH-50", onlyLevel: "ปวช." });
    expect(all.top.length).toBe(5);
    expect(voc.top.length).toBe(5);
    for (const row of voc.top) expect(row.programme.level).toBe("ปวช.");
  });

  it("honours the sector filter", () => {
    const priv = recommendProgrammes(practical, {
      provinceIso: "TH-50",
      onlySector: "private",
    });
    for (const row of priv.top) expect(sectorOf(row.programme.tuitionBand)).toBe("private");
  });

  it("keeps every filtered result above the same core gate", () => {
    const voc = recommendProgrammes(practical, { provinceIso: "TH-50", onlyLevel: "ปวส." });
    for (const row of voc.top) expect(row.core).toBeGreaterThanOrEqual(CORE_GATE);
  });
});

describe("employment outcomes", () => {
  it("never reports a percentage without the base it was taken from", () => {
    const a: Record<string, number> = {};
    for (const q of questions.interest) a[q.id] = q.dimension === "R" ? 5 : 1;
    const result = recommendProgrammes(a, { provinceIso: "TH-50", tier: "LOWER_SECONDARY" });
    const withOutcome = result.top.filter((r) => r.programme.outcome);
    for (const row of withOutcome) {
      const o = row.programme.outcome!;
      expect(o.tracked).toBeGreaterThan(0);
      expect(o.graduates).toBeGreaterThanOrEqual(o.tracked);
      expect(o.workingPct).toBeGreaterThanOrEqual(0);
      expect(o.academicYear).toBeTruthy();
    }
  });
});

describe("travel modes", () => {
  it("carries how the trip could be made, and never the driving time", () => {
    // drive_minutes is car time. Geography_and_Access says plainly it is not
    // the time a learner spends — most wait for a สองแถว — so the engine does
    // not pass it on. A precise number about the wrong journey is worse than
    // no number.
    const a: Record<string, number> = {};
    for (const q of questions.interest) a[q.id] = q.dimension === "R" ? 5 : 1;
    const result = recommendProgrammes(a, { provinceIso: "TH-50", tier: "LOWER_SECONDARY" });
    const reachable = result.top.filter((r) => r.travel.km !== null);
    expect(reachable.length).toBeGreaterThan(0);
    for (const row of reachable) {
      expect(Array.isArray(row.travel.modes)).toBe(true);
      expect(row.travel).not.toHaveProperty("minutes");
    }
    expect(reachable.some((r) => r.travel.modes.length > 0)).toBe(true);
  });
});

describe("occupations shown to the learner", () => {
  it("names them in Thai or not at all", () => {
    // An untranslated English job title on a Thai card is worse than one
    // fewer example, so the builder drops what it cannot name.
    const a: Record<string, number> = {};
    for (const q of questions.interest) a[q.id] = q.dimension === "R" ? 5 : 1;
    const result = recommendProgrammes(a, { provinceIso: "TH-50" });
    const named = result.top.filter((r) => r.programme.occupations.length > 0);
    expect(named.length).toBeGreaterThan(0);
    for (const row of named) {
      expect(row.programme.occupations.length).toBeLessThanOrEqual(3);
      for (const name of row.programme.occupations) {
        expect(name, `${name} is not Thai`).toMatch(/[฀-๿]/);
      }
    }
  });
});
