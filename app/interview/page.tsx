"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import questions from "@/data/questions.json";
import { Button, Notice, Shell } from "@/components/ui";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import { checkText } from "@/lib/safety";
import { loadSessionResult, newSession, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import AssessmentNavigation from "@/components/assessment/AssessmentNavigation";
import ChoiceList from "@/components/assessment/ChoiceList";
import LikertScale from "@/components/assessment/LikertScale";
import QuestionCard from "@/components/assessment/QuestionCard";
import ReviewStep, { type ReviewSection } from "@/components/assessment/ReviewStep";
import type { SelectionSource } from "@/components/assessment/types";
import { markSeen, recordAnswer } from "@/lib/research/telemetry";

type ContextKey = "tier" | "cost" | "mobility" | "horizon" | "proud";

/** Every learner-visible string in the question bank carries both languages. */
interface Localised {
  en: string;
  th: string;
}

/**
 * The JSON's context entries are not uniform — only some carry `help`,
 * `options` or `placeholder` — so the shape is stated once here rather than
 * re-narrowed at every use site.
 */
interface ContextQuestion {
  id: string;
  type: string;
  required?: boolean;
  text: Localised;
  help?: Localised;
  placeholder?: Localised;
  options?: { value: string; label: Localised }[];
}

interface InterestQuestion {
  id: string;
  dimension: string;
  text: Localised;
}

const CONTEXT_QUESTIONS = questions.context as ContextQuestion[];
const INTEREST_QUESTIONS = questions.interest as InterestQuestion[];
const SCALE = questions.scale as { value: number; label: Localised }[];

type Step =
  | { kind: "interest"; q: InterestQuestion }
  | { kind: "context"; q: ContextQuestion }
  | { kind: "review" };

/**
 * One flat list of screens. Order is the JSON's order, which keeps the
 * assessment's sequence a data decision rather than a layout decision.
 */
const STEPS: Step[] = [
  ...INTEREST_QUESTIONS.map((q) => ({ kind: "interest" as const, q })),
  ...CONTEXT_QUESTIONS.map((q) => ({ kind: "context" as const, q })),
  { kind: "review" as const },
];

const REVIEW_INDEX = STEPS.length - 1;
const TOTAL_QUESTIONS = REVIEW_INDEX;
/** Questions that count towards the bar. The optional free text is excluded. */
const SCORED_QUESTIONS = STEPS.filter(
  (s) => s.kind === "interest" || (s.kind === "context" && s.q.type !== "text"),
).length;

/** Long enough to read as a transition, short enough not to feel like waiting. */
const ADVANCE_MS = 170;

/**
 * How long to wait before moving to the next question.
 *
 * A learner who has asked their system for reduced motion has asked not to be
 * moved around, and an artificial pause before a transition is part of that
 * motion — globals.css already zeroes the card animation for them, so leaving
 * the delay in place would give them the wait without the thing it was covering.
 *
 * It also makes the end-to-end suite substantially faster, because Playwright
 * runs with reduced motion and waits for animations to settle before every
 * click. That is a side effect, not the reason.
 */
function advanceDelay(): number {
  if (typeof window === "undefined" || !window.matchMedia) return ADVANCE_MS;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ADVANCE_MS;
}

export default function InterviewPage() {
  const router = useRouter();
  const { t, lang } = usePreferences();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [recovered, setRecovered] = useState<"repaired" | "reset" | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [safety, setSafety] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  /** Set when a step was opened from the review list, so answering returns there. */
  const [returnToReview, setReturnToReview] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const result = loadSessionResult();
    const restored = result.session ?? newSession();
    setSession(restored);
    // Resume where the learner stopped rather than at question one. Anything
    // else makes a refresh feel like losing the work that was in fact kept.
    setStepIndex(firstUnansweredStep(restored));
    if (result.status === "reset" && result.discarded.length > 0) setRecovered("reset");
    else if (result.status === "repaired" && result.discarded.length > 0) setRecovered("repaired");
  }, []);

  useEffect(() => () => clearAdvance(advanceTimer), []);

  // Move focus into the new step's choices. The radiogroup is labelled by the
  // question heading, so landing here announces the question and leaves the
  // arrow keys immediately usable.
  // Response-process capture for a pilot. Local-only; nothing is transmitted,
  // and it is exported only by a deliberate action on /research.
  useEffect(() => {
    const step = STEPS[stepIndex];
    if (step?.kind === "interest") markSeen(step.q.id, stepIndex);
  }, [stepIndex]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Steps without a radiogroup — the free text and the review list — would
    // otherwise drop focus to <body> when the previous step unmounted, leaving
    // a keyboard user to tab from the top of the document.
    const target =
      cardRef.current?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]') ??
      cardRef.current?.querySelector<HTMLElement>("#assessment-question") ??
      cardRef.current;
    target?.focus();
  }, [stepIndex]);

  const persist = useCallback((next: GuestSession) => {
    setSession(next);
    setStorageOk(saveSession(next));
  }, []);

  const answeredInterest = useMemo(
    () => (session ? Object.keys(session.interview.interest).length : 0),
    [session],
  );

  const requiredContext: ContextKey[] = ["tier", "cost", "mobility", "horizon"];
  const missingContext = session
    ? requiredContext.filter((k) => !session.interview.context[k])
    : requiredContext;
  const enoughInterest = answeredInterest >= MIN_INTEREST_ANSWERS;
  const canContinue = enoughInterest && missingContext.length === 0;

  const answeredScored =
    answeredInterest + (requiredContext.length - missingContext.length);

  const goTo = (index: number, dir: "forward" | "back") => {
    clearAdvance(advanceTimer);
    setDirection(dir);
    setStepIndex(index);
  };

  const goNext = () => {
    setReturnToReview(false);
    goTo(Math.min(stepIndex + 1, REVIEW_INDEX), "forward");
  };

  const goPrev = () => {
    setReturnToReview(false);
    goTo(Math.max(stepIndex - 1, 0), "back");
  };

  const jumpTo = (index: number) => {
    setReturnToReview(true);
    goTo(index, "back");
  };

  /** Answering moves on by itself — the learner's click is the whole gesture. */
  const scheduleAdvance = () => {
    clearAdvance(advanceTimer);
    const destination = returnToReview ? REVIEW_INDEX : Math.min(stepIndex + 1, REVIEW_INDEX);
    advanceTimer.current = setTimeout(() => {
      setReturnToReview(false);
      setDirection("forward");
      setStepIndex(destination);
    }, advanceDelay());
  };

  /**
   * Only a committed choice moves the assessment on.
   *
   * Arrow keys traverse the scale, so advancing on every change would mean the
   * first arrow press answered the question and scrolled the learner away from
   * it. Enter and Space still advance, because a button turns them into a
   * click.
   */
  const setInterest = (id: string, value: number, source: SelectionSource) => {
    if (!session) return;
    recordAnswer(id, stepIndex);
    persist({
      ...session,
      interview: {
        ...session.interview,
        interest: { ...session.interview.interest, [id]: value },
      },
    });
    if (source === "pointer") scheduleAdvance();
  };

  const setContext = (key: ContextKey, value: string, source: SelectionSource | "typing") => {
    if (!session) return;
    persist({
      ...session,
      interview: { ...session.interview, context: { ...session.interview.context, [key]: value } },
    });
    if (source === "pointer") scheduleAdvance();
  };

  const handleContinue = () => {
    if (!session) return;
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

  if (!session) {
    return (
      <Shell step={1}>
        <p className="text-muted">{t.assessment.loading}</p>
      </Shell>
    );
  }

  if (safety) return <SafetyPause onDismiss={() => setSafety(false)} />;

  const step = STEPS[stepIndex];
  const onReview = stepIndex === REVIEW_INDEX;

  return (
    <Shell step={1}>
      <div className="mx-auto w-full max-w-2xl">
        <AssessmentHeader
          title={t.assessment.title}
          position={stepIndex + 1}
          total={TOTAL_QUESTIONS}
          answered={answeredScored}
          progressMax={SCORED_QUESTIONS}
          counterTemplate={t.assessment.questionCounter}
          reviewWord={t.assessment.reviewLabel}
          answeredTemplate={t.assessment.answeredCounter}
          progressLabel={t.chrome.progressLabel}
          reviewLabel={t.assessment.reviewAnswers}
          onReview={stepIndex === REVIEW_INDEX ? undefined : () => goTo(REVIEW_INDEX, "forward")}
        />

        <p className="mb-5 inline-block rounded-full border border-warning/40 bg-warning/5 px-3 py-1 text-[11px] font-bold text-warning">
          {t.assessment.demoNotice}
        </p>

        {stepIndex === 0 ? <p className="mb-5 text-sm text-muted">{t.assessment.intro}</p> : null}

        {!storageOk ? (
          <div className="mb-5">
            <Notice tone="warning" title={t.assessment.storageBlockedTitle}>
              {t.assessment.storageBlockedBody}
            </Notice>
          </div>
        ) : null}

        {recovered ? (
          <div className="mb-5">
            <Notice
              tone="warning"
              title={
                recovered === "reset"
                  ? t.assessment.recoveredResetTitle
                  : t.assessment.recoveredRepairedTitle
              }
            >
              {recovered === "reset"
                ? t.assessment.recoveredResetBody
                : t.assessment.recoveredRepairedBody}
            </Notice>
          </div>
        ) : null}

        <div ref={cardRef}>
          {step.kind === "interest" ? (
            <QuestionCard
              motionKey={`interest-${step.q.id}`}
              direction={direction}
              // The RIASEC dimension is deliberately not shown. Naming the trait
              // a statement measures invites the answer the learner thinks it
              // wants rather than the one that is true.
              eyebrow={t.assessment.eyebrowInterests}
              question={localised(step.q.text, lang)}
              helper={t.assessment.interestHelper}
              footer={
                <AssessmentNavigation
                  onPrev={goPrev}
                  onNext={goNext}
                  canGoBack={stepIndex > 0}
                  answered={session.interview.interest[step.q.id] !== undefined}
                  labels={t.assessment}
                />
              }
            >
              <LikertScale
                points={SCALE.map((s) => ({ value: s.value, label: localised(s.label, lang) }))}
                value={session.interview.interest[step.q.id]}
                onChange={(v, source) => setInterest(step.q.id, v, source)}
                testIdPrefix={`q-${step.q.id}`}
                labelledBy="assessment-question"
              />
            </QuestionCard>
          ) : null}

          {step.kind === "context" && step.q.type !== "text" ? (
            <QuestionCard
              motionKey={`context-${step.q.id}`}
              direction={direction}
              eyebrow={t.assessment.eyebrowSituation}
              question={localised(step.q.text, lang)}
              helper={step.q.help ? localised(step.q.help, lang) : undefined}
              footer={
                <AssessmentNavigation
                  onPrev={goPrev}
                  onNext={goNext}
                  canGoBack={stepIndex > 0}
                  answered={Boolean(
                    session.interview.context[step.q.id as Exclude<ContextKey, "proud">],
                  )}
                  labels={t.assessment}
                />
              }
            >
              <ChoiceList
                choices={(step.q.options ?? []).map((o) => ({ value: o.value, label: localised(o.label, lang) }))}
                value={session.interview.context[step.q.id as Exclude<ContextKey, "proud">]}
                onChange={(v, source) => setContext(step.q.id as ContextKey, v, source)}
                testIdPrefix={`ctx-${step.q.id}`}
                labelledBy="assessment-question"
              />
            </QuestionCard>
          ) : null}

          {step.kind === "context" && step.q.type === "text" ? (
            <QuestionCard
              motionKey={`context-${step.q.id}`}
              direction={direction}
              eyebrow={t.assessment.eyebrowOptional}
              question={localised(step.q.text, lang)}
              helper={step.q.help ? localised(step.q.help, lang) : undefined}
              footer={
                <AssessmentNavigation
                  onPrev={goPrev}
                  onNext={goNext}
                  canGoBack={stepIndex > 0}
                  answered={Boolean(session.interview.context.proud?.trim())}
                  labels={t.assessment}
                />
              }
            >
              <textarea
                data-testid={`ctx-${step.q.id}`}
                rows={5}
                placeholder={step.q.placeholder ? localised(step.q.placeholder, lang) : undefined}
                value={session.interview.context.proud ?? ""}
                onChange={(e) => setContext("proud", e.target.value, "typing")}
                aria-labelledby="assessment-question"
                className="w-full resize-y rounded-control border border-line bg-surface2 px-4 py-3 text-sm leading-relaxed text-ink transition placeholder:text-muted/80 hover:border-muted/70 focus:border-mint"
              />
            </QuestionCard>
          ) : null}

          {onReview ? (
            <ReviewStep sections={reviewSections(session, lang, t)} onJump={jumpTo} labels={t.assessment} />
          ) : null}
        </div>

        <div
          id="interview-errors"
          tabIndex={-1}
          aria-live="assertive"
          className="mt-5 focus:outline-none"
        >
          {onReview && showErrors && !canContinue ? (
            <Notice tone="warning" title={t.assessment.errorsTitle}>
              <ul className="list-inside list-disc">
                {!enoughInterest ? (
                  <li>
                    {format(t.assessment.errorNotEnough, {
                      min: MIN_INTEREST_ANSWERS,
                      total: INTEREST_QUESTIONS.length,
                      answered: answeredInterest,
                    })}
                  </li>
                ) : null}
                {missingContext.map((k) => (
                  <li key={k}>
                    {format(t.assessment.errorMissingContext, { question: labelFor(k, lang) })}
                  </li>
                ))}
              </ul>
            </Notice>
          ) : null}
        </div>

        {onReview ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              data-testid="assessment-prev"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink"
            >
              <span aria-hidden>←</span> {t.assessment.backToQuestions}
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted">
                {canContinue ? t.assessment.readyToContinue : t.assessment.answerRequired}
              </span>
              <Button onClick={handleContinue} data-testid="interview-continue">
                {t.assessment.continueToMission}
              </Button>
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-xs text-muted">
          <strong className="text-ink">{t.assessment.howUsedTitle}</strong>{" "}
          {t.assessment.howUsedBody}
        </p>

        <p className="mt-4 text-xs">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setSafety(true);
            }}
            className="text-muted underline underline-offset-2"
          >
            {t.assessment.needToTalk}
          </a>
        </p>

        <p className="sr-only">{t.safety.disclaimer}</p>
      </div>
    </Shell>
  );
}

