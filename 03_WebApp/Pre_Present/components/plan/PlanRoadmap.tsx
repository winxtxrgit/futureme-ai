"use client";

import type { PlanWeek } from "@/lib/plan";

/**
 * The 30-day plan drawn as a roadmap: a numbered spine with one stop per week.
 *
 * The shape is doing a job, not decorating. A stacked list of four cards reads
 * as four separate things to do; a spine reads as an order, which is what a
 * plan is. Week 2 asks the learner to visit a workplace they only decided to
 * look for in week 1.
 *
 * What it deliberately does not do is imply the road ends somewhere good. The
 * last node is a stop like the others — no flag, no trophy, no "you have
 * arrived" — because finishing these four weeks tells a learner whether a route
 * suits them, which is as often "no" as "yes", and a roadmap that celebrates
 * completion would quietly argue for one of those answers.
 *
 * Layout is a three-column grid on wide screens (card, spine, card) and two
 * columns below that (spine, card). The alternating side is presentational
 * only: the DOM order stays week 1 to week 4 either way, so the reading order
 * and the tab order follow the plan rather than the picture.
 */
export default function PlanRoadmap({
  weeks,
  done,
  onToggle,
  weekTemplate,
  objectiveLabel,
  taskLabel,
  weekCompleteLabel,
  currentWeekLabel,
  gapTaskLabel,
  isGapTask,
}: {
  weeks: PlanWeek[];
  done: Record<string, boolean>;
  onToggle: (taskId: string) => void;
  /** "Week {n}" in the active language. */
  weekTemplate: string;
  /** Resolves the week's objective in the active language. */
  objectiveLabel: (week: PlanWeek) => string;
  /** Renders one task's sentence in the active language. */
  taskLabel: (task: PlanWeek["tasks"][number]) => string;
  /** Announced on a week whose tasks are all ticked. */
  weekCompleteLabel: string;
  /** Marks the earliest unfinished week — where to pick the plan back up. */
  currentWeekLabel: string;
  /** Marks a task the engine added because it found a gap. */
  gapTaskLabel: string;
  isGapTask: (task: PlanWeek["tasks"][number]) => boolean;
}) {
  const isComplete = (week: PlanWeek) =>
    week.tasks.length > 0 && week.tasks.every((task) => done[task.id]);

  /*
   * Where to pick the plan back up: the earliest week still unfinished. A plan
   * is read over a month, not in one sitting, so returning to it should not
   * mean re-reading four weeks to work out where you stopped. Nothing is
   * current once every week is done — there is no next stop to point at.
   */
  const currentWeek = weeks.find((week) => !isComplete(week))?.week ?? null;

  return (
    /*
     * The list roles are explicit because `display: grid` on a list item drops
     * its list semantics in WebKit, and "item 2 of 4" is most of what this
     * component is telling a screen-reader user.
     */
    <ol className="relative" data-testid="plan-roadmap" role="list">
      {weeks.map((week, index) => {
        const complete = isComplete(week);
        const current = week.week === currentWeek;
        const isLast = index === weeks.length - 1;
        // Right-hand card on odd stops, left-hand on even — wide screens only.
        const cardOnRight = index % 2 === 0;

        return (
          <li
            key={week.week}
            role="listitem"
            aria-current={current ? "step" : undefined}
            data-testid={`roadmap-stop-${week.week}`}
            data-complete={complete ? "true" : "false"}
            data-current={current ? "true" : "false"}
            className="grid grid-cols-[3rem_1fr] gap-x-4 lg:grid-cols-[1fr_3rem_1fr] lg:gap-x-6"
          >
            {/* Wide screens only: the empty half opposite the card. */}
            <div className={`hidden lg:block ${cardOnRight ? "" : "lg:order-3"}`} aria-hidden />

            <div className="relative flex flex-col items-center lg:order-2">
              <span
                aria-hidden
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  complete
                    ? "border-mint bg-mint text-mintInk"
                    : current
                      ? "border-indigo bg-indigo/10 text-indigoText ring-4 ring-indigo/20"
                      : "border-indigo/40 bg-surface text-indigoText",
                ].join(" ")}
              >
                {complete ? "✓" : String(week.week).padStart(2, "0")}
              </span>
              {/* The rail between stops. Absent after the last one, so the road
                  stops where the plan stops rather than trailing off. */}
              {isLast ? null : (
                <span
                  aria-hidden
                  className={`w-0.5 flex-1 transition-colors ${complete ? "bg-mint/50" : "bg-line"}`}
                />
              )}
            </div>

            <div className={`pb-8 ${cardOnRight ? "lg:order-3" : "lg:order-1"}`}>
              <div className="rounded-card border border-line bg-surface p-4 text-left shadow-[var(--shadow-card)]">
                <p className="text-[11px] font-bold tracking-widest text-muted">
                  {weekTemplate.replace("{n}", String(week.week))}
                </p>
                <h2 className="mt-1 text-base font-bold">{objectiveLabel(week)}</h2>
                {complete ? (
                  <p className="mt-1 text-xs font-semibold text-mint">{weekCompleteLabel}</p>
                ) : null}
                {current ? (
                  <p className="mt-1 text-xs font-semibold text-indigoText" data-testid="roadmap-current-label">
                    {currentWeekLabel}
                  </p>
                ) : null}

                <ul className="mt-3 space-y-2">
                  {week.tasks.map((task) => {
                    const checked = !!done[task.id];
                    return (
                      <li key={task.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface2 p-3 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(task.id)}
                            data-testid={`task-${task.id}`}
                            className="mt-0.5 h-4 w-4 accent-mint"
                          />
                          <span>
                            <span className={checked ? "text-muted line-through" : ""}>
                              {taskLabel(task)}
                            </span>
                            {/* Outside the struck-through span on purpose: why a
                                task exists does not stop being true once it is
                                ticked, and a struck-out label reads as retracted. */}
                            {isGapTask(task) ? (
                              <span
                                data-testid={`gap-marker-${task.id}`}
                                className="ml-2 whitespace-nowrap rounded-full border border-warning/40 bg-warning/5 px-2 py-0.5 text-[10px] font-bold text-warning"
                              >
                                {gapTaskLabel}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
