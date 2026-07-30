"use client";

import { forwardRef } from "react";

/**
 * One selectable answer in a single-choice question.
 *
 * The whole row is the control, not a small circle beside a label, so the
 * target is comfortable on a phone and forgiving with a mouse.
 */
const AnswerOption = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    selected: boolean;
    tabIndex: number;
    testId: string;
    onSelect: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  }
>(function AnswerOption({ label, selected, tabIndex, testId, onSelect, onKeyDown }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      data-testid={testId}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={[
        "group flex w-full min-h-[56px] items-center gap-3.5 rounded-control border px-4 py-3 text-left transition-all duration-200",
        "motion-safe:active:scale-[0.99]",
        selected
          ? "border-mint bg-mint/10 shadow-[var(--shadow-selected)]"
          : "border-line bg-surface2 hover:border-muted/70 hover:bg-surface2/60",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all duration-200",
          selected ? "border-mint bg-mint" : "border-muted/50 group-hover:border-muted",
        ].join(" ")}
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-mintInk" /> : null}
      </span>

      <span
        className={[
          "text-sm font-semibold leading-snug transition-colors",
          selected ? "text-ink" : "text-muted group-hover:text-ink",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
});

export default AnswerOption;
