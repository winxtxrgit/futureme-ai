/**
 * Psychometric statistics for a pilot dataset.
 *
 * This module turns collected responses into the numbers a validation report
 * has to contain. It computes nothing about the *instrument's* quality on its
 * own — it needs real participant data — but it is the part that can be made
 * correct before any data exists, and its correctness is verified against
 * hand-computed reference values in tests/unit/psychometrics.test.ts.
 *
 * Every estimator here is named precisely, because "reliability" is not one
 * number and reports that do not say which estimator they used are not
 * checkable. Where an estimator rests on an assumption the data may not meet,
 * the assumption is stated in the doc comment rather than left implicit.
 *
 * Deliberately dependency-free. A validation pipeline whose numbers depend on a
 * transitive npm upgrade is not a validation pipeline.
 */

/** One respondent's answers to one scale, in item order. `null` = not answered. */
export type ResponseRow = (number | null)[];

/** Rows are respondents, columns are items. Ragged rows are rejected. */
export type ResponseMatrix = ResponseRow[];

export interface ItemStats {
  index: number;
  n: number;
  mean: number;
  sd: number;
  /** Share of responses at each scale point, keyed by the point. */
  distribution: Record<number, number>;
  /**
   * Pearson r between this item and the sum of the *other* items in the scale.
   * Corrected (item excluded from the total), which is the form that is
   * conventionally flagged at < .30.
   */
  correctedItemTotal: number;
}

export interface ScaleStats {
  n: number;
  items: number;
  itemStats: ItemStats[];
  /** Cronbach's alpha. Assumes tau-equivalence; see `omegaTotal`. */
  alpha: number;
  /** Percentile bootstrap CI for alpha. */
  alphaCI: [number, number];
  /** McDonald's omega-total from a single-factor congeneric model. */
  omegaTotal: number;
  averageInterItem: number;
  /** Mean of the scale total across respondents. */
  scaleMean: number;
  scaleSd: number;
}

/* ------------------------------------------------------------------ *
 * Elementary statistics. Sample (n-1) denominators throughout, which
 * is what psychometric software reports.
 * ------------------------------------------------------------------ */

export function mean(xs: number[]): number {
  if (xs.length === 0) return Number.NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[]): number {
  if (xs.length < 2) return Number.NaN;
  const m = mean(xs);
  return xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
}

