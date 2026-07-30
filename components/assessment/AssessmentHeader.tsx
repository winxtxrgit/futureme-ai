"use client";

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
}) {
  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
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

      <div className="mt-3 flex items-baseline justify-between text-xs font-semibold">
        <span className="text-muted" aria-live="polite">
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
