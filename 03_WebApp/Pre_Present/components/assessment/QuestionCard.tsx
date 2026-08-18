"use client";

import { useEffect, useRef } from "react";
import ChatAvatar from "@/components/chat/ChatAvatar";
import AssessmentMascot from "./AssessmentMascot";
import AssessmentTimelineMessage from "./AssessmentTimelineMessage";
import QuickReplies from "./QuickReplies";

export interface AssessmentTranscriptExchange {
  questionId: string;
  question: string;
  answer: string | null;
  answerValue?: string;
}

/**
 * The interview rendered as a real conversation: FutureMe questions are on
 * the left, saved learner replies are on the right, and the current composer
 * stays below the scrollable transcript.
 */
export default function QuestionCard({
  motionKey,
  direction,
  eyebrow,
  question,
  helper,
  questionId,
  replyOptions,
  history,
  acceptedReply,
  acceptedReplyValue,
  children,
  footer,
  labels,
  mascotState,
  mascotStatus,
  forceMascotMotion,
  onToggleMascotMotion,
  motionToggleLabel,
  onQuickReply,
  quickReplyBusy,
}: {
  motionKey: string;
  direction: "forward" | "back";
  eyebrow: string;
  question: string;
  helper?: string;
  questionId: string;
  replyOptions?: string[];
  history: AssessmentTranscriptExchange[];
  acceptedReply?: string | null;
  acceptedReplyValue?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labels: {
    interviewerName: string;
    interviewerAsking: string;
    interviewerListening: string;
    replyLabel: string;
    replyHint: string;
    optionsIntro: string;
    transcriptLabel: string;
  };
  /** Sends one of `replyOptions` as the answer. Omitted where none apply. */
  onQuickReply?: (option: string) => void;
  quickReplyBusy?: boolean;
  mascotState: "idle" | "thinking" | "speaking" | "offline" | "error";
  mascotStatus: string;
  forceMascotMotion: boolean;
  onToggleMascotMotion: () => void;
  motionToggleLabel: string;
}) {
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const activeTurnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const transcript = transcriptRef.current;
    const activeTurn = activeTurnRef.current;
    if (!transcript || !activeTurn) return;
    const frame = window.requestAnimationFrame(() => {
      if (acceptedReply) {
        transcript.scrollTop = transcript.scrollHeight;
        return;
      }
      const transcriptBox = transcript.getBoundingClientRect();
      const activeBox = activeTurn.getBoundingClientRect();
      transcript.scrollTop += activeBox.top - transcriptBox.top - 16;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [acceptedReply, history.length, motionKey, question]);

  return (
    <div
      data-question-id={questionId}
      data-testid="interview-current-question"
      className="min-w-0"
    >
      <section
        aria-labelledby="interview-chat-title"
        className="mx-auto w-full max-w-4xl min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)]"
        data-testid="interview-chat-panel"
      >
        <header className="flex items-center gap-3 border-b border-line bg-surface2/35 px-4 py-3 sm:px-5">
          <ChatAvatar role="assistant" />
          <div className="min-w-0">
            <h2 id="interview-chat-title" className="truncate text-sm font-bold">
              {labels.interviewerName}
            </h2>
            <p className="truncate text-xs text-muted" aria-live="polite">
              {mascotStatus}
            </p>
          </div>
        </header>

        <div
          ref={transcriptRef}
          role="log"
          aria-label={labels.transcriptLabel}
          aria-live="off"
          data-testid="interview-transcript"
          className="max-h-[min(58dvh,620px)] min-h-[320px] space-y-5 overflow-x-hidden overflow-y-auto bg-surface2/20 px-4 py-5 sm:px-5"
        >
          {history.map((exchange) => (
            <div key={exchange.questionId} className="space-y-5" data-testid="interview-exchange">
              <AssessmentTimelineMessage
                role="assistant"
                kind="question"
                label={labels.interviewerName}
                questionId={exchange.questionId}
              >
                <p>{exchange.question}</p>
              </AssessmentTimelineMessage>

              {exchange.answer ? (
                <AssessmentTimelineMessage
                  role="user"
                  kind="answer"
                  label={labels.replyLabel}
                  questionId={exchange.questionId}
                  answerValue={exchange.answerValue}
                >
                  <p>{exchange.answer}</p>
                </AssessmentTimelineMessage>
              ) : null}
            </div>
          ))}

          <div
            className={
              direction === "back"
                ? "space-y-5 animate-[card-in-back_220ms_ease-out]"
                : "space-y-5 animate-[card-in_220ms_ease-out]"
            }
          >
            <div
              ref={activeTurnRef}
              data-question-id={questionId}
              data-testid="interview-active-turn"
              className="grid min-w-0 items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)]"
            >
              <div className="order-1 min-w-0">
                <AssessmentMascot
                  state={mascotState}
                  status={mascotStatus}
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
                  questionId={questionId}
                  active
                  showAvatar={false}
                >
                  <div data-testid="interview-question-bubble" data-bubble-side="left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {eyebrow}
                    </p>
                    <h2
                      id="assessment-question"
                      tabIndex={-1}
                      className="mt-2 text-balance text-lg font-semibold leading-snug focus:outline-none sm:text-xl"
                    >
                      {question}
                    </h2>

                    {helper ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{helper}</p>
                    ) : null}

                    {replyOptions && replyOptions.length > 0 ? (
                      <div
                        className="mt-4 border-t border-indigo/20 pt-3"
                        data-testid="interview-option-guide"
                      >
                        <p className="text-xs font-semibold text-indigoText">
                          {labels.optionsIntro}
                        </p>
                        <ol className="mt-2 grid gap-1.5 text-xs leading-relaxed text-muted sm:grid-cols-2">
                          {replyOptions.map((option, index) => (
                            <li key={option} className="flex min-w-0 gap-2">
                              <span className="font-bold text-indigoText">{index + 1}.</span>
                              <span className="min-w-0">{option}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                </AssessmentTimelineMessage>
              </div>
            </div>

            {acceptedReply ? (
              <AssessmentTimelineMessage
                role="user"
                kind="answer"
                label={labels.replyLabel}
                questionId={questionId}
                answerValue={acceptedReplyValue}
                active
              >
                <p>{acceptedReply}</p>
              </AssessmentTimelineMessage>
            ) : null}
          </div>
        </div>

        <div
          className="border-t border-coral/25 bg-coral/5 p-3 sm:p-4"
          data-question-id={questionId}
          data-testid="interview-composer"
        >
          {onQuickReply && replyOptions && replyOptions.length > 0 ? (
            <QuickReplies
              options={replyOptions}
              onSelect={onQuickReply}
              disabled={quickReplyBusy}
              label={labels.optionsIntro}
            />
          ) : null}

          <div className="flex min-w-0 items-end gap-3">
            <div className="min-w-0 flex-1">{children}</div>
            <ChatAvatar role="user" />
          </div>
          {footer}
        </div>
      </section>
    </div>
  );
}