export function sd(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

export function covariance(xs: number[], ys: number[]): number {
  if (xs.length !== ys.length) throw new Error("covariance: length mismatch");
  if (xs.length < 2) return Number.NaN;
  const mx = mean(xs);
  const my = mean(ys);
  let acc = 0;
  for (let i = 0; i < xs.length; i++) acc += (xs[i] - mx) * (ys[i] - my);
  return acc / (xs.length - 1);
}

export function correlation(xs: number[], ys: number[]): number {
  const denom = sd(xs) * sd(ys);
  // A constant vector has no correlation with anything; report 0 rather than
  // NaN so one dead item cannot poison an entire matrix.
  if (!Number.isFinite(denom) || denom === 0) return 0;
  return covariance(xs, ys) / denom;
}

/* ------------------------------------------------------------------ *
 * Complete-case handling
 * ------------------------------------------------------------------ */

/**
 * Drops rows with any missing answer.
 *
 * Listwise deletion is the honest default for alpha, which is defined on a
 * complete covariance matrix. Pairwise deletion can produce a non-positive
 * definite matrix and an alpha above 1, which is a statistic that does not
 * exist. The number dropped is reported so a reader can judge the cost.
 */
export function completeCases(matrix: ResponseMatrix): { rows: number[][]; dropped: number } {
  const width = matrix[0]?.length ?? 0;
  const rows: number[][] = [];
  let dropped = 0;
  for (const row of matrix) {
    if (row.length !== width) throw new Error("completeCases: ragged matrix");
    if (row.some((v) => v === null || !Number.isFinite(v))) {
      dropped += 1;
      continue;
    }
    rows.push(row as number[]);
  }
  return { rows, dropped };
}

function column(rows: number[][], j: number): number[] {
  return rows.map((r) => r[j]);
}

function rowTotals(rows: number[][]): number[] {
  return rows.map((r) => r.reduce((a, b) => a + b, 0));
}

/* ------------------------------------------------------------------ *
 * Reliability
 * ------------------------------------------------------------------ */

/**
 * Cronbach's alpha.
 *
 *   alpha = (k / (k - 1)) * (1 - sum(item variances) / variance(total))
 *
 * Assumes every item measures the construct equally well (tau-equivalence).
 * Interest scales rarely satisfy that, which is why `omegaTotal` is reported
 * alongside it rather than instead of it — alpha is included because the RIASEC
 * literature reports alpha, so it is what makes this instrument comparable.
 */
export function cronbachAlpha(matrix: ResponseMatrix): number {
  const { rows } = completeCases(matrix);
  const k = rows[0]?.length ?? 0;
  if (k < 2 || rows.length < 2) return Number.NaN;

  let sumItemVar = 0;
  for (let j = 0; j < k; j++) sumItemVar += variance(column(rows, j));
  const totalVar = variance(rowTotals(rows));
  if (!Number.isFinite(totalVar) || totalVar === 0) return Number.NaN;

  return (k / (k - 1)) * (1 - sumItemVar / totalVar);
}

/**
 * Percentile bootstrap confidence interval for alpha.
 *
 * Resamples respondents with replacement. Seeded so a reported interval is
 * reproducible from the dataset alone — an unseeded CI cannot be checked by
 * anyone else, which defeats the point of publishing it.
 */
export function alphaConfidenceInterval(
  matrix: ResponseMatrix,
  { resamples = 2000, level = 0.95, seed = 20260730 } = {},
): [number, number] {
  const { rows } = completeCases(matrix);
  if (rows.length < 3) return [Number.NaN, Number.NaN];

  const rand = mulberry32(seed);
  const estimates: number[] = [];

  for (let b = 0; b < resamples; b++) {
    const sample: number[][] = [];
    for (let i = 0; i < rows.length; i++) {
      sample.push(rows[Math.floor(rand() * rows.length)]);
    }
    const a = cronbachAlpha(sample);
    if (Number.isFinite(a)) estimates.push(a);
  }

  if (estimates.length === 0) return [Number.NaN, Number.NaN];
  estimates.sort((x, y) => x - y);
  const lo = quantile(estimates, (1 - level) / 2);
  const hi = quantile(estimates, 1 - (1 - level) / 2);
  return [lo, hi];
}

function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

/** Deterministic PRNG so bootstrap intervals are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Correlation matrix, eigendecomposition, and omega
 * ------------------------------------------------------------------ */

export function correlationMatrix(rows: number[][]): number[][] {
  const k = rows[0]?.length ?? 0;
  const cols = Array.from({ length: k }, (_, j) => column(rows, j));
  const out: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      const r = i === j ? 1 : correlation(cols[i], cols[j]);
      out[i][j] = r;
      out[j][i] = r;
    }
  }
  return out;
}

/**
 * Jacobi eigenvalue iteration for real symmetric matrices.
 *
 * Chosen over a library because it is short enough to read and verify, and
 * because a validation pipeline should not silently change its numbers when a
 * dependency is upgraded. Returns eigenvalues descending with matching
 * eigenvectors as columns.
 */
export function jacobiEigen(
  input: number[][],
  { maxSweeps = 100, tolerance = 1e-12 } = {},
): { values: number[]; vectors: number[][] } {
  const n = input.length;
  const a = input.map((row) => [...row]);
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < tolerance) break;

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t =
          Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;

        for (let i = 0; i < n; i++) {
          const aip = a[i][p];
          const aiq = a[i][q];
          a[i][p] = c * aip - s * aiq;
          a[i][q] = s * aip + c * aiq;
        }
        for (let i = 0; i < n; i++) {
          const api = a[p][i];
          const aqi = a[q][i];
          a[p][i] = c * api - s * aqi;
          a[q][i] = s * api + c * aqi;
        }
        for (let i = 0; i < n; i++) {
          const vip = v[i][p];
          const viq = v[i][q];
          v[i][p] = c * vip - s * viq;
          v[i][q] = s * vip + c * viq;
        }
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => a[y][y] - a[x][x]);
  return {
    values: order.map((i) => a[i][i]),
    vectors: Array.from({ length: n }, (_, r) => order.map((i) => v[r][i])),
  };
}

