/**
 * End-to-end recovery test for the analysis pipeline.
 *
 * The individual statistics are checked against hand-computed values in
 * psychometrics.test.ts. This file checks something different and, for a
 * validation study, more important: that the *whole chain* — dataset assembly,
 * dimension scoring, scale intercorrelation, circumplex test — recovers a
 * structure that was put in deliberately.
 *
 * On real participant data there is no ground truth, so if the chain is wrong
 * nothing will reveal it. Simulating a known circumplex is the only opportunity
 * to find that out.
 *
 * To state the obvious because it is the easiest thing here to misread:
 * **nothing in this file says anything about the instrument.** Simulated
 * respondents have no interests. This is a self-test of the arithmetic.
 */
import { describe, expect, it } from "vitest";
import { cronbachAlpha, mulberry32 } from "@/lib/research/psychometrics";
import {
  DATASET_SCHEMA,
  dimensionScores,
  mergeDatasets,
  scaleCorrelationMatrix,
  scaleMatrix,
  type PilotDataset,
} from "@/lib/research/dataset";
import {
  circumplexCorrespondence,
  meanCorrelationByDistance,
  RIASEC_ORDER,
} from "@/lib/research/circumplex";

const DIMS = [...RIASEC_ORDER];
const ITEMS_PER_DIM = 5;
const SCALE = [1, 2, 3, 4, 5];

function makeNormal(rand: () => number) {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = rand() * 2 - 1;
      v = rand() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const f = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * f;
    return u * f;
  };
}

function discretise(x: number): number {
  if (x < -1.2) return 1;
  if (x < -0.4) return 2;
  if (x < 0.4) return 3;
  if (x < 1.2) return 4;
  return 5;
}

/**
 * Builds a dataset from an exact circumplex.
 *
 * Six latent dimensions are unit vectors 60 degrees apart in a plane, so
 * corr(z_i, z_j) = cos(theta_i - theta_j): +0.5 adjacent, -0.5 alternate,
 * -1.0 opposite. Items load on their own dimension at `loading`.
 */
function simulate({ n = 300, loading = 0.75, seed = 7 } = {}): PilotDataset {
  const rand = mulberry32(seed);
  const normal = makeNormal(rand);

  const itemOrder: string[] = [];
  const itemDimensions: string[] = [];
  for (let k = 1; k <= ITEMS_PER_DIM; k++) {
    for (const d of DIMS) {
      itemOrder.push(`SIM-${d}-${k}`);
      itemDimensions.push(d);
    }
  }

  const participants = Array.from({ length: n }, (_, p) => {
    const u = normal();
    const v = normal();
    const latent = DIMS.map((_, i) => {
      const theta = (i * Math.PI) / 3;
      return Math.cos(theta) * u + Math.sin(theta) * v;
    });

    const answers: Record<string, number> = {};
    itemOrder.forEach((id, idx) => {
      const d = DIMS.indexOf(itemDimensions[idx] as (typeof DIMS)[number]);
      const unique = Math.sqrt(Math.max(0, 1 - loading * loading)) * normal();
      answers[id] = discretise(loading * latent[d] + unique);
    });

    return {
      participantId: `sim-${p}`,
      language: p % 2 ? "th" : "en",
      tier: "UPPER_SECONDARY",
      answers,
      secondsPerItem: itemOrder.map(() => 3),
      revisions: {},
      startedAt: new Date().toISOString(),
      exportedAt: new Date().toISOString(),
    };
  });

  return {
    meta: {
      schema: DATASET_SCHEMA,
      instrument: "simulated-circumplex-v1",
      itemOrder,
      itemDimensions,
      scalePoints: SCALE,
      exportedAt: new Date().toISOString(),
    },
    participants,
  };
}

