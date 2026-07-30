"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, EvidenceBadge, Notice, Shell } from "@/components/ui";
import { recommend, type Recommendation } from "@/lib/decision-engine";
import { buildPlan, planProgress, type GapTaskCode, type PlanTask } from "@/lib/plan";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";

/**
 * Renders a plan task.
 *
 * Template tasks carry their own bilingual copy; gap tasks carry a code the
 * plan builder emitted, so the wording lives here rather than in the builder.
 */
function taskText(task: PlanTask, lang: Language, t: Dictionary): string {
  if (task.gap) {
    const template = t.engine.gapTasks[task.gap as GapTaskCode];
    return task.experiment
      ? format(template, { experiment: localised(task.experiment, lang) })
      : template;
  }
  return task.text ? localised(task.text, lang) : "";
}

export default function PlanPage() {
  const { t, lang } = usePreferences();
  const [session, setSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  const result = useMemo<Recommendation | null>(
    () => (session ? recommend(session.interview, session.mission) : null),
    [session],
  );

  if (!session || !result) {
    return (
      <Shell step={5}>
        <p className="text-muted">{t.assessment.loading}</p>
      </Shell>
    );
  }

  const route = result.routes.find((r) => r.routeId === session.selectedRouteId);

  if (!route) {
    return (
      <Shell step={5}>
        <Card>
          <h1 className="text-xl font-bold">{t.plan.noRouteTitle}</h1>
          <p className="mt-2 text-sm text-muted">
            {session.selectedRouteId ? t.plan.noRouteChanged : t.plan.noRouteYet}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/routes">{t.plan.goToResults}</Button>
            <Button href="/compare" variant="secondary">
              {t.plan.compareRoutes}
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  const plan = buildPlan(route);
  const progress = planProgress(plan, session.planProgress);

  const toggle = (taskId: string) => {
    const next = {
      ...session,
      planProgress: { ...session.planProgress, [taskId]: !session.planProgress[taskId] },
    };
    setSession(next);
    saveSession(next);
  };

  return (
    <Shell step={5}>
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-widest text-mint">{t.plan.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl" data-testid="plan-heading">
          {localised(route.name, lang)}
        </h1>
        <div className="mt-3">
          <EvidenceBadge
            strength={route.evidenceStrength}
            label={t.engine.strengthLabels[route.evidenceStrength]}
          />
        </div>
      </div>

      <div className="mb-6">
        <Notice tone="warning" title={t.plan.exploratoryTitle}>
          {t.plan.exploratoryBody}
        </Notice>
      </div>

      {plan.addedForGaps.length > 0 ? (
        <div className="mb-6">
          <Notice title={t.plan.gapsTitle}>
            <ul className="list-inside list-disc">
              {plan.addedForGaps.map((gap) => (
                <li key={gap}>
                  {gap === "RUN_EXPERIMENT"
                    ? format(t.engine.gapTasks[gap], {
                        experiment: localised(route.nextExperiment, lang),
                      })
                    : t.engine.gapTasks[gap]}
                </li>
              ))}
            </ul>
          </Notice>
        </div>
      ) : null}

      <div className="mb-6" aria-live="polite">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            {format(t.plan.progress, { completed: progress.completed, total: progress.total })}
          </span>
          <span>{progress.percent}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface2"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t.plan.progressLabel}
        >
          <div className="h-full bg-mint transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <ol className="space-y-4">
        {plan.weeks.map((w) => (
          <Card as="li" key={w.week}>
            <p className="text-[11px] font-bold tracking-widest text-muted">
              {format(t.plan.week, { n: w.week })}
            </p>
            <h2 className="mt-1 text-base font-bold">{localised(w.objective, lang)}</h2>
            <ul className="mt-3 space-y-2">
              {w.tasks.map((task) => {
                const done = !!session.planProgress[task.id];
                return (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface2 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(task.id)}
                        data-testid={`task-${task.id}`}
                        className="mt-0.5 h-4 w-4 accent-mint"
                      />
                      <span className={done ? "text-muted line-through" : ""}>
                        {taskText(task, lang, t)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </ol>

      <Card className="mt-6">
        <h2 className="text-sm font-bold">{t.plan.changedMindTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.plan.changedMindBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/compare" variant="secondary">
            {t.plan.compareAgain}
          </Button>
          <Button href="/routes" variant="secondary">
            {t.plan.pickDifferent}
          </Button>
          <Button href="/interview" variant="secondary">
            {t.plan.changeAnswers}
          </Button>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-bold">{t.plan.keepTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.plan.keepBody}</p>
        <div className="mt-4">
          <Button variant="secondary" disabled>
            {t.plan.createAccount}
          </Button>
        </div>
      </Card>
    </Shell>
  );
}
