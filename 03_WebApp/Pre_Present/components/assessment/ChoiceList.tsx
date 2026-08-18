"use client";

import { useRef } from "react";
import type { SelectionSource } from "./types";
import AnswerOption from "./AnswerOption";

export interface Choice {
  value: string;
  label: string;
}

/**
 * A vertical single-choice group. Same radiogroup keyboard contract as the
 * Likert scale — one tab stop, arrow keys move within it — so the two question
 * types do not behave differently for anyone navigating by keyboard.
 */
export default function ChoiceList({
  choices,
  value,
  onChange,
  testIdPrefix,
  labelledBy,
}: {
  choices: Choice[];
  value: string | undefined;
  onChange: (value: string, source: SelectionSource) => void;
  testIdPrefix: string;
  labelledBy?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Arrow keys move the selection without committing it. Clamps, never wraps. */
  const move = (from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), choices.length - 1);
    if (next === from) return;
    onChange(choices[next].value, "keyboard");
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        onChange(choices[0].value, "keyboard");
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        onChange(choices[choices.length - 1].value, "keyboard");
        refs.current[choices.length - 1]?.focus();
        break;
    }
  };

  const selectedIndex = choices.findIndex((c) => c.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2.5">
      {choices.map((choice, i) => (
        <AnswerOption
          key={choice.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          label={choice.label}
          selected={choice.value === value}
          tabIndex={i === tabStop ? 0 : -1}
          testId={`${testIdPrefix}-${choice.value}`}
          onSelect={() => onChange(choice.value, "pointer")}
          onKeyDown={(e) => onKeyDown(e, i)}
        />
      ))}
    </div>
  );
}
