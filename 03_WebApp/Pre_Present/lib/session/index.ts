"use client";

import missionsData from "@/data/missions.json";
import questionsData from "@/data/questions.json";
import routesData from "@/data/routes.json";
import type {
  CostAnswer,
  Horizon,
  InterviewInput,
  MissionInput,
  Mobility,
  Tier,
} from "@/lib/decision-engine/types";
import { isProvinceCode } from "@/lib/geo/types";

export const SESSION_KEY = "futureme.guest.v1";
export const SESSION_VERSION = 3;

/** Versions this build knows how to read. Anything else is discarded. */
export const READABLE_VERSIONS = [1, 2, 3] as const;

/**
 * Upper bounds on anything we read back. localStorage is writable by the user,
 * by extensions, and by any script that has run on this origin, so every
 * collection needs a ceiling — otherwise a hand-edited value can make the page
 * allocate without limit before a single field has been validated.
 */
const LIMITS = {
  textLength: 4_000,
  planEntries: 500,
  idLength: 64,
} as const;

export interface GuestSession {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  interview: InterviewInput;
  /**
   * The learner's mission. Present with `completed: false` while it is still a
   * draft, so unfinished work survives a refresh.
   */
  mission: MissionInput | null;
  selectedRouteId: string | null;
  /**
   * The province the learner picked so route results can name real places.
   *
   * A province is not an address — there are 77 of them and millions of people
   * in each — but it is still theirs, so it is stored under the same key as
   * everything else, listed on the privacy page, and cleared by the same
   * button. It survives a reset of the interview, because where they live did
   * not change when they decided to answer the questions again.
   */
  provinceIso: string | null;
  planProgress: Record<string, boolean>;
  safetyTriggered: boolean;
}

/**
 * What happened when stored state was read.
 *
 * - `ok`       — read back exactly as written.
 * - `repaired` — some fields were unusable and were dropped; the rest was kept.
 * - `reset`    — nothing could be trusted, so a clean session was started.
 * - `empty`    — nothing was stored.
 */
export type LoadStatus = "ok" | "repaired" | "reset" | "empty";

export interface LoadResult {
  session: GuestSession | null;
  status: LoadStatus;
  /** Field paths that were dropped or corrected. Useful in tests and in the UI. */
  discarded: string[];
}

// ---------------------------------------------------------------------------
// Allowed values, derived from the seed data so they cannot drift from the UI
// ---------------------------------------------------------------------------

/**
 * Answer ids the session will keep. Anything else in stored JSON is dropped,
 * because localStorage is writable by the learner.
 *
 * The efficacy items are included even though the interview does not yet ask
 * them: they are legitimate answers on the same 1..5 scale, the programme
 * recommender reads them by id, and a stored answer being silently discarded
 * is much harder to diagnose than one that is never collected. Keeping them
 * costs nothing while the questions are unasked, and means the second axis
 * starts working the moment they are.
 */
const QUESTION_IDS = new Set([
  ...questionsData.interest.map((q) => q.id),
  ...((questionsData as { efficacy?: { id: string }[] }).efficacy ?? []).map((q) => q.id),
]);
const SCALE_VALUES = new Set(questionsData.scale.map((s) => s.value));
const ROUTE_IDS = new Set(routesData.routes.map((r) => r.id));

const TIERS = new Set<Tier>(["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"]);
const COSTS = new Set<CostAnswer>(["tight", "moderate", "flexible", "unknown"]);
const MOBILITIES = new Set<Mobility>(["local_only", "can_move", "unknown"]);
const HORIZONS = new Set<Horizon>(["soon", "later", "unsure"]);

type MissionDef = (typeof missionsData.missions)[number];
type MissionStep = MissionDef["steps"][number];

