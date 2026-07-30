"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EvidenceBadge, Shell } from "@/components/ui";
import { recommend, WEIGHTS, type Recommendation } from "@/lib/decision-engine";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

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
        <Card>
          <h1 className="text-xl font-bold">{t.compare.nothingTitle}</h1>
          <p className="mt-2 text-sm text-muted">{t.compare.nothingBody}</p>
          <div className="mt-5">
            <Button href="/routes">{t.compare.backToResults}</Button>
          </div>
        </Card>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.compare.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{t.compare.intro}</p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">
            {format(t.compare.caption, { n: routes.length })}
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="w-40 p-3 text-xs font-bold uppercase tracking-wide text-muted">
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
            <tr>
              <th scope="row" className="p-3 text-xs font-semibold text-muted">
                {t.compare.choose}
              </th>
              {routes.map((r) => (
                <td key={r.routeId} className="p-3">
                  <Button
                    variant="secondary"
                    onClick={() => select(r.routeId)}
                    className="w-full"
                    data-testid={`compare-select-${r.routeId}`}
                  >
                    {t.compare.buildPlan}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted" data-testid="compare-caveat">
        <strong className="text-ink">{t.compare.caveatStrong}</strong> {t.compare.caveat}
      </p>

      <div className="mt-6">
        <Button href="/routes" variant="secondary">
          {t.compare.backToCards}
        </Button>
      </div>
    </Shell>
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
