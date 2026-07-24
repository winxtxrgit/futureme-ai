import Link from "next/link";
import { Button, Card, Shell } from "@/components/ui";
import { routeDataAsOf } from "@/lib/decision-engine";

export default function Home() {
  return (
    <Shell>
      <section className="pt-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-bold tracking-wide text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mint" />
          FUNCTIONAL PROTOTYPE · RUNNABLE END-TO-END DEMO
        </p>

        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
          A next step you can
          <br />
          <span className="bg-gradient-to-r from-indigo via-magenta to-coral bg-clip-text text-transparent">
            actually explain.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Answer a short interview, try one real task, then compare up to three study routes — each
          showing the evidence behind it and what it still does not know.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/interview" data-testid="start-guest">
            Start as guest →
          </Button>
          <Button href="/privacy" variant="secondary">
            What happens to my answers?
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">
          No account needed. Your answers stay in this browser.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="text-sm font-bold">Talk, don&apos;t tick</h2>
          <p className="mt-2 text-sm text-muted">
            A shortened interview plus your own words — not only multiple choice.
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-bold">Try, don&apos;t guess</h2>
          <p className="mt-2 text-sm text-muted">
            One mission produces evidence from what you would actually do.
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-bold">Up to three routes</h2>
          <p className="mt-2 text-sm text-muted">
            Never ranked, never a winner — and none at all when the evidence is too thin.
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="border-warning/30">
          <h2 className="text-sm font-bold">What this prototype is, honestly</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>
              • The assessment is <strong className="text-ink">shortened and not validated</strong>.
              It is built on the structure of the RIASEC model but is not a RIASEC test.
            </li>
            <li>
              • Route information is <strong className="text-ink">demo data</strong> compiled{" "}
              {routeDataAsOf()} and is not verified against current official sources.
            </li>
            <li>
              • Recommendations come from a{" "}
              <strong className="text-ink">deterministic rule engine</strong> you can read in{" "}
              <code className="text-ink">lib/decision-engine/</code> — no model decides your route.
            </li>
            <li>
              • This does not replace a qualified counsellor, and it has not been tested with real
              students.
            </li>
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/privacy" className="text-mint underline underline-offset-2">
              Read exactly what data is collected →
            </Link>
          </p>
        </Card>
      </section>
    </Shell>
  );
}
