/**
 * Everything here is an attack on `parseSession` with values localStorage can
 * actually contain: hand-edited JSON, state written by an older release, and
 * values that are the right type but not a value the UI could ever produce.
 *
 * The contract under test is narrow on purpose — never crash, never carry an
 * unrecognised value into the engine, and never throw away a whole interview
 * over one bad field.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import questions from "@/data/questions.json";
import routes from "@/data/routes.json";

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

const { SESSION_KEY, SESSION_VERSION, loadSessionResult, newSession, parseSession, saveSession } =
  await import("@/lib/session");

/** A complete, valid stored session, as an anonymous object. */
function stored(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: SESSION_VERSION,
    id: "guest_abc123",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    interview: {
      interest: { R1: 5, R2: 4, I1: 3 },
      context: { tier: "LOWER_SECONDARY", cost: "moderate", mobility: "can_move", horizon: "soon" },
    },
    mission: {
      missionId: "mission-school-problem",
      answers: { problem: "the cupboard is a mess", approach: ["observe"], energy: "ordering" },
      completed: true,
    },
    selectedRouteId: routes.routes[0].id,
    planProgress: { "w1-t1": true },
    safetyTriggered: false,
    ...overrides,
  };
}

beforeEach(() => storage.clear());

describe("structural rejection", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a number", 42],
    ["a string", "session"],
    ["an array", [1, 2, 3]],
    ["a boolean", true],
  ])("resets on %s", (_label, value) => {
    const result = parseSession(value);
    expect(result.status).toBe("reset");
    expect(result.session).toBeNull();
  });

  it("resets on an unsupported future version", () => {
    expect(parseSession(stored({ version: 99 })).status).toBe("reset");
  });

  it("resets when the version is not a number", () => {
    expect(parseSession(stored({ version: "2" })).status).toBe("reset");
  });

  it("resets when the interview is missing entirely", () => {
    const rest = stored();
    delete rest.interview;
    expect(parseSession(rest).status).toBe("reset");
  });

  it("resets when the interview is the wrong type", () => {
    expect(parseSession(stored({ interview: "yes" })).status).toBe("reset");
    expect(parseSession(stored({ interview: [] })).status).toBe("reset");
  });
});

describe("field-level salvage", () => {
  it("accepts a clean session unchanged", () => {
    const result = parseSession(stored());
    expect(result.status).toBe("ok");
    expect(result.discarded).toEqual([]);
    expect(result.session?.interview.interest).toEqual({ R1: 5, R2: 4, I1: 3 });
  });

  it("keeps valid interview answers and drops invalid ones", () => {
    const result = parseSession(
      stored({
        interview: {
          interest: {
            R1: 5, // valid
            R2: 9, // outside the 1–5 scale
            I1: "4", // right value, wrong type
            A1: 2.5, // not an integer
            ZZ9: 5, // not a question in this instrument
            S1: null,
          },
          context: { tier: "LOWER_SECONDARY" },
        },
      }),
    );

    expect(result.status).toBe("repaired");
    expect(result.session?.interview.interest).toEqual({ R1: 5 });
    expect(result.discarded).toEqual(
      expect.arrayContaining([
        "interview.interest.R2",
        "interview.interest.I1",
        "interview.interest.A1",
        "interview.interest.ZZ9",
        "interview.interest.S1",
      ]),
    );
  });

  it("drops context values outside the offered options", () => {
    const result = parseSession(
      stored({
        interview: {
          interest: { R1: 5 },
          context: {
            tier: "POSTGRADUATE",
            cost: "free",
            mobility: "can_move",
            horizon: 7,
            proud: "I rebuilt the sign-up sheet",
          },
        },
      }),
    );

    expect(result.session?.interview.context).toEqual({
      mobility: "can_move",
      proud: "I rebuilt the sign-up sheet",
    });
    expect(result.discarded).toEqual(
      expect.arrayContaining([
        "interview.context.tier",
        "interview.context.cost",
        "interview.context.horizon",
      ]),
    );
  });

  it("truncates oversized free text rather than storing it", () => {
    const result = parseSession(
      stored({
        interview: { interest: { R1: 5 }, context: { proud: "x".repeat(50_000) } },
      }),
    );
    expect(result.session?.interview.context.proud?.length).toBeLessThanOrEqual(4_000);
  });

  it("regenerates a missing or malformed id and timestamps", () => {
    const result = parseSession(stored({ id: "", createdAt: "not a date", updatedAt: 12345 }));
    expect(result.status).toBe("repaired");
    expect(result.session?.id).toMatch(/^guest_/);
    expect(Number.isFinite(Date.parse(result.session!.createdAt))).toBe(true);
    expect(result.discarded).toEqual(
      expect.arrayContaining(["id", "createdAt", "updatedAt"]),
    );
  });
});

