"use client";

import ChatAvatar from "@/components/chat/ChatAvatar";
import AssessmentMascot from "./AssessmentMascot";
import AssessmentTimelineMessage from "./AssessmentTimelineMessage";

export interface ReviewItem {
  id: string;
  question: string;
  answer: string | null;
  stepIndex: number;
  optional?: boolean;
}

export interface ReviewSection {
  title: string;
  items: ReviewItem[];
}

export interface ReviewLabels {
  interviewerName: string;
  interviewerListening: string;
  replyLabel: string;
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
  transcriptLabel,
  forceMascotMotion,
  onToggleMascotMotion,
  motionToggleLabel,
}: {
  sections: ReviewSection[];
  onJump: (stepIndex: number) => void;
  labels: ReviewLabels;
  transcriptLabel: string;
  forceMascotMotion: boolean;
  onToggleMascotMotion: () => void;
  motionToggleLabel: string;
}) {
  return (
    <div className="min-w-0 animate-[card-in_220ms_ease-out]">
      <section className="mx-auto w-full max-w-4xl min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)]">
        <header className="flex items-center gap-3 border-b border-line bg-surface2/35 px-4 py-3 sm:px-5">
          <ChatAvatar role="assistant" />
          <div>
            <h2 className="text-sm font-bold">{labels.interviewerName}</h2>
            <p className="text-xs text-muted">{labels.interviewerListening}</p>
          </div>
        </header>

        <div
          aria-label={transcriptLabel}
          data-testid="interview-review-chat"
          className="space-y-5 bg-surface2/20 px-4 py-5 sm:px-5"
        >
          <div className="grid min-w-0 items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
            <div className="order-1 min-w-0">
              <AssessmentMascot
                state="speaking"
                status={labels.interviewerListening}
                forceMotion={forceMascotMotion}
                onToggleMotion={onToggleMascotMotion}
                toggleMotionLabel={motionToggleLabel}
              />
            </div>

            <div className="order-2 min-w-0">
              <AssessmentTimelineMessage
                role="assistant"
                kind="question"
                label={labels.interviewerName}
                questionId="review"
                active
                showAvatar={false}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  {labels.reviewEyebrow}
                </p>
                <h2
                  id="assessment-question"
                  tabIndex={-1}
                  className="mt-2 text-xl font-semibold focus:outline-none"
                >
                  {labels.reviewTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{labels.reviewIntro}</p>
              </AssessmentTimelineMessage>
            </div>
          </div>

          <AssessmentTimelineMessage
            role="user"
            kind="answer"
            label={labels.replyLabel}
            questionId="review"
          >
            {sections.map((section) => (
              <section key={section.title} className="mt-5 first:mt-0">
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
                        className="group flex w-full flex-col items-start gap-2 bg-surface px-3 py-3 text-left transition hover:bg-coral/5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="min-w-0 flex-1 text-[13px] leading-snug text-muted transition group-hover:text-ink">
                          {item.question}
                        </span>

                        <span className="flex shrink-0 items-center gap-2">
                          {item.answer ? (
                            <span className="max-w-52 truncate rounded-full border border-coral/40 bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral">
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
                          <span aria-hidden className="text-muted opacity-0 transition group-hover:opacity-100">
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
          </AssessmentTimelineMessage>
        </div>
      </section>
    </div>
  );
}
