"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import questions from "@/data/questions.json";
import { Button, Notice, Shell } from "@/components/ui";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import { checkText } from "@/lib/safety";
import {
  loadSessionResult,
  newSession,
  resetInterview,
  saveSession,
  type GuestSession,
} from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import AssessmentNavigation from "@/components/assessment/AssessmentNavigation";
import AssessmentReplyComposer from "@/components/assessment/AssessmentReplyComposer";
import QuestionCard, {
  type AssessmentTranscriptExchange,
} from "@/components/assessment/QuestionCard";
import ReviewStep, { type ReviewSection } from "@/components/assessment/ReviewStep";
import type { MascotState } from "@/components/FutureMeMascot";
import {
  MAX_CHOICE_REPLY_LENGTH,
  parseContextReply,
  parseInterestReply,
  type ContextChoiceId,
  type LikertValue,
  type ReplyParseFailureReason,
} from "@/lib/interview/reply-parser";
import { MASCOT_MOTION_KEY } from "@/lib/mascot/motion-preference";
import { clearTelemetry, markSeen, recordAnswer } from "@/lib/research/telemetry";

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
  /** Present on the self-efficacy items, which answer "how well", not "how much do you like". */
  scaleId?: string;
}

const CONTEXT_QUESTIONS = questions.context as ContextQuestion[];
/*
 * Interest items and self-efficacy items share one list because they share
 * everything that matters to this screen: a 1..5 answer, stored under the same
 * key, resumed and reviewed the same way. They differ only in what the five
 * points are called — "how much would you like this" against "how well could
 * you do this" — so only the label lookup branches. Putting efficacy in a
 * second list would have meant every index calculation on this page learning
 * about it.
 */
const INTEREST_QUESTIONS = [
  ...(questions.interest as InterestQuestion[]),
  ...((questions as { efficacy?: InterestQuestion[] }).efficacy ?? []),
];
const SCALE = questions.scale as { value: LikertValue; label: Localised }[];
const SCALE_CONFIDENCE = (questions as { scaleConfidence?: typeof SCALE }).scaleConfidence ?? SCALE;

/** The five points as this item words them. */
function scaleFor(q: InterestQuestion) {
  return q.scaleId === "scale5-confidence" ? SCALE_CONFIDENCE : SCALE;
}

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

