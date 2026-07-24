"use client";

import { Button, Card, Shell } from "@/components/ui";
import { SUPPORT_MESSAGE } from "@/lib/safety";

/**
 * Shown instead of recommendations when the prototype safety rule fires.
 * No career output is generated from the triggering answer.
 */
export default function SafetyPause({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <Shell>
      <Card className="border-warning/50">
        <h1 className="text-2xl font-bold">{SUPPORT_MESSAGE.heading}</h1>
        <p className="mt-3 text-sm text-muted">{SUPPORT_MESSAGE.body}</p>
        <p className="mt-3 text-sm font-semibold">{SUPPORT_MESSAGE.action}</p>

        <div className="mt-5 rounded-control border border-line bg-surface2 p-4 text-sm">
          <p className="font-bold">If you need to talk to someone now</p>
          <p className="mt-1 text-muted">{SUPPORT_MESSAGE.thaiHotline}</p>
        </div>

        <p className="mt-5 text-xs text-muted">{SUPPORT_MESSAGE.disclaimer}</p>

        {onDismiss ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onDismiss} data-testid="safety-back">
              Go back to my answers
            </Button>
          </div>
        ) : null}

        <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
          <strong className="text-ink">How this works, and its limits.</strong> This screen is
          triggered by a simple keyword rule running in your browser — it is not a risk assessment.
          It will miss things and it will sometimes fire when nothing is wrong. Nothing you typed
          was sent anywhere, and nobody was alerted.
        </p>
      </Card>
    </Shell>
  );
}
