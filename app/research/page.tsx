"use client";

import { useEffect, useState } from "react";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { usePreferences } from "@/components/PreferencesProvider";
import questions from "@/data/questions.json";
import { loadOrCreate, type GuestSession } from "@/lib/session";
import { clearTelemetry, loadTelemetry, secondsPerItem } from "@/lib/research/telemetry";
import { buildDataset } from "@/lib/research/dataset";

/**
 * Pilot participation.
 *
 * Kept off the main flow on purpose. A learner exploring study routes is not
 * there to be a research subject, and putting a consent request in the middle of
 * the assessment would make agreeing feel like part of finishing it.
 *
 * Consent is gated on an explicit checkbox rather than on pressing the button,
 * so the act of agreeing is separate from the act of exporting. Nothing is
 * transmitted at any point: the export writes a file to the participant's own
 * device and they decide whether to hand it over. That is the only honest
 * mechanism available to a product with no server, and it happens to be the one
 * that leaves the participant most in control.
 */
export default function ResearchPage() {
  const { t, lang } = usePreferences();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [consented, setConsented] = useState(false);
  const [exported, setExported] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  const answered = session ? Object.keys(session.interview.interest).length : 0;

  const download = () => {
    if (!session) return;
    const telemetry = loadTelemetry();
    const itemOrder = questions.interest.map((q) => q.id);

    const dataset = buildDataset(
      {
        instrument: questions.meta.id,
        itemOrder,
        itemDimensions: questions.interest.map((q) => q.dimension),
        scalePoints: questions.scale.map((s) => s.value),
      },
      {
        participantId: telemetry.participantId,
        language: lang,
        tier: session.interview.context.tier ?? null,
        // Only the interest items. The free-text answer is the one field that
        // could identify a learner and it is deliberately never included.
        answers: Object.fromEntries(
          itemOrder
            .filter((id) => typeof session.interview.interest[id] === "number")
            .map((id) => [id, session.interview.interest[id]]),
        ),
        secondsPerItem: secondsPerItem(telemetry, itemOrder),
        revisions: Object.fromEntries(
          itemOrder.map((id) => [id, telemetry.items[id]?.revisions ?? 0]),
        ),
        startedAt: telemetry.startedAt,
      },
    );

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futureme-pilot-${telemetry.participantId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <Shell>
      <p className="text-[11px] font-bold tracking-widest text-mint">{t.research.eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t.research.title}</h1>

      <Card className="mt-6">
        <h2 className="text-lg font-bold">{t.research.purposeTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.research.purposeBody}</p>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-bold">{t.research.whatTitle}</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>• {t.research.whatShared1}</li>
            <li>• {t.research.whatShared2}</li>
            <li>• {t.research.whatShared3}</li>
          </ul>
        </Card>
        <Card className="border-mint/30">
          <h2 className="text-sm font-bold">{t.research.whatNotTitle}</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>• {t.research.whatNot1}</li>
            <li>• {t.research.whatNot2}</li>
            <li>• {t.research.whatNot3}</li>
          </ul>
        </Card>
      </div>

      <p className="mt-3 text-xs text-muted">{t.research.idNote}</p>

      <Card className="mt-6 border-warning/40">
        <h2 className="text-lg font-bold">{t.research.consentTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.research.consentBody}</p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface2 p-3 text-sm">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            data-testid="research-consent"
            className="mt-0.5 h-4 w-4 accent-mint"
          />
          <span>{t.research.consentCheckbox}</span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={download} disabled={!consented || answered === 0} data-testid="research-export">
            {t.research.exportButton}
          </Button>
          {answered === 0 ? (
            <span className="text-xs text-muted">{t.research.nothingToExport}</span>
          ) : null}
          {exported ? (
            <span className="text-sm text-mint" role="status">
              {t.research.exportedNote}
            </span>
          ) : null}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-bold">{t.research.facilitatorTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.research.facilitatorBody}</p>
        <pre className="mt-3 overflow-x-auto rounded-control border border-line bg-surface2 p-3 text-xs text-muted">
          <code>{`node scripts/analyse.ts ./pilot-exports --out report.md`}</code>
        </pre>
        <div className="mt-3">
          <Notice tone="warning">{t.research.facilitatorNote}</Notice>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              clearTelemetry();
              setCleared(true);
              setExported(false);
            }}
            data-testid="research-clear"
          >
            {t.research.clearButton}
          </Button>
          {cleared ? (
            <span className="text-sm text-mint" role="status">
              {t.research.clearedNote}
            </span>
          ) : null}
        </div>
      </Card>

      <div className="mt-6">
        <Button href="/privacy" variant="secondary">
          {t.research.back}
        </Button>
      </div>
    </Shell>
  );
}
