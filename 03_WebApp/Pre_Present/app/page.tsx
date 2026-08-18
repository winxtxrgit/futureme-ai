"use client";

import Link from "next/link";
import { Button, Shell } from "@/components/ui";
import { Tabs } from "@/components/Tabs";
import { routeDataAsOf } from "@/lib/decision-engine";
import { useT } from "@/components/PreferencesProvider";
import FutureMeMascot from "@/components/mascot/FutureMeMascot";

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

/**
 * The first screen.
 *
 * It used to open with four paragraphs, three cards and a warning panel before
 * anyone met the product. A learner arriving here has not agreed to read a
 * briefing — they are deciding whether this is worth their time at all.
 *
 * So the page leads with the character, one sentence and one action, and
 * everything that was explanation moved behind tabs. Nothing was deleted: the
 * three principles and the honest limitations are the product's position and
 * are still one click away, in panels that stay in the DOM so find-in-page and
 * screen readers still reach them.
 */
export default function Home() {
  const t = useT();

  return (
    <Shell>
      <section className="flex flex-col items-center pt-2 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-bold tracking-wide text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mint" />
          {t.landing.badge}
        </p>

        {/*
          The character at the size it was drawn to be read at. It was 96px in a
          corner, which is a favicon rather than a face. Decorative still — the
          heading below says what this is, and a screen reader does not need it
          twice.

          The component writes its width inline, so the responsive sizes need
          `!` to win.
        */}
        <div data-testid="landing-mascot" className="mt-4">
          <FutureMeMascot
            emotion="smile"
            pose="wave"
            crop="full"
            size={300}
            animated
            className="!w-[180px] sm:!w-[240px] lg:!w-[300px]"
          />
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          {t.landing.headlineLead}{" "}
          <span className="bg-gradient-to-r from-indigo via-magenta to-coral bg-clip-text text-transparent">
            {t.landing.headlineAccent}
          </span>
        </h1>

        <p className="mt-3 max-w-xl text-base text-muted">{t.landing.heroNote}</p>

        {/*
          One action, named. The other three ways in are links rather than
          buttons of equal weight — four buttons side by side asked a learner to
          choose before they knew what any of them were.
        */}
        <h2 className="mt-6 text-sm font-bold text-muted">{t.landing.ctaHeading}</h2>
        <div className="mt-3">
          <Button href="/interview" data-testid="start-guest">
            {t.landing.startGuest}
          </Button>
        </div>

        <p className="mt-4 max-w-xl text-xs text-muted">{t.landing.noAccount}</p>
      </section>

      <section className="mt-10">
        <Tabs
          ariaLabel={t.landing.howTitle}
          items={[
            {
              id: "how",
              label: t.landing.tabHow,
              content: (
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-bold">{t.landing.card1Title}</h3>
                    <p className="mt-2 text-sm text-muted">{t.landing.card1Body}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{t.landing.card2Title}</h3>
                    <p className="mt-2 text-sm text-muted">{t.landing.card2Body}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{t.landing.card3Title}</h3>
                    <p className="mt-2 text-sm text-muted">{t.landing.card3Body}</p>
                  </div>
                </div>
              ),
            },
            {
              id: "honest",
              label: t.landing.tabHonest,
              content: (
                <>
                  <h3 className="text-sm font-bold">{t.landing.honestTitle}</h3>
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
                  <p className="mt-4 flex flex-wrap gap-4 text-sm">
                    <Link href="/how-it-works" className="text-mint underline underline-offset-2">
                      {t.landing.howItWorks}
                    </Link>
                    <Link href="/privacy" className="text-mint underline underline-offset-2">
                      {t.landing.readData}
                    </Link>
                  </p>
                </>
              ),
            },
            {
              id: "more",
              label: t.landing.tabMore,
              content: (
                <>
                  <p className="text-sm text-muted">{t.landing.tabMoreBody}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button href="/chat" variant="secondary" data-testid="open-chat">
                      {t.landing.chatButton}
                    </Button>
                    <Button href="/nearby" variant="secondary" data-testid="open-nearby">
                      {t.landing.nearbyButton}
                    </Button>
                    <Button href="/privacy" variant="secondary">
                      {t.landing.whatHappens}
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />
      </section>
    </Shell>
  );
}
