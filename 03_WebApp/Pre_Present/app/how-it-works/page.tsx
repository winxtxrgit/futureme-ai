"use client";

import Link from "next/link";
import { Button, Card, Shell } from "@/components/ui";
import { routeDataAsOf } from "@/lib/decision-engine";
import { useT } from "@/components/PreferencesProvider";

/**
 * The three steps and the honest limitations, moved off the landing page.
 *
 * They were the right content in the wrong place: a learner arriving for the
 * first time met a briefing before an invitation. Moving them here keeps them
 * one click away and, importantly, keeps them — the limitations in particular
 * are the product's honesty position, not filler, so they are not dropped.
 */
function WithStrong({ template, strong }: { template: string; strong: string }) {
  const [before, after = ""] = template.split("{strong}");
  return (
    <>
      {before}
      <strong className="text-ink">{strong}</strong>
      {after}
    </>
  );
}

export default function HowItWorksPage() {
  const t = useT();

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-bold tracking-wide text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mint" />
          {t.landing.badge}
        </p>

        <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{t.landing.howTitle}</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">{t.landing.howIntro}</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <h2 className="text-sm font-bold">{t.landing.card1Title}</h2>
            <p className="mt-2 text-sm text-muted">{t.landing.card1Body}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-bold">{t.landing.card2Title}</h2>
            <p className="mt-2 text-sm text-muted">{t.landing.card2Body}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-bold">{t.landing.card3Title}</h2>
            <p className="mt-2 text-sm text-muted">{t.landing.card3Body}</p>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="border-warning/30">
            <h2 className="text-sm font-bold">{t.landing.honestTitle}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li>
                • <WithStrong template={t.landing.honest1} strong={t.landing.honest1Strong} />
              </li>
              <li>
                •{" "}
                <WithStrong
                  template={t.landing.honest2.replace("{date}", routeDataAsOf())}
                  strong={t.landing.honest2Strong}
                />
              </li>
              <li>
                • <WithStrong template={t.landing.honest3} strong={t.landing.honest3Strong} />
              </li>
              <li>• {t.landing.honest4}</li>
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/privacy" className="text-mint underline underline-offset-2">
                {t.landing.readData}
              </Link>
            </p>
          </Card>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">{t.landing.backHome}</Button>
          <Button href="/privacy" variant="secondary">
            {t.landing.whatHappens}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
