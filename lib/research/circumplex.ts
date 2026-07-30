/**
 * Structural test of Holland's circular order.
 *
 * This is the analysis the RIASEC literature actually runs, and the one this
 * project most needs, because the finding that constrained the whole design is a
 * *negative* structural result: Rounds and Tracey (1996) examined 76
 * international correlation matrices and could not support cross-cultural
 * structural equivalence of the circular order model. Any Thai pilot has to be
 * able to reproduce that test on its own data rather than assume the hexagon.
 *
 * Method — the randomisation test of hypothesised order relations (Hubert &
 * Arabie 1987; applied to RIASEC by Tracey & Rounds 1993, 1996):
 *
 *  1. Place the six types on a circle in the order R-I-A-S-E-C.
 *  2. Each of the 15 unique type pairs has a circular distance of 1 (adjacent),
 *     2 (alternate) or 3 (opposite).
 *  3. The model predicts that a correlation between closer types exceeds a
 *     correlation between more distant types. Over all pairs-of-pairs with
 *     different distances that is 6*6 + 6*3 + 6*3 = 72 order predictions.
 *  4. CI = (met - violated) / 72, ranging -1 to +1.
 *  5. Significance comes from enumerating all 6! = 720 relabellings of the
 *     types and counting how many reach a CI at least as high as observed.
 *     720 is small enough to enumerate exactly, so no sampling error is
 *     introduced into the p-value.
 *
 * Interpretation is deliberately not encoded here. There is no threshold at
 * which a CI "passes"; Tracey & Rounds (1993) report a meta-analytic benchmark
 * of CI = .63 across RIASEC measures, and a result should be read against that
 * rather than against a cutoff this code invented.
 */

export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecType = (typeof RIASEC_ORDER)[number];

export interface CorrespondenceResult {
  /** Correspondence index, -1 to +1. */
  ci: number;
  predictionsMet: number;
  predictionsViolated: number;
  /** Predictions where the two correlations were exactly equal. */
  ties: number;
  totalPredictions: number;
  /**
   * Exact randomisation p-value: the share of the 720 label permutations whose
   * CI is greater than or equal to the observed CI.
   */
  p: number;
  permutations: number;
}

/** Distance around a 6-point circle: 1 adjacent, 2 alternate, 3 opposite. */
export function circularDistance(i: number, j: number, n = 6): number {
  const d = Math.abs(i - j) % n;
  return Math.min(d, n - d);
}

interface Prediction {
  /** Indices of the closer pair. */
  near: [number, number];
  /** Indices of the more distant pair. */
  far: [number, number];
}

/**
 * The model's order predictions for a circle of `n` points.
 *
 * Built from the geometry rather than written out, so the count is derived and
 * cannot drift from the structure it is supposed to describe.
 */
export function orderPredictions(n = 6): Prediction[] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);

  const predictions: Prediction[] = [];
  for (const a of pairs) {
    for (const b of pairs) {
      const da = circularDistance(a[0], a[1], n);
      const db = circularDistance(b[0], b[1], n);
      if (da < db) predictions.push({ near: a, far: b });
    }
  }
  return predictions;
}

function evaluate(
  matrix: number[][],
  predictions: Prediction[],
  labelOf: number[],
): { ci: number; met: number; violated: number; ties: number } {
  let met = 0;
  let violated = 0;
  let ties = 0;

  for (const { near, far } of predictions) {
    const rNear = matrix[labelOf[near[0]]][labelOf[near[1]]];
    const rFar = matrix[labelOf[far[0]]][labelOf[far[1]]];
    if (rNear > rFar) met += 1;
    else if (rNear < rFar) violated += 1;
    else ties += 1;
  }

  // Ties stay in the denominator: a model that predicts an inequality and finds
  // equality has not been supported, and dropping those cases would inflate CI.
  const ci = (met - violated) / predictions.length;
  return { ci, met, violated, ties };
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([items[i], ...tail]);
  }
  return out;
}

/**
 * Runs the randomisation test against a 6x6 scale intercorrelation matrix.
 *
 * `matrix` must be indexed in the RIASEC order the instrument uses — the same
 * order as `RIASEC_ORDER`. Rows and columns are scale scores, not items.
 */
export function circumplexCorrespondence(matrix: number[][]): CorrespondenceResult {
  const n = matrix.length;
  if (n !== 6) throw new Error(`circumplexCorrespondence: expected a 6x6 matrix, got ${n}`);
  for (const row of matrix) {
    if (row.length !== 6) throw new Error("circumplexCorrespondence: matrix is not square");
  }

  const predictions = orderPredictions(6);
  const identity = [0, 1, 2, 3, 4, 5];
  const observed = evaluate(matrix, predictions, identity);

  const perms = permutations(identity);
  let atLeastAsExtreme = 0;
  for (const perm of perms) {
    if (evaluate(matrix, predictions, perm).ci >= observed.ci) atLeastAsExtreme += 1;
  }

  return {
    ci: observed.ci,
    predictionsMet: observed.met,
    predictionsViolated: observed.violated,
    ties: observed.ties,
    totalPredictions: predictions.length,
    p: atLeastAsExtreme / perms.length,
    permutations: perms.length,
  };
}

/**
 * Mean correlation at each circular distance.
 *
 * Reported alongside the CI because it is what makes a failure legible: a
 * circumplex that fails usually fails because one specific band is out of order,
 * and the manual's own recurring anomaly — Enterprising correlating more with
 * Artistic than with Social — is visible here and not in the CI alone.
 */
export function meanCorrelationByDistance(matrix: number[][]): Record<number, number> {
  const sums: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      const d = circularDistance(i, j);
      sums[d] += matrix[i][j];
      counts[d] += 1;
    }
  }
  return {
    1: counts[1] ? sums[1] / counts[1] : Number.NaN,
    2: counts[2] ? sums[2] / counts[2] : Number.NaN,
    3: counts[3] ? sums[3] / counts[3] : Number.NaN,
  };
}