describe("mission state", () => {
  it("drops a mission whose id is not in the catalogue", () => {
    const result = parseSession(
      stored({ mission: { missionId: "mission-removed", answers: {}, completed: true } }),
    );
    expect(result.session?.mission).toBeNull();
    expect(result.discarded).toContain("mission.missionId");
  });

  it("drops answers to steps that no longer exist", () => {
    const result = parseSession(
      stored({
        mission: {
          missionId: "mission-school-problem",
          answers: { problem: "fine", removedStep: "stale" },
          completed: false,
        },
      }),
    );
    expect(result.session?.mission?.answers).toEqual({ problem: "fine" });
    expect(result.discarded).toContain("mission.answers.removedStep");
  });

  it("drops option values that were never offered", () => {
    const result = parseSession(
      stored({
        mission: {
          missionId: "mission-school-problem",
          answers: { approach: ["observe", "hack-the-mainframe"], energy: "levitating" },
          completed: false,
        },
      }),
    );
    expect(result.session?.mission?.answers.approach).toEqual(["observe"]);
    expect(result.session?.mission?.answers.energy).toBeUndefined();
  });

  it("repairs a corrupted multi-select array", () => {
    const result = parseSession(
      stored({
        mission: {
          missionId: "mission-school-problem",
          answers: { approach: "observe" }, // string where an array belongs
          completed: false,
        },
      }),
    );
    expect(result.session?.mission?.answers.approach).toBeUndefined();
    expect(result.discarded).toContain("mission.answers.approach");
  });

  it("de-duplicates and caps multi-select answers", () => {
    const result = parseSession(
      stored({
        mission: {
          missionId: "mission-school-problem",
          answers: {
            approach: ["observe", "observe", "measure", "build", "organise", "pitch", "recruit"],
          },
          completed: false,
        },
      }),
    );
    const approach = result.session?.mission?.answers.approach as string[];
    expect(new Set(approach).size).toBe(approach.length);
    expect(approach.length).toBeLessThanOrEqual(4); // maxSelected for this step
  });

  it("preserves an unfinished draft", () => {
    const result = parseSession(
      stored({
        mission: {
          missionId: "mission-school-problem",
          answers: { problem: "half a sentence" },
          completed: false,
        },
      }),
    );
    expect(result.session?.mission?.completed).toBe(false);
    expect(result.session?.mission?.answers.problem).toBe("half a sentence");
  });

  it("treats a non-boolean completed flag as unfinished", () => {
    const result = parseSession(
      stored({
        mission: { missionId: "mission-school-problem", answers: {}, completed: "yes" },
      }),
    );
    expect(result.session?.mission?.completed).toBe(false);
    expect(result.discarded).toContain("mission.completed");
  });
});

