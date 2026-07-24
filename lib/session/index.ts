"use client";

import type { InterviewInput, MissionInput } from "@/lib/decision-engine/types";

export const SESSION_KEY = "futureme.guest.v1";
export const SESSION_VERSION = 1;

export interface GuestSession {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  interview: InterviewInput;
  mission: MissionInput | null;
  selectedRouteId: string | null;
  planProgress: Record<string, boolean>;
  safetyTriggered: boolean;
}

export function newSession(): GuestSession {
  const now = new Date().toISOString();
  return {
    version: SESSION_VERSION,
    id: `guest_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    interview: { interest: {}, context: {} },
    mission: null,
    selectedRouteId: null,
    planProgress: {},
    safetyTriggered: false,
  };
}

/**
 * Validate anything we read back from localStorage. Storage can be edited by
 * hand, shared between browser versions, or left over from an older release,
 * so an unusable value must degrade to a fresh session rather than crash.
 */
export function isValidSession(value: unknown): value is GuestSession {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Partial<GuestSession>;
  return (
    s.version === SESSION_VERSION &&
    typeof s.id === "string" &&
    typeof s.interview === "object" &&
    s.interview !== null &&
    typeof (s.interview as InterviewInput).interest === "object" &&
    typeof (s.interview as InterviewInput).context === "object"
  );
}

export function loadSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    // Malformed JSON, quota errors, or storage disabled entirely.
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable — fall through to a fresh in-memory session */
    }
    return null;
  }
}

export function saveSession(session: GuestSession): boolean {
  if (typeof window === "undefined") return false;
  try {
    const next = { ...session, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return true;
  } catch {
    // Private browsing or a full quota. The app keeps working in memory;
    // the UI warns that progress will not survive a refresh.
    return false;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing further we can do */
  }
}

export function loadOrCreate(): GuestSession {
  return loadSession() ?? newSession();
}