describe("the pipeline recovers a known circumplex", () => {
  const dataset = simulate({ n: 300, loading: 0.75, seed: 7 });

  it("recovers the predicted order of correlations by circular distance", () => {
    const { matrix, n } = scaleCorrelationMatrix(dataset, DIMS, 1, 5);
    expect(n).toBe(300);
    const means = meanCorrelationByDistance(matrix);
    expect(means[1]).toBeGreaterThan(means[2]);
    expect(means[2]).toBeGreaterThan(means[3]);
  });

  it("returns a correspondence index of 1 for a perfect latent circumplex", () => {
    const { matrix } = scaleCorrelationMatrix(dataset, DIMS, 1, 5);
    const result = circumplexCorrespondence(matrix);
    expect(result.ci).toBe(1);
    expect(result.predictionsMet).toBe(72);
    expect(result.predictionsViolated).toBe(0);
    // Only the 12 dihedral relabellings of a circle can match a perfect one.
    expect(result.p).toBeCloseTo(12 / 720, 12);
  });

  it("attenuates the observed correlation by the scales' reliability, as theory predicts", () => {
    // Classical test theory: an observed correlation is the true correlation
    // multiplied by the square root of each scale's reliability. With alpha
    // about the same for both scales that is r_true * alpha.
    //
    // This is the assertion that ties the reliability arithmetic and the
    // structural arithmetic together — if either were wrong independently, this
    // relationship would not hold.
    const { matrix } = scaleCorrelationMatrix(dataset, DIMS, 1, 5);
    const means = meanCorrelationByDistance(matrix);

    const alphas = DIMS.map((d) => cronbachAlpha(scaleMatrix(dataset, d)));
    const meanAlpha = alphas.reduce((a, b) => a + b, 0) / alphas.length;

    // True adjacent correlation is cos(60 degrees) = 0.5.
    const predicted = 0.5 * meanAlpha;
    expect(means[1]).toBeCloseTo(predicted, 1);
  });

  it("produces reliabilities consistent with the loading it was built from", () => {
    // Every scale is built the same way, so they should land in a narrow band.
    const alphas = DIMS.map((d) => cronbachAlpha(scaleMatrix(dataset, d)));
    for (const a of alphas) {
      expect(a).toBeGreaterThan(0.75);
      expect(a).toBeLessThan(0.95);
    }
    expect(Math.max(...alphas) - Math.min(...alphas)).toBeLessThan(0.15);
  });

  it("fails to find a circumplex when there is none", () => {
    // Independent dimensions: the structural test must not report structure.
    const rand = mulberry32(99);
    const flat = simulate({ n: 200, loading: 0.75, seed: 3 });
    for (const p of flat.participants) {
      for (const id of flat.meta.itemOrder) p.answers[id] = Math.floor(rand() * 5) + 1;
    }
    const { matrix } = scaleCorrelationMatrix(flat, DIMS, 1, 5);
    const result = circumplexCorrespondence(matrix);
    // With no latent structure the index should be far from 1 and the
    // randomisation p-value should not be significant.
    expect(result.ci).toBeLessThan(0.6);
    expect(result.p).toBeGreaterThan(0.05);
  });

  it("recovers dimension scores on the 0..1 scale the engine uses", () => {
    const scores = dimensionScores(dataset, "R", 1, 5);
    expect(scores).toHaveLength(300);
    for (const s of scores) {
      expect(s).not.toBeNull();
      expect(s as number).toBeGreaterThanOrEqual(0);
      expect(s as number).toBeLessThanOrEqual(1);
    }
  });
});

describe("dataset merging refuses to pool incompatible files", () => {
  const base = simulate({ n: 2, seed: 1 });

  const asFile = (d: PilotDataset, source: string) => ({ source, data: d });

  it("merges compatible single-participant files", () => {
    const a = simulate({ n: 1, seed: 1 });
    const b = simulate({ n: 1, seed: 2 });
    b.participants[0].participantId = "other";
    const merged = mergeDatasets([asFile(a, "a.json"), asFile(b, "b.json")]);
    expect(merged.dataset.participants).toHaveLength(2);
    expect(merged.rejected).toEqual([]);
  });

  it("rejects a different instrument rather than pooling it", () => {
    const other = simulate({ n: 1, seed: 5 });
    other.meta.instrument = "something-else";
    other.participants[0].participantId = "x";
    const merged = mergeDatasets([asFile(base, "a.json"), asFile(other, "b.json")]);
    expect(merged.dataset.participants).toHaveLength(2);
    expect(merged.rejected).toHaveLength(1);
    expect(merged.rejected[0].reason).toMatch(/instrument/);
  });

  it("rejects a different item order, because the columns would not line up", () => {
    const shuffled = simulate({ n: 1, seed: 6 });
    shuffled.meta.itemOrder = [...shuffled.meta.itemOrder].reverse();
    shuffled.participants[0].participantId = "y";
    const merged = mergeDatasets([asFile(base, "a.json"), asFile(shuffled, "b.json")]);
    expect(merged.rejected.some((r) => /item order/.test(r.reason))).toBe(true);
  });

  it("drops a duplicate participant instead of counting them twice", () => {
    const merged = mergeDatasets([asFile(base, "a.json"), asFile(base, "again.json")]);
    expect(merged.dataset.participants).toHaveLength(2);
    expect(merged.duplicates).toHaveLength(2);
  });

  it("rejects a file that is not a dataset at all", () => {
    const merged = mergeDatasets([{ source: "junk.json", data: { hello: 1 } }]);
    expect(merged.dataset.participants).toHaveLength(0);
    expect(merged.rejected[0].reason).toMatch(/not a pilot dataset/);
  });
});
