"use client";

import { useEffect, useRef } from "react";
import { Button, Card, Shell } from "@/components/ui";
import { useT } from "@/components/PreferencesProvider";

export type SafetyTriggerSource = "local" | "server";

/**
 * Shown instead of recommendations when the prototype safety rule fires.
 * No career output is generated from the triggering answer.
 *
 * The copy is localised because this is the screen where a learner most needs
 * to understand exactly what is being said to them, and the audience is Thai.
 * The hotline number itself is identical in both languages — it is a fact, not
 * a translation.
 */
export default function SafetyPause({
  onDismiss,
  triggerSource = "local",
}: {
  onDismiss?: () => void;
  triggerSource?: SafetyTriggerSource;
}) {
  const t = useT();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Shell>
      <Card className="border-warning/50">
        <div role="alert" aria-live="assertive" aria-atomic="true">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-mint"
          >
            {t.safety.heading}
          </h1>
          <p className="mt-3 text-sm text-muted">{t.safety.body}</p>
          <p className="mt-3 text-sm font-semibold">{t.safety.action}</p>
        </div>

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
          <strong className="text-ink">{t.safety.limitsTitle}</strong>{" "}
          {triggerSource === "server" ? t.safety.limitsBodyServer : t.safety.limitsBody}
        </p>
      </Card>
    </Shell>
  );
}