function missionById(id: string): MissionDef | undefined {
  return missionsData.missions.find((m) => m.id === id);
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

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
    provinceIso: null,
    planProgress: {},
    safetyTriggered: false,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isIsoTimestamp = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 40 && Number.isFinite(Date.parse(v));

const isSafeId = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= LIMITS.idLength;

/**
 * Rebuild a session from an untrusted value, keeping whatever is individually
 * valid and recording whatever is not.
 *
 * The bias is deliberate: throwing away a whole interview because one Likert
 * answer is the string `"5"` would punish the learner for a bug. But nothing
 * unrecognised is ever carried forward — an unknown question id, a route that
 * no longer exists, or a mission step that was renamed is dropped, not trusted.
 *
 * A `reset` is reserved for the cases where the container itself is wrong:
 * not an object, an unreadable version, or no interview object at all.
 */
export function parseSession(value: unknown): LoadResult {
  const discarded: string[] = [];

  if (!isObject(value)) return { session: null, status: "reset", discarded: ["root"] };

  const version = value.version;
  if (typeof version !== "number" || !READABLE_VERSIONS.includes(version as 1 | 2)) {
    return { session: null, status: "reset", discarded: ["version"] };
  }

  if (!isObject(value.interview)) {
    return { session: null, status: "reset", discarded: ["interview"] };
  }

  const session = newSession();

  // Identity and timestamps. These are convenience metadata, not evidence, so a
  // bad value is regenerated rather than treated as fatal.
  if (isSafeId(value.id)) session.id = value.id;
  else discarded.push("id");

  if (isIsoTimestamp(value.createdAt)) session.createdAt = value.createdAt;
  else discarded.push("createdAt");

  if (isIsoTimestamp(value.updatedAt)) session.updatedAt = value.updatedAt;
  else discarded.push("updatedAt");

  session.interview = parseInterview(value.interview, discarded);
  session.mission = parseMission(value.mission, discarded);

  if (value.selectedRouteId === null || value.selectedRouteId === undefined) {
    session.selectedRouteId = null;
  } else if (typeof value.selectedRouteId === "string" && ROUTE_IDS.has(value.selectedRouteId)) {
    session.selectedRouteId = value.selectedRouteId;
  } else {
    session.selectedRouteId = null;
    discarded.push("selectedRouteId");
  }

  if (value.provinceIso === null || value.provinceIso === undefined) {
    session.provinceIso = null;
  } else if (isProvinceCode(value.provinceIso)) {
    session.provinceIso = value.provinceIso;
  } else {
    session.provinceIso = null;
    discarded.push("provinceIso");
  }

  session.planProgress = parsePlanProgress(value.planProgress, discarded);

  if (typeof value.safetyTriggered === "boolean") session.safetyTriggered = value.safetyTriggered;
  else if (value.safetyTriggered !== undefined) discarded.push("safetyTriggered");

  // Migration is a re-stamp: v1 and v2 share a shape, and v2 only widened what
  // `mission` is allowed to hold (a draft, not just a completed attempt). The
  // value has just been validated field by field, so it is already a valid v2.
  session.version = SESSION_VERSION;
  const migrated = version !== SESSION_VERSION;

  return {
    session,
    status: discarded.length > 0 || migrated ? "repaired" : "ok",
    discarded,
  };
}

function parseInterview(raw: Record<string, unknown>, discarded: string[]): InterviewInput {
  const interest: Record<string, number> = {};

  if (isObject(raw.interest)) {
    for (const [id, v] of Object.entries(raw.interest)) {
      if (!QUESTION_IDS.has(id)) {
        discarded.push(`interview.interest.${id}`);
        continue;
      }
      if (typeof v !== "number" || !Number.isInteger(v) || !SCALE_VALUES.has(v)) {
        discarded.push(`interview.interest.${id}`);
        continue;
      }
      interest[id] = v;
    }
  } else if (raw.interest !== undefined) {
    discarded.push("interview.interest");
  }

  const context: InterviewInput["context"] = {};

  if (isObject(raw.context)) {
    const c = raw.context;
    if (typeof c.tier === "string" && TIERS.has(c.tier as Tier)) context.tier = c.tier as Tier;
    else if (c.tier !== undefined) discarded.push("interview.context.tier");

    if (typeof c.cost === "string" && COSTS.has(c.cost as CostAnswer)) {
      context.cost = c.cost as CostAnswer;
    } else if (c.cost !== undefined) discarded.push("interview.context.cost");

    if (typeof c.mobility === "string" && MOBILITIES.has(c.mobility as Mobility)) {
      context.mobility = c.mobility as Mobility;
    } else if (c.mobility !== undefined) discarded.push("interview.context.mobility");

    if (typeof c.horizon === "string" && HORIZONS.has(c.horizon as Horizon)) {
      context.horizon = c.horizon as Horizon;
    } else if (c.horizon !== undefined) discarded.push("interview.context.horizon");

    if (typeof c.proud === "string") context.proud = c.proud.slice(0, LIMITS.textLength);
    else if (c.proud !== undefined) discarded.push("interview.context.proud");
  } else if (raw.context !== undefined) {
    discarded.push("interview.context");
  }

  return { interest, context };
}

/**
 * A mission is validated against the definition it claims to be an attempt at,
 * so a renamed step or a removed option cannot reach the scorer.
 */
function parseMission(raw: unknown, discarded: string[]): MissionInput | null {
  if (raw === null || raw === undefined) return null;

  if (!isObject(raw)) {
    discarded.push("mission");
    return null;
  }

  const missionId = raw.missionId;
  if (typeof missionId !== "string") {
    discarded.push("mission.missionId");
    return null;
  }

  const def = missionById(missionId);
  if (!def) {
    // The mission this attempt belongs to no longer exists in the catalogue.
    discarded.push("mission.missionId");
    return null;
  }

  const answers: Record<string, string | string[]> = {};

  if (isObject(raw.answers)) {
    for (const [stepId, value] of Object.entries(raw.answers)) {
      const step = def.steps.find((s) => s.id === stepId);
      if (!step) {
        discarded.push(`mission.answers.${stepId}`);
        continue;
      }
      const cleaned = parseMissionAnswer(step, value);
      if (cleaned === undefined) discarded.push(`mission.answers.${stepId}`);
      else answers[stepId] = cleaned;
    }
  } else if (raw.answers !== undefined) {
    discarded.push("mission.answers");
  }

  let completed = false;
  if (typeof raw.completed === "boolean") completed = raw.completed;
  else if (raw.completed !== undefined) discarded.push("mission.completed");

  return { missionId, answers, completed };
}

function parseMissionAnswer(step: MissionStep, value: unknown): string | string[] | undefined {
  if (step.type === "text") {
    return typeof value === "string" ? value.slice(0, LIMITS.textLength) : undefined;
  }

  const allowed = new Set((step.options ?? []).map((o) => o.value));

  if (step.type === "single") {
    return typeof value === "string" && allowed.has(value) ? value : undefined;
  }

  if (step.type === "multi") {
    if (!Array.isArray(value)) return undefined;
    const seen = new Set<string>();
    for (const v of value) {
      if (typeof v === "string" && allowed.has(v)) seen.add(v);
    }
    // Silently trimming to the cap is right: the extra selections were never
    // offered by the UI, so honouring them would score answers nobody gave.
    return [...seen].slice(0, step.maxSelected ?? allowed.size);
  }

  return undefined;
}

function parsePlanProgress(raw: unknown, discarded: string[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (raw === undefined || raw === null) return out;

  if (!isObject(raw)) {
    discarded.push("planProgress");
    return out;
  }

  let kept = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (kept >= LIMITS.planEntries) {
      discarded.push("planProgress.overflow");
      break;
    }
    if (typeof v !== "boolean" || !isSafeId(k)) {
      discarded.push(`planProgress.${k}`);
      continue;
    }
    // Only ticked boxes are worth storing; `false` is the default anyway.
    if (v) out[k] = true;
    kept += 1;
  }
  return out;
}

/**
 * Strict predicate — true only for a value that is already a clean session of
 * the current version. Repairable input returns false here; use `parseSession`
 * when you want the salvage behaviour.
 */
export function isValidSession(value: unknown): value is GuestSession {
  if (!isObject(value) || value.version !== SESSION_VERSION) return false;
  const result = parseSession(value);
  return result.status === "ok";
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** Read stored state, reporting how much of it survived. */
export function loadSessionResult(): LoadResult {
  if (typeof window === "undefined") return { session: null, status: "empty", discarded: [] };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SESSION_KEY);
  } catch {
    // Storage disabled entirely (private mode, blocked cookies).
    return { session: null, status: "empty", discarded: [] };
  }

  if (!raw) return { session: null, status: "empty", discarded: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    forget();
    return { session: null, status: "reset", discarded: ["json"] };
  }

  const result = parseSession(parsed);

  if (result.session === null) {
    forget();
    return result;
  }

  // Persist the repaired form so the next read is clean and the damage is not
  // re-reported on every page.
  if (result.status === "repaired") saveSession(result.session);

  return result;
}

export function loadSession(): GuestSession | null {
  return loadSessionResult().session;
}

export function saveSession(session: GuestSession): boolean {
  if (typeof window === "undefined") return false;
  try {
    const next = { ...session, version: SESSION_VERSION, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return true;
  } catch {
    // Private browsing or a full quota. The app keeps working in memory;
    // the UI warns that progress will not survive a refresh.
    return false;
  }
}

export function clearSession(): void {
  forget();
}

/**
 * Start the questions again, keeping the same guest.
 *
 * Everything downstream of the answers goes with them. A mission, a chosen
 * route and its plan progress were all derived from replies that no longer
 * exist, and leaving them would let the learner walk into a plan built on
 * answers they have just withdrawn.
 *
 * `safetyTriggered` is the deliberate exception. It gates the support screen on
 * /routes, so clearing it here would turn "start over" into a way to dismiss
 * that screen — a safety state must not be undone as a side effect of an
 * unrelated action. Identity is kept too: this is the same learner starting
 * again, not a new one, so `id` and `createdAt` survive.
 */
export function resetInterview(session: GuestSession): GuestSession {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
    interview: { interest: {}, context: {} },
    mission: null,
    selectedRouteId: null,
    planProgress: {},
  };
}

function forget(): void {
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
