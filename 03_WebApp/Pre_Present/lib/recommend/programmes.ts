import packed from "@/data/programmes.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";

/**
 * Unpacks the programme index.
 *
 * A programme's RIASEC vector is its ISCED-F field's vector, and those are
 * measured — the mean interest profile of the O*NET occupations in that field,
 * rescaled to 0..1. They are no longer weights anybody chose. The one
 * judgement left in the chain is which occupations belong to a field, and that
 * is recorded per field in build/crosswalk_audit.md.
 */

interface Packed {
  meta: {
    programmes: number;
    institutions: number;
    fields: number;

    riasecSource: string;
    riasecStatus: string;
    costNote: string;
    missing: string[];
    coverageNote: string;
    source: string[];
  };
  /** [iscedCode, title, [R,I,A,S,E,C], occupationsBehindTheMean, thaiExamples] */
  fields: [string, string, number[], number, string[]][];
  /** [id, nameTh, provinceIso, provinceTh, tuitionBand, website] */
  institutions: [string, string, string, string, string, string][];
  titles: string[];
  levels: string[];
  /** [workingPct, studyingPct, tracked, graduates, smallSample, year] */
  outcomes: [number, number, number, number, number, string][];
  /** [titleIndex, institutionIndex, fieldIndex, seats, productionCost, levelIndex, outcomeIndex] */
  programmes: [number, number, number, number | null, number | null, number, number][];
}

const data = packed as unknown as Packed;

export interface Programme {
  title: string;
  institutionId: string;
  institutionTh: string;
  provinceIso: string;
  provinceTh: string;
  tuitionBand: string;
  /** The institution's own site, from the register. Empty when it has none — never guessed. */
  website: string;
  /** ISCED-F 2013 detailed field code, e.g. "0613" */
  isced: string;
  iscedTitle: string;
  /**
   * How many O*NET occupations the field's measured vector averages over.
   * A field resting on one occupation is not wrong, but it is thin, and the
   * trace shows the number rather than leaving a reader to assume it is many.
   */
  iscedOccupations: number;
  /**
   * A few of those occupations, named in Thai. The most concrete thing the
   * system can say about a programme — and the crosswalk made visible to the
   * learner, not only to a reviewer reading the audit.
   */
  occupations: string[];
  riasec: Record<Dimension, number>;
  seatsPlanned: number | null;
  /**
   * What the institution spends per student per year — NOT what the learner
   * pays. At a public university the learner pays a fraction of it. Never
   * render this as a tuition figure.
   */
  productionCost: number | null;
  /** ปริญญาตรี · ปวช. · ปวส. — the learner's stated tier gates on this */
  level: string;
  /**
   * What happened to people who finished this field, in this province, at this
   * level. Null where the survey has nothing or suppressed it.
   *
   * `workingPct` and `studyingPct` are shares of `tracked`, never of
   * `graduates` — the survey does not reach everyone, and a percentage of the
   * reached read as a percentage of the whole is the misreading this field
   * exists to prevent. Both numbers are carried so the UI can say which is
   * which.
   */
  outcome: ProgrammeOutcome | null;
}

export interface ProgrammeOutcome {
  workingPct: number;
  studyingPct: number;
  tracked: number;
  graduates: number;
  smallSample: boolean;
  academicYear: string;
}

export const PROGRAMME_META = data.meta;

function unpackOutcome(row: Packed["outcomes"][number]): ProgrammeOutcome {
  const [workingPct, studyingPct, tracked, graduates, smallSample, academicYear] = row;
  return { workingPct, studyingPct, tracked, graduates, smallSample: smallSample === 1, academicYear };
}

let cache: Programme[] | null = null;

export function allProgrammes(): Programme[] {
  if (cache) return cache;

  const vectors = data.fields.map(([, , values]) => {
    const vec = {} as Record<Dimension, number>;
    DIMENSIONS.forEach((d, i) => {
      vec[d] = values[i];
    });
    return vec;
  });

  cache = data.programmes.map(([titleIndex, instIndex, fieldIndex, seats, cost, levelIndex, outcomeIndex]) => {
    const [id, nameTh, provinceIso, provinceTh, tuitionBand, website] = data.institutions[instIndex];
    const [isced, iscedTitle, , iscedOccupations, occupations] = data.fields[fieldIndex];
    return {
      title: data.titles[titleIndex],
      institutionId: id,
      institutionTh: nameTh,
      provinceIso,
      provinceTh,
      tuitionBand,
      website,
      isced,
      iscedTitle,
      iscedOccupations,
      occupations,
      riasec: vectors[fieldIndex],
      seatsPlanned: seats,
      productionCost: cost,
      level: data.levels[levelIndex],
      outcome: outcomeIndex >= 0 ? unpackOutcome(data.outcomes[outcomeIndex]) : null,
    };
  });

  return cache;
}
