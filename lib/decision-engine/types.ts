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
  note: string;
}

export interface RouteResult {
  routeId: string;
  name: string;
  shortName: string;
  summary: string;
  score: ScoreBreakdown;
  evidenceStrength: EvidenceStrength;
  reasons: ReasonCode[];
  supportingEvidence: string[];
  strengths: string[];
  limitations: string[];
  openQuestions: string[];
  nextExperiment: string;
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
  name: string;
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
