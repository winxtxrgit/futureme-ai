import routesData from "@/data/routes.json";
import { evaluateEligibility, isStale, type RouteDef } from "./eligibility";
import { describeTopInterests, openQuestionsFor, REASON_TEXT } from "./explanations";
import {
  findContradictions,
  interestFit,
  MIN_INTEREST_ANSWERS,
  normaliseInterests,
  scoreMissionEvidence,
  TIE_EPSILON,
  topDimensions,
  WEIGHTS,
} from "./scoring";
import type {
  Dimension,
  EvidenceStrength,
  IneligibleRoute,
  InterviewInput,
  MissionInput,
  Recommendation,
  ReasonCode,
  RouteProvenance,
  RouteResult,
  ScoreBreakdown,
} from "./types";

export const ENGINE_VERSION = "0.1.0-prototype";
export const MAX_ROUTES = 3;

export * from "./types";
export { WEIGHTS, MIN_INTEREST_ANSWERS, TIE_EPSILON } from "./scoring";
export { routeDataAsOf, isStale, freshness, unverifiedFields } from "./eligibility";
export { REASON_TEXT, STRENGTH_LABELS, STRENGTH_HELP, DIMENSION_LABELS } from "./explanations";

const LEARNING_STYLE_AFFINITY: Record<string, Partial<Record<Dimension, number>>> = {
  "hands-on": { R: 1, A: 0.5, C: 0.3 },
  "structured-analytical": { I: 1, C: 0.7 },
  "structured-social": { S: 1, C: 0.6, E: 0.5 },
  exploratory: { A: 1, I: 0.5 },
};

/**
 * Run the full recommendation. Pure and deterministic: the same input always
 * produces the same output, which is what makes the result defensible to a
 * student, a parent or a counsellor.
 *
 * Returns between 0 and 3 routes. It deliberately returns fewer — including
 * none — when the evidence does not support more.
 */
export function recommend(
  interview: InterviewInput,
  mission: MissionInput | null,
  now: Date = new Date(),
): Recommendation {
  const { riasec, answered, total } = normaliseInterests(interview);
  const missionEvidence = scoreMissionEvidence(mission);
  const missionCompleted = missionEvidence.signals > 0;

  const contradictions = missionCompleted
    ? findContradictions(riasec, missionEvidence.vector)
    : [];

  const profile = {
    riasec,
    topDimensions: topDimensions(riasec),
    answeredInterest: answered,
    totalInterest: total,
    missionCompleted,
    contradictions,
  };

  const notices: ReasonCode[] = [];
  if (interview.context.cost === "unknown") notices.push("MISSING_COST_DATA");
  if (interview.context.mobility === "unknown") notices.push("MISSING_LOCATION_DATA");
  if (isStale(now)) notices.push("STALE_ROUTE_DATA");

  // Gate 1 — not enough of the interview was answered to say anything.
  if (answered < MIN_INTEREST_ANSWERS) {
    return {
      routes: [],
      ineligible: [],
      insufficientEvidence: true,
      insufficientReasons: ["INSUFFICIENT_ANSWERS"],
      profile,
      notices,
      generatedAt: now.toISOString(),
      engineVersion: ENGINE_VERSION,
    };
  }

  // Gate 2 — answers so uniform that no dimension stands out. Recommending
  // from a flat profile would be inventing a preference the learner never gave.
  const spread = Math.max(...Object.values(riasec)) - Math.min(...Object.values(riasec));
  if (spread < 0.15) {
    return {
      routes: [],
      ineligible: [],
      insufficientEvidence: true,
      insufficientReasons: ["INSUFFICIENT_EVIDENCE"],
      profile,
      notices,
      generatedAt: now.toISOString(),
      engineVersion: ENGINE_VERSION,
    };
  }

  const eligible: RouteResult[] = [];
  const ineligible: IneligibleRoute[] = [];

  for (const route of routesData.routes as RouteDef[]) {
    const verdict = evaluateEligibility(route, interview);
    if (!verdict.eligible) {
      ineligible.push({ routeId: route.id, name: route.name, reasons: verdict.blocking });
      continue;
    }

    const score = scoreRoute(route, riasec, missionEvidence.vector, missionCompleted, verdict.supporting);
    const reasons: ReasonCode[] = [...verdict.supporting];

    if (score.interests >= 60) reasons.unshift("INTEREST_MATCH");
    else reasons.unshift("INTEREST_WEAK");

    if (missionCompleted) {
      const missionFit = interestFit(missionEvidence.vector, route.interestWeights) * 100;
      const contradicts =
        contradictions.length > 0 && Math.abs(missionFit - score.interests) >= 20;
      reasons.push(contradicts ? "MISSION_CONTRADICTS" : "MISSION_CORROBORATES");
    }

    for (const n of verdict.notices) if (!reasons.includes(n)) reasons.push(n);

    const strength = evidenceStrength(score, missionCompleted, reasons, answered, total);

    eligible.push({
      routeId: route.id,
      name: route.name,
      shortName: route.shortName,
      summary: route.summary,
      score,
      evidenceStrength: strength,
      reasons,
      supportingEvidence: buildSupportingEvidence(profile.topDimensions, missionEvidence.notes),
      strengths: route.strengths,
      limitations: route.limitations,
      openQuestions: openQuestionsFor(reasons, strength),
      nextExperiment: route.nextExperiment,
      costBand: route.costBand,
      requiresRelocation: route.requiresRelocation,
      flexibility: route.flexibility,
      timeToEarning: route.timeToEarning,
      tiedWith: [],
      stale: isStale(now),
      provenance: route.provenance as RouteProvenance,
    });
  }

  eligible.sort((a, b) => b.score.total - a.score.total);
  const selected = eligible.slice(0, MAX_ROUTES);

  // Gate 3 — routes survived the filters but none is backed by real evidence.
  if (selected.length > 0 && selected.every((r) => r.evidenceStrength === "insufficient")) {
    return {
      routes: [],
      ineligible,
      insufficientEvidence: true,
      insufficientReasons: ["INSUFFICIENT_EVIDENCE"],
      profile,
      notices,
      generatedAt: now.toISOString(),
      engineVersion: ENGINE_VERSION,
    };
  }

  markTies(selected);

  return {
    routes: selected,
    ineligible,
    insufficientEvidence: false,
    insufficientReasons: [],
    profile,
    notices,
    generatedAt: now.toISOString(),
    engineVersion: ENGINE_VERSION,
  };
}

