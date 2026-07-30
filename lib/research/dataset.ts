/**
 * The pilot dataset format.
 *
 * One exported file is one participant. A facilitator collects a directory of
 * them and `scripts/analyse.mjs` merges the directory into a report. That shape
 * follows from the product's architecture rather than being chosen for elegance:
 * there is no server, answers never leave the browser, so the only honest way to
 * assemble a dataset is for each participant to hand one over deliberately.
 *
 * Two properties the format is designed to guarantee:
 *
 *  - **Anonymity by construction.** There is no name, no school, no session id,
 *    no free text. The participant id is random per browser. Education tier and
 *    language are included because the analysis has to stratify by them, and
 *    both are coarse enough not to identify anyone.
 *  - **Self-describing.** Every file carries the instrument id, the item order
 *    and the scale points it was administered with. A dataset that cannot say
 *    which version of an instrument produced it is not analysable later, and
 *    this instrument is expected to be revised after the pilot.
 *
 * The optional free-text answer is deliberately excluded. It is the one field
 * that could identify a learner, it is not scored psychometrically, and a
 * dataset that cannot leak it is better than a policy promising not to read it.
 */

export const DATASET_SCHEMA = 1;

export interface DatasetMeta {
  schema: number;
  /** Instrument id from data/questions.json, e.g. "futureme-interest-v2". */
  instrument: string;
  /** Item ids in administered order. */
  itemOrder: string[];
  /** Dimension for each item, index-aligned with `itemOrder`. */
  itemDimensions: string[];
  scalePoints: number[];
  exportedAt: string;
}

export interface ParticipantRecord {
  participantId: string;
  /** Interface language the instrument was answered in. */
  language: string;
  /** Education tier, for stratification. Null when not answered. */
  tier: string | null;
  /** Answers keyed by item id. Missing keys mean unanswered. */
  answers: Record<string, number>;
  /** Seconds to first answer per item, index-aligned with `itemOrder`. */
  secondsPerItem: (number | null)[];
  /** Times the answer was changed, per item id. */
  revisions: Record<string, number>;
  startedAt: string;
  exportedAt: string;
}

export interface PilotDataset {
  meta: DatasetMeta;
  participants: ParticipantRecord[];
}

/** A single-participant dataset, as one browser exports it. */
export function buildDataset(
  meta: Omit<DatasetMeta, "schema" | "exportedAt">,
  participant: Omit<ParticipantRecord, "exportedAt">,
): PilotDataset {
  const exportedAt = new Date().toISOString();
  return {
    meta: { ...meta, schema: DATASET_SCHEMA, exportedAt },
    participants: [{ ...participant, exportedAt }],
  };
}

export interface MergeResult {
  dataset: PilotDataset;
  /** Files rejected, with the reason, so a merge is never silently partial. */
  rejected: { source: string; reason: string }[];
  /** Participant ids that appeared more than once; later copies dropped. */
  duplicates: string[];
}

/**
 * Merges per-participant files into one dataset.
 *
 * Rejects rather than coerces. A file from a different instrument version, or
 * with a different item order, cannot be pooled with the others without
 * silently comparing answers to different questions — so it is set aside and
 * reported. Pooling incompatible data is the failure mode that produces a
 * published number nobody can reproduce.
 */
