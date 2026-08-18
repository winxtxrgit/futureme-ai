import { describe, expect, it } from "vitest";
import { newSession, resetInterview, type GuestSession } from "@/lib/session";

/**
 * Starting over has to remove the answers *and* everything the app derived from
 * them. The one thing it must not touch is the safety flag: that gates the
 * support screen on /routes, and an unrelated action must never be a way to
 * dismiss it.
 */

function answeredSession(overrides: Partial<GuestSession> = {}): GuestSession {
  return {
    ...newSession(),
    interview: {
      interest: { q_realistic_1: 5, q_investigative_2: 4, q_artistic_1: 2 },
      context: { tier: "UPPER_SECONDARY", cost: "tight", mobility: "can_move", horizon: "soon" },
    },
    mission: { routeId: "vocational-digital", stepId: "shadow-a-technician", completed: true },
    selectedRouteId: "vocational-digital",
    planProgress: { "step-1": true, "step-2": false },
    ...overrides,
  } as GuestSession;
}

describe("resetInterview", () => {
  it("clears every interest and context answer", () => {
    const next = resetInterview(answeredSession());

    expect(next.interview.interest).toEqual({});
    expect(next.interview.context).toEqual({});
  });

  it("clears what was derived from those answers", () => {
    const next = resetInterview(answeredSession());

    expect(next.mission).toBeNull();
    expect(next.selectedRouteId).toBeNull();
    expect(next.planProgress).toEqual({});
  });

  it("keeps the safety flag, so starting over cannot dismiss the support screen", () => {
    const next = resetInterview(answeredSession({ safetyTriggered: true }));

    expect(next.safetyTriggered).toBe(true);
  });

  it("leaves the flag alone when it was never set", () => {
    expect(resetInterview(answeredSession()).safetyTriggered).toBe(false);
  });

  it("keeps the same learner rather than minting a new one", () => {
    const before = answeredSession();
    const next = resetInterview(before);

    expect(next.id).toBe(before.id);
    expect(next.createdAt).toBe(before.createdAt);
    expect(next.version).toBe(before.version);
  });

  it("records that something changed", () => {
    const before = answeredSession({ updatedAt: "2020-01-01T00:00:00.000Z" });
    const next = resetInterview(before);

    expect(next.updatedAt).not.toBe(before.updatedAt);
    expect(Number.isFinite(Date.parse(next.updatedAt))).toBe(true);
  });

  it("does not mutate the session it was given", () => {
    const before = answeredSession();
    const snapshot = structuredClone(before);
    resetInterview(before);

    expect(before).toEqual(snapshot);
  });

  it("is safe to run on a session that has no answers yet", () => {
    const clean = newSession();
    const next = resetInterview(clean);

    expect(next.interview).toEqual({ interest: {}, context: {} });
    expect(next.id).toBe(clean.id);
  });

  it("produces a session the parser still recognises", async () => {
    const { isValidSession } = await import("@/lib/session");
    expect(isValidSession(resetInterview(answeredSession()))).toBe(true);
  });
});