/** A short visible acknowledgement, not a fake model-generation delay. */
const ADVANCE_MS = 480;
const ASKING_MS = 1_250;
const ERROR_MS = 900;
const MAX_PROUD_LENGTH = 4_000;

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
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<ReplyParseFailureReason | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>("speaking");
  const [forceMascotMotion, setForceMascotMotion] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  /** Set when a step was opened from the review list, so answering returns there. */
  const [returnToReview, setReturnToReview] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mascotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const replyRef = useRef<HTMLTextAreaElement | null>(null);
  const firstRender = useRef(true);
  const safetyReturnRef = useRef<HTMLElement | null>(null);
  const sessionRef = useRef<GuestSession | null>(null);
  const forceMotionRef = useRef(false);
  sessionRef.current = session;
  forceMotionRef.current = forceMascotMotion;

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

  useEffect(() => {
    try {
      setForceMascotMotion(window.localStorage.getItem(MASCOT_MOTION_KEY) === "on");
    } catch {
      setForceMascotMotion(false);
    }
  }, []);

  useEffect(
    () => () => {
      clearAdvance(advanceTimer);
      clearTimer(mascotTimer);
    },
    [],
  );

  // Response-process capture for a pilot. Local-only; nothing is transmitted,
  // and it is exported only by a deliberate action on /research.
  useEffect(() => {
    const step = STEPS[stepIndex];
    if (step?.kind === "interest") markSeen(step.q.id, stepIndex);
  }, [stepIndex]);

  const sessionReady = session !== null;

  useEffect(() => {
    if (!sessionReady) return;
    const activeSession = sessionRef.current;
    const activeStep = STEPS[stepIndex];
    if (!activeSession || !activeStep || activeStep.kind === "review") return;

    clearTimer(mascotTimer);
    setReply(replyForStep(activeSession, activeStep, lang));
    setReplyError(null);
    setSubmitting(false);
    setMascotState("speaking");

    const reduced =
      !forceMotionRef.current &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMascotState("idle");
      return;
    }
    mascotTimer.current = setTimeout(() => setMascotState("idle"), ASKING_MS);
  }, [lang, sessionReady, stepIndex]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const target =
      cardRef.current?.querySelector<HTMLElement>('[data-testid="assessment-reply"]') ??
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
    clearTimer(mascotTimer);
    setSubmitting(false);
    setReplyError(null);
    setDirection(dir);
    setStepIndex(index);
  };

  const goNext = () => {
    const destination = returnToReview ? REVIEW_INDEX : Math.min(stepIndex + 1, REVIEW_INDEX);
    setReturnToReview(false);
    goTo(destination, "forward");
  };

  const goPrev = () => {
    setReturnToReview(false);
    goTo(Math.max(stepIndex - 1, 0), "back");
  };

  const jumpTo = (index: number) => {
    setReturnToReview(true);
    goTo(index, "back");
  };

  /**
   * Discard every reply and start the questions again.
   *
   * The confirmation lives in the header, which owns the two-step control; by
   * the time this runs the learner has already said yes. Reviewing state is
   * dropped as well — returning to a review of answers that no longer exist
   * would be a dead end.
   */
  const handleReset = () => {
    if (!session) return;
    persist(resetInterview(session));
    /*
     * Response timing lives under its own key, and it has to go with the
     * answers it describes. Left behind, the next attempt's replies are filed
     * against the first attempt's timings — a learner who restarts looks in the
     * pilot data like one who deliberated for a very long time and then
     * revised, which is a finding about a bug rather than about them.
     */
    clearTelemetry();
    setReply("");
    setShowErrors(false);
    setReturnToReview(false);
    goTo(0, "back");
    /*
     * `goTo` moves focus only when the step index changes, and resetting from
     * the first question leaves it at zero. The confirm button the learner just
     * pressed is unmounted either way, so without this focus lands on <body>
     * and a keyboard user restarts from the top of the page.
     */
    window.requestAnimationFrame(() => replyRef.current?.focus());
  };

  /** A sent and accepted reply advances after the mascot acknowledges it. */
  const scheduleAdvance = () => {
    clearAdvance(advanceTimer);
    const destination = returnToReview ? REVIEW_INDEX : Math.min(stepIndex + 1, REVIEW_INDEX);
    advanceTimer.current = setTimeout(() => {
      setReturnToReview(false);
      setDirection("forward");
      setStepIndex(destination);
      setSubmitting(false);
    }, advanceDelay());
  };

  const showClarification = (reason: ReplyParseFailureReason) => {
    clearTimer(mascotTimer);
    setReplyError(reason);
    setSubmitting(false);
    setMascotState("error");
    mascotTimer.current = setTimeout(() => setMascotState("idle"), ERROR_MS);
    window.requestAnimationFrame(() => replyRef.current?.focus());
  };

  const handleReplyChange = (value: string) => {
    setReply(value);
    if (replyError) setReplyError(null);
    if (mascotState === "error") setMascotState("idle");

    const activeStep = STEPS[stepIndex];
    if (session && activeStep?.kind === "context" && activeStep.q.type === "text") {
      persist({
        ...session,
        interview: {
          ...session.interview,
          context: { ...session.interview.context, proud: value },
        },
      });
    }
  };

  /**
   * @param quickReply text chosen by tapping an option instead of typing it.
   *   It takes the same path as anything typed — the safety check, the parser,
   *   the clarification on a miss — because a tap and a typed word are the same
   *   answer and must not be recorded two different ways.
   */
  const handleReplySubmit = (quickReply?: string) => {
    const activeStep = STEPS[stepIndex];
    if (!session || submitting || !activeStep || activeStep.kind === "review") return;

    const raw = (quickReply ?? reply).trim();
    if (!raw) {
      showClarification("empty");
      return;
    }

    const safetyCheck = checkText(raw);
    if (safetyCheck.triggered) {
      safetyReturnRef.current = replyRef.current;
      persist({ ...session, safetyTriggered: true });
      setReply("");
      setSafety(true);
      return;
    }

    let next: GuestSession;
    if (activeStep.kind === "interest") {
      /*
       * Parse against the scale this item is actually shown with. Reading a
       * confidence answer ("Very well") against the like/dislike labels
       * rejects every self-efficacy answer — the question renders, the chip
       * highlights, and the assessment refuses to move on.
       */
      const parsed = parseInterestReply(raw, scaleFor(activeStep.q));
      if (!parsed.ok) {
        showClarification(parsed.reason);
        return;
      }
      recordAnswer(activeStep.q.id, stepIndex);
      next = {
        ...session,
        interview: {
          ...session.interview,
          interest: { ...session.interview.interest, [activeStep.q.id]: parsed.value },
        },
      };
    } else if (activeStep.q.type === "text") {
      next = {
        ...session,
        interview: {
          ...session.interview,
          context: { ...session.interview.context, proud: raw.slice(0, MAX_PROUD_LENGTH) },
        },
      };
    } else {
      const questionId = activeStep.q.id as ContextChoiceId;
      const options = activeStep.q.options ?? [];
      const parsed = parseContextReply(questionId, raw, options as never);
      if (!parsed.ok) {
        showClarification(parsed.reason);
        return;
      }
      if (!options.some((option) => option.value === parsed.value)) {
        showClarification("no_match");
        return;
      }
      next = {
        ...session,
        interview: {
          ...session.interview,
          context: { ...session.interview.context, [questionId]: parsed.value },
        },
      };
    }

    clearTimer(mascotTimer);
    setReplyError(null);
    setSubmitting(true);
    setMascotState("offline");
    persist(next);
    scheduleAdvance();
  };

  const toggleMascotMotion = () => {
    setForceMascotMotion((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(MASCOT_MOTION_KEY, next ? "on" : "system");
      } catch {
        // The visible preference still works for this page when storage is blocked.
      }
      return next;
    });
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
      safetyReturnRef.current = document.activeElement as HTMLElement | null;
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

  if (safety) {
    return (
      <SafetyPause
        onDismiss={() => {
          setSafety(false);
          window.requestAnimationFrame(() => {
            const fallback =
              cardRef.current?.querySelector<HTMLElement>('[data-testid="assessment-reply"]') ??
              cardRef.current?.querySelector<HTMLElement>("#assessment-question");
            const target = safetyReturnRef.current?.isConnected ? safetyReturnRef.current : fallback;
            target?.focus();
          });
        }}
      />
    );
  }

  const step = STEPS[stepIndex];
  const onReview = stepIndex === REVIEW_INDEX;
  const conversationLabels = {
    interviewerName: t.assessment.interviewerName,
    interviewerAsking: t.assessment.interviewerAsking,
    interviewerListening: t.assessment.interviewerListening,
    replyLabel: t.assessment.replyLabel,
    replyHint: t.assessment.textChatHint,
    optionsIntro: t.assessment.optionsIntro,
    transcriptLabel: t.chat.conversationLabel,
  };
  const replyOptions = optionsForStep(step, lang);
  const composerMaxLength =
    step.kind === "context" && step.q.type === "text"
      ? MAX_PROUD_LENGTH
      : MAX_CHOICE_REPLY_LENGTH;
  const composerPlaceholder =
    step.kind === "context" && step.q.type === "text" && step.q.placeholder
      ? localised(step.q.placeholder, lang)
      : t.assessment.replyPlaceholder;
  const replyErrorText = replyError
    ? replyError === "too_long"
      ? t.assessment.replyTooLong
      : t.assessment.replyNotRecognised
    : null;
  const transcriptHistory =
    step.kind === "review" ? [] : conversationHistory(session, stepIndex, lang);
  const acceptedReply =
    step.kind === "review"
      ? null
      : step.kind === "context" && step.q.type === "text"
        ? submitting
          ? reply.trim()
          : null
        : stepHasAnswer(session, step)
          ? replyForStep(session, step, lang)
          : null;
  const acceptedReplyValue =
    step.kind === "review" || !acceptedReply ? undefined : replyValueForStep(session, step);
  const mascotStatus =
    mascotState === "thinking"
      ? t.assessment.interviewerChecking
      : mascotState === "offline"
        ? t.assessment.interviewerSaved
        : mascotState === "error"
          ? t.assessment.interviewerClarifying
          : mascotState === "speaking"
            ? t.assessment.interviewerAsking
            : t.assessment.interviewerListening;

  return (
    <Shell step={1}>
      <div className="mx-auto w-full max-w-5xl">
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
          resetLabel={t.assessment.resetAnswers}
          resetConfirmPrompt={t.assessment.resetConfirmPrompt}
          resetConfirmLabel={t.assessment.resetConfirm}
          resetCancelLabel={t.assessment.resetCancel}
          resetDoneLabel={t.assessment.resetDone}
          // Nothing to discard yet on a clean session, so the control stays out
          // of the way until there is something it could undo.
          onReset={answeredScored > 0 ? handleReset : undefined}
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
          {step.kind !== "review" ? (
            <QuestionCard
              motionKey={`${step.kind}-${step.q.id}`}
              direction={direction}
              questionId={step.q.id}
              eyebrow={
                step.kind === "interest"
                  ? t.assessment.eyebrowInterests
                  : step.q.type === "text"
                    ? t.assessment.eyebrowOptional
                    : t.assessment.eyebrowSituation
              }
              question={localised(step.q.text, lang)}
              helper={
                step.kind === "interest"
                  ? t.assessment.interestHelper
                  : step.q.help
                    ? localised(step.q.help, lang)
                    : undefined
              }
              replyOptions={replyOptions}
              onQuickReply={(option) => handleReplySubmit(option)}
              quickReplyBusy={submitting}
              history={transcriptHistory}
              acceptedReply={acceptedReply}
              acceptedReplyValue={acceptedReplyValue}
              labels={conversationLabels}
              mascotState={mascotState}
              mascotStatus={mascotStatus}
              forceMascotMotion={forceMascotMotion}
              onToggleMascotMotion={toggleMascotMotion}
              motionToggleLabel={
                forceMascotMotion ? t.chat.motionSystem : t.chat.motionEnable
              }
              footer={
                <AssessmentNavigation
                  onPrev={goPrev}
                  onNext={goNext}
                  canGoBack={stepIndex > 0}
                  answered={stepHasAnswer(session, step)}
                  labels={t.assessment}
                />
              }
            >
              <AssessmentReplyComposer
                value={reply}
                onChange={handleReplyChange}
                onSubmit={handleReplySubmit}
                disabled={submitting}
                questionId={step.q.id}
                placeholder={composerPlaceholder}
                hint={t.assessment.composerHint}
                sendLabel={t.assessment.sendReply}
                sendingLabel={t.assessment.savingReply}
                error={replyErrorText}
                maxLength={composerMaxLength}
                rows={step.kind === "context" && step.q.type === "text" ? 4 : 3}
                inputRef={replyRef}
              />
            </QuestionCard>
          ) : null}

          {onReview ? (
            <ReviewStep
              sections={reviewSections(session, lang, t)}
              onJump={jumpTo}
              labels={t.assessment}
              transcriptLabel={t.chat.conversationLabel}
              forceMascotMotion={forceMascotMotion}
              onToggleMascotMotion={toggleMascotMotion}
              motionToggleLabel={
                forceMascotMotion ? t.chat.motionSystem : t.chat.motionEnable
              }
            />
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
              <Button onClick={handleContinue} data-testid="interview-continue" variant="coral">
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
          <button
            type="button"
            onClick={(e) => {
              safetyReturnRef.current = e.currentTarget;
              setSafety(true);
            }}
            className="text-muted underline underline-offset-2 transition hover:text-ink"
          >
            {t.assessment.needToTalk}
          </button>
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

function clearTimer(ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function optionsForStep(step: Step, lang: Language): string[] | undefined {
  if (step.kind === "interest") return scaleFor(step.q).map((point) => localised(point.label, lang));
  if (step.kind === "context" && step.q.type !== "text") {
    return (step.q.options ?? []).map((option) => localised(option.label, lang));
  }
  return undefined;
}

function replyForStep(session: GuestSession, step: Step, lang: Language): string {
  if (step.kind === "interest") {
    const value = session.interview.interest[step.q.id];
    const point = scaleFor(step.q).find((candidate) => candidate.value === value);
    return point ? localised(point.label, lang) : "";
  }
  if (step.kind === "context") {
    if (step.q.type === "text") return session.interview.context.proud ?? "";
    const value = session.interview.context[step.q.id as Exclude<ContextKey, "proud">];
    const option = step.q.options?.find((candidate) => candidate.value === value);
    return option ? localised(option.label, lang) : "";
  }
  return "";
}

function replyValueForStep(session: GuestSession, step: Exclude<Step, { kind: "review" }>): string | undefined {
  if (step.kind === "interest") {
    const value = session.interview.interest[step.q.id];
    return value === undefined ? undefined : String(value);
  }
  if (step.q.type === "text") return undefined;
  const value = session.interview.context[step.q.id as Exclude<ContextKey, "proud">];
  return value ? String(value) : undefined;
}

/**
 * Project saved assessment answers into a chat history without storing a
 * second transcript or reconstructing wording that the learner did not save.
 */
function conversationHistory(
  session: GuestSession,
  activeIndex: number,
  lang: Language,
): AssessmentTranscriptExchange[] {
  const history: AssessmentTranscriptExchange[] = [];

  for (let index = 0; index < Math.min(activeIndex, REVIEW_INDEX); index += 1) {
    const step = STEPS[index];
    if (step.kind === "review") continue;
    const answer = replyForStep(session, step, lang).trim();
    history.push({
      questionId: step.q.id,
      question: localised(step.q.text, lang),
      answer: answer || null,
      answerValue: answer ? replyValueForStep(session, step) : undefined,
    });
  }

  return history;
}

function stepHasAnswer(session: GuestSession, step: Exclude<Step, { kind: "review" }>): boolean {
  if (step.kind === "interest") return session.interview.interest[step.q.id] !== undefined;
  if (step.q.type === "text") return Boolean(session.interview.context.proud?.trim());
  return Boolean(session.interview.context[step.q.id as Exclude<ContextKey, "proud">]);
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
    const point = scaleFor(q).find((s) => s.value === value);
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
