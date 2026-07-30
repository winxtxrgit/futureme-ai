"use client";

import Link from "next/link";
import { Button, Card, Shell } from "@/components/ui";
import { routeDataAsOf } from "@/lib/decision-engine";
import { useT } from "@/components/PreferencesProvider";

/**
 * Renders a sentence with one emphasised span in the middle.
 *
 * The honest-limitations list needs a bolded phrase inside otherwise ordinary
 * prose, and where that phrase sits in the sentence differs between English and
 * Thai. Splitting on the `{strong}` placeholder keeps the emphasis attached to
 * the right words in both languages instead of hard-coding an English clause
 * order into the markup.
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

export default function Home() {
  const t = useT();

  return (
    <Shell>
      <section className="pt-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-bold tracking-wide text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mint" />
          {t.landing.badge}
        </p>

        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
          {t.landing.headlineLead}
          <br />
          <span className="bg-gradient-to-r from-indigo via-magenta to-coral bg-clip-text text-transparent">
            {t.landing.headlineAccent}
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{t.landing.subhead}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/interview" data-testid="start-guest">
            {t.landing.startGuest}
          </Button>
          <Button href="/privacy" variant="secondary">
            {t.landing.whatHappens}
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">{t.landing.noAccount}</p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
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

      <section className="mt-10">
        <Card className="border-warning/30">
          <h2 className="text-sm font-bold">{t.landing.honestTitle}</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>
              •{" "}
              <WithStrong template={t.landing.honest1} strong={t.landing.honest1Strong} />
            </li>
            <li>
              •{" "}
              <WithStrong
                template={t.landing.honest2.replace("{date}", routeDataAsOf())}
                strong={t.landing.honest2Strong}
              />
            </li>
            <li>
              •{" "}
              <WithStrong template={t.landing.honest3} strong={t.landing.honest3Strong} />
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
    </Shell>
  );
}
