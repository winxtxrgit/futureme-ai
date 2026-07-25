"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EvidenceBadge, Shell } from "@/components/ui";
import {
  recommend,
  STRENGTH_LABELS,
  WEIGHTS,
  type Recommendation,
} from "@/lib/decision-engine";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";

const COST_LABEL: Record<string, string> = {
  low: "Lower",
  moderate: "Moderate",
  high: "Higher",
};

const TIMING_LABEL: Record<string, string> = {
  soon: "Sooner",
  later: "Several years",
};

export default function ComparePage() {
  const router = useRouter();
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
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  if (result.routes.length === 0) {
    return (
      <Shell step={4}>
        <Card>
          <h1 className="text-xl font-bold">There is nothing to compare yet</h1>
          <p className="mt-2 text-sm text-muted">
            No routes were generated, so there is no comparison to show.
          </p>
          <div className="mt-5">
            <Button href="/routes">Back to results</Button>
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
      label: "Evidence strength",
      render: (i) => (
        <EvidenceBadge
          strength={routes[i].evidenceStrength}
          label={STRENGTH_LABELS[routes[i].evidenceStrength]}
        />
      ),
    },
    {
      label: `Interest fit (${Math.round(WEIGHTS.interests * 100)}% of score)`,
      render: (i) => <Meter value={routes[i].score.interests} />,
    },
    {
      label: `Feasibility (${Math.round(WEIGHTS.feasibility * 100)}%)`,
      render: (i) => <Meter value={routes[i].score.feasibility} />,
    },
    {
      label: `Demonstrated strengths (${Math.round(WEIGHTS.strengths * 100)}%)`,
      render: (i) => <Meter value={routes[i].score.strengths} />,
    },
    {
      label: `Learning style (${Math.round(WEIGHTS.learningStyle * 100)}%)`,
      render: (i) => <Meter value={routes[i].score.learningStyle} />,
    },
    {
      label: "Relative cost",
      render: (i) => <span className="text-sm">{COST_LABEL[routes[i].costBand] ?? "—"}</span>,
    },
    {
      label: "Need to move away?",
      render: (i) => (
        <span className="text-sm">{routes[i].requiresRelocation ? "Usually yes" : "Usually no"}</span>
      ),
    },
    {
      label: "Time before earning",
      render: (i) => (
        <span className="text-sm">{TIMING_LABEL[routes[i].timeToEarning] ?? "—"}</span>
      ),
    },
    {
      label: "Keeps options open",
      render: (i) => <Meter value={routes[i].flexibility * 100} />,
    },
    {
      label: "Still unanswered",
      render: (i) => (
        <ul className="space-y-1 text-xs text-muted">
          {routes[i].openQuestions.map((q) => (
            <li key={q}>• {q}</li>
          ))}
        </ul>
      ),
    },
    {
      // Last row on purpose. The three rows above it — cost, relocation and
      // timing — are the team's estimates, and this is the screen where a
      // learner is most likely to treat them as facts.
      label: "Where this comes from",
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
              {p.status}
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
              <p className="text-muted">No source recorded.</p>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Shell step={4}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Compare before you choose</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          The same criteria applied to every route. Bars show this prototype&apos;s scoring — they
          are a way to see the trade-offs, not a measurement of your future.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">
            Comparison of {routes.length} suggested routes across consistent criteria
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="w-40 p-3 text-xs font-bold uppercase tracking-wide text-muted">
                Criterion
              </th>
              {routes.map((r) => (
                <th key={r.routeId} scope="col" className="p-3 align-top text-sm font-bold">
                  {r.shortName}
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
                Choose
              </th>
              {routes.map((r) => (
                <td key={r.routeId} className="p-3">
                  <Button
                    variant="secondary"
                    onClick={() => select(r.routeId)}
                    className="w-full"
                    data-testid={`compare-select-${r.routeId}`}
                  >
                    Build a plan
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted" data-testid="compare-caveat">
        <strong className="text-ink">Read the last row before you trust the middle ones.</strong>{" "}
        Relative cost, whether you would need to move, and time before earning are the team&rsquo;s
        estimates — no source in this prototype supports them, and they are what the engine used to
        rule routes in or out. Check anything you would act on against the institution&rsquo;s own
        current page.
      </p>

      <div className="mt-6">
        <Button href="/routes" variant="secondary">
          ← Back to the full cards
        </Button>
      </div>
    </Shell>
  );
}

function Meter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  // Deliberately coarse: showing 62.4% would imply precision this engine does not have.
  const band = v >= 66 ? "Higher" : v >= 40 ? "Middle" : "Lower";
  return (
    <div>
      <div
        className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-surface2"
        role="img"
        aria-label={`${band} relative to the other routes`}
      >
        <div className="h-full bg-indigo" style={{ width: `${v}%` }} />
      </div>
      <span className="mt-1 block text-xs text-muted">{band}</span>
    </div>
  );
}
