"use client";

/**
 * The card the question lives in.
 *
 * `motionKey` remounts the inner element on every step change so the entry
 * animation replays. `direction` makes the movement mean something: forward
 * enters from the right, back from the left, so the card behaves like a place
 * you can walk in two directions rather than a panel that blinks.
 *
 * The animation is CSS-only and globals.css disables it under
 * prefers-reduced-motion.
 */
export default function QuestionCard({
  motionKey,
  direction,
  eyebrow,
  question,
  helper,
  children,
  footer,
}: {
  motionKey: string;
  direction: "forward" | "back";
  eyebrow: string;
  question: string;
  helper?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      key={motionKey}
      className={
        direction === "back" ? "animate-[card-in-back_220ms_ease-out]" : "animate-[card-in_220ms_ease-out]"
      }
    >
      <div className="rounded-card border border-line bg-surface px-6 py-8 shadow-[var(--shadow-card)] sm:px-10 sm:py-11">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint/80">{eyebrow}</p>

        <h2
          id="assessment-question"
          tabIndex={-1}
          className="mt-4 text-balance text-xl font-semibold leading-snug sm:text-2xl sm:leading-snug"
        >
          {question}
        </h2>

        {helper ? <p className="mt-3 text-sm text-muted">{helper}</p> : null}

        <div className="mt-8">{children}</div>
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
