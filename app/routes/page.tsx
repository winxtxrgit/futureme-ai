"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EvidenceBadge, Shell } from "@/components/ui";
import {
  DIMENSION_LABELS,
  explainReason,
  freshness,
  recommend,
  routeDataAsOf,
  STRENGTH_HELP,
  STRENGTH_LABELS,
  unverifiedFields,
  type Recommendation,
  type RouteResult,
} from "@/lib/decision-engine";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";

/** Descriptive, not ranked — the same words the compare screen uses. */
const COST_LABEL: Record<string, string> = { low: "Lower", moderate: "Moderate", high: "Higher" };
const TIMING_LABEL: Record<string, string> = { soon: "Sooner", later: "Later" };

function attributes(route: RouteResult): { label: string; value: string }[] {
  return [
    { label: "Cost", value: COST_LABEL[route.costBand] ?? "—" },
    { label: "Time to earning", value: TIMING_LABEL[route.timeToEarning] ?? "—" },
    { label: "Study away from home", value: route.requiresRelocation ? "Usually" : "Not needed" },
    {
      label: "Flexibility",
      value: route.flexibility >= 0.66 ? "Keeps options open" : route.flexibility < 0.4 ? "More specialised" : "Balanced",
    },
  ];
}

export default function RoutesPage() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [llmAvailable, setLlmAvailable] = useState(false);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  // Ask once whether the optional rewording layer is configured. The control is
  // only offered when it can do something — a button that always falls back
  // would misrepresent what the deployment can do.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/explain")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { available?: boolean } | null) => {
        if (!cancelled && d?.available) setLlmAvailable(true);
      })
      .catch(() => {
        /* absent layer is the normal case, not an error */
      });
    return () => {
      cancelled = true;
    };
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
        <Card className="border-warning/40">
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

  const many = result.routes.length > 1;

  return (
    <Shell step={3}>
      {/* Level 1 — understand what the options are, fast. */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl" data-testid="routes-heading">
          {many ? `${result.routes.length} directions worth exploring` : "One direction worth exploring"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {many
            ? "None of these is a “best match.” Think of them as hypotheses to test — skim the three, then compare."
            : "This is not a “best match” — it is one hypothesis to test. Read it, then explore the evidence."}
        </p>
      </header>

      <SignalSummary result={result} />

      {/* Equal weight by construction: same grid cell, same card, same actions. */}
      <ul className="mt-6 grid gap-4 lg:grid-cols-3">
        {result.routes.map((route) => (
          <RouteCard
            key={route.routeId}
            route={route}
            llmAvailable={llmAvailable}
            onSelect={() => select(route.routeId)}
          />
        ))}
      </ul>

      {/* Level 2 — comparison is the intended next step, so it is the one strong CTA. */}
      {many ? (
        <section className="mt-8 rounded-card border border-mint/30 bg-mint/5 p-5 text-center">
          <h2 className="text-base font-bold">Not sure which one?</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Put them side by side on cost, time to earning, flexibility and evidence before you
            decide anything.
          </p>
          <div className="mt-4">
            <Button href="/compare" data-testid="go-compare">
              Compare the {result.routes.length} routes →
            </Button>
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <Button href="/compare" variant="secondary" data-testid="go-compare">
            See this route&rsquo;s details side by side →
          </Button>
        </div>
      )}

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

      {/* Level 3 (shared) — source and freshness, once, not repeated per card. */}
      <DataFreshness />

      <p className="mt-4 text-xs text-muted">
        Generated in your browser by engine {result.engineVersion} from demo route data compiled{" "}
        {routeDataAsOf()}. No model chose these routes.
      </p>
    </Shell>
  );
}

/**
 * Replaces the two large warning panels (ties, contradiction) with one calm
 * summary of what the answers pointed to. The detail — why more than one route
 * is showing — is available on demand, not shouted by default.
 */
function SignalSummary({ result }: { result: Recommendation }) {
  const { profile } = result;
  const interest = profile.topDimensions.slice(0, 2).map((d) => DIMENSION_LABELS[d]);
  const tied = result.routes.some((r) => r.tiedWith.length > 0);
  const contradicted = profile.contradictions.length > 0;
  const missionLine = !profile.missionCompleted
    ? "Not completed yet"
    : contradicted
      ? "Pointed somewhere different"
      : "Agreed with your interview";

  return (
    <section className="rounded-card border border-line bg-surface p-5" data-testid="signal-summary">
      <h2 className="text-sm font-bold">What your answers pointed to</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Interview</dt>
          <dd className="mt-1 text-sm">{interest.join(" + ") || "No clear lead"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Mission</dt>
          <dd className="mt-1 text-sm">{missionLine}</dd>
        </div>
      </dl>

      {tied || contradicted ? (
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer text-xs font-bold" data-testid="why-multiple">
            Why you&rsquo;re seeing more than one
          </summary>
          <div className="mt-2 space-y-2 text-sm text-muted">
            {contradicted ? (
              <p>
                Your answers and your actions pointed in different directions. That is useful
                evidence, not a mistake — it often means you need more real-world exploration before
                choosing. Worth talking through with a counsellor.
              </p>
            ) : null}
            {tied ? (
              <p>
                Some of these routes are too close to rank confidently, so FutureMe shows them as
                equals rather than inventing an order the evidence does not support.
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </section>
  );
}

/**
 * Says how old the catalogue is and which fields have no source at all, rather
 * than only warning once it crosses a threshold. Missing information is a
 * different problem from out-of-date information and the learner deserves both.
 * Shown once for the whole page; per-route sources live in each route's details.
 */
function DataFreshness() {
  const f = freshness();
  const unsourced = unverifiedFields();

  return (
    <section className="mt-8 rounded-card border border-line bg-surface p-5" data-testid="data-freshness">
      <h2 className="text-sm font-bold">About this information</h2>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold">Compiled</dt>
          <dd className="text-muted">
            {f.dataAsOf} · {f.ageInDays} days ago
            {f.stale ? (
              <span className="ml-2 rounded-full border border-warning/40 bg-warning/5 px-2 py-0.5 text-[11px] font-bold text-warning">
                past its {f.thresholdDays}-day review point
              </span>
            ) : (
              <span className="ml-2 rounded-full border border-mint/40 bg-mint/5 px-2 py-0.5 text-[11px] font-bold text-mint">
                within its {f.thresholdDays}-day review point
              </span>
            )}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold">Not sourced at all</dt>
          <dd className="text-muted">
            {unsourced.join(", ")} — these are the team&rsquo;s estimates, and they drive the
            filters that ruled routes in or out.
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted">
        Each route&rsquo;s own source is inside its <strong className="text-ink">Explore</strong>{" "}
        panel. Entry criteria and fees change every academic year — check anything you would act on
        against the institution&rsquo;s own current page before you decide.
      </p>
    </section>
  );
}

function RouteCard({
  route,
  llmAvailable,
  onSelect,
}: {
  route: RouteResult;
  llmAvailable: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `route-detail-${route.routeId}`;

  return (
    <Card as="li" className="flex flex-col">
      {/* Identity */}
      <h2 className="text-base font-bold leading-snug">{route.name}</h2>
      {route.shortName && route.shortName !== route.name ? (
        <p className="mt-0.5 text-xs text-muted">{route.shortName}</p>
      ) : null}

      <p className="mt-2 text-sm text-muted">{route.summary}</p>

      <div className="mt-3">
        <EvidenceBadge strength={route.evidenceStrength} label={STRENGTH_LABELS[route.evidenceStrength]} />
        <p className="mt-1.5 text-xs text-muted">{STRENGTH_HELP[route.evidenceStrength]}</p>
      </div>

      {/* At a glance — descriptive dimensions, not scores */}
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
        {attributes(route).map((a) => (
          <div key={a.label}>
            <dt className="text-[11px] uppercase tracking-wide text-muted">{a.label}</dt>
            <dd className="text-sm">{a.value}</dd>
          </div>
        ))}
      </dl>

      <WhyItMayFit route={route} llmAvailable={llmAvailable} />

      {route.limitations.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Consider</h3>
          <p className="mt-1 text-sm text-muted">{route.limitations[0]}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-control border border-line bg-surface2 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Try this next</p>
        <p className="mt-1 text-sm">{route.nextExperiment}</p>
      </div>

      <div className="flex-1" />

      {/* Level 3 toggle — every card's action is identical in style and weight. */}
      <div className="mt-5">
        <Button
          variant="secondary"
          onClick={() => setOpen((v) => !v)}
          className="w-full"
          data-testid={`select-${route.routeId}`}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {open ? "Hide details" : "Explore this route"}
        </Button>
      </div>

      {open ? (
        <div id={panelId} className="mt-4 space-y-4 border-t border-line pt-4" data-testid={`detail-${route.routeId}`}>
          <DetailBlock title="Why FutureMe showed this">
            <ul className="space-y-1 text-sm text-muted">
              {route.reasons.slice(0, 4).map((code) => (
                <li key={code}>• {explainReason(code)}</li>
              ))}
            </ul>
          </DetailBlock>

          <DetailBlock title="Evidence used">
            <ul className="space-y-1 text-sm text-muted">
              {route.supportingEvidence.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          </DetailBlock>

          {route.strengths.length > 0 ? (
            <DetailBlock title="Strengths">
              <ul className="space-y-1 text-sm text-muted">
                {route.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          {route.limitations.length > 0 ? (
            <DetailBlock title="Trade-offs">
              <ul className="space-y-1 text-sm text-muted">
                {route.limitations.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          {route.openQuestions.length > 0 ? (
            <DetailBlock title="Still unanswered">
              <ul className="space-y-1 text-sm text-muted">
                {route.openQuestions.map((q) => (
                  <li key={q}>• {q}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          <Provenance route={route} />

          <Button
            variant="secondary"
            onClick={onSelect}
            className="w-full"
            data-testid={`plan-${route.routeId}`}
          >
            Build a 30-day plan for this route →
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * The compact "why it may fit" block, shown by default.
 *
 * Its default content is the route's own strengths — genuinely route-specific,
 * so the three cards differ at a glance instead of repeating the same generic
 * sentences. The optional AI layer, when configured, restates the engine's
 * reasoning in plainer words; it is labelled as wording only and never changes
 * which route this is or why it appeared.
 */
function WhyItMayFit({ route, llmAvailable }: { route: RouteResult; llmAvailable: boolean }) {
  const codes = route.reasons.slice(0, 3);
  const deterministic = codes.map((c) => explainReason(c)).join(" ");
  const signals = route.strengths.slice(0, 2);

  const [rewritten, setRewritten] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "unavailable">("idle");

  const reword = useCallback(async () => {
    if (rewritten) {
      setShowing(true);
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ routeId: route.routeId, reasons: codes }),
      });
      const data = (await res.json()) as { source?: string; text?: string };
      if (data.source === "llm" && data.text) {
        setRewritten(data.text);
        setShowing(true);
        setState("idle");
      } else {
        setState("unavailable");
      }
    } catch {
      setState("unavailable");
    }
  }, [codes, rewritten, route.routeId]);

  return (
    <section className="mt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Why it may fit you</h3>

      {showing && rewritten ? (
        <>
          <p className="mt-2 text-sm text-muted" data-testid={`why-llm-${route.routeId}`}>
            {rewritten}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            <span className="rounded-full border border-indigo/40 bg-indigo/10 px-2 py-0.5 font-bold text-indigo">
              Reworded by AI
            </span>{" "}
            Wording only. This route and why it appeared were decided by the rule engine before any
            model was asked.
          </p>
          <button
            type="button"
            onClick={() => setShowing(false)}
            className="mt-2 text-xs text-muted underline underline-offset-2"
          >
            Show the rule-engine wording
          </button>
        </>
      ) : (
        <>
          {rewritten ? (
            <p className="mt-2 text-sm text-muted" data-testid={`why-rules-${route.routeId}`}>
              {deterministic}
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm" data-testid={`why-rules-${route.routeId}`}>
              {signals.map((s) => (
                <li key={s} className="text-muted">
                  • {s}
                </li>
              ))}
            </ul>
          )}
          {llmAvailable ? (
            <button
              type="button"
              onClick={reword}
              disabled={state === "loading"}
              data-testid={`reword-${route.routeId}`}
              className="mt-2 text-xs text-muted underline underline-offset-2 disabled:opacity-50"
            >
              {state === "loading"
                ? "Rewriting…"
                : rewritten
                  ? "Show the AI rewording"
                  : "Say why in plainer words (AI)"}
            </button>
          ) : null}
          {state === "unavailable" ? (
            <p className="mt-2 text-xs text-warning">
              The optional AI wording layer is not available right now. The text above is the
              engine&rsquo;s own and is unaffected.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

/** Where this route's description came from, shown inside its Explore panel. */
function Provenance({ route }: { route: RouteResult }) {
  const { provenance: p } = route;
  const label =
    p.status === "partially-verified"
      ? "Structure checked against a listed source"
      : p.status === "illustrative"
        ? "Written by the team — no source verifies this route as described"
        : "Not supported by any source in the registry";

  return (
    <details className="border-t border-line pt-3">
      <summary className="cursor-pointer text-xs font-bold" data-testid={`provenance-${route.routeId}`}>
        Where this came from
      </summary>
      <div className="mt-2 space-y-2 text-xs text-muted">
        <p>
          <span
            className={[
              "mr-2 rounded-full border px-2 py-0.5 font-bold",
              p.status === "partially-verified"
                ? "border-mint/40 bg-mint/5 text-mint"
                : "border-warning/40 bg-warning/5 text-warning",
            ].join(" ")}
          >
            {p.status}
          </span>
          {label}
        </p>
        {p.source && p.sourceUrl ? (
          <p>
            Source:{" "}
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              {p.source}
            </a>
            {p.lastVerified ? ` · last checked ${p.lastVerified}` : null}
          </p>
        ) : (
          <p>Source: none recorded.</p>
        )}
        <p>{p.note}</p>
      </div>
    </details>
  );
}
