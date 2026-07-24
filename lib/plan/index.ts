import routesData from "@/data/routes.json";
import type { RouteResult } from "@/lib/decision-engine/types";

export interface PlanTask {
  id: string;
  text: string;
}

export interface PlanWeek {
  week: number;
  objective: string;
  tasks: PlanTask[];
}

export interface ActionPlan {
  routeId: string;
  routeName: string;
  weeks: PlanWeek[];
  /** Tasks injected because the engine flagged a specific gap. */
  addedForGaps: string[];
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

  const addedForGaps: string[] = [];

  if (route.reasons.includes("MISSION_CONTRADICTS")) {
    const t = "Redo the mission choosing what you would really do, then compare the two answers.";
    weeks[0].tasks.push({ id: "gap-contradiction", text: t });
    addedForGaps.push(t);
  }
  if (route.reasons.includes("MISSING_COST_DATA")) {
    const t = "Ask at home what the realistic yearly budget for study is.";
    weeks[2].tasks.push({ id: "gap-cost", text: t });
    addedForGaps.push(t);
  }
  if (route.reasons.includes("MISSING_LOCATION_DATA")) {
    const t = "Decide with your family whether studying away from home is possible.";
    weeks[2].tasks.push({ id: "gap-location", text: t });
    addedForGaps.push(t);
  }
  if (route.evidenceStrength === "limited" || route.evidenceStrength === "insufficient") {
    const t = `Run the suggested experiment: ${route.nextExperiment}`;
    weeks[0].tasks.push({ id: "gap-experiment", text: t });
    addedForGaps.push(t);
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