export function mergeDatasets(files: { source: string; data: unknown }[]): MergeResult {
  const rejected: { source: string; reason: string }[] = [];
  const duplicates: string[] = [];
  const participants: ParticipantRecord[] = [];
  const seen = new Set<string>();
  let meta: DatasetMeta | null = null;

  for (const { source, data } of files) {
    const parsed = data as Partial<PilotDataset> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.meta || !Array.isArray(parsed.participants)) {
      rejected.push({ source, reason: "not a pilot dataset" });
      continue;
    }
    const m = parsed.meta;
    if (m.schema !== DATASET_SCHEMA) {
      rejected.push({ source, reason: `schema ${String(m.schema)} != ${DATASET_SCHEMA}` });
      continue;
    }
    if (!meta) {
      meta = m;
    } else {
      if (m.instrument !== meta.instrument) {
        rejected.push({ source, reason: `instrument ${m.instrument} != ${meta.instrument}` });
        continue;
      }
      if (m.itemOrder.join("|") !== meta.itemOrder.join("|")) {
        rejected.push({ source, reason: "different item order" });
        continue;
      }
      if (m.scalePoints.join("|") !== meta.scalePoints.join("|")) {
        rejected.push({ source, reason: "different scale points" });
        continue;
      }
    }

    for (const p of parsed.participants) {
      if (!p || typeof p.participantId !== "string") {
        rejected.push({ source, reason: "participant without an id" });
        continue;
      }
      if (seen.has(p.participantId)) {
        duplicates.push(p.participantId);
        continue;
      }
      seen.add(p.participantId);
      participants.push(p);
    }
  }

  return {
    dataset: {
      meta:
        meta ??
        {
          schema: DATASET_SCHEMA,
          instrument: "unknown",
          itemOrder: [],
          itemDimensions: [],
          scalePoints: [],
          exportedAt: new Date().toISOString(),
        },
      participants,
    },
    rejected,
    duplicates,
  };
}

/**
 * Response matrix for one dimension, rows = participants, columns = items.
 *
 * Column order follows `itemOrder`, so the matrix is comparable across
 * participants even if a browser somehow wrote its answer keys differently.
 */
export function scaleMatrix(dataset: PilotDataset, dimension: string): (number | null)[][] {
  const columns = dataset.meta.itemOrder.filter(
    (_, i) => dataset.meta.itemDimensions[i] === dimension,
  );
  return dataset.participants.map((p) =>
    columns.map((id) => {
      const v = p.answers[id];
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    }),
  );
}

/** Item ids belonging to a dimension, in administered order. */
export function itemsForDimension(dataset: PilotDataset, dimension: string): string[] {
  return dataset.meta.itemOrder.filter((_, i) => dataset.meta.itemDimensions[i] === dimension);
}

/**
 * Per-participant dimension scores on the 0..1 scale the engine uses.
 *
 * Mirrors `normaliseInterests`: the mean of answered items, rescaled, with
 * unanswered items excluded rather than counted as zero. Duplicated here rather
 * than imported so the analysis pipeline has no dependency on the product's
 * client-side code — if the two ever disagree, that is a finding in itself, and
 * `tests/unit/dataset.test.ts` asserts they agree.
 */
export function dimensionScores(
  dataset: PilotDataset,
  dimension: string,
  scaleMin: number,
  scaleMax: number,
): (number | null)[] {
  const ids = itemsForDimension(dataset, dimension);
  return dataset.participants.map((p) => {
    const values = ids
      .map((id) => p.answers[id])
      .filter((v): v is number => typeof v === "number" && v >= scaleMin && v <= scaleMax);
    if (values.length === 0) return null;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return (mean - scaleMin) / (scaleMax - scaleMin);
  });
}

/**
 * The 6x6 scale intercorrelation matrix the circumplex test consumes.
 *
 * Participants missing a dimension entirely are excluded listwise, because a
 * correlation matrix assembled from different subsets per cell can fail to be
 * positive definite and produce structural statistics that mean nothing.
 */
export function scaleCorrelationMatrix(
  dataset: PilotDataset,
  dimensions: string[],
  scaleMin: number,
  scaleMax: number,
): { matrix: number[][]; n: number } {
  const columns = dimensions.map((d) => dimensionScores(dataset, d, scaleMin, scaleMax));
  const keep: number[] = [];
  for (let i = 0; i < dataset.participants.length; i++) {
    if (columns.every((c) => c[i] !== null)) keep.push(i);
  }

  const vectors = columns.map((c) => keep.map((i) => c[i] as number));
  const k = dimensions.length;
  const matrix: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));

  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      matrix[i][j] = i === j ? 1 : pearson(vectors[i], vectors[j]);
      matrix[j][i] = matrix[i][j];
    }
  }
  return { matrix, n: keep.length };
}

function pearson(xs: number[], ys: number[]): number {
  if (xs.length < 3) return 0;
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
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}
