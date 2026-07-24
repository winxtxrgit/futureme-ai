"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, EvidenceBadge, Notice, Shell } from "@/components/ui";
import { recommend, STRENGTH_LABELS, type Recommendation } from "@/lib/decision-engine";
import { buildPlan, planProgress } from "@/lib/plan";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";

export default function PlanPage() {
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
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  const route = result.routes.find((r) => r.routeId === session.selectedRouteId);

  if (!route) {
    return (
      <Shell step={5}>
        <Card>
          <h1 className="text-xl font-bold">No route selected yet</h1>
          <p className="mt-2 text-sm text-muted">
            {session.selectedRouteId
              ? "The route you picked is no longer among your results — your answers may have changed since."
              : "Pick a route first and a 30-day plan will be built from it."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/routes">Go to results</Button>
            <Button href="/compare" variant="secondary">
              Compare routes
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
        <p className="text-[11px] font-bold tracking-widest text-mint">30-DAY PLAN</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl" data-testid="plan-heading">
          {route.name}
        </h1>
        <div className="mt-3">
          <EvidenceBadge
            strength={route.evidenceStrength}
            label={STRENGTH_LABELS[route.evidenceStrength]}
          />
        </div>
      </div>

      <div className="mb-6">
        <Notice tone="warning" title="This plan is exploratory">
          It is built from a template so you can test the route cheaply before committing to it.
          Finishing it does not qualify you for anything, and it is not advice from a counsellor.
        </Notice>
      </div>

      {plan.addedForGaps.length > 0 ? (
        <div className="mb-6">
          <Notice title="Extra tasks added for your specific gaps">
            <ul className="list-inside list-disc">
              {plan.addedForGaps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Notice>
        </div>
      ) : null}

      <div className="mb-6" aria-live="polite">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            {progress.completed} of {progress.total} tasks checked in
          </span>
          <span>{progress.percent}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface2"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Plan progress"
        >
          <div className="h-full bg-mint transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <ol className="space-y-4">
        {plan.weeks.map((w) => (
          <Card as="li" key={w.week}>
            <p className="text-[11px] font-bold tracking-widest text-muted">WEEK {w.week}</p>
            <h2 className="mt-1 text-base font-bold">{w.objective}</h2>
            <ul className="mt-3 space-y-2">
              {w.tasks.map((t) => {
                const done = !!session.planProgress[t.id];
                return (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface2 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(t.id)}
                        data-testid={`task-${t.id}`}
                        className="mt-0.5 h-4 w-4 accent-[#4FE3C1]"
                      />
                      <span className={done ? "text-muted line-through" : ""}>{t.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </ol>

      <Card className="mt-6">
        <h2 className="text-sm font-bold">Changed your mind?</h2>
        <p className="mt-2 text-sm text-muted">
          Revising is normal and costs you nothing. Your checked-in tasks are kept.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/compare" variant="secondary">
            Compare routes again
          </Button>
          <Button href="/routes" variant="secondary">
            Pick a different route
          </Button>
          <Button href="/interview" variant="secondary">
            Change my answers
          </Button>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-bold">Want to keep this?</h2>
        <p className="mt-2 text-sm text-muted">
          Right now this plan lives only in this browser. Accounts are not implemented in this
          prototype — saving permanently, and sharing a summary with a counsellor, are planned.
        </p>
        <div className="mt-4">
          <Button variant="secondary" disabled>
            Create an account (not implemented)
          </Button>
        </div>
      </Card>
    </Shell>
  );
}
