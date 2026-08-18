"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EvidenceBadge, Shell } from "@/components/ui";
import {
  freshness,
  recommend,
  routeDataAsOf,
  unverifiedFields,
  type Recommendation,
  type RouteResult,
} from "@/lib/decision-engine";
import { joinLabels } from "@/lib/decision-engine/explanations";
import type { Localised, SupportingEvidence } from "@/lib/decision-engine/types";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import { ProgrammeMatches } from "@/components/routes/ProgrammeMatches";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";
import SafetyPause from "@/components/SafetyPause";
import provinces from "@/data/provinces.json";
import { NearbyForRoute } from "@/components/routes/NearbyForRoute";
import { isProvinceCode, type NearbyProvince } from "@/lib/geo/types";
import {
  JourneyChatPanel,
  JourneyMascotTurn,
  JourneyMessage,
} from "@/components/journey/JourneyChat";

/** Descriptive, not ranked — the same words the compare screen uses. */
function costLabel(band: string, t: Dictionary): string {
  return { low: t.routes.costLow, moderate: t.routes.costModerate, high: t.routes.costHigh }[band] ?? "—";
}
function timingLabel(v: string, t: Dictionary): string {
  return { soon: t.routes.timingSoon, later: t.routes.timingLater }[v] ?? "—";
}

function attributes(route: RouteResult, t: Dictionary): { label: string; value: string }[] {
  return [
    { label: t.compare.rowCost, value: costLabel(route.costBand, t) },
    { label: t.routes.attrTimeToEarning, value: timingLabel(route.timeToEarning, t) },
    {
      label: t.routes.attrRelocation,
      value: route.requiresRelocation ? t.routes.relocationUsually : t.routes.relocationNotNeeded,
    },
    {
      label: t.routes.attrFlexibility,
      value:
        route.flexibility >= 0.66
          ? t.routes.flexOpen
          : route.flexibility < 0.4
            ? t.routes.flexSpecialised
            : t.routes.flexBalanced,
    },
  ];
}

