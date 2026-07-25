/**
 * Integration: the whole journey wired together — session persistence, engine,
 * plan generation and recovery — without a browser.
 *
 * A minimal localStorage stand-in lets the real session module run in Node,
 * so this exercises the same code the UI uses rather than a copy of it.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import questions from "@/data/questions.json";
import { recommend } from "@/lib/decision-engine";
import { buildPlan, planProgress } from "@/lib/plan";
import type { InterviewInput, MissionInput } from "@/lib/decision-engine/types";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

const storage = new MemoryStorage();
vi.stubGlobal("window", { localStorage: storage });

// Imported after the stub so the module sees a defined `window`.
const { clearSession, isValidSession, loadOrCreate, loadSession, newSession, saveSession, SESSION_KEY } =
  await import("@/lib/session");

function fullInterview(high: string[]): InterviewInput {
  const interest: Record<string, number> = {};
  for (const q of questions.interest) interest[q.id] = high.includes(q.dimension) ? 5 : 2;
  return {
    interest,
    context: { tier: "LOWER_SECONDARY", cost: "moderate", mobility: "can_move", horizon: "soon" },
  };
}

const mission: MissionInput = {
  missionId: "mission-school-problem",
  completed: true,
  answers: {
    problem: "Nobody can read the club sign-up sheet so people double book.",
    approach: ["observe", "organise"],
    evidence: "I would count how many double bookings happen the following week.",
    energy: "ordering",
  },
};

beforeEach(() => storage.clear());

describe("guest session lifecycle", () => {
  it("creates a session without any account", () => {
    const s = newSession();
    expect(s.id).toMatch(/^guest_/);
    expect(s.interview.interest).toEqual({});
    expect(s.selectedRouteId).toBeNull();
  });

  it("persists and restores across a simulated page refresh", () => {
    const s = newSession();
    s.interview = fullInterview(["C", "I"]);
    expect(saveSession(s)).toBe(true);

    const restored = loadSession();
    expect(restored).not.toBeNull();
    expect(restored!.id).toBe(s.id);
    expect(Object.keys(restored!.interview.interest)).toHaveLength(questions.interest.length);
  });

  it("discards a corrupted session instead of crashing", () => {
    storage.setItem(SESSION_KEY, "{not valid json");
    expect(loadSession()).toBeNull();
    expect(storage.getItem(SESSION_KEY)).toBeNull();
  });

  it("discards a session written by an incompatible version", () => {
    storage.setItem(SESSION_KEY, JSON.stringify({ version: 999, id: "x" }));
    expect(loadSession()).toBeNull();
  });

  it("rejects structurally invalid values", () => {
    expect(isValidSession(null)).toBe(false);
    expect(isValidSession({ version: 1 })).toBe(false);
    expect(isValidSession(newSession())).toBe(true);
  });

  it("always yields a usable session from loadOrCreate", () => {
    storage.setItem(SESSION_KEY, "garbage");
    expect(loadOrCreate().id).toMatch(/^guest_/);
  });

  it("deletes everything on request", () => {
    saveSession(newSession());
    clearSession();
    expect(storage.getItem(SESSION_KEY)).toBeNull();
  });
});

describe("full journey", () => {
  it("runs interview → mission → routes → selection → plan", () => {
    // 1. Guest starts.
    const session = loadOrCreate();
    expect(session.selectedRouteId).toBeNull();

    // 2. Interview.
    session.interview = fullInterview(["C", "I"]);
    saveSession(session);

    // 3. Mission.
    session.mission = mission;
    saveSession(session);

    // 4. Routes.
    const result = recommend(session.interview, session.mission);
    expect(result.insufficientEvidence).toBe(false);
    expect(result.routes.length).toBeGreaterThan(0);
    expect(result.routes.length).toBeLessThanOrEqual(3);
    expect(result.profile.missionCompleted).toBe(true);

    // 5. Selection.
    const chosen = result.routes[0];
    session.selectedRouteId = chosen.routeId;
    saveSession(session);

    // 6. Plan.
    const plan = buildPlan(chosen);
    expect(plan.routeId).toBe(chosen.routeId);
    expect(plan.weeks).toHaveLength(4);

    // 7. Check in on a task and confirm it survives a refresh.
    const firstTask = plan.weeks[0].tasks[0];
    session.planProgress[firstTask.id] = true;
    saveSession(session);

    const restored = loadSession()!;
    expect(restored.selectedRouteId).toBe(chosen.routeId);
    expect(restored.planProgress[firstTask.id]).toBe(true);
    expect(planProgress(plan, restored.planProgress).completed).toBe(1);
  });

  it("recovers mid-journey after a refresh before the mission", () => {
    const s = loadOrCreate();
    s.interview = fullInterview(["S"]);
    saveSession(s);

    const resumed = loadOrCreate();
    expect(resumed.mission).toBeNull();
    expect(recommend(resumed.interview, resumed.mission).routes.length).toBeGreaterThan(0);
  });

  it("keeps the journey usable when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    vi.stubGlobal("window", { localStorage: broken });

    // Session APIs degrade rather than throw...
    expect(loadSession()).toBeNull();
    expect(saveSession(newSession())).toBe(false);

    // ...and the engine still produces a result from in-memory state.
    expect(recommend(fullInterview(["I"]), mission).routes.length).toBeGreaterThan(0);

    vi.stubGlobal("window", { localStorage: storage });
  });

  it("reports insufficient evidence rather than inventing routes", () => {
    const s = loadOrCreate();
    s.interview = { interest: {}, context: { tier: "LOWER_SECONDARY" } };
    saveSession(s);

    const r = recommend(s.interview, null);
    expect(r.insufficientEvidence).toBe(true);
    expect(r.routes).toHaveLength(0);
  });

  it("invalidates a stored selection that is no longer eligible", () => {
    const s = loadOrCreate();
    s.interview = fullInterview(["A"]);
    s.mission = mission;
    s.selectedRouteId = "health-care";
    saveSession(s);

    // Cost becomes a hard constraint, so the high-cost selection drops out.
    s.interview.context.cost = "tight";
    const r = recommend(s.interview, s.mission);
    const stillThere = r.routes.some((x) => x.routeId === "health-care");
    expect(stillThere).toBe(false);
    // The plan page detects exactly this and asks the learner to choose again.
    expect(r.routes.find((x) => x.routeId === s.selectedRouteId)).toBeUndefined();
  });
});
