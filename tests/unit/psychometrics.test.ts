/**
 * Correctness of the analysis pipeline.
 *
 * These are the tests that make a future finding citable. An instrument cannot
 * be validated without participants, but the arithmetic that will be applied to
 * those participants *can* be verified now — and if it is wrong, every number
 * in the eventual report is wrong in a way no reviewer would catch.
 *
 * So the reference values here are computed by hand, from a dataset small
 * enough to check on paper, and written into the test as constants. A test that
 * only compares the code against itself proves nothing.
 */
import { describe, expect, it } from "vitest";
import {
  alphaConfidenceInterval,
  completeCases,
  correlation,
  correlationMatrix,
  cronbachAlpha,
  itemStatistics,
  jacobiEigen,
  mean,
  mulberry32,
  omegaTotal,
  scaleStatistics,
  sd,
  variance,
} from "@/lib/research/psychometrics";
import {
  circularDistance,
  circumplexCorrespondence,
  meanCorrelationByDistance,
  orderPredictions,
} from "@/lib/research/circumplex";

/**
 * Worked example, 4 respondents x 3 items. Every value below was computed by
 * hand; the derivation is in the comments so it can be re-checked.
 *
 *   item 1: 1 2 4 5   mean 3.0   var 10/3 = 3.33333
 *   item 2: 2 3 4 5   mean 3.5   var  5/3 = 1.66667
 *   item 3: 2 3 5 4   mean 3.5   var  5/3 = 1.66667
 *   sum of item variances = 20/3 = 6.66667
 *   totals: 5 8 13 14   mean 10   var 54/3 = 18
 *   alpha = (3/2)(1 - (20/3)/18) = 1.5 * 0.629630 = 0.944444
 */
const WORKED = [
  [1, 2, 2],
  [2, 3, 3],
  [4, 4, 5],
  [5, 5, 4],
];

describe("elementary statistics use sample denominators", () => {
  it("computes mean, variance and sd with n-1", () => {
    expect(mean([1, 2, 4, 5])).toBe(3);
    // SS = 4 + 1 + 1 + 4 = 10, divided by n-1 = 3
    expect(variance([1, 2, 4, 5])).toBeCloseTo(10 / 3, 12);
    expect(sd([1, 2, 4, 5])).toBeCloseTo(Math.sqrt(10 / 3), 12);
  });

  it("returns NaN rather than 0 for a single observation", () => {
    expect(Number.isNaN(variance([3]))).toBe(true);
  });

  it("returns 0 correlation against a constant instead of NaN", () => {
    // One dead item must not poison an entire matrix with NaN.
    expect(correlation([1, 2, 3, 4], [2, 2, 2, 2])).toBe(0);
  });

  it("reproduces a correlation with a closed form", () => {
    // item1 devs: -2 -1  1  2   var = 10/3
    // rest sums:   4  6  9  9   mean 7, devs -3 -1 2 2, var = 18/3 = 6
    // cov = (6 + 1 + 2 + 4)/3 = 13/3
    // r = (13/3) / sqrt((10/3) * 6) = (13/3) / sqrt(20)
    //
    // Written as the closed form rather than a decimal on purpose: the first
    // version of this test carried a hand-divided constant that was wrong in
    // the fifth decimal, and the test failed against correct code. An expression
    // the reader can re-derive is safer than a number they have to trust.
    const expected = 13 / 3 / Math.sqrt(20);
    expect(expected).toBeCloseTo(0.96896279, 8);
    expect(correlation([1, 2, 4, 5], [4, 6, 9, 9])).toBeCloseTo(expected, 12);
  });
});

describe("Cronbach's alpha", () => {
  it("matches the hand-computed value on the worked example", () => {
    expect(cronbachAlpha(WORKED)).toBeCloseTo(0.9444444, 7);
  });

  it("is 0 when items are uncorrelated by construction", () => {
    // Orthogonal columns: no shared variance, so no internal consistency.
    const orthogonal = [
      [1, 1],
      [1, 5],
      [5, 1],
      [5, 5],
    ];
    expect(cronbachAlpha(orthogonal)).toBeCloseTo(0, 10);
  });

  it("goes negative when an item runs against the others", () => {
    // A reverse-keyed item left un-reversed is the classic cause. Alpha must be
    // allowed to report the problem rather than being clamped to look healthy.
    const flipped = WORKED.map(([a, b, c]) => [a, b, 6 - c]);
    expect(cronbachAlpha(flipped)).toBeLessThan(0);
  });

  it("refuses to report a value from too little data", () => {
    expect(Number.isNaN(cronbachAlpha([[1, 2, 3]]))).toBe(true);
    expect(Number.isNaN(cronbachAlpha(WORKED.map((r) => [r[0]])))).toBe(true);
  });

  it("is unchanged by adding a constant to every response", () => {
    // Alpha is a function of covariances, so a location shift must not move it.
    const shifted = WORKED.map((r) => r.map((v) => v + 10));
    expect(cronbachAlpha(shifted)).toBeCloseTo(cronbachAlpha(WORKED), 12);
  });
});

