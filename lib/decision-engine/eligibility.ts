import routesData from "@/data/routes.json";
import type { InterviewInput, ReasonCode, Tier } from "./types";

export type RouteDef = (typeof routesData.routes)[number];

export interface EligibilityVerdict {
  eligible: boolean;
  blocking: ReasonCode[];
  supporting: ReasonCode[];
  notices: ReasonCode[];
}

/**
 * Hard constraints, applied before any scoring.
 *
 * A route the learner cannot reach or cannot afford is not a recommendation,
 * so these filters run first and produce blocking reason codes that the UI
 * shows verbatim. Unknown answers never block — they raise a notice instead,
 * because "I don't know yet" is a normal answer for a 15-year-old.
 */
export function evaluateEligibility(route: RouteDef, input: InterviewInput): EligibilityVerdict {
  const blocking: ReasonCode[] = [];
  const supporting: ReasonCode[] = [];
  const notices: ReasonCode[] = [];

  const { tier, cost, mobility, horizon } = input.context;

  // Tier: a route not offered at the learner's stage is genuinely irrelevant.
  if (tier && !route.tiers.includes(tier as Tier)) blocking.push("TIER_MISMATCH");

  // Cost.
  if (cost === "tight") {
    if (route.costBand === "high") blocking.push("COST_CONSTRAINT");
    else if (route.costBand === "low") supporting.push("FEASIBLE_COST");
  } else if (cost === "unknown") {
    if (route.costBand === "high") notices.push("MISSING_COST_DATA");
  } else if (cost === "moderate" && route.costBand === "low") {
    supporting.push("FEASIBLE_COST");
  }

  // Location.
  if (mobility === "local_only") {
    if (route.requiresRelocation) blocking.push("LOCATION_CONSTRAINT");
    else supporting.push("FEASIBLE_LOCATION");
  } else if (mobility === "unknown" && route.requiresRelocation) {
    notices.push("MISSING_LOCATION_DATA");
  }

  // Timing is a preference, never a blocker.
  if (horizon && horizon !== "unsure" && horizon === route.timeToEarning) {
    supporting.push("TIMING_MATCH");
  }

  if (route.flexibility >= 0.75) supporting.push("KEEPS_OPTIONS_OPEN");
  if (isStale()) notices.push("STALE_ROUTE_DATA");

  return { eligible: blocking.length === 0, blocking, supporting, notices };
}

/** Route data ages: entry criteria and costs change every academic year. */
export function isStale(now: Date = new Date()): boolean {
  const asOf = new Date(routesData.meta.dataAsOf);
  const days = (now.getTime() - asOf.getTime()) / 86_400_000;
  return days > routesData.meta.stalenessWarningAfterDays;
}

export function routeDataAsOf(): string {
  return routesData.meta.dataAsOf;
}
