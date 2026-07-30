"use client";

import { Button, Card, Shell } from "@/components/ui";
import { useT } from "@/components/PreferencesProvider";

/**
 * Shown instead of recommendations when the prototype safety rule fires.
 * No career output is generated from the triggering answer.
 *
 * The copy is localised because this is the screen where a learner most needs
 * to understand exactly what is being said to them, and the audience is Thai.
 * The hotline number itself is identical in both languages — it is a fact, not
 * a translation.
 */
export default function SafetyPause({ onDismiss }: { onDismiss?: () => void }) {
  const t = useT();
  return (
    <Shell>
      <Card className="border-warning/50">
        <h1 className="text-2xl font-bold">{t.safety.heading}</h1>
        <p className="mt-3 text-sm text-muted">{t.safety.body}</p>
        <p className="mt-3 text-sm font-semibold">{t.safety.action}</p>

        <div className="mt-5 rounded-control border border-line bg-surface2 p-4 text-sm">
          <p className="font-bold">{t.safety.hotlineTitle}</p>
          <p className="mt-1 text-muted">{t.safety.hotline}</p>
        </div>

        <p className="mt-5 text-xs text-muted">{t.safety.disclaimer}</p>

        {onDismiss ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onDismiss} data-testid="safety-back">
              {t.safety.goBack}
            </Button>
          </div>
        ) : null}

        <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
          <strong className="text-ink">{t.safety.limitsTitle}</strong> {t.safety.limitsBody}
        </p>
      </Card>
    </Shell>
  );
}
