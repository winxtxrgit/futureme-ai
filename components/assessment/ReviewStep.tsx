"use client";

export interface ReviewItem {
  /** The question id, so the row's test id matches the question's. */
  id: string;
  question: string;
  /** The chosen answer in words, or null when the question was skipped. */
  answer: string | null;
  /** Which step to return to when this row is used. */
  stepIndex: number;
  optional?: boolean;
}

export interface ReviewSection {
  title: string;
  items: ReviewItem[];
}

/**
 * The end of the assessment, and the thing a one-question-at-a-time flow owes
 * the learner: everything they said, in one place, with a way back into any of
 * it. Without this the step format would quietly remove the ability to review
 * and change answers that the long form had.
 *
 * Skipped questions are shown as skipped rather than hidden — a gap the learner
 * chose is still information they should see before continuing.
 */
export interface ReviewLabels {
  reviewEyebrow: string;
  reviewTitle: string;
  reviewIntro: string;
  reviewChangeHint: string;
  reviewSkipped: string;
  reviewLeftBlank: string;
}

export default function ReviewStep({
  sections,
  onJump,
  labels,
}: {
  sections: ReviewSection[];
  onJump: (stepIndex: number) => void;
  labels: ReviewLabels;
}) {
  return (
    <div className="animate-[card-in_220ms_ease-out]">
      <div className="rounded-card border border-line bg-surface px-5 py-7 shadow-[var(--shadow-card)] sm:px-8 sm:py-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint/80">
          {labels.reviewEyebrow}
        </p>
        <h2 id="assessment-question" tabIndex={-1} className="mt-3 text-xl font-semibold sm:text-2xl focus:outline-none">
          {labels.reviewTitle}
        </h2>
        <p className="mt-3 text-sm text-muted">{labels.reviewIntro}</p>

        {sections.map((section) => (
          <section key={section.title} className="mt-7">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              {section.title}
            </h3>

            <ul className="mt-3 divide-y divide-line/70 overflow-hidden rounded-control border border-line">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onJump(item.stepIndex)}
                    data-testid={`review-${item.id}`}
                    className="group flex w-full items-center justify-between gap-4 bg-surface2/40 px-4 py-3 text-left transition hover:bg-surface2"
                  >
                    <span className="min-w-0 flex-1 text-[13px] leading-snug text-muted transition group-hover:text-ink">
                      {item.question}
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      {item.answer ? (
                        <span className="rounded-full border border-mint/40 bg-mint/10 px-2.5 py-1 text-[11px] font-bold text-mint">
                          {item.answer}
                        </span>
                      ) : (
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                            item.optional
                              ? "border-line text-muted"
                              : "border-warning/50 text-warning",
                          ].join(" ")}
                        >
                          {item.optional ? labels.reviewLeftBlank : labels.reviewSkipped}
                        </span>
                      )}
                      <span
                        aria-hidden
                        className="text-muted opacity-0 transition group-hover:opacity-100"
                      >
                        ✎
                      </span>
                      <span className="sr-only">{labels.reviewChangeHint}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
