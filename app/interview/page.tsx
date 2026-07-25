"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import questions from "@/data/questions.json";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import { checkText, SUPPORT_MESSAGE } from "@/lib/safety";
import { loadSessionResult, newSession, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";

type ContextKey = "tier" | "cost" | "mobility" | "horizon" | "proud";

export default function InterviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [recovered, setRecovered] = useState<"repaired" | "reset" | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [safety, setSafety] = useState(false);

  useEffect(() => {
    const result = loadSessionResult();
    setSession(result.session ?? newSession());
    // Only worth saying when something was actually lost. A clean read, or an
    // empty one on a first visit, is not news.
    if (result.status === "reset" && result.discarded.length > 0) setRecovered("reset");
    else if (result.status === "repaired" && result.discarded.length > 0) setRecovered("repaired");
  }, []);

  const persist = (next: GuestSession) => {
    setSession(next);
    setStorageOk(saveSession(next));
  };

  const setInterest = (id: string, value: number) => {
    if (!session) return;
    persist({
      ...session,
      interview: {
        ...session.interview,
        interest: { ...session.interview.interest, [id]: value },
      },
    });
  };

  const setContext = (key: ContextKey, value: string) => {
    if (!session) return;
    persist({
      ...session,
      interview: { ...session.interview, context: { ...session.interview.context, [key]: value } },
    });
  };

  const answered = useMemo(
    () => (session ? Object.keys(session.interview.interest).length : 0),
    [session],
  );
  const requiredContext: ContextKey[] = ["tier", "cost", "mobility", "horizon"];
  const missingContext = session
    ? requiredContext.filter((k) => !session.interview.context[k])
    : requiredContext;
  const enoughInterest = answered >= MIN_INTEREST_ANSWERS;
  const canContinue = enoughInterest && missingContext.length === 0;

  if (!session) {
    return (
      <Shell step={1}>
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  if (safety) return <SafetyPause onDismiss={() => setSafety(false)} />;

  const total = questions.interest.length;
  const percent = Math.round((answered / total) * 100);

  const handleContinue = () => {
    if (!canContinue) {
      setShowErrors(true);
      document.getElementById("interview-errors")?.focus();
      return;
    }
    const check = checkText(session.interview.context.proud);
    if (check.triggered) {
      persist({ ...session, safetyTriggered: true });
      setSafety(true);
      return;
    }
    router.push("/mission");
  };

  return (
    <Shell step={1}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">A few questions about you</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          There are no right answers, and nothing here is a test. Answer as you actually are, not as
          you think you should be.
        </p>
        <p className="mt-3 inline-block rounded-full border border-warning/40 bg-warning/5 px-3 py-1 text-[11px] font-bold text-warning">
          Demo assessment — shortened for prototype evaluation
        </p>
      </div>

      {!storageOk ? (
        <div className="mb-5">
          <Notice tone="warning" title="Progress will not be saved">
            This browser is blocking local storage, so refreshing the page will lose your answers.
            You can still finish the demo in one sitting.
          </Notice>
        </div>
      ) : null}

      {recovered ? (
        <div className="mb-5">
          <Notice
            tone="warning"
            title={
              recovered === "reset"
                ? "We had to start you a new session"
                : "Some saved answers could not be read"
            }
          >
            {recovered === "reset"
              ? "The data stored in this browser could not be read, so it was cleared and a fresh session started. Nothing was sent anywhere."
              : "Part of what was stored in this browser did not match anything this version asks, so it was discarded rather than guessed at. Everything still shown below was read back intact."}
          </Notice>
        </div>
      ) : null}

      <div className="mb-6" aria-live="polite">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            {answered} of {total} answered
          </span>
          <span>{percent}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Interview progress"
        >
          <div className="h-full bg-mint transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          You can change any answer before continuing. At least {MIN_INTEREST_ANSWERS} are needed.
        </p>
      </div>

      <ol className="space-y-3">
        {questions.interest.map((q, i) => (
          <Card as="li" key={q.id}>
            <fieldset>
              <legend className="text-sm font-semibold">
                <span className="mr-2 text-muted">{i + 1}.</span>
                {q.text}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {questions.scale.map((s) => {
                  const active = session.interview.interest[q.id] === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={active}
                      data-testid={`q-${q.id}-${s.value}`}
                      onClick={() => setInterest(q.id, s.value)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-mint bg-mint text-mintInk"
                          : "border-line bg-surface2 text-muted hover:border-muted hover:text-ink",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </Card>
        ))}
      </ol>

      <h2 className="mb-3 mt-8 text-lg font-bold">Your situation</h2>
      <div className="space-y-3">
        {questions.context.map((q) => (
          <Card key={q.id}>
            {q.type === "text" ? (
              <label className="block">
                <span className="text-sm font-semibold">{q.text}</span>
                {q.help ? <span className="mt-1 block text-xs text-muted">{q.help}</span> : null}
                <textarea
                  data-testid={`ctx-${q.id}`}
                  rows={3}
                  placeholder={q.placeholder}
                  value={session.interview.context.proud ?? ""}
                  onChange={(e) => setContext("proud", e.target.value)}
                  className="mt-2 w-full rounded-control border border-line bg-surface2 px-3 py-2 text-sm text-ink placeholder:text-muted/60"
                />
              </label>
            ) : (
              <fieldset>
                <legend className="text-sm font-semibold">
                  {q.text}
                  {q.required ? <span className="ml-1 text-coral">*</span> : null}
                </legend>
                {q.help ? <p className="mt-1 text-xs text-muted">{q.help}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.options?.map((o) => {
                    const active =
                      session.interview.context[q.id as Exclude<ContextKey, "proud">] === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        data-testid={`ctx-${q.id}-${o.value}`}
                        onClick={() => setContext(q.id as ContextKey, o.value)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-mint bg-mint text-mintInk"
                            : "border-line bg-surface2 text-muted hover:border-muted hover:text-ink",
                        ].join(" ")}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </Card>
        ))}
      </div>

      <div
        id="interview-errors"
        tabIndex={-1}
        aria-live="assertive"
        className="mt-6 focus:outline-none"
      >
        {showErrors && !canContinue ? (
          <Notice tone="warning" title="A few things are still missing">
            <ul className="list-inside list-disc">
              {!enoughInterest ? (
                <li>
                  Answer at least {MIN_INTEREST_ANSWERS} of the {total} statements (you have{" "}
                  {answered}).
                </li>
              ) : null}
              {missingContext.map((k) => (
                <li key={k}>Choose an answer for “{labelFor(k)}”.</li>
              ))}
            </ul>
          </Notice>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={handleContinue} data-testid="interview-continue">
          Continue to the mission →
        </Button>
        <span className="text-xs text-muted">
          {canContinue ? "Ready to continue." : "Answer the required questions to continue."}
        </span>
      </div>

      <p className="mt-6 text-xs text-muted">
        <strong className="text-ink">How these answers are used:</strong> they are scored in your
        browser by a rule-based engine to suggest study routes. In guest mode they are not sent to
        any server and nobody else can see them.
      </p>

      <p className="mt-4 text-xs">
        <a href="#" onClick={(e) => { e.preventDefault(); setSafety(true); }} className="text-muted underline underline-offset-2">
          Need someone to talk to?
        </a>
      </p>

      <p className="sr-only">{SUPPORT_MESSAGE.disclaimer}</p>
    </Shell>
  );
}

function labelFor(key: ContextKey): string {
  return questions.context.find((q) => q.id === key)?.text ?? key;
}
