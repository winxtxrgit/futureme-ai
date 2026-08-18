"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, EvidenceBadge, Shell } from "@/components/ui";
import {
  JourneyChatPanel,
  JourneyMascotTurn,
  JourneyMessage,
} from "@/components/journey/JourneyChat";
import {
  recommend,
  WEIGHTS,
  type Recommendation,
  type RouteResult,
} from "@/lib/decision-engine";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";

type ComparisonFocus = "fit" | "practical" | "evidence";

export default function ComparePage() {
  const router = useRouter();
  const { t, lang } = usePreferences();

  const COST_LABEL: Record<string, string> = {
    low: t.compare.costLow,
    moderate: t.compare.costModerate,
    high: t.compare.costHigh,
  };
  const TIMING_LABEL: Record<string, string> = {
    soon: t.compare.timingSoon,
    later: t.compare.timingLater,
  };
  const STATUS_LABEL: Record<string, string> = {
    "partially-verified": t.compare.statusPartiallyVerified,
    illustrative: t.compare.statusIllustrative,
    unverified: t.compare.statusUnverified,
  };
  const [session, setSession] = useState<GuestSession | null>(null);
  const [comparisonFocus, setComparisonFocus] = useState<ComparisonFocus | null>(null);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  const result = useMemo<Recommendation | null>(
    () => (session ? recommend(session.interview, session.mission) : null),
    [session],
  );

  if (!session || !result) {
    return (
      <Shell step={4}>
        <p className="text-muted">{t.assessment.loading}</p>
      </Shell>
    );
  }

  if (result.routes.length === 0) {
    return (
      <Shell step={4}>
        <JourneyChatPanel
          title={t.assessment.interviewerName}
          status={t.assessment.interviewerListening}
          transcriptLabel={t.chat.conversationLabel}
          testIdPrefix="compare"
        >
          <JourneyMascotTurn
            status={t.assessment.interviewerListening}
            toggleMotionLabel={t.chat.motionEnable}
            label={t.assessment.interviewerName}
            testIdPrefix="compare"
          >
            <div data-testid="compare-empty-message">
              <h1 className="text-xl font-bold">{t.compare.nothingTitle}</h1>
              <p className="mt-2 text-sm text-muted">{t.compare.nothingBody}</p>
              <div className="mt-5">
                <Button href="/routes">{t.compare.backToResults}</Button>
              </div>
            </div>
          </JourneyMascotTurn>
        </JourneyChatPanel>
      </Shell>
    );
  }

  const routes = result.routes;
  const select = (id: string) => {
    const next = { ...session, selectedRouteId: id };
    setSession(next);
    saveSession(next);
    router.push("/plan");
  };

  const rows: { label: string; render: (i: number) => React.ReactNode }[] = [
    {
      label: t.compare.rowEvidence,
      render: (i) => (
        <EvidenceBadge
          strength={routes[i].evidenceStrength}
          label={t.engine.strengthLabels[routes[i].evidenceStrength]}
        />
      ),
    },
    {
      label: format(t.compare.rowInterest, { pct: Math.round(WEIGHTS.interests * 100) }),
      render: (i) => <Meter value={routes[i].score.interests} t={t} />,
    },
    {
      label: format(t.compare.rowFeasibility, { pct: Math.round(WEIGHTS.feasibility * 100) }),
      render: (i) => <Meter value={routes[i].score.feasibility} t={t} />,
    },
    {
      label: format(t.compare.rowStrengths, { pct: Math.round(WEIGHTS.strengths * 100) }),
      render: (i) => <Meter value={routes[i].score.strengths} t={t} />,
    },
    {
      label: format(t.compare.rowLearningStyle, { pct: Math.round(WEIGHTS.learningStyle * 100) }),
      render: (i) => <Meter value={routes[i].score.learningStyle} t={t} />,
    },
    {
      label: t.compare.rowCost,
      render: (i) => <span className="text-sm">{COST_LABEL[routes[i].costBand] ?? "—"}</span>,
    },
    {
      label: t.compare.rowRelocate,
      render: (i) => (
        <span className="text-sm">
          {routes[i].requiresRelocation ? t.compare.usuallyYes : t.compare.usuallyNo}
        </span>
      ),
    },
    {
      label: t.compare.rowTiming,
      render: (i) => (
        <span className="text-sm">{TIMING_LABEL[routes[i].timeToEarning] ?? "—"}</span>
      ),
    },
    {
      label: t.compare.rowFlexibility,
      render: (i) => <Meter value={routes[i].flexibility * 100} t={t} />,
    },
    {
      label: t.compare.rowOpen,
      render: (i) => (
        <ul className="space-y-1 text-xs text-muted">
          {routes[i].openQuestions.map((q) => (
            <li key={q}>• {t.engine.openQuestions[q]}</li>
          ))}
        </ul>
      ),
    },
    {
      // Last row on purpose. The three rows above it — cost, relocation and
      // timing — are the team's estimates, and this is the screen where a
      // learner is most likely to treat them as facts.
      label: t.compare.rowProvenance,
      render: (i) => {
        const p = routes[i].provenance;
        return (
          <div className="space-y-1 text-xs">
            <span
              className={[
                "inline-block rounded-full border px-2 py-0.5 font-bold",
                p.status === "partially-verified"
                  ? "border-mint/40 bg-mint/5 text-mint"
                  : "border-warning/40 bg-warning/5 text-warning",
              ].join(" ")}
            >
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
            {p.sourceUrl && p.source ? (
              <p className="text-muted">
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2"
                >
                  {p.source}
                </a>
              </p>
            ) : (
              <p className="text-muted">{t.compare.noSource}</p>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Shell step={4}>
      <JourneyChatPanel
        title={t.assessment.interviewerName}
        status={t.assessment.interviewerListening}
        transcriptLabel={t.chat.conversationLabel}
        testIdPrefix="compare"
      >
        <JourneyMascotTurn
          status={t.assessment.interviewerListening}
          toggleMotionLabel={t.chat.motionEnable}
          label={t.assessment.interviewerName}
          testIdPrefix="compare"
        >
          <div data-testid="compare-intro-message">
            <h1
              className="text-2xl font-bold sm:text-3xl"
              data-testid="compare-heading"
            >
              {t.compare.title}
            </h1>
            <p className="mt-3 text-sm text-muted">
              {routes.length > 1 ? t.routes.introMany : t.routes.introOne}
            </p>
            <p className="mt-2 text-sm text-muted">{t.compare.intro}</p>
          </div>
        </JourneyMascotTurn>

        <JourneyMessage
          role="assistant"
          label={t.assessment.interviewerName}
          testId="compare-guide"
        >
          <h2 className="text-base font-bold">{t.compare.guideTitle}</h2>
          <p className="mt-1 text-sm text-muted">{t.compare.guideBody}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["fit", t.compare.focusFit],
                ["practical", t.compare.focusPractical],
                ["evidence", t.compare.focusEvidence],
              ] as const
            ).map(([focus, label]) => (
              <button
                key={focus}
                type="button"
                aria-pressed={comparisonFocus === focus}
                data-testid={`compare-focus-${focus}`}
                onClick={() => setComparisonFocus(focus)}
                className={[
                  "rounded-control border px-3 py-2 text-left text-xs font-bold transition",
                  comparisonFocus === focus
                    ? "border-indigo bg-indigo/20 text-indigoText"
                    : "border-line bg-surface text-muted hover:border-indigo/60 hover:text-ink",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </JourneyMessage>

        {comparisonFocus ? (
          <>
            <JourneyMessage
              role="user"
              label={t.assessment.replyLabel}
              testId="compare-focus-reply"
            >
              <p className="font-semibold">
                {t.compare.yourFocus}: {focusLabel(comparisonFocus, t)}
              </p>
            </JourneyMessage>
            <JourneyMessage
              role="assistant"
              label={t.assessment.interviewerName}
              testId="compare-focus-results"
            >
              <p className="mb-4 text-sm text-muted">{t.compare.showingFocus}</p>
              <FocusedComparison
                focus={comparisonFocus}
                routes={routes}
                t={t}
                lang={lang}
                onSelect={select}
              />
            </JourneyMessage>
          </>
        ) : null}

        <JourneyMessage
          role="assistant"
          label={t.assessment.interviewerName}
          testId="compare-table-message"
          className="min-w-0 max-w-full"
        >
          <details data-testid="compare-full-matrix">
            <summary className="cursor-pointer text-sm font-bold text-indigoText">
              {t.compare.fullMatrix}
            </summary>
          <div
            aria-label={format(t.compare.caption, { n: routes.length })}
            className="max-w-full overflow-x-auto rounded-control border border-line bg-surface2/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
            data-testid="compare-scroll-region"
            role="region"
            tabIndex={0}
          >
            <table
              className="w-full min-w-[640px] border-collapse text-left"
              data-testid="compare-table"
            >
              <caption className="sr-only">
                {format(t.compare.caption, { n: routes.length })}
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th
                    scope="col"
                    className="w-40 p-3 text-xs font-bold uppercase tracking-wide text-muted"
                  >
                    {t.compare.criterion}
                  </th>
                  {routes.map((r) => (
                    <th key={r.routeId} scope="col" className="p-3 align-top text-sm font-bold">
                      {localised(r.shortName, lang)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? "bg-surface/40" : ""}>
                    <th
                      scope="row"
                      className="p-3 align-top text-xs font-semibold text-muted"
                    >
                      {row.label}
                    </th>
                    {routes.map((r, i) => (
                      <td key={r.routeId} className="p-3 align-top">
                        {row.render(i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </details>
        </JourneyMessage>

        <JourneyMessage
          role="assistant"
          label={t.assessment.interviewerName}
          testId="compare-caveat-message"
        >
          <p className="text-xs text-muted" data-testid="compare-caveat">
            <strong className="text-ink">{t.compare.caveatStrong}</strong> {t.compare.caveat}
          </p>
          <div className="mt-5">
            <Button href="/routes" variant="secondary">
              {t.compare.backToCards}
            </Button>
          </div>
        </JourneyMessage>
      </JourneyChatPanel>
    </Shell>
  );
}

function focusLabel(focus: ComparisonFocus, t: Dictionary): string {
  if (focus === "fit") return t.compare.focusFit;
  if (focus === "practical") return t.compare.focusPractical;
  return t.compare.focusEvidence;
}

function FocusedComparison({
  focus,
  routes,
  t,
  lang,
  onSelect,
}: {
  focus: ComparisonFocus;
  routes: RouteResult[];
  t: Dictionary;
  lang: Language;
  onSelect: (routeId: string) => void;
}) {
  const costLabel: Record<string, string> = {
    low: t.compare.costLow,
    moderate: t.compare.costModerate,
    high: t.compare.costHigh,
  };
  const timingLabel: Record<string, string> = {
    soon: t.compare.timingSoon,
    later: t.compare.timingLater,
  };
  const statusLabel: Record<string, string> = {
    "partially-verified": t.compare.statusPartiallyVerified,
    illustrative: t.compare.statusIllustrative,
    unverified: t.compare.statusUnverified,
  };

  return (
    <ul className="grid gap-3 lg:grid-cols-3" data-testid="compare-focus-cards">
      {routes.map((route) => (
        <li
          key={route.routeId}
          className="flex min-w-0 flex-col rounded-control border border-indigo/25 bg-surface p-4"
          data-route-id={route.routeId}
          data-testid={`compare-focus-route-${route.routeId}`}
        >
          <h3 className="text-sm font-bold">{localised(route.shortName, lang)}</h3>

          {focus === "fit" ? (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] font-semibold text-muted">{t.compare.rowEvidence}</p>
              <EvidenceBadge
                strength={route.evidenceStrength}
                label={t.engine.strengthLabels[route.evidenceStrength]}
              />
              <ComparisonMetric
                label={format(t.compare.rowInterest, {
                  pct: Math.round(WEIGHTS.interests * 100),
                })}
              >
                <Meter value={route.score.interests} t={t} />
              </ComparisonMetric>
              <ComparisonMetric
                label={format(t.compare.rowFeasibility, {
                  pct: Math.round(WEIGHTS.feasibility * 100),
                })}
              >
                <Meter value={route.score.feasibility} t={t} />
              </ComparisonMetric>
              <ComparisonMetric
                label={format(t.compare.rowStrengths, {
                  pct: Math.round(WEIGHTS.strengths * 100),
                })}
              >
                <Meter value={route.score.strengths} t={t} />
              </ComparisonMetric>
              <ComparisonMetric
                label={format(t.compare.rowLearningStyle, {
                  pct: Math.round(WEIGHTS.learningStyle * 100),
                })}
              >
                <Meter value={route.score.learningStyle} t={t} />
              </ComparisonMetric>
            </div>
          ) : null}

          {focus === "practical" ? (
            <dl className="mt-3 space-y-3">
              <ComparisonDefinition label={t.compare.rowCost}>
                {costLabel[route.costBand] ?? "â€”"}
              </ComparisonDefinition>
              <ComparisonDefinition label={t.compare.rowRelocate}>
                {route.requiresRelocation ? t.compare.usuallyYes : t.compare.usuallyNo}
              </ComparisonDefinition>
              <ComparisonDefinition label={t.compare.rowTiming}>
                {timingLabel[route.timeToEarning] ?? "â€”"}
              </ComparisonDefinition>
              <ComparisonMetric label={t.compare.rowFlexibility}>
                <Meter value={route.flexibility * 100} t={t} />
              </ComparisonMetric>
            </dl>
          ) : null}

          {focus === "evidence" ? (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] font-semibold text-muted">{t.compare.rowEvidence}</p>
              <EvidenceBadge
                strength={route.evidenceStrength}
                label={t.engine.strengthLabels[route.evidenceStrength]}
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t.compare.rowOpen}
                </p>
                <ul className="mt-1 space-y-1 text-xs text-muted">
                  {route.openQuestions.map((question) => (
                    <li key={question}>â€¢ {t.engine.openQuestions[question]}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t.compare.rowProvenance}
                </p>
                <span className="mt-1 inline-block rounded-full border border-line px-2 py-0.5 text-xs font-bold text-muted">
                  {statusLabel[route.provenance.status] ?? route.provenance.status}
                </span>
                {route.provenance.sourceUrl && route.provenance.source ? (
                  <p className="mt-2 text-xs text-muted">
                    <a
                      href={route.provenance.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline underline-offset-2"
                    >
                      {route.provenance.source}
                    </a>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted">{t.compare.noSource}</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-auto pt-4">
            <Button
              variant="secondary"
              onClick={() => onSelect(route.routeId)}
              className="w-full"
              data-testid={`compare-select-${route.routeId}`}
              aria-label={`${t.compare.buildPlan}: ${localised(route.shortName, lang)}`}
            >
              {t.compare.buildPlan}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ComparisonMetric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ComparisonDefinition({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

function Meter({ value, t }: { value: number; t: Dictionary }) {
  const v = Math.max(0, Math.min(100, value));
  // Deliberately coarse: showing 62.4% would imply precision this engine does not have.
  const band =
    v >= 66 ? t.compare.bandHigher : v >= 40 ? t.compare.bandMiddle : t.compare.bandLower;
  return (
    <div>
      <div
        className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-surface2"
        role="img"
        aria-label={format(t.compare.bandLabel, { band })}
      >
        <div className="h-full bg-indigo" style={{ width: `${v}%` }} />
      </div>
      <span className="mt-1 block text-xs text-muted">{band}</span>
    </div>
  );
}