describe("bootstrap confidence interval", () => {
  const data = Array.from({ length: 60 }, (_, i) => {
    // A deterministic dataset with real covariance structure.
    const base = (i % 5) + 1;
    return [base, Math.min(5, base + (i % 2)), Math.max(1, base - (i % 3 === 0 ? 1 : 0))];
  });

  it("brackets the point estimate", () => {
    const alpha = cronbachAlpha(data);
    const [lo, hi] = alphaConfidenceInterval(data, { resamples: 400 });
    expect(lo).toBeLessThanOrEqual(alpha);
    expect(hi).toBeGreaterThanOrEqual(alpha);
  });

  it("is reproducible from the same seed, and moves with a different one", () => {
    const a = alphaConfidenceInterval(data, { resamples: 300, seed: 1 });
    const b = alphaConfidenceInterval(data, { resamples: 300, seed: 1 });
    const c = alphaConfidenceInterval(data, { resamples: 300, seed: 2 });
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });

  it("produces a narrower interval from more respondents", () => {
    const width = ([lo, hi]: [number, number]) => hi - lo;
    const small = alphaConfidenceInterval(data.slice(0, 15), { resamples: 400 });
    const large = alphaConfidenceInterval([...data, ...data, ...data], { resamples: 400 });
    expect(width(large)).toBeLessThan(width(small));
  });
});

describe("Jacobi eigendecomposition", () => {
  it("recovers eigenvalues of a matrix with a known solution", () => {
    // [[2,1],[1,2]] has eigenvalues 3 and 1.
    const { values } = jacobiEigen([
      [2, 1],
      [1, 2],
    ]);
    expect(values[0]).toBeCloseTo(3, 10);
    expect(values[1]).toBeCloseTo(1, 10);
  });

  it("recovers eigenvalues of an equicorrelation matrix analytically", () => {
    // For a k x k matrix with 1 on the diagonal and r off it, the eigenvalues
    // are 1 + (k-1)r once and 1 - r with multiplicity k-1.
    const k = 4;
    const r = 0.5;
    const m = Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) => (i === j ? 1 : r)),
    );
    const { values } = jacobiEigen(m);
    expect(values[0]).toBeCloseTo(1 + (k - 1) * r, 10);
    for (let i = 1; i < k; i++) expect(values[i]).toBeCloseTo(1 - r, 10);
  });

  it("returns orthonormal eigenvectors", () => {
    const m = [
      [4, 1, 0],
      [1, 3, 1],
      [0, 1, 2],
    ];
    const { vectors } = jacobiEigen(m);
    for (let c = 0; c < 3; c++) {
      let norm = 0;
      for (let r0 = 0; r0 < 3; r0++) norm += vectors[r0][c] ** 2;
      expect(norm).toBeCloseTo(1, 9);
    }
    // Columns 0 and 1 must be orthogonal.
    let dot = 0;
    for (let r0 = 0; r0 < 3; r0++) dot += vectors[r0][0] * vectors[r0][1];
    expect(dot).toBeCloseTo(0, 9);
  });

  it("sorts eigenvalues descending", () => {
    const { values } = jacobiEigen([
      [1, 0.2, 0.1],
      [0.2, 1, 0.3],
      [0.1, 0.3, 1],
    ]);
    expect(values[0]).toBeGreaterThanOrEqual(values[1]);
    expect(values[1]).toBeGreaterThanOrEqual(values[2]);
  });
});

