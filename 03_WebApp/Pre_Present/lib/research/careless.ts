/**
 * Detection of careless or insufficient-effort responding.
 *
 * Around 10–12% of respondents in typical self-report samples fall into a
 * careless latent class (Meade & Craig, 2012), and a pilot that does not screen
 * for it reports reliability estimates contaminated by people who were not
 * reading. So these indices exist to make a dataset defensible, not to police
 * learners.
 *
 * Three deliberate positions, each of which is a documented recommendation
 * rather than this project's invention:
 *
 *  - **No single index decides anything.** Curran (2016) is explicit that these
 *    should be used conservatively and as a family. Every function here returns
 *    a number; nothing here returns "exclude".
 *  - **Thresholds are not baked in.** The widely quoted 2-seconds-per-item floor
 *    is described in its own source (Huang et al., 2012) as "an educated guess",
 *    not a validated constant. Calibrating on the observed distribution and
 *    reporting the percentile used is the honest alternative, so the caller
 *    supplies thresholds and the report states them.
 *  - **Flag and warn, never silently discard.** O*NET's own tool tells a client
 *    who disliked every activity that their results may not reflect their
 *    interests. For a career-exploration product aimed at teenagers, offering a
 *    retake is both better measurement and better treatment of the learner.
 *
 * A caveat that matters for this population and is easy to forget: in a
 * translated instrument given to 13-year-olds of mixed reading ability, a failed
 * attention check may indicate reading difficulty rather than carelessness. That
 * is the same mechanism the reverse-item literature documents, and it is why
 * these indices are inputs to a judgement rather than a verdict.
 */

export interface CarelessIndices {
  /** Longest run of identical consecutive responses. */
  longstring: number;
  /**
   * Intra-individual response variability: the SD of one person's answers.
   * Near zero means no discrimination between items; implausibly high means
   * random responding. Both tails are informative.
   */
  irv: number;
  /**
   * Even-odd consistency, corrected by Spearman-Brown.
   *
   * Splits each unidimensional subscale in half, correlates the two halves
   * *within one person* across subscales, then corrects for halving. Requires
   * several subscales — this instrument has six, which is why the index is
   * available at all. Meade & Craig favour it over psychometric antonyms.
   */
  evenOdd: number | null;
  /** Median seconds per item, when response timing was captured. */
  medianSecondsPerItem: number | null;
  /** Fraction of items answered. */
  completeness: number;
  /** Number of items with a recorded answer. */
  answered: number;
}

export interface CarelessFlagOptions {
  /** Flag when the longest identical run reaches this length. */
  longstringAtLeast?: number;
  /** Flag when IRV falls at or below this. Zero variance is the clear case. */
  irvAtMost?: number;
  /** Flag when even-odd consistency falls below this. */
  evenOddBelow?: number;
  /**
   * Flag when median seconds per item falls below this.
   *
   * No default. A borrowed constant would be exactly the unexamined threshold
   * this module is trying to avoid; calibrate it on the pilot's own distribution
   * and record which percentile you used.
   */
  minSecondsPerItem?: number;
}

export interface CarelessAssessment {
  indices: CarelessIndices;
  /** Which checks fired. Empty does not mean the response is good. */
  flags: string[];
  /** Thresholds actually applied, so a report can state them. */
  thresholdsUsed: Required<Omit<CarelessFlagOptions, "minSecondsPerItem">> & {
    minSecondsPerItem: number | null;
  };
}

/** One respondent's answers to one scale, in administration order. */
export interface ScaleResponses {
  /** Subscale identifier — the six RIASEC dimensions here. */
  scale: string;
  /** Answers in item order. `null` where unanswered. */
  values: (number | null)[];
}

function present(values: (number | null)[]): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

function sampleSd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

/**
 * Longest run of the same answer in a row.
 *
 * Interpretable here specifically *because* the six dimensions are interleaved
 * rather than blocked: across a blocked instrument a long identical run can be
 * perfectly genuine, whereas across an interleaved one it is more likely to be
 * inattention. Unanswered items break a run rather than extending it.
 */
