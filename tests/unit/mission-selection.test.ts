/**
 * Mission selection must be explainable to the learner who was given the
 * mission, so these tests pin the rule itself rather than a snapshot: which
 * dimension decided it, when it refuses to decide, and that the learner can
 * always overrule it.
 */
import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import missionsData from "@/data/missions.json";
import { DIMENSIONS, type Dimension, type InterviewInput } from "@/lib/decision-engine/types";
import { MISSIONS, missionById, selectMission } from "@/lib/mission";

/** An interview that answers everything, scoring the given dimensions high. */
function leaning(high: Dimension[], low = 1, top = 5): InterviewInput {
  const interest: Record<string, number> = {};
  for (const q of questions.interest) {
    interest[q.id] = high.includes(q.dimension as Dimension) ? top : low;
  }
  return {
    interest,
    context: { tier: "LOWER_SECONDARY", cost: "moderate", mobility: "can_move", horizon: "soon" },
  };
}

describe("mission catalogue", () => {
  it("covers all six RIASEC dimensions across its missions", () => {
    const covered = new Set(MISSIONS.flatMap((m) => m.bestFor));
    for (const d of DIMENSIONS) expect(covered.has(d)).toBe(true);
  });

  it("gives every mission options spanning all six dimensions", () => {
    // Without this a mission could never disagree with the interview, and the
    // contradiction signal the product is built on would be unreachable.
    for (const mission of MISSIONS) {
      const produced = new Set<string>();
      for (const step of mission.steps) {
        for (const option of step.options ?? []) {
          for (const d of Object.keys(option.evidence ?? {})) produced.add(d);
        }
      }
      expect(produced.size, `${mission.id} covers ${[...produced].join("")}`).toBe(6);
    }
  });

  it("uses ids that are unique and stable", () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    for (const m of MISSIONS) expect(missionById(m.id)?.id).toBe(m.id);
  });
});

describe("selectMission", () => {
  it("picks the hands-on mission for a practical, creative profile", () => {
    const choice = selectMission(leaning(["R", "A"]));
    expect(choice.mission.id).toBe("mission-make-something");
    expect(choice.isDefault).toBe(false);
    expect(["R", "A"]).toContain(choice.matchedDimension);
  });

  it("picks the people mission for a social, enterprising profile", () => {
    const choice = selectMission(leaning(["S", "E"]));
    expect(choice.mission.id).toBe("mission-run-something");
    expect(["S", "E"]).toContain(choice.matchedDimension);
  });

  it("picks the analytical mission for an investigative, organised profile", () => {
    const choice = selectMission(leaning(["I", "C"]));
    expect(choice.mission.id).toBe("mission-school-problem");
    expect(["I", "C"]).toContain(choice.matchedDimension);
  });

  it("is deterministic — the same interview always gives the same mission", () => {
    const interview = leaning(["S"]);
    const ids = Array.from({ length: 20 }, () => selectMission(interview).mission.id);
    expect(new Set(ids).size).toBe(1);
  });

  it("refuses to choose from too few answers and says so", () => {
    const choice = selectMission({ interest: { R1: 5, R2: 5 }, context: {} });
    expect(choice.isDefault).toBe(true);
    expect(choice.matchedDimension).toBeNull();
    expect(choice.rationale).toMatch(/not far enough along/i);
  });

  it("refuses to choose from a flat profile and says so", () => {
    // Every item answered identically: no dimension leads, so a "match" would
    // be an invented preference.
    const choice = selectMission(leaning([...DIMENSIONS], 3, 3));
    expect(choice.isDefault).toBe(true);
    expect(choice.rationale).toMatch(/too even/i);
  });

  it("always offers the other missions as alternatives", () => {
    const choice = selectMission(leaning(["R"]));
    expect(choice.alternatives).toHaveLength(MISSIONS.length - 1);
    expect(choice.alternatives.map((m) => m.id)).not.toContain(choice.mission.id);
  });

  it("lets the learner override the rule", () => {
    const interview = leaning(["R", "A"]);
    const overridden = selectMission(interview, "mission-run-something");
    expect(overridden.mission.id).toBe("mission-run-something");
    expect(overridden.isLearnerChoice).toBe(true);
    expect(overridden.rationale).toMatch(/chose this mission yourself/i);
  });

  it("ignores an override naming a mission that does not exist", () => {
    const choice = selectMission(leaning(["R", "A"]), "mission-deleted-last-year");
    expect(choice.mission.id).toBe("mission-make-something");
    expect(choice.isLearnerChoice).toBe(false);
  });

  it("always explains itself in one readable sentence", () => {
    for (const profile of [["R"], ["I"], ["A"], ["S"], ["E"], ["C"]] as Dimension[][]) {
      const choice = selectMission(leaning(profile));
      expect(choice.rationale.length).toBeGreaterThan(20);
      expect(choice.rationale).toMatch(/\.$/);
    }
  });

  it("documents the rule next to the data it reads", () => {
    // The seed file is what a reviewer opens first; it has to say how selection
    // works and that `bestFor` does not constrain the evidence produced.
    expect(missionsData.meta.selection).toMatch(/lib\/mission/);
    expect(missionsData.meta.selection).toMatch(/all six dimensions/i);
  });
});