describe("omega-total", () => {
  it("is high for a strongly unidimensional scale", () => {
    // Items that all track one underlying value closely.
    const rows = Array.from({ length: 40 }, (_, i) => {
      const t = (i % 5) + 1;
      return [t, t, t, Math.min(5, Math.max(1, t + (i % 7 === 0 ? 1 : 0)))];
    });
    expect(omegaTotal(rows)).toBeGreaterThan(0.9);
  });

  it("is low when items share almost nothing", () => {
    // Independent columns from a seeded PRNG. An earlier version of this test
    // used (i*3)%5, (i*7)%5 ... which are all permutations of i%5 and therefore
    // perfectly dependent — omega was correctly high and the test was wrong.
    const rand = mulberry32(4242);
    const rows = Array.from({ length: 300 }, () =>
      Array.from({ length: 4 }, () => Math.floor(rand() * 5) + 1),
    );
    expect(omegaTotal(rows)).toBeLessThan(0.5);
  });

  it("stays inside 0..1", () => {
    const rows = Array.from({ length: 30 }, (_, i) => [
      (i % 5) + 1,
      ((i * 2) % 5) + 1,
      ((i * 4) % 5) + 1,
    ]);
    const w = omegaTotal(rows);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(1);
  });
});

describe("missing data", () => {
  it("drops incomplete rows listwise and reports how many", () => {
    const withGaps = [...WORKED, [1, null, 3], [2, 2, null]];
    const { rows, dropped } = completeCases(withGaps);
    expect(rows).toHaveLength(4);
    expect(dropped).toBe(2);
  });

  it("computes alpha on complete cases only, unchanged by added gaps", () => {
    const withGaps = [...WORKED, [1, null, 3]];
    expect(cronbachAlpha(withGaps)).toBeCloseTo(cronbachAlpha(WORKED), 12);
  });

  it("rejects a ragged matrix rather than guessing", () => {
    expect(() => completeCases([[1, 2, 3], [1, 2]])).toThrow(/ragged/);
  });
});

describe("item statistics", () => {
  const stats = itemStatistics(WORKED, [1, 2, 3, 4, 5]);

  it("reports hand-computed item means and SDs", () => {
    expect(stats[0].mean).toBeCloseTo(3, 12);
    expect(stats[0].sd).toBeCloseTo(Math.sqrt(10 / 3), 12);
    expect(stats[1].mean).toBeCloseTo(3.5, 12);
    expect(stats[1].sd).toBeCloseTo(Math.sqrt(5 / 3), 12);
  });

  it("reports the corrected item-total correlation, item excluded from the total", () => {
    // Item 1 against the sum of items 2 and 3 only: (13/3) / sqrt(20).
    expect(stats[0].correctedItemTotal).toBeCloseTo(13 / 3 / Math.sqrt(20), 12);
  });

  it("reports a response distribution that sums to 1 over the scale points", () => {
    for (const s of stats) {
      const total = Object.values(s.distribution).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1, 12);
    }
    // Item 1 was 1,2,4,5 — one response at each of those points, none at 3.
    expect(stats[0].distribution[3]).toBe(0);
    expect(stats[0].distribution[1]).toBeCloseTo(0.25, 12);
  });
});