export default function RoutesPage() {
  const { t, lang } = usePreferences();
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [llmAvailable, setLlmAvailable] = useState(false);
  const [nearby, setNearby] = useState<NearbyProvince | null>(null);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  /*
   * Places are fetched only once the learner has said where they are, and the
   * failure is silent: the routes are the point of this screen and they are
   * complete without this section. A network problem here should cost the
   * addition, never the page.
   */
  const provinceIso = session?.provinceIso ?? null;
  useEffect(() => {
    if (!provinceIso) {
      setNearby(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/nearby?province=${encodeURIComponent(provinceIso)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: NearbyProvince | null) => {
        if (!cancelled) setNearby(data);
      })
      .catch(() => {
        if (!cancelled) setNearby(null);
      });
    return () => {
      cancelled = true;
    };
  }, [provinceIso]);

  const chooseProvince = useCallback((iso: string) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, provinceIso: isProvinceCode(iso) ? iso : null };
      saveSession(next);
      return next;
    });
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
        <JourneyChatPanel
          title={t.assessment.interviewerName}
          status={t.assessment.interviewerChecking}
          transcriptLabel={t.chat.conversationLabel}
          testIdPrefix="routes"
        >
        <JourneyMascotTurn
          state="error"
          status={t.assessment.interviewerChecking}
          toggleMotionLabel={t.chat.motionEnable}
          label={t.assessment.interviewerName}
          testIdPrefix="routes"
        >
          <h1 className="text-xl font-bold">{t.routes.errorTitle}</h1>
          <p className="mt-2 text-sm text-muted">
            The engine could not process this session. Your answers are still saved.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-control bg-surface2 p-3 text-xs text-muted">
            {error}
          </pre>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setSession(loadOrCreate())}>{t.routes.tryAgain}</Button>
            <Button href="/interview" variant="secondary">
              Review my answers
            </Button>
          </div>
        </JourneyMascotTurn>
        </JourneyChatPanel>
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
        <JourneyChatPanel
          title={t.assessment.interviewerName}
          status={t.assessment.interviewerListening}
          transcriptLabel={t.chat.conversationLabel}
          testIdPrefix="routes"
        >
        <JourneyMascotTurn
          state="thinking"
          status={t.assessment.interviewerListening}
          toggleMotionLabel={t.chat.motionEnable}
          label={t.assessment.interviewerName}
          testIdPrefix="routes"
        >
          <h1 className="text-2xl font-bold" data-testid="insufficient-heading">
            {t.routes.insufficientTitle}
          </h1>
          <p className="mt-3 text-sm text-muted">{t.routes.insufficientBody}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {result.insufficientReasons.map((r) => (
              <li key={r}>• {t.engine.reasons[r]}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            {format(t.routes.answeredCount, {
              answered: result.profile.answeredInterest,
              total: result.profile.totalInterest,
            })}
          </p>
          {/*
            The route engine has already declined. The programme engine gets
            asked anyway, because it can say *which* property of the answers is
            missing — too few informative answers, or six dimensions that came
            out level — and "every dimension scored about the same" is a more
            useful thing to tell a learner than "not enough evidence".
          */}
          <ProgrammeMatches
            interview={session.interview}
            provinceIso={provinceIso}
            t={t}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/interview">{t.routes.reviewAnswers}</Button>
            <Button href="/mission" variant="secondary">
              {t.routes.redoMission}
            </Button>
          </div>
        </JourneyMascotTurn>
        </JourneyChatPanel>
      </Shell>
    );
  }

  const many = result.routes.length > 1;

  return (
    <Shell step={3}>
      <JourneyChatPanel
        title={t.assessment.interviewerName}
        status={t.assessment.interviewerListening}
        transcriptLabel={t.chat.conversationLabel}
        testIdPrefix="routes"
      >
      {/* Level 1 — understand what the options are, fast. */}
      <JourneyMascotTurn
        state="speaking"
        status={t.assessment.interviewerListening}
        toggleMotionLabel={t.chat.motionEnable}
        label={t.assessment.interviewerName}
        testIdPrefix="routes"
      >
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl" data-testid="routes-heading">
          {many ? format(t.routes.headingMany, { n: result.routes.length }) : t.routes.headingOne}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {many ? t.routes.introMany : t.routes.introOne}
        </p>
      </header>

      <div className="mt-4">
        <SignalSummary result={result} t={t} />
      </div>
      </JourneyMascotTurn>

      {/*
        Asked once, here, and remembered. Every route card below is then able to
        name real places, which is the difference between a suggestion a learner
        reads and one they can act on. It is a province, chosen from a list —
        never the device's location, which for a thirteen-year-old would be a
        home address we have no need for.
      */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label htmlFor="routes-province" className="text-xs font-bold text-muted">
          {provinceIso ? t.routes.nearbyChangeProvince : t.routes.nearbySetProvince}
        </label>
        <select
          id="routes-province"
          data-testid="routes-province"
          value={provinceIso ?? ""}
          onChange={(event) => chooseProvince(event.target.value)}
          className="min-w-0 flex-1 rounded-control border border-line bg-surface px-3 py-1.5 text-sm sm:max-w-xs"
        >
          <option value="">{t.nearby.pickPlaceholder}</option>
          {provinces.map((province) => (
            <option key={province.iso} value={province.iso}>
              {province.th} · {province.en}
            </option>
          ))}
        </select>
      </div>

      {/* Equal weight by construction: same grid cell, same card, same actions. */}
      <ul className="space-y-6" data-testid="route-options">
        {result.routes.map((route) => (
          <li
            key={route.routeId}
            data-route-id={route.routeId}
            data-testid={`route-option-${route.routeId}`}
          >
            <JourneyMessage role="assistant" label={t.assessment.interviewerName}>
              <RouteCard
                route={route}
                llmAvailable={llmAvailable}
                onSelect={() => select(route.routeId)}
                t={t}
                lang={lang}
                nearby={nearby}
              />
            </JourneyMessage>
          </li>
        ))}
      </ul>

      {/*
        Level 1b — the routes above answer "what kind of thing suits me". This
        answers "so where do I actually apply", which is the question a route
        cannot: nobody applies to a route. It sits after the cards rather than
        replacing them because academic fit is only resolved at route level —
        the programme list is where the context data earns its place, and the
        component shows the two contributions apart so that is visible.
      */}
      <ProgrammeMatches interview={session.interview} provinceIso={provinceIso} t={t} />

      {/* Level 2 — comparison is the intended next step, so it is the one strong CTA. */}
      <JourneyMessage
        role="assistant"
        label={t.assessment.interviewerName}
        testId="routes-compare-message"
      >
      {many ? (
        <section className="text-center">
          <h2 className="text-base font-bold">{t.routes.notSureTitle}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t.routes.notSureBody}</p>
          <div className="mt-4">
            <Button href="/compare" data-testid="go-compare">
              {format(t.routes.compareN, { n: result.routes.length })}
            </Button>
          </div>
        </section>
      ) : (
        <div>
          <Button href="/compare" variant="secondary" data-testid="go-compare">
            {t.routes.compareOne}
          </Button>
        </div>
      )}
      </JourneyMessage>

      {result.ineligible.length > 0 ? (
        <JourneyMessage role="assistant" label={t.assessment.interviewerName}>
        <details>
          <summary className="cursor-pointer text-sm font-bold">
            {format(t.routes.filteredSummary, { n: result.ineligible.length })}
          </summary>
          <ul className="mt-4 space-y-3">
            {result.ineligible.map((r) => (
              <li key={r.routeId} className="text-sm">
                <p className="font-semibold">{localised(r.name, lang)}</p>
                <ul className="mt-1 text-muted">
                  {r.reasons.map((code) => (
                    <li key={code}>• {t.engine.reasons[code]}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
        </JourneyMessage>
      ) : null}

      {/* Level 3 (shared) — source and freshness, once, not repeated per card. */}
      <JourneyMessage
        role="assistant"
        label={t.assessment.interviewerName}
        testId="routes-source-message"
      >
        <DataFreshness t={t} />
        <p className="mt-4 text-xs text-muted">
          {format(t.routes.generatedBy, {
            version: result.engineVersion,
            date: routeDataAsOf(),
          })}
        </p>
      </JourneyMessage>
      </JourneyChatPanel>
    </Shell>
  );
}

/**
 * Replaces the two large warning panels (ties, contradiction) with one calm
 * summary of what the answers pointed to. The detail — why more than one route
 * is showing — is available on demand, not shouted by default.
 */
function SignalSummary({ result, t }: { result: Recommendation; t: Dictionary }) {
  const { profile } = result;
  const interest = profile.topDimensions.slice(0, 2).map((d) => t.engine.dimensions[d]);
  const tied = result.routes.some((r) => r.tiedWith.length > 0);
  const contradicted = profile.contradictions.length > 0;
  const missionLine = !profile.missionCompleted
    ? t.routes.missionNotDone
    : contradicted
      ? t.routes.missionDiffered
      : t.routes.missionAgreed;

  return (
    /*
     * A disclosure rather than a panel. This explains how the engine reached
     * its answer, which matters — but on a 390px screen it was 400px of
     * preamble in front of the answer itself, and a learner who has just
     * answered thirty questions should meet the routes first.
     */
    <details className="rounded-card border border-line bg-surface" data-testid="signal-summary">
      <summary className="cursor-pointer list-none p-4 text-sm font-bold marker:hidden">
        {t.routes.summaryTitle}
        <span className="ml-2 font-normal text-muted">▾</span>
      </summary>
      <div className="px-4 pb-4">
      <dl className="mt-1 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.routes.summaryInterview}
          </dt>
          <dd className="mt-1 text-sm">{interest.join(" + ") || t.routes.summaryNoLead}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.routes.summaryMission}
          </dt>
          <dd className="mt-1 text-sm">{missionLine}</dd>
        </div>
      </dl>

      {tied || contradicted ? (
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer text-xs font-bold" data-testid="why-multiple">
            {t.routes.whyMultiple}
          </summary>
          <div className="mt-2 space-y-2 text-sm text-muted">
            {contradicted ? (
              <p>{t.routes.whyContradicted}</p>
            ) : null}
            {tied ? (
              <p>{t.routes.whyTied}</p>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
    </details>
  );
}

/**
 * Says how old the catalogue is and which fields have no source at all, rather
 * than only warning once it crosses a threshold. Missing information is a
 * different problem from out-of-date information and the learner deserves both.
 * Shown once for the whole page; per-route sources live in each route's details.
 */
function DataFreshness({ t }: { t: Dictionary }) {
  const f = freshness();
  const unsourced = unverifiedFields();

  return (
    <section className="mt-8 rounded-card border border-line bg-surface p-5" data-testid="data-freshness">
      <h2 className="text-sm font-bold">{t.routes.freshnessTitle}</h2>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold">{t.routes.compiled}</dt>
          <dd className="text-muted">
            {format(t.routes.daysAgo, { date: f.dataAsOf, days: f.ageInDays })}
            {f.stale ? (
              <span className="ml-2 rounded-full border border-warning/40 bg-warning/5 px-2 py-0.5 text-[11px] font-bold text-warning">
                {format(t.routes.pastReview, { days: f.thresholdDays })}
              </span>
            ) : (
              <span className="ml-2 rounded-full border border-mint/40 bg-mint/5 px-2 py-0.5 text-[11px] font-bold text-mint">
                {format(t.routes.withinReview, { days: f.thresholdDays })}
              </span>
            )}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold">{t.routes.notSourced}</dt>
          <dd className="text-muted">
            {format(t.routes.notSourcedBody, {
              fields: unsourced
                .map((f) => t.routes.fieldNames[f as keyof typeof t.routes.fieldNames] ?? f)
                .join(", "),
            })}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted">
        <FreshnessFooter t={t} />
      </p>
    </section>
  );
}

function RouteCard({
  route,
  llmAvailable,
  onSelect,
  t,
  lang,
  nearby,
}: {
  route: RouteResult;
  llmAvailable: boolean;
  onSelect: () => void;
  t: Dictionary;
  lang: Language;
  nearby: NearbyProvince | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `route-detail-${route.routeId}`;

  return (
    <Card className="flex flex-col border-indigo/25 bg-surface/80">
      {/* Identity */}
      <h2 className="text-base font-bold leading-snug">{localised(route.name, lang)}</h2>
      {localised(route.shortName, lang) !== localised(route.name, lang) ? (
        <p className="mt-0.5 text-xs text-muted">{localised(route.shortName, lang)}</p>
      ) : null}

      <p className="mt-2 text-sm text-muted">{localised(route.summary, lang)}</p>

      <div className="mt-3">
        <EvidenceBadge
          strength={route.evidenceStrength}
          label={t.engine.strengthLabels[route.evidenceStrength]}
        />
        <p className="mt-1.5 text-xs text-muted">
          {t.engine.strengthHelp[route.evidenceStrength]}
        </p>
      </div>

      {/* At a glance — descriptive dimensions, not scores */}
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
        {attributes(route, t).map((a) => (
          <div key={a.label}>
            <dt className="text-[11px] uppercase tracking-wide text-muted">{a.label}</dt>
            <dd className="text-sm">{a.value}</dd>
          </div>
        ))}
      </dl>

      <WhyItMayFit route={route} llmAvailable={llmAvailable} t={t} lang={lang} />

      {route.limitations.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{t.routes.consider}</h3>
          <p className="mt-1 text-sm text-muted">{localised(route.limitations[0], lang)}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-control border border-line bg-surface2 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{t.routes.tryThisNext}</p>
        <p className="mt-1 text-sm">{localised(route.nextExperiment, lang)}</p>
      </div>

      {/*
        Shown above the fold on the card rather than inside the details panel:
        for a learner weighing routes, whether a place exists within reach is
        not extra detail, it is part of what the route would mean.
      */}
      <NearbyForRoute routeId={route.routeId} province={nearby} />

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
          {open ? t.routes.hideDetails : t.routes.exploreRoute}
        </Button>
      </div>

      {open ? (
        <div id={panelId} className="mt-4 space-y-4 border-t border-line pt-4" data-testid={`detail-${route.routeId}`}>
          <DetailBlock title={t.routes.whyShown}>
            <ul className="space-y-1 text-sm text-muted">
              {route.reasons.slice(0, 4).map((code) => (
                <li key={code}>• {t.engine.reasons[code]}</li>
              ))}
            </ul>
          </DetailBlock>

          <DetailBlock title={t.routes.evidenceUsed}>
            <ul className="space-y-1 text-sm text-muted">
              {route.supportingEvidence.map((e, i) => (
                <li key={i}>• {renderEvidence(e, lang, t)}</li>
              ))}
            </ul>
          </DetailBlock>

          {route.strengths.length > 0 ? (
            <DetailBlock title={t.routes.strengths}>
              <ul className="space-y-1 text-sm text-muted">
                {route.strengths.map((s) => (
                  <li key={s.en}>• {localised(s, lang)}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          {route.limitations.length > 0 ? (
            <DetailBlock title={t.routes.tradeOffs}>
              <ul className="space-y-1 text-sm text-muted">
                {route.limitations.map((s) => (
                  <li key={s.en}>• {localised(s, lang)}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          {route.openQuestions.length > 0 ? (
            <DetailBlock title={t.routes.stillUnanswered}>
              <ul className="space-y-1 text-sm text-muted">
                {route.openQuestions.map((q) => (
                  <li key={q}>• {t.engine.openQuestions[q]}</li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          <Provenance route={route} t={t} lang={lang} />

          <Button
            variant="secondary"
            onClick={onSelect}
            className="w-full"
            data-testid={`plan-${route.routeId}`}
          >
            {t.routes.buildPlan}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

/** Turns a structured evidence item into a sentence in the active language. */
function renderEvidence(e: SupportingEvidence, lang: Language, t: Dictionary): string {
  if (e.kind === "mission") {
    return format(t.engine.evidenceMission, { note: localised(e.note, lang) });
  }
  const names = e.dimensions.map((d) => t.engine.dimensions[d]);
  return format(t.engine.evidenceInterview, {
    interests: joinLabels(names, t.engine.listConjunction, t.engine.noPattern),
  });
}

/** The freshness footer has an emphasised word mid-sentence in both languages. */
function FreshnessFooter({ t }: { t: Dictionary }) {
  const [before, after = ""] = t.routes.freshnessFooter.split("{strong}");
  return (
    <>
      {before}
      <strong className="text-ink">{t.routes.freshnessFooterStrong}</strong>
      {after}
    </>
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
function WhyItMayFit({
  route,
  llmAvailable,
  t,
  lang,
}: {
  route: RouteResult;
  llmAvailable: boolean;
  t: Dictionary;
  lang: Language;
}) {
  const codes = route.reasons.slice(0, 3);
  const deterministic = codes.map((c) => t.engine.reasons[c]).join(" ");
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
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{t.routes.whyItMayFit}</h3>

      {showing && rewritten ? (
        <>
          <p className="mt-2 text-sm text-muted" data-testid={`why-llm-${route.routeId}`}>
            {rewritten}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            <span className="rounded-full border border-indigo/40 bg-indigo/10 px-2 py-0.5 font-bold text-indigoText">
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
              {signals.map((s: Localised) => (
                <li key={s.en} className="text-muted">
                  • {localised(s, lang)}
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
                ? t.routes.rewriting
                : rewritten
                  ? t.routes.showRewording
                  : t.routes.sayPlainer}
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
function Provenance({
  route,
  t,
  lang,
}: {
  route: RouteResult;
  t: Dictionary;
  lang: Language;
}) {
  const { provenance: p } = route;
  const label =
    p.status === "partially-verified"
      ? t.routes.provStatusPartial
      : p.status === "illustrative"
        ? t.routes.provStatusIllustrative
        : t.routes.provStatusUnverified;

  return (
    <details className="border-t border-line pt-3">
      <summary className="cursor-pointer text-xs font-bold" data-testid={`provenance-${route.routeId}`}>
        {t.routes.whereFrom}
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
            {label}
          </span>
        </p>
        {p.source && p.sourceUrl ? (
          <p>
            {t.routes.sourceLabel}{" "}
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              {p.source}
            </a>
            {p.lastVerified ? format(t.routes.lastChecked, { date: p.lastVerified }) : null}
          </p>
        ) : (
          <p>{t.routes.sourceNone}</p>
        )}
        <p>{localised(p.note, lang)}</p>
      </div>
    </details>
  );
}
