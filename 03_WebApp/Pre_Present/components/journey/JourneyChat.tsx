"use client";

import { useState, type ReactNode } from "react";
import AssessmentMascot from "@/components/assessment/AssessmentMascot";
import ChatAvatar from "@/components/chat/ChatAvatar";
import type { MascotState } from "@/components/FutureMeMascot";

export function JourneyChatPanel({
  title,
  status,
  transcriptLabel,
  testIdPrefix,
  children,
}: {
  title: string;
  status: string;
  transcriptLabel: string;
  testIdPrefix: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${testIdPrefix}-chat-title`}
      className="mx-auto w-full max-w-4xl min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)]"
      data-testid={`${testIdPrefix}-chat-panel`}
    >
      <header
        className="flex items-center gap-3 border-b border-line bg-surface2/45 px-4 py-3 sm:px-5"
        data-testid={`${testIdPrefix}-chat-header`}
      >
        <ChatAvatar role="assistant" />
        <div className="min-w-0">
          <h2 id={`${testIdPrefix}-chat-title`} className="truncate text-sm font-bold">
            {title}
          </h2>
          <p className="truncate text-xs text-muted">{status}</p>
        </div>
      </header>

      <div
        role="log"
        aria-label={transcriptLabel}
        aria-live="off"
        className="min-w-0 space-y-6 overflow-x-hidden bg-surface2/20 px-3 py-5 sm:px-5 sm:py-6"
        data-testid={`${testIdPrefix}-transcript`}
      >
        {children}
      </div>
    </section>
  );
}

export function JourneyMessage({
  role,
  label,
  testId,
  className = "",
  showAvatar = true,
  children,
}: {
  role: "assistant" | "user";
  label: string;
  testId?: string;
  className?: string;
  showAvatar?: boolean;
  children: ReactNode;
}) {
  const assistant = role === "assistant";

  return (
    <article
      aria-label={label}
      className={`flex w-full min-w-0 flex-col ${assistant ? "items-start" : "items-end"} ${className}`}
      data-role={role}
      data-side={assistant ? "left" : "right"}
      data-testid={testId}
    >
      <div
        className={[
          "relative min-w-0 rounded-[24px] border-2 px-4 py-4 text-sm leading-relaxed shadow-[var(--shadow-card)] sm:px-5",
          showAvatar ? "max-w-[calc(100%_-_2.5rem)] sm:max-w-[92%]" : "w-full max-w-full",
          assistant
            ? `${showAvatar ? "ml-10 sm:ml-12" : ""} rounded-bl-control border-indigo/45 border-l-[3px] border-l-indigo bg-indigo/10 text-ink`
            : "mr-10 rounded-br-control border-coral/45 border-r-[3px] border-r-coral bg-coral/10 text-ink sm:mr-12",
        ].join(" ")}
        data-bubble-side={assistant ? "left" : "right"}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute -bottom-[9px] h-4 w-4 rotate-45 border-b-2 border-r-2",
            assistant
              ? "left-7 border-indigo/45 bg-indigo/10"
              : "right-7 border-coral/45 bg-coral/10",
          ].join(" ")}
          data-tail-side={assistant ? "left" : "right"}
        />
        <p className={`mb-2 text-[11px] font-bold ${assistant ? "text-indigoText" : "text-coral"}`}>
          {label}
        </p>
        <div className="min-w-0 break-words [overflow-wrap:anywhere]">{children}</div>
      </div>

      {showAvatar ? (
        <div className={assistant ? "ml-2 mt-3" : "mr-2 mt-3"}>
          <ChatAvatar role={role} />
        </div>
      ) : null}
    </article>
  );
}

export function JourneyMascotTurn({
  status,
  toggleMotionLabel,
  label,
  testIdPrefix,
  state = "idle",
  children,
}: {
  status: string;
  toggleMotionLabel?: string;
  label?: string;
  testIdPrefix?: string;
  state?: MascotState;
  children: ReactNode;
}) {
  const [forceMotion, setForceMotion] = useState(false);
  const prefix = testIdPrefix ?? "journey";

  return (
    <div
      className="grid min-w-0 items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)]"
      data-testid={`${prefix}-mascot-turn`}
    >
      <div className="min-w-0">
        <AssessmentMascot
          state={state}
          status={status}
          forceMotion={forceMotion}
          onToggleMotion={toggleMotionLabel ? () => setForceMotion((value) => !value) : undefined}
          toggleMotionLabel={toggleMotionLabel}
          testIdPrefix={prefix}
        />
      </div>
      <JourneyMessage role="assistant" label={label ?? "FutureMe AI"} showAvatar={false}>
        {children}
      </JourneyMessage>
    </div>
  );
}
