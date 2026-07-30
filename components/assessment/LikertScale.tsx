"use client";

import { useRef } from "react";
import type { SelectionSource } from "./types";

export interface ScalePoint {
  value: number;
  label: string;
}

/**
 * The five-point interest scale (strongly dislike … strongly like).
 *
 * Built as a real radiogroup rather than five toggle buttons: the values are
 * mutually exclusive, so arrow keys should move between them and a screen
 * reader should announce "3 of 5" without being told to. Roving tabindex keeps
 * the whole group a single tab stop.
 *
 * The dot grows across the scale so the row reads as a gradient at a glance,
 * but size is never the only signal — every point keeps its written label, and
 * the selected point gets a ring and a filled dot as well as the mint colour.
 */
export default function LikertScale({
  points,
  value,
  onChange,
  testIdPrefix,
  labelledBy,
}: {
  points: ScalePoint[];
  value: number | undefined;
  onChange: (value: number, source: SelectionSource) => void;
  testIdPrefix: string;
  labelledBy?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Arrow keys move the selection without treating it as a final answer.
   *
   * They clamp at the ends rather than wrapping: wrapping meant pressing Left
   * on "strongly dislike" selected "strongly like", which is the opposite of
   * what the key press asked for.
   */
  const move = (from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), points.length - 1);
    if (next === from) return;
    onChange(points[next].value, "keyboard");
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        onChange(points[0].value, "keyboard");
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        onChange(points[points.length - 1].value, "keyboard");
        refs.current[points.length - 1]?.focus();
        break;
    }
  };

  const selectedIndex = points.findIndex((p) => p.value === value);
  // Before anything is chosen the group still needs exactly one tab stop.
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  /**
   * The dot grows across the scale. Every dot is centred in a fixed-size well
   * so the labels keep a common baseline on desktop and a common left edge on
   * mobile — without it the row visibly sags as the dots get bigger.
   */
  const dotSize = ["h-3 w-3", "h-[17px] w-[17px]", "h-[22px] w-[22px]", "h-[27px] w-[27px]", "h-8 w-8"];
  const dotBorder = [
    "border-muted/40",
    "border-muted/50",
    "border-muted/60",
    "border-muted/70",
    "border-muted/80",
  ];

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-2.5"
    >
      {points.map((point, i) => {
        const active = point.value === value;
        return (
          <button
            key={point.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={i === tabStop ? 0 : -1}
            data-testid={`${testIdPrefix}-${point.value}`}
            onClick={() => onChange(point.value, "pointer")}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={[
              "group flex min-h-[54px] items-center gap-3 rounded-control border px-4 py-3 text-left transition-all duration-200",
              "sm:min-h-[124px] sm:flex-col sm:justify-center sm:gap-3 sm:px-2 sm:py-4 sm:text-center",
              "motion-safe:active:scale-[0.97]",
              active
                ? "border-mint bg-mint/10 shadow-[var(--shadow-selected-lift)] sm:-translate-y-0.5"
                : "border-line bg-surface2 hover:border-muted/70 hover:bg-surface2/60 motion-safe:hover:-translate-y-0.5",
            ].join(" ")}
          >
            <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center">
              <span
                className={[
                  "grid place-items-center rounded-full border-2 transition-all duration-200",
                  dotSize[i] ?? "h-5 w-5",
                  active
                    ? "border-mint bg-mint motion-safe:scale-110"
                    : `${dotBorder[i] ?? "border-muted/50"} bg-transparent group-hover:border-muted`,
                ].join(" ")}
              >
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-mintInk" /> : null}
              </span>
            </span>

            <span
              className={[
                "text-sm font-semibold leading-tight transition-colors sm:text-[12px]",
                active ? "text-ink" : "text-muted group-hover:text-ink",
              ].join(" ")}
            >
              {point.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
