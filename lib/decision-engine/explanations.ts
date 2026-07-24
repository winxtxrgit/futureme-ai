import type { Dimension, EvidenceStrength, ReasonCode } from "./types";

export const DIMENSION_LABELS: Record<Dimension, string> = {
  R: "practical, hands-on work",
  I: "investigating and analysing",
  A: "creative and design work",
  S: "helping and teaching people",
  E: "leading and persuading",
  C: "organising and keeping things accurate",
};

/**
 * Deterministic template explanations.
 *
 * This is the DEFAULT explanation layer and it always works offline. The
 * optional LLM layer in app/api/explain rewrites these sentences more warmly —
 * it never changes which routes were selected or why.
 */
export const REASON_TEXT: Record<ReasonCode, string> = {
  INTEREST_MATCH: "Your interest answers line up with what this route asks for.",
  INTEREST_WEAK: "Your interest answers only partly line up with this route.",
  MISSION_CORROBORATES: "What you did in the mission backs up what you said in the interview.",
  MISSION_CONTRADICTS: "Your mission choices point somewhere different from your interview answers.",
  FEASIBLE_COST: "The cost band fits the constraint you described.",
  FEASIBLE_LOCATION: "This is usually available without moving away from home.",
  TIMING_MATCH: "The time before you start earning matches what you said you wanted.",
  KEEPS_OPTIONS_OPEN: "This route keeps a relatively wide range of later options open.",
  COST_CONSTRAINT: "Filtered out: you said cost matters a lot and this route is high-cost.",
  LOCATION_CONSTRAINT: "Filtered out: you said you need to stay near home and this route usually requires moving.",
  TIER_MISMATCH: "Filtered out: this route is not offered at your current stage.",
  INSUFFICIENT_ANSWERS: "Not enough interview questions were answered.",
  INSUFFICIENT_EVIDENCE: "There is not enough evidence yet to separate the routes.",
  TIED_SCORES: "These routes scored close enough that the difference is not meaningful.",
  MISSING_COST_DATA: "You have not decided how much cost matters, so affordability was not checked.",
  MISSING_LOCATION_DATA: "You have not decided whether you could move, so location was not checked.",
  STALE_ROUTE_DATA: "This route information may be out of date — verify against official sources.",
};

export const STRENGTH_LABELS: Record<EvidenceStrength, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  limited: "Limited evidence",
  insufficient: "More exploration needed",
};

export const STRENGTH_HELP: Record<EvidenceStrength, string> = {
  strong: "Your interview and your mission point the same way.",
  moderate: "Some signals agree, but not all of them.",
  limited: "This is based on a small number of signals.",
  insufficient: "There is not enough here to say much yet.",
};

export function describeTopInterests(dims: Dimension[]): string {
  const parts = dims.map((d) => DIMENSION_LABELS[d]);
  if (parts.length === 0) return "no clear pattern yet";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** Questions the learner should still answer, derived from actual gaps. */
export function openQuestionsFor(reasons: ReasonCode[], strength: EvidenceStrength): string[] {
  const q: string[] = [];
  if (reasons.includes("MISSING_COST_DATA")) q.push("How much can your family realistically spend per year?");
  if (reasons.includes("MISSING_LOCATION_DATA")) q.push("Could you actually study away from home?");
  if (reasons.includes("MISSION_CONTRADICTS")) q.push("Which felt more true — what you said, or what you chose in the mission?");
  if (strength === "limited" || strength === "insufficient") q.push("What would you need to try before you would trust this suggestion?");
  if (reasons.includes("STALE_ROUTE_DATA")) q.push("Have the entry requirements changed since this data was compiled?");
  if (q.length === 0) q.push("What would make you change your mind about this route?");
  return q;
}