/**
 * McDonald's omega-total for a single-factor congeneric model.
 *
 *   omega = (sum L)^2 / ((sum L)^2 + sum(1 - L^2))
 *
 * Loadings L come from principal axis factoring: the correlation matrix with
 * iteratively re-estimated communalities on the diagonal, first factor taken.
 *
 * The single-factor assumption is the limitation to state when reporting this.
 * If a scale is not unidimensional, omega-total from one factor is not the right
 * estimator and the pilot should fit a proper measurement model instead. This
 * is a screening statistic, not a substitute for a confirmatory factor analysis.
 */
export function omegaTotal(matrix: ResponseMatrix, { iterations = 50 } = {}): number {
  const { rows } = completeCases(matrix);
  const k = rows[0]?.length ?? 0;
  if (k < 3 || rows.length < 3) return Number.NaN;

  const r = correlationMatrix(rows);
  // Start communalities at the largest absolute off-diagonal correlation, the
  // conventional cheap initial estimate.
  let h = Array.from({ length: k }, (_, i) =>
    Math.max(...r[i].filter((_, j) => j !== i).map(Math.abs)),
  );

  let loadings = new Array(k).fill(0);
  for (let it = 0; it < iterations; it++) {
    const reduced = r.map((row, i) => row.map((x, j) => (i === j ? h[i] : x)));
    const { values, vectors } = jacobiEigen(reduced);
    const lambda = Math.max(values[0], 0);
    const scale = Math.sqrt(lambda);
    loadings = Array.from({ length: k }, (_, i) => vectors[i][0] * scale);
    // Sign is arbitrary in an eigenvector; orient the factor positively so the
    // sum of loadings is not accidentally negative.
    const positive = loadings.reduce((a, b) => a + b, 0) >= 0;
    if (!positive) loadings = loadings.map((x) => -x);

    const nextH = loadings.map((l) => Math.min(l * l, 0.999));
    const delta = Math.max(...nextH.map((x, i) => Math.abs(x - h[i])));
    h = nextH;
    if (delta < 1e-8) break;
  }

  const sumL = loadings.reduce((a, b) => a + b, 0);
  const sumErr = loadings.reduce((acc, l) => acc + (1 - l * l), 0);
  const denom = sumL * sumL + sumErr;
  if (denom === 0) return Number.NaN;
  return (sumL * sumL) / denom;
}

/* ------------------------------------------------------------------ *
 * Item and scale reports
 * ------------------------------------------------------------------ */

export function itemStatistics(matrix: ResponseMatrix, scalePoints: number[]): ItemStats[] {
  const { rows } = completeCases(matrix);
  const k = rows[0]?.length ?? 0;
  const totals = rowTotals(rows);

  return Array.from({ length: k }, (_, j) => {
    const col = column(rows, j);
    const rest = totals.map((t, i) => t - rows[i][j]);
    const counts: Record<number, number> = {};
    for (const p of scalePoints) counts[p] = 0;
    for (const v of col) counts[v] = (counts[v] ?? 0) + 1;
    const distribution: Record<number, number> = {};
    for (const p of scalePoints) distribution[p] = col.length ? counts[p] / col.length : 0;

    return {
      index: j,
      n: col.length,
      mean: mean(col),
      sd: sd(col),
      distribution,
      correctedItemTotal: correlation(col, rest),
    };
  });
}

export function scaleStatistics(matrix: ResponseMatrix, scalePoints: number[]): ScaleStats {
  const { rows } = completeCases(matrix);
  const k = rows[0]?.length ?? 0;
  const totals = rowTotals(rows);
  const r = k >= 2 ? correlationMatrix(rows) : [];

  let offDiagonalSum = 0;
  let offDiagonalCount = 0;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      offDiagonalSum += r[i][j];
      offDiagonalCount += 1;
    }
  }

  return {
    n: rows.length,
    items: k,
    itemStats: itemStatistics(matrix, scalePoints),
    alpha: cronbachAlpha(matrix),
    alphaCI: alphaConfidenceInterval(matrix),
    omegaTotal: omegaTotal(matrix),
    averageInterItem: offDiagonalCount ? offDiagonalSum / offDiagonalCount : Number.NaN,
    scaleMean: mean(totals),
    scaleSd: sd(totals),
  };
}
