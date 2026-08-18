"use client";

/**
 * The answers, as things you can tap.
 *
 * The interview asks thirty-five questions whose answers are five fixed
 * points, and until now the only way in was the keyboard: read a numbered
 * list, then type a digit or a phrase. On a phone that is thirty-five rounds
 * of typing for answers the learner never had to compose, and every one of
 * them a chance to be told the reply could not be read.
 *
 * Deliberately buttons rather than a radio group. This screen was rebuilt as a
 * conversation on purpose — the form controls were removed so it would read as
 * someone asking rather than a questionnaire — and quick replies are how a
 * chat interface offers choices without turning back into a form. Tapping one
 * sends it, exactly as if it had been typed, so there is one way an answer is
 * recorded and one place it is parsed.
 *
 * They sit above the composer, not inside the question bubble: the bubble is
 * what was said, this is how you answer, and on a phone it puts the choices
 * within reach of the thumb rather than up under the question.
 */
export default function QuickReplies({
  options,
  onSelect,
  disabled,
  label,
}: {
  /** Answer texts in scale order. The index is the number shown on the chip. */
  options: string[];
  /** Sends the chosen text as a reply, the same path a typed answer takes. */
  onSelect: (option: string) => void;
  disabled?: boolean;
  /** Names the set for a screen reader — the chips alone read as loose words. */
  label: string;
}) {
  if (options.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      data-testid="interview-quick-replies"
      className="mb-3 flex flex-wrap gap-2"
    >
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          data-testid={`quick-reply-${index + 1}`}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-indigo/40 bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-indigo hover:bg-indigo/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-40"
        >
          {/* The number is kept visible so typing "3" and tapping the third
              chip are recognisably the same act, for anyone who has already
              learned the numbered list. */}
          <span aria-hidden className="text-indigoText">
            {index + 1}
          </span>
          <span className="min-w-0 truncate">{option}</span>
        </button>
      ))}
    </div>
  );
}