function clearAdvance(ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

/** The first screen the learner has not completed, or the review if none. */
function firstUnansweredStep(session: GuestSession): number {
  for (let i = 0; i < STEPS.length - 1; i++) {
    const step = STEPS[i];
    if (step.kind === "interest") {
      if (session.interview.interest[step.q.id] === undefined) return i;
    } else if (step.kind === "context") {
      // The optional free text is never treated as unfinished business: a
      // learner who answered everything else should resume on the review
      // screen, not be sent back to a question they chose to leave blank.
      if (step.q.type === "text") {
        continue;
      } else if (!session.interview.context[step.q.id as Exclude<ContextKey, "proud">]) {
        return i;
      }
    }
  }
  return STEPS.length - 1;
}

function reviewSections(
  session: GuestSession,
  lang: Language,
  t: { assessment: { sectionInterests: string; sectionSituation: string } },
): ReviewSection[] {
  const interest = INTEREST_QUESTIONS.map((q, i) => {
    const value = session.interview.interest[q.id];
    const point = SCALE.find((s) => s.value === value);
    return {
      id: q.id,
      question: localised(q.text, lang),
      answer: point ? localised(point.label, lang) : null,
      stepIndex: i,
    };
  });

  const situation = CONTEXT_QUESTIONS.map((q, i) => {
    const stepIndex = INTEREST_QUESTIONS.length + i;
    if (q.type === "text") {
      const text = session.interview.context.proud?.trim();
      return {
        id: q.id,
        question: localised(q.text, lang),
        answer: text ? truncate(text, 32) : null,
        stepIndex,
        optional: true,
      };
    }
    const value = session.interview.context[q.id as Exclude<ContextKey, "proud">];
    const option = q.options?.find((o) => o.value === value);
    return {
      id: q.id,
      question: localised(q.text, lang),
      answer: option ? localised(option.label, lang) : null,
      stepIndex,
    };
  });

  return [
    { title: t.assessment.sectionInterests, items: interest },
    { title: t.assessment.sectionSituation, items: situation },
  ];
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}

function labelFor(key: ContextKey, lang: Language): string {
  const q = CONTEXT_QUESTIONS.find((item) => item.id === key);
  return q ? localised(q.text, lang) : key;
}
