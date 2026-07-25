"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EvidenceBadge, Notice, Shell } from "@/components/ui";
import {
  explainReason,
  recommend,
  routeDataAsOf,
  STRENGTH_HELP,
  STRENGTH_LABELS,
  type Recommendation,
  type RouteResult,
} from "@/lib/decision-engine";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";

export default function RoutesPage() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  const result = useMemo<Recommendation | null>(() => {
    if (!session) return null;
    try {
      return recommend(session.interview, session.mission);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    }
  }, [session]);

  if (!session) {
    return (
      <Shell step={3}>
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  // A half-written mission draft is not a completed mission, so the pause must
  // still hold — otherwise autosaving a draft would silently dismiss it.
  if (session.safetyTriggered && !session.mission?.completed) return <SafetyPause />;

  if (error) {
    return (
      <Shell step={3}>
        <Card className="border-coral/40">
          <h1 className="text-xl font-bold">Something went wrong generating routes</h1>
          <p className="mt-2 text-sm text-muted">
            The engine could not process this session. Your answers are still saved.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-control bg-surface2 p-3 text-xs text-muted">
            {error}
          </pre>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setSession(loadOrCreate())}>Try again</Button>
            <Button href="/interview" variant="secondary">
              Review my answers
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  if (!result) return null;

  const select = (routeId: string) => {
    const next = { ...session, selectedRouteId: routeId };
    setSession(next);
    saveSession(next);
    router.push("/plan");
  };

  if (result.insufficientEvidence) {
    return (
      <Shell step={3}>
        <Card className="border-warning/40" >
          <h1 className="text-2xl font-bold" data-testid="insufficient-heading">
            We do not have enough evidence to suggest a route yet.
          </h1>
          <p className="mt-3 text-sm text-muted">
            Complete another mission or review your responses.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {result.insufficientReasons.map((r) => (
              <li key={r}>• {explainReason(r)}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            You answered {result.profile.answeredInterest} of {result.profile.totalInterest}{" "}
            statements.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/interview">Review my answers</Button>
            <Button href="/mission" variant="secondary">
              Redo the mission
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell step={3}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl" data-testid="routes-heading">
          {result.routes.length === 1
            ? "One route fits what you told us"
            : `${result.routes.length} routes worth exploring`}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          These are not ranked and none of them is a &ldquo;best match&rdquo;. Read the evidence and
          the limitations, then compare them before you choose.
        </p>
      </div>

      {result.routes.some((r) => r.tiedWith.length > 0) ? (
        <div className="mb-5">
          <Notice title="Some of these scored too close to separate">
            The difference between them is smaller than this prototype can meaningfully measure, so
            they are shown as equals.
          </Notice>
        </div>
      ) : null}

      {result.profile.contradictions.length > 0 ? (
        <div className="mb-5">
          <Notice tone="warning" title="Your interview and your mission disagree">
            What you chose in the mission points somewhere different from what you said in the
            interview. That is useful information, not a mistake — it usually means one of them was
            answered aspirationally. Worth discussing with a counsellor.
          </Notice>
        </div>
      ) : null}

      {/* Equal weight by construction: same grid cell, same card, same actions. */}
      <ul className="grid gap-4 lg:grid-cols-3">
        {result.routes.map((route) => (
          <RouteCard key={route.routeId} route={route} onSelect={() => select(route.routeId)} />
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button href="/compare" data-testid="go-compare">
          Compare these side by side →
        </Button>
        <span className="text-xs text-muted">Recommended before choosing.</span>
      </div>

      {result.ineligible.length > 0 ? (
        <details className="mt-8 rounded-card border border-line bg-surface p-5">
          <summary className="cursor-pointer text-sm font-bold">
            {result.ineligible.length} route{result.ineligible.length === 1 ? "" : "s"} were filtered
            out — see why
          </summary>
          <ul className="mt-4 space-y-3">
            {result.ineligible.map((r) => (
              <li key={r.routeId} className="text-sm">
                <p className="font-semibold">{r.name}</p>
                <ul className="mt-1 text-muted">
                  {r.reasons.map((code) => (
                    <li key={code}>• {explainReason(code)}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="mt-6 text-xs text-muted">
        Generated in your browser by engine {result.engineVersion} from demo route data compiled{" "}
        {routeDataAsOf()}. No model chose these routes.
      </p>
    </Shell>
  );
}

function RouteCard({ route, onSelect }: { route: RouteResult; onSelect: () => void }) {
  return (
    <Card as="li" className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-base font-bold leading-snug">{route.name}</h2>
      </div>

      <div className="mt-3">
        <EvidenceBadge strength={route.evidenceStrength} label={STRENGTH_LABELS[route.evidenceStrength]} />
        <p className="mt-1.5 text-xs text-muted">{STRENGTH_HELP[route.evidenceStrength]}</p>
      </div>

      <p className="mt-3 text-sm text-muted">{route.summary}</p>

      <section className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Why this appeared</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {route.reasons.slice(0, 3).map((code) => (
            <li key={code} className="text-muted">
              • {explainReason(code)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Evidence used</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {route.supportingEvidence.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      </section>

      <details className="mt-4 border-t border-line pt-3">
        <summary className="cursor-pointer text-xs font-bold">Strengths and limitations</summary>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Possible strengths</p>
            <ul className="mt-1 space-y-1 text-muted">
              {route.strengths.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Possible limitations
            </p>
            <ul className="mt-1 space-y-1 text-muted">
              {route.limitations.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <section className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Still unanswered</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {route.openQuestions.map((q) => (
            <li key={q}>• {q}</li>
          ))}
        </ul>
      </section>

      <div className="mt-4 rounded-control border border-line bg-surface2 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Next experiment</p>
        <p className="mt-1 text-sm">{route.nextExperiment}</p>
      </div>

      {route.stale ? (
        <p className="mt-3 text-xs text-warning">
          ⚠ This route information may be out of date — verify against official sources.
        </p>
      ) : null}

      {/* Every card gets the identical action, in the identical style. */}
      <div className="mt-5 pt-1">
        <Button
          variant="secondary"
          onClick={onSelect}
          className="w-full"
          data-testid={`select-${route.routeId}`}
        >
          Build a 30-day plan for this
        </Button>
      </div>
    </Card>
  );
}