describe("scale report", () => {
  it("assembles the numbers a pilot report needs", () => {
    const s = scaleStatistics(WORKED, [1, 2, 3, 4, 5]);
    expect(s.n).toBe(4);
    expect(s.items).toBe(3);
    expect(s.alpha).toBeCloseTo(0.9444444, 7);
    expect(s.scaleMean).toBeCloseTo(10, 12);
    expect(s.scaleSd).toBeCloseTo(Math.sqrt(18), 12);
    expect(s.itemStats).toHaveLength(3);
  });

  it("produces a symmetric correlation matrix with a unit diagonal", () => {
    const m = correlationMatrix(WORKED);
    for (let i = 0; i < 3; i++) {
      expect(m[i][i]).toBeCloseTo(1, 12);
      for (let j = 0; j < 3; j++) expect(m[i][j]).toBeCloseTo(m[j][i], 12);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Circumplex structural test
 * ------------------------------------------------------------------ */

describe("circular geometry", () => {
  it("computes distances around a six-point circle", () => {
    expect(circularDistance(0, 1)).toBe(1);
    expect(circularDistance(0, 5)).toBe(1); // wraps
    expect(circularDistance(0, 2)).toBe(2);
    expect(circularDistance(0, 3)).toBe(3); // opposite
    expect(circularDistance(4, 1)).toBe(3);
  });

  it("derives exactly the 72 order predictions the literature reports", () => {
    // 6 adjacent pairs, 6 alternate, 3 opposite:
    //   6*6 (adj>alt) + 6*3 (adj>opp) + 6*3 (alt>opp) = 72
    expect(orderPredictions(6)).toHaveLength(72);
  });
});

describe("circumplex correspondence", () => {
  /** Builds a 6x6 matrix whose correlations depend only on circular distance. */
  function byDistance(d1: number, d2: number, d3: number): number[][] {
    return Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 6 }, (_, j) => {
        if (i === j) return 1;
        return { 1: d1, 2: d2, 3: d3 }[circularDistance(i, j)] as number;
      }),
    );
  }

  it("returns CI = 1 for a perfect circumplex", () => {
    const result = circumplexCorrespondence(byDistance(0.6, 0.3, 0.1));
    expect(result.ci).toBe(1);
    expect(result.predictionsMet).toBe(72);
    expect(result.predictionsViolated).toBe(0);
    expect(result.totalPredictions).toBe(72);
  });

  it("returns CI = -1 when the order is exactly inverted", () => {
    const result = circumplexCorrespondence(byDistance(0.1, 0.3, 0.6));
    expect(result.ci).toBe(-1);
    expect(result.predictionsViolated).toBe(72);
  });

  it("returns CI = 0 when every correlation is identical", () => {
    // All predictions are ties: the model predicted inequalities and found none.
    const result = circumplexCorrespondence(byDistance(0.4, 0.4, 0.4));
    expect(result.ci).toBe(0);
    expect(result.ties).toBe(72);
    expect(result.predictionsMet).toBe(0);
  });

  it("counts ties in the denominator rather than discarding them", () => {
    // Adjacent > alternate = opposite. The 36 adjacency predictions hold; the
    // 18 alternate-vs-opposite predictions tie. Met 54, violated 0, ties 18.
    const result = circumplexCorrespondence(byDistance(0.6, 0.2, 0.2));
    expect(result.predictionsMet).toBe(54);
    expect(result.ties).toBe(18);
    expect(result.ci).toBeCloseTo(54 / 72, 12);
  });

  it("enumerates all 720 relabellings exactly", () => {
    const result = circumplexCorrespondence(byDistance(0.6, 0.3, 0.1));
    expect(result.permutations).toBe(720);
  });

  it("gives a perfect structure the smallest attainable p-value", () => {
    const result = circumplexCorrespondence(byDistance(0.6, 0.3, 0.1));
    // Rotations and the reflection of a circle preserve every distance, so a
    // perfect circumplex is matched by its 12 dihedral relabellings — 12/720.
    expect(result.p).toBeCloseTo(12 / 720, 12);
  });

  it("gives a flat matrix a p-value of 1", () => {
    // Nothing distinguishes any labelling, so no permutation does worse.
    expect(circumplexCorrespondence(byDistance(0.4, 0.4, 0.4)).p).toBe(1);
  });

  it("is unchanged by rotating the type labels", () => {
    // A circle has no privileged starting point, so CI must be rotation
    // invariant. This is the property that makes the statistic about structure
    // rather than about which type happens to be listed first.
    const m = byDistance(0.55, 0.28, 0.05);
    const rotate = (x: number[][]) => {
      const idx = [1, 2, 3, 4, 5, 0];
      return idx.map((i) => idx.map((j) => x[i][j]));
    };
    expect(circumplexCorrespondence(rotate(m)).ci).toBeCloseTo(
      circumplexCorrespondence(m).ci,
      12,
    );
  });

  it("detects the known RIASEC anomaly as a partial failure, not a pass", () => {
    // The O*NET manual's recurring finding: Enterprising correlates more with
    // Artistic (distance 2) than with Social (distance 1). Injecting exactly
    // that must pull CI below 1 without collapsing it.
    const m = byDistance(0.6, 0.3, 0.1);
    const E = 4;
    const S = 3;
    const A = 2;
    m[E][S] = 0.2;
    m[S][E] = 0.2; // adjacent, now weak
    m[E][A] = 0.5;
    m[A][E] = 0.5; // alternate, now strong
    const result = circumplexCorrespondence(m);
    expect(result.ci).toBeLessThan(1);
    expect(result.ci).toBeGreaterThan(0);
    expect(result.predictionsViolated).toBeGreaterThan(0);
  });

  it("rejects a matrix that is not 6x6 instead of returning a wrong number", () => {
    expect(() => circumplexCorrespondence([[1, 0], [0, 1]])).toThrow(/6x6/);
  });

  it("reports mean correlation by distance for diagnosing a failure", () => {
    const means = meanCorrelationByDistance(byDistance(0.6, 0.3, 0.1));
    expect(means[1]).toBeCloseTo(0.6, 12);
    expect(means[2]).toBeCloseTo(0.3, 12);
    expect(means[3]).toBeCloseTo(0.1, 12);
  });
});