export function longstring(values: (number | null)[]): number {
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const v of values) {
    if (typeof v !== "number") {
      run = 0;
      previous = null;
      continue;
    }
    run = v === previous ? run + 1 : 1;
    previous = v;
    if (run > best) best = run;
  }
  return best;
}

/** SD of one respondent's answers across all items. */
export function intraIndividualVariability(values: (number | null)[]): number {
  return sampleSd(present(values));
}

/**
 * Even-odd consistency across subscales, Spearman-Brown corrected.
 *
 * Returns null when there are too few usable subscales to correlate — which is
 * the right answer, not zero. A null must not be read as "consistent".
 */
export function evenOddConsistency(scales: ScaleResponses[]): number | null {
  const evens: number[] = [];
  const odds: number[] = [];

  for (const { values } of scales) {
    const evenItems: number[] = [];
    const oddItems: number[] = [];
    values.forEach((v, i) => {
      if (typeof v !== "number" || !Number.isFinite(v)) return;
      (i % 2 === 0 ? evenItems : oddItems).push(v);
    });
    if (evenItems.length === 0 || oddItems.length === 0) continue;
    evens.push(evenItems.reduce((a, b) => a + b, 0) / evenItems.length);
    odds.push(oddItems.reduce((a, b) => a + b, 0) / oddItems.length);
  }

  const r = pearson(evens, odds);
  if (r === null) return null;
  // Spearman-Brown: each half is half-length, so correct upward.
  const corrected = (2 * r) / (1 + r);
  // A negative half-half correlation makes the correction meaningless; report
  // the raw value rather than a number outside the coefficient's range.
  if (!Number.isFinite(corrected)) return r;
  return Math.max(-1, Math.min(1, corrected));
}

export function carelessIndices(
  scales: ScaleResponses[],
  { secondsPerItem }: { secondsPerItem?: number[] } = {},
): CarelessIndices {
  const all = scales.flatMap((s) => s.values);
  const answered = present(all).length;
  const times = (secondsPerItem ?? []).filter((t) => Number.isFinite(t) && t >= 0);

  return {
    longstring: longstring(all),
    irv: intraIndividualVariability(all),
    evenOdd: evenOddConsistency(scales),
    medianSecondsPerItem: times.length > 0 ? median(times) : null,
    completeness: all.length > 0 ? answered / all.length : 0,
    answered,
  };
}

export function median(xs: number[]): number {
  if (xs.length === 0) return Number.NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Applies thresholds and returns which checks fired.
 *
 * Defaults are stated rather than hidden: a longstring of 8 on a 30-item
 * interleaved instrument, and zero within-person variance. Both are judgement
 * calls and are reported back in `thresholdsUsed` so a report can quote them.
 */
export function assessCareless(
  scales: ScaleResponses[],
  options: CarelessFlagOptions = {},
  timing: { secondsPerItem?: number[] } = {},
): CarelessAssessment {
  const thresholds = {
    longstringAtLeast: options.longstringAtLeast ?? 8,
    irvAtMost: options.irvAtMost ?? 0,
    evenOddBelow: options.evenOddBelow ?? 0,
    minSecondsPerItem: options.minSecondsPerItem ?? null,
  };

  const indices = carelessIndices(scales, timing);
  const flags: string[] = [];

  if (indices.longstring >= thresholds.longstringAtLeast) flags.push("LONGSTRING");
  if (indices.irv <= thresholds.irvAtMost) flags.push("NO_VARIANCE");
  if (indices.evenOdd !== null && indices.evenOdd < thresholds.evenOddBelow) {
    flags.push("INCONSISTENT_HALVES");
  }
  if (
    thresholds.minSecondsPerItem !== null &&
    indices.medianSecondsPerItem !== null &&
    indices.medianSecondsPerItem < thresholds.minSecondsPerItem
  ) {
    flags.push("TOO_FAST");
  }

  return { indices, flags, thresholdsUsed: thresholds };
}
