import questionsData from "@/data/questions.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";
import {
  MIN_ITEMS_PER_DIMENSION,
  PRIOR_MEAN,
  SCALE_MIDPOINT,
} from "./parameters";

/**
 * Steps 1-4 of the pipeline: answers become a six-dimensional profile.
 *
 * Port of 01_Research/Recommendation_Engine/engine.py score_dimensions.
 */

const SCALE_MIN = 1;
const SCALE_MAX = 5;

interface BankItem {
  id: string;
  dimension: string;
  direction?: string;
}

const INTEREST_ITEMS = questionsData.interest as BankItem[];
const EFFICACY_ITEMS = (questionsData as { efficacy?: BankItem[] }).efficacy ?? [];

export interface DimensionScore {
  dimension: Dimension;
  /** theta_d, the mean over informative answers, before shrinkage */
  rawMean: number;
  /** theta_hat_d, what the ranking actually uses */
  shrunk: number;
  /** items asked in this dimension */
  asked: number;
  /** of those, how many said something — the midpoint says nothing */
  informative: number;
  coverage: number;
  consistency: number;
  confidence: number;
  itemIds: string[];
}

export interface Profile {
  dimensions: Record<Dimension, DimensionScore>;
  /** theta_hat, the vector the ranking compares against programmes */
  vector: Record<Dimension, number>;
  efficacy: Record<Dimension, number | null>;
  overallConfidence: number;
  /** Holland (1997): highest dimension minus lowest */
  differentiation: number;
  weakestDimension: Dimension;
  asked: number;
  informative: number;
}

/** Likert 1..5 to 0..1, reflecting reverse-keyed items about the midpoint. */
export function itemValue(raw: number, direction?: string): number {
  const directed = direction === "reverse" ? SCALE_MIN + SCALE_MAX - raw : raw;
  return (directed - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
}

/**
 * A midpoint answer is counted as *asked* but not as *informative*.
 *
 * 03-branching-rules.md §3.2 has said so from the start, and the 5,000-session
 * simulation gives midpoint respondents a confidence of 0.33 for that reason.
 * Scoring a "3" as 0.5 produces the worst failure this engine can have: a
 * learner who answers 3 to everything gets consistency 1.00 — identical
 * answers never disagree — confidence 1.00, and the most confident-looking
 * recommendations in the system. Undecided becomes certain.
 */
function isInformative(raw: number): boolean {
  return raw !== SCALE_MIDPOINT;
}

export function buildProfile(answers: Record<string, number>): Profile {
  const byDim = new Map<Dimension, { id: string; value: number; informative: boolean }[]>();
  for (const d of DIMENSIONS) byDim.set(d, []);

  for (const item of INTEREST_ITEMS) {
    const d = item.dimension as Dimension;
    const bucket = byDim.get(d);
    if (!bucket) continue;
    const raw = answers[item.id];
    // Number.isFinite rather than a bare range check: NaN is a number, and
    // both NaN < 1 and NaN > 5 are false, so it would slip through.
    if (!Number.isFinite(raw) || raw < SCALE_MIN || raw > SCALE_MAX) continue;
    bucket.push({
      id: item.id,
      value: itemValue(raw, item.direction),
      informative: isInformative(raw),
    });
  }

  const dimensions = {} as Record<Dimension, DimensionScore>;

  for (const d of DIMENSIONS) {
    const all = byDim.get(d) ?? [];
    const informative = all.filter((a) => a.informative);
    const k = informative.length;

    if (k === 0) {
      dimensions[d] = {
        dimension: d,
        rawMean: PRIOR_MEAN,
        shrunk: PRIOR_MEAN,
        asked: all.length,
        informative: 0,
        coverage: 0,
        consistency: 0,
        confidence: 0,
        itemIds: [],
      };
      continue;
    }

    const mean = informative.reduce((s, a) => s + a.value, 0) / k;
    const coverage = Math.min(1, k / MIN_ITEMS_PER_DIMENSION);

    // Mean absolute deviation, rescaled so MAD 0 -> 1 and MAD 0.5 -> 0. One
    // item cannot disagree with itself, so it counts as neutral rather than
    // perfectly consistent — otherwise a single answer yields full confidence.
    let consistency: number;
    if (k === 1) {
      consistency = 0.5;
    } else {
      const mad = informative.reduce((s, a) => s + Math.abs(a.value - mean), 0) / k;
      consistency = Math.max(0, 1 - 2 * mad);
    }

    const confidence = coverage * consistency;

    // Kelley (1947) reliability shrinkage: pull an unreliable score toward the
    // prior in proportion to its unreliability, so an unreliable extreme
    // cannot out-rank a reliable moderate.
    const shrunk = confidence * mean + (1 - confidence) * PRIOR_MEAN;

    dimensions[d] = {
      dimension: d,
      rawMean: mean,
      shrunk,
      asked: all.length,
      informative: k,
      coverage,
      consistency,
      confidence,
      itemIds: informative.map((a) => a.id),
    };
  }

  const efficacy = {} as Record<Dimension, number | null>;
  for (const d of DIMENSIONS) efficacy[d] = null;
  for (const item of EFFICACY_ITEMS) {
    const d = item.dimension as Dimension;
    if (!DIMENSIONS.includes(d)) continue;
    const raw = answers[item.id];
    if (!Number.isFinite(raw) || raw < SCALE_MIN || raw > SCALE_MAX) continue;
    efficacy[d] = itemValue(raw, item.direction);
  }

  const vector = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) vector[d] = dimensions[d].shrunk;

  const values = DIMENSIONS.map((d) => vector[d]);
  const overallConfidence =
    DIMENSIONS.reduce((s, d) => s + dimensions[d].confidence, 0) / DIMENSIONS.length;

  return {
    dimensions,
    vector,
    efficacy,
    overallConfidence,
    differentiation: Math.max(...values) - Math.min(...values),
    weakestDimension: DIMENSIONS.reduce((a, b) =>
      dimensions[a].confidence <= dimensions[b].confidence ? a : b,
    ),
    asked: DIMENSIONS.reduce((s, d) => s + dimensions[d].asked, 0),
    informative: DIMENSIONS.reduce((s, d) => s + dimensions[d].informative, 0),
  };
}
