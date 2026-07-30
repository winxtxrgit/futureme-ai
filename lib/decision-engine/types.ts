/**
 * A learner-visible string in both supported languages.
 *
 * Route and mission copy lives in the seed data, so it cannot be a key into the
 * UI dictionary. Carrying both languages through the engine keeps the engine
 * language-agnostic — it never chooses a wording, it just passes the pair along
 * and the interface picks a side.
 */
export interface Localised {
  en: string;
  th: string;
}

export type Dimension = "R" | "I" | "A" | "S" | "E" | "C";
export const DIMENSIONS: Dimension[] = ["R", "I", "A", "S", "E", "C"];

export type Tier = "LOWER_SECONDARY" | "UPPER_SECONDARY" | "VOCATIONAL";
export type CostAnswer = "tight" | "moderate" | "flexible" | "unknown";
export type Mobility = "local_only" | "can_move" | "unknown";
export type Horizon = "soon" | "later" | "unsure";

/** Raw interview input. Likert answers are 1..5, keyed by question id. */
export interface InterviewInput {
  interest: Record<string, number>;
  context: {
    tier?: Tier;
    cost?: CostAnswer;
    mobility?: Mobility;
    horizon?: Horizon;
    proud?: string;
  };
}

/** Raw mission input, keyed by step id. Values are string or string[]. */
export interface MissionInput {
  missionId: string;
  answers: Record<string, string | string[]>;
  completed: boolean;
}

export type EvidenceStrength = "strong" | "moderate" | "limited" | "insufficient";

/**
 * Every reason the engine can give. These are stable identifiers — the UI maps
 * them to sentences in explanations.ts, and tests assert on them directly.
 */
export type ReasonCode =
  | "INTEREST_MATCH"
  | "INTEREST_WEAK"
  | "MISSION_CORROBORATES"
  | "MISSION_CONTRADICTS"
  | "FEASIBLE_COST"
  | "FEASIBLE_LOCATION"
  | "TIMING_MATCH"
  | "KEEPS_OPTIONS_OPEN"
  | "COST_CONSTRAINT"
  | "LOCATION_CONSTRAINT"
  | "TIER_MISMATCH"
  | "INSUFFICIENT_ANSWERS"
  | "INSUFFICIENT_EVIDENCE"
  | "TIED_SCORES"
  | "MISSING_COST_DATA"
  | "MISSING_LOCATION_DATA"
  | "STALE_ROUTE_DATA";

/**
 * Questions the learner still has to answer, as codes.
 *
 * The engine decides *which* gaps exist; the interface decides how to say them.
 * Returning prose from here would have meant the scoring module owned a
 * language, which is why every one of these used to be an English sentence.
 */
export type OpenQuestionCode =
  | "COST_UNKNOWN"
  | "LOCATION_UNKNOWN"
  | "MISSION_VS_INTERVIEW"
  | "WHAT_WOULD_YOU_TRY"
  | "REQUIREMENTS_CHANGED"
  | "WHAT_WOULD_CHANGE_YOUR_MIND";

/** Where a route's support came from. Formatted for display by the UI. */
export type SupportingEvidence =
  | { kind: "interview"; dimensions: Dimension[] }
  | { kind: "mission"; note: Localised };

export interface ScoreBreakdown {
  interests: number;
  strengths: number;
  learningStyle: number;
  feasibility: number;
  flexibility: number;
  total: number;
}

/**
 * Where a route's description came from, carried through to the screen.
 *
 * `status` describes the route as a whole. The per-field picture is coarser
 * and lives once in `data/routes.json` under `meta.fieldStatus`, because cost,
 * location and timing are unsourced for every route and repeating that per
 * route would only let the copies drift apart.
 */
export interface RouteProvenance {
  status: "partially-verified" | "illustrative" | "unverified";
  source: string | null;
  sourceUrl: string | null;
  /** ISO date the source was last checked, or null when there is no source. */
  lastVerified: string | null;
  note: Localised;
}

export interface RouteResult {
  routeId: string;
  name: Localised;
  shortName: Localised;
  summary: Localised;
  score: ScoreBreakdown;
  evidenceStrength: EvidenceStrength;
  reasons: ReasonCode[];
  supportingEvidence: SupportingEvidence[];
  strengths: Localised[];
  limitations: Localised[];
  openQuestions: OpenQuestionCode[];
  nextExperiment: Localised;
  costBand: string;
  requiresRelocation: boolean;
  flexibility: number;
  timeToEarning: string;
  tiedWith: string[];
  stale: boolean;
  provenance: RouteProvenance;
}

export interface IneligibleRoute {
  routeId: string;
  name: Localised;
  reasons: ReasonCode[];
}

export interface Recommendation {
  /** 0..3 routes. Deliberately not always three. */
  routes: RouteResult[];
  ineligible: IneligibleRoute[];
  /** True when the engine declines to recommend anything. */
  insufficientEvidence: boolean;
  /** Populated when insufficientEvidence is true. */
  insufficientReasons: ReasonCode[];
  profile: {
    riasec: Record<Dimension, number>;
    topDimensions: Dimension[];
    answeredInterest: number;
    totalInterest: number;
    missionCompleted: boolean;
    contradictions: Dimension[];
  };
  /** Advisory notices that do not block a recommendation. */
  notices: ReasonCode[];
  generatedAt: string;
  engineVersion: string;
}
