import type { Ref } from "react";
import { Button } from "@/components/ui";

export default function AssessmentReplyComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  questionId,
  placeholder,
  hint,
  sendLabel,
  sendingLabel,
  error,
  maxLength,
  rows = 3,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  questionId: string;
  placeholder: string;
  hint: string;
  sendLabel: string;
  sendingLabel: string;
  error: string | null;
  maxLength: number;
  rows?: number;
  inputRef?: Ref<HTMLTextAreaElement>;
}) {
  const hintId = "assessment-reply-hint";
  const errorId = "assessment-reply-error";
  const countId = "assessment-reply-count";

  const submit = () => {
    if (!disabled && value.trim().length > 0) onSubmit();
  };

  return (
    <form
      data-question-id={questionId}
      data-testid="interview-user-chatbox"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={inputRef}
        id="assessment-reply"
        data-testid="assessment-reply"
        data-question-id={questionId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        aria-labelledby="assessment-question"
        aria-describedby={`${hintId} ${countId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? errorId : undefined}
        className="w-full resize-y rounded-control border border-coral/35 bg-surface px-4 py-3 text-sm leading-relaxed text-ink transition placeholder:text-muted/80 hover:border-coral/60 focus:border-coral focus:ring-2 focus:ring-coral/20 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 rounded-control border border-warning/40 bg-warning/5 px-3 py-2 text-xs font-semibold leading-relaxed text-warning"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-[11px] leading-relaxed text-muted">
          <span id={hintId}>{hint}</span>
          <span id={countId} className="ml-2 tabular-nums">
            {value.length}/{maxLength}
          </span>
        </p>
        <Button
          type="submit"
          variant="coral"
          disabled={disabled || value.trim().length === 0}
          data-testid="assessment-send"
          className="min-w-24"
        >
          {disabled ? sendingLabel : sendLabel}
        </Button>
      </div>
    </form>
  );
}
