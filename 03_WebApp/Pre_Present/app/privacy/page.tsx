"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { clearTelemetry } from "@/lib/research/telemetry";
import { clearSession, SESSION_KEY } from "@/lib/session";
import { useT } from "@/components/PreferencesProvider";

/**
 * Splits a sentence around two placeholders so the emphasised phrases stay
 * attached to the right words in both languages, where clause order differs.
 */
function TwoStrong({
  template,
  first,
  second,
}: {
  template: string;
  first: string;
  second: string;
}) {
  const [a, rest = ""] = template.split("{optional}");
  const [b, c = ""] = rest.split("{off}");
  return (
    <>
      {a}
      <strong className="text-ink">{first}</strong>
      {b}
      <strong className="text-ink">{second}</strong>
      {c}
    </>
  );
}

export default function PrivacyPage() {
  const t = useT();
  const [cleared, setCleared] = useState(false);

  const [storedBefore, storedAfter = ""] = t.privacy.storedUnder.split("{key}");

  return (
    <Shell>
      <h1 className="text-2xl font-bold sm:text-3xl">{t.privacy.title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t.privacy.intro}</p>

      <div className="mt-6">
        <Notice title={t.privacy.shortTitle}>{t.privacy.shortBody}</Notice>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-bold">{t.privacy.collectedTitle}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="p-2 text-xs font-bold uppercase text-muted">{t.privacy.colData}</th>
                <th className="p-2 text-xs font-bold uppercase text-muted">{t.privacy.colWhere}</th>
                <th className="p-2 text-xs font-bold uppercase text-muted">{t.privacy.colKept}</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowInterview}</td>
                <td className="p-2">{t.privacy.thisBrowser}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowMission}</td>
                <td className="p-2">{t.privacy.thisBrowser}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowChat}</td>
                <td className="p-2">{t.privacy.chatWhere}</td>
                <td className="p-2">{t.privacy.chatKept}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowRoutes}</td>
                <td className="p-2">{t.privacy.thisBrowser}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowProvince}</td>
                <td className="p-2">{t.privacy.thisBrowser}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowSession}</td>
                <td className="p-2">{t.privacy.thisBrowserRandom}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">{t.privacy.rowResearch}</td>
                <td className="p-2">{t.privacy.thisBrowser}</td>
                <td className="p-2">{t.privacy.untilCleared}</td>
              </tr>
              <tr>
                <td className="p-2">{t.privacy.rowAnalytics}</td>
                <td className="p-2">{t.privacy.analyticsWhere}</td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          {storedBefore}
          <code className="text-ink">{SESSION_KEY}</code>
          {storedAfter}
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">{t.privacy.aiTitle}</h2>
        <p className="mt-2 text-sm text-muted">
          <TwoStrong
            template={t.privacy.aiBody1}
            first={t.privacy.aiBody1Optional}
            second={t.privacy.aiBody1Off}
          />
        </p>
        <p className="mt-2 text-sm text-muted">{t.privacy.aiBody2}</p>
        <p className="mt-2 text-sm text-muted">{t.privacy.aiBody3}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">{t.privacy.claimsTitle}</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-control border border-line bg-surface2 p-3">
            <p className="font-bold">{t.privacy.claim1Title}</p>
            <p className="mt-1 text-muted">{t.privacy.claim1Body}</p>
          </div>
          <div className="rounded-control border border-mint/40 bg-mint/5 p-3">
            <p className="font-bold">{t.privacy.claim2Title}</p>
            <p className="mt-1 text-muted">{t.privacy.claim2Body}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{t.privacy.claimsCorrection}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">{t.privacy.notYetTitle}</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>• {t.privacy.notYet1}</li>
          <li>• {t.privacy.notYet2}</li>
          <li>• {t.privacy.notYet3}</li>
          <li>• {t.privacy.notYet4}</li>
        </ul>
        <p className="mt-3 text-sm text-muted">{t.privacy.notYetBody}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">{t.privacy.researchLinkTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.privacy.researchLinkBody}</p>
        <p className="mt-3 text-sm">
          <Link href="/research" className="text-mint underline underline-offset-2">
            {t.privacy.researchLink}
          </Link>
        </p>
      </Card>

      <Card className="mt-4 border-coral/30">
        <h2 className="text-lg font-bold">{t.privacy.deleteTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.privacy.deleteBody}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              clearSession();
              /*
               * Response timing is held under its own key so a facilitator can
               * clear research data without destroying a learner's answers.
               * The obligation only runs one way: a learner deleting their
               * answers must not leave telemetry about them behind, and this
               * button is where that promise is either kept or broken.
               */
              clearTelemetry();
              setCleared(true);
            }}
            data-testid="delete-data"
          >
            {t.privacy.deleteButton}
          </Button>
          {cleared ? (
            <span className="text-sm text-mint" role="status">
              {t.privacy.deleted}
            </span>
          ) : null}
        </div>
      </Card>

      <div className="mt-6">
        <Button href="/" variant="secondary">
          {t.privacy.back}
        </Button>
      </div>
    </Shell>
  );
}