describe("selection and plan progress", () => {
  it("drops a selected route that is not in the catalogue", () => {
    const result = parseSession(stored({ selectedRouteId: "route-that-was-deleted" }));
    expect(result.session?.selectedRouteId).toBeNull();
    expect(result.discarded).toContain("selectedRouteId");
  });

  it("drops non-boolean plan progress entries", () => {
    const result = parseSession(
      stored({ planProgress: { "w1-t1": true, "w1-t2": "done", "w2-t1": 1, "w2-t2": false } }),
    );
    expect(result.session?.planProgress).toEqual({ "w1-t1": true });
  });

  it("caps a plan-progress object stuffed with entries", () => {
    const huge: Record<string, boolean> = {};
    for (let i = 0; i < 5_000; i += 1) huge[`t${i}`] = true;
    const result = parseSession(stored({ planProgress: huge }));
    expect(Object.keys(result.session!.planProgress).length).toBeLessThanOrEqual(500);
    expect(result.discarded).toContain("planProgress.overflow");
  });

  it("drops a plan-progress object that is an array", () => {
    const result = parseSession(stored({ planProgress: ["w1-t1"] }));
    expect(result.session?.planProgress).toEqual({});
    expect(result.discarded).toContain("planProgress");
  });
});

describe("version migration", () => {
  it("migrates a v1 session and keeps its answers", () => {
    const v1 = stored({ version: 1 });
    const result = parseSession(v1);
    expect(result.status).toBe("repaired");
    expect(result.session?.version).toBe(SESSION_VERSION);
    expect(result.session?.interview.interest).toEqual({ R1: 5, R2: 4, I1: 3 });
    expect(result.session?.mission?.completed).toBe(true);
  });

  it("checks every interest id against the current instrument", () => {
    // A v1 session written before an item was renamed must not smuggle the old
    // id into the scorer, where it would silently score nothing.
    const ids = new Set(questions.interest.map((q) => q.id));
    const result = parseSession(
      stored({ version: 1, interview: { interest: { OLD_Q1: 5, R1: 4 }, context: {} } }),
    );
    for (const id of Object.keys(result.session!.interview.interest)) {
      expect(ids.has(id)).toBe(true);
    }
  });
});

describe("reading through localStorage", () => {
  it("reports an empty store rather than inventing a session", () => {
    expect(loadSessionResult()).toEqual({ session: null, status: "empty", discarded: [] });
  });

  it("resets and clears the key on malformed JSON", () => {
    storage.setItem(SESSION_KEY, "{ this is not json");
    const result = loadSessionResult();
    expect(result.status).toBe("reset");
    expect(result.session).toBeNull();
    expect(storage.getItem(SESSION_KEY)).toBeNull();
  });

  it("resets and clears the key on JSON that is not a session", () => {
    storage.setItem(SESSION_KEY, JSON.stringify(["not", "a", "session"]));
    expect(loadSessionResult().status).toBe("reset");
    expect(storage.getItem(SESSION_KEY)).toBeNull();
  });

  it("writes the repaired form back so damage is reported once", () => {
    storage.setItem(SESSION_KEY, JSON.stringify(stored({ selectedRouteId: "gone" })));

    expect(loadSessionResult().status).toBe("repaired");
    // Second read sees the cleaned value.
    expect(loadSessionResult().status).toBe("ok");
  });

  it("survives a storage backend that throws", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem() {
          throw new Error("blocked");
        },
        setItem() {
          throw new Error("blocked");
        },
        removeItem() {
          throw new Error("blocked");
        },
      },
    });

    expect(() => loadSessionResult()).not.toThrow();
    expect(loadSessionResult().session).toBeNull();
    expect(saveSession(newSession())).toBe(false);

    vi.stubGlobal("window", { localStorage: storage });
  });

  it("round-trips a real session without repairs", () => {
    const s = newSession();
    s.interview = { interest: { R1: 5, I1: 4 }, context: { tier: "VOCATIONAL" } };
    saveSession(s);
    const result = loadSessionResult();
    expect(result.status).toBe("ok");
    expect(result.session?.interview.context.tier).toBe("VOCATIONAL");
  });
});
