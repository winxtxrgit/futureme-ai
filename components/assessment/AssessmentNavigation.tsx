"use client";

/**
 * Step navigation.
 *
 * Answering usually advances on its own, so this row exists for the two cases
 * that need a deliberate act: going back to change something, and moving past a
 * question without answering it. The forward button says which of those is
 * happening — "Skip" when nothing is chosen, "Next" once something is — because
 * a learner who skips should know they skipped.
 */
export default function AssessmentNavigation({
  onPrev,
  onNext,
  answered,
  canGoBack,
  labels,
}: {
  onPrev: () => void;
  onNext: () => void;
  answered: boolean;
  canGoBack: boolean;
  /** Supplied by the caller so the control has no language of its own. */
  labels: { previous: string; next: string; skip: string };
}) {
  const forwardLabel = answered ? labels.next : labels.skip;

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoBack}
        data-testid="assessment-prev"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink disabled:pointer-events-none disabled:opacity-0"
      >
        <span aria-hidden>←</span> {labels.previous}
      </button>

      <button
        type="button"
        onClick={onNext}
        data-testid={answered ? "assessment-next" : "assessment-skip"}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200",
          "motion-safe:active:scale-[0.97]",
          answered
            ? "bg-mint text-mintInk hover:bg-mint/90 shadow-[var(--shadow-primary)]"
            : "border border-line bg-surface2 text-muted hover:border-muted hover:text-ink",
        ].join(" ")}
      >
        {forwardLabel} <span aria-hidden>→</span>
      </button>
    </div>
  );
}
