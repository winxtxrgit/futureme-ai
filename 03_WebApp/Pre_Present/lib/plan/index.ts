import routesData from "@/data/routes.json";
import type { Localised, RouteResult } from "@/lib/decision-engine/types";

/**
 * A task added because the engine found a specific gap.
 *
 * A code rather than a sentence: the plan builder knows *which* gap exists, the
 * interface knows how to say it. The one exception carries the route's own
 * next-experiment text, which is already bilingual seed data.
 */
export type GapTaskCode =
  | "MISSION_CONTRADICTION"
  | "COST_UNKNOWN"
  | "LOCATION_UNKNOWN"
  | "RUN_EXPERIMENT";

export interface PlanTask {
  id: string;
  /** Template tasks carry their own copy; gap tasks carry a code to render. */
  text?: Localised;
  gap?: GapTaskCode;
  /** The route's suggested experiment, for RUN_EXPERIMENT only. */
  experiment?: Localised;
}

export interface PlanWeek {
  week: number;
  objective: Localised;
  tasks: PlanTask[];
}

export interface ActionPlan {
  routeId: string;
  routeName: Localised;
  weeks: PlanWeek[];
  /** Gaps the engine flagged, as codes. */
  addedForGaps: GapTaskCode[];
  exploratory: true;
}

type TemplateKey = keyof typeof routesData.planTemplates;

/**
 * Build a 30-day plan from structured templates.
 *
 * Deterministic and offline. The template is chosen by the route, then extra
 * tasks are appended for the specific gaps the engine detected — so a plan for
 * a contradicted route differs from a plan for a well-supported one.
 */
export function buildPlan(route: RouteResult): ActionPlan {
  const def = routesData.routes.find((r) => r.id === route.routeId);
  const templateKey = (def?.planTemplate ?? "structured") as TemplateKey;
  const template = routesData.planTemplates[templateKey] ?? routesData.planTemplates.structured;

  const weeks: PlanWeek[] = template.weeks.map((w, i) => ({
    week: i + 1,
    objective: w.objective,
    tasks: w.tasks.map((t, j) => ({ id: `w${i + 1}t${j + 1}`, text: t })),
  }));

  const addedForGaps: GapTaskCode[] = [];

  if (route.reasons.includes("MISSION_CONTRADICTS")) {
    weeks[0].tasks.push({ id: "gap-contradiction", gap: "MISSION_CONTRADICTION" });
    addedForGaps.push("MISSION_CONTRADICTION");
  }
  if (route.reasons.includes("MISSING_COST_DATA")) {
    weeks[2].tasks.push({ id: "gap-cost", gap: "COST_UNKNOWN" });
    addedForGaps.push("COST_UNKNOWN");
  }
  if (route.reasons.includes("MISSING_LOCATION_DATA")) {
    weeks[2].tasks.push({ id: "gap-location", gap: "LOCATION_UNKNOWN" });
    addedForGaps.push("LOCATION_UNKNOWN");
  }
  if (route.evidenceStrength === "limited" || route.evidenceStrength === "insufficient") {
    weeks[0].tasks.push({
      id: "gap-experiment",
      gap: "RUN_EXPERIMENT",
      experiment: route.nextExperiment,
    });
    addedForGaps.push("RUN_EXPERIMENT");
  }

  return { routeId: route.routeId, routeName: route.name, weeks, addedForGaps, exploratory: true };
}

export function planProgress(plan: ActionPlan, done: Record<string, boolean>): {
  completed: number;
  total: number;
  percent: number;
} {
  const all = plan.weeks.flatMap((w) => w.tasks);
  const completed = all.filter((t) => done[t.id]).length;
  return {
    completed,
    total: all.length,
    percent: all.length === 0 ? 0 : Math.round((completed / all.length) * 100),
  };
}