/** Five weighted criteria, each 0..100, combined into one composite. */
export function scoreRoute(
  route: RouteDef,
  riasec: Record<Dimension, number>,
  missionVector: Record<Dimension, number>,
  missionCompleted: boolean,
  supporting: ReasonCode[],
): ScoreBreakdown {
  const interests = interestFit(riasec, route.interestWeights) * 100;

  // Strengths come from demonstrated behaviour, not stated preference. With no
  // mission we do not invent a value — we fall back to a neutral 50.
  const strengths = missionCompleted ? interestFit(missionVector, route.interestWeights) * 100 : 50;

  const affinity = LEARNING_STYLE_AFFINITY[route.learningStyle] ?? {};
  const affinityKeys = Object.keys(affinity) as Dimension[];
  const learningStyle =
    affinityKeys.length > 0
      ? (affinityKeys.reduce((sum, d) => sum + riasec[d] * (affinity[d] ?? 0), 0) /
          affinityKeys.reduce((sum, d) => sum + (affinity[d] ?? 0), 0)) *
        100
      : 50;

  const feasibilityHits = supporting.filter(
    (r) => r === "FEASIBLE_COST" || r === "FEASIBLE_LOCATION" || r === "TIMING_MATCH",
  ).length;
  const feasibility = Math.min(100, 55 + feasibilityHits * 15);

  const flexibility = route.flexibility * 100;

  const total =
    interests * WEIGHTS.interests +
    feasibility * WEIGHTS.feasibility +
    strengths * WEIGHTS.strengths +
    learningStyle * WEIGHTS.learningStyle +
    flexibility * WEIGHTS.flexibility;

  return {
    interests: round(interests),
    strengths: round(strengths),
    learningStyle: round(learningStyle),
    feasibility: round(feasibility),
    flexibility: round(flexibility),
    total: round(total),
  };
}

/**
 * Evidence strength is about how much we actually know, not how high the score
 * is. A high score from a half-finished interview is still weak evidence.
 */
export function evidenceStrength(
  score: ScoreBreakdown,
  missionCompleted: boolean,
  reasons: ReasonCode[],
  answered: number,
  total: number,
): EvidenceStrength {
  const completeness = answered / total;
  const contradicted = reasons.includes("MISSION_CONTRADICTS");

  if (completeness < 0.75) return "insufficient";
  if (!missionCompleted) return score.interests >= 55 ? "limited" : "insufficient";
  if (contradicted) return "limited";
  if (score.interests >= 65 && score.strengths >= 60) return "strong";
  if (score.interests >= 50 || score.strengths >= 50) return "moderate";
  return "limited";
}

/** Flag near-equal totals so the UI can refuse to rank them. */
export function markTies(routes: RouteResult[]): void {
  for (const a of routes) {
    a.tiedWith = routes
      .filter((b) => b.routeId !== a.routeId && Math.abs(a.score.total - b.score.total) <= TIE_EPSILON)
      .map((b) => b.routeId);
    if (a.tiedWith.length > 0 && !a.reasons.includes("TIED_SCORES")) a.reasons.push("TIED_SCORES");
  }
}

function buildSupportingEvidence(top: Dimension[], missionNotes: string[]): string[] {
  const out = [`Your interview leaned towards ${describeTopInterests(top.slice(0, 2))}.`];
  for (const n of missionNotes.slice(0, 3)) out.push(`In the mission you chose: ${n}`);
  return out;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Human-readable reason text, for UI and tests. */
export function explainReason(code: ReasonCode): string {
  return REASON_TEXT[code];
}
