"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "@/lib/i18n";
import ProgressBar from "./ProgressBar";

/**
 * The fixed frame above the question card: what this is, where you are in it,
 * and a way out to the full list of answers.
 *
 * `answered` and `position` are deliberately separate. Position is which screen
 * you are on; answered is how many you have actually completed. Skipping moves
 * one and not the other, and conflating them would let the bar claim progress
 * the learner has not made.
 */
export default function AssessmentHeader({
  title,
  position,
  total,
  answered,
  progressMax,
  counterTemplate,
  reviewWord,
  answeredTemplate,
  progressLabel,
  onReview,
  reviewLabel,
  onReset,
  resetLabel,
  resetConfirmLabel,
  resetConfirmPrompt,
  resetCancelLabel,
  resetDoneLabel,
}: {
  title: string;
  position: number;
  total: number;
  answered: number;
  /**
   * The bar's denominator. Separate from `total` because the optional free-text
   * question is a screen you pass through but not a bar the learner should be
   * unable to fill by declining to answer it.
   */
  progressMax: number;
  /** "Question {current} of {total}" in the active language. */
  counterTemplate: string;
  reviewWord: string;
  /** "{answered} of {total} answered" in the active language. */
  answeredTemplate: string;
  /** Accessible name for the progress bar. */
  progressLabel: string;
  onReview?: () => void;
  reviewLabel: string;
  /** Discard every reply and return to the first question. */
  onReset?: () => void;
  resetLabel: string;
  resetConfirmLabel: string;
  /** States what is about to be lost, before it is lost. */
  resetConfirmPrompt: string;
  resetCancelLabel: string;
  /** Announced after the reset so the change is not silent. */
  resetDoneLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);

  // Move to the confirm button rather than leaving focus on a control that just
  // disappeared, which would drop a keyboard user back to the top of the page.
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  // The confirmation is a decision about losing work, so let Escape out of it.
  useEffect(() => {
    if (!confirming) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setConfirming(false);
      resetRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirming]);

  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {onReset ? (
            <button
              ref={resetRef}
              type="button"
              onClick={() => {
                setDone(false);
                setConfirming(true);
              }}
              data-testid="assessment-reset"
              className="rounded-full px-2 py-1 text-xs font-semibold text-muted underline underline-offset-4 transition hover:text-ink"
            >
              {resetLabel}
            </button>
          ) : null}
          {onReview ? (
            <button
              type="button"
              onClick={onReview}
              data-testid="go-review"
              className="rounded-full px-2 py-1 text-xs font-semibold text-muted underline underline-offset-4 transition hover:text-ink"
            >
              {reviewLabel}
            </button>
          ) : null}
        </div>
      </div>

      {confirming ? (
        <div
          role="alertdialog"
          aria-label={resetConfirmPrompt}
          data-testid="assessment-reset-confirm"
          className="mt-3 rounded-control border border-warning/50 bg-warning/5 p-3"
        >
          <p className="text-xs text-ink">{resetConfirmPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              ref={confirmRef}
              type="button"
              onClick={() => {
                onReset?.();
                setConfirming(false);
                setDone(true);
              }}
              data-testid="assessment-reset-confirm-yes"
              className="rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-canvas transition hover:bg-coral/90"
            >
              {resetConfirmLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                resetRef.current?.focus();
              }}
              data-testid="assessment-reset-cancel"
              className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-bold text-ink transition hover:border-muted"
            >
              {resetCancelLabel}
            </button>
          </div>
        </div>
      ) : null}

      {/* Kept mounted so the announcement is not competing with a DOM insertion. */}
      <p role="status" aria-live="polite" className="sr-only">
        {done ? resetDoneLabel : ""}
      </p>

      <div className="mt-3 flex items-baseline justify-between text-xs font-semibold">
        {/* Tagged so the screenshot capture can wait for the question to
            actually change rather than guessing at the acknowledgement delay. */}
        <span className="text-muted" aria-live="polite" data-testid="assessment-progress-label">
          {position > total
            ? reviewWord
            : format(counterTemplate, { current: position, total })}
        </span>
        <span className="text-muted">
          {format(answeredTemplate, { answered, total: progressMax })}
        </span>
      </div>

      <div className="mt-2">
        <ProgressBar value={answered} max={progressMax} label={progressLabel} />
      </div>
    </div>
  );
}
