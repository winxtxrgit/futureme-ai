"use client";

/**
 * Assessment progress.
 *
 * The bar is decorative reinforcement — the accessible value lives on the
 * element itself, and the "Question N of M" text next to it says the same thing
 * in words, so progress never depends on seeing the fill.
 */
export default function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  /** Supplied by the caller; the bar has no language of its own. */
  label: string;
}) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface2"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo via-mint to-mint transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
