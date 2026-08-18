/**
 * What a learner is shown when they ask where they could study.
 *
 * The list is ordered by road distance and nothing else. Distance is a fact
 * about a journey, not a judgement about a place, so ordering by it does not
 * rank the options — and nothing here says an option is recommended, suitable,
 * or a match. The deterministic engine decides routes; this screen only says
 * what exists and how far away it is.
 */

/** How a daily journey of this length would actually be made. */
export type TravelBand =
  | "walkable"
  | "local"
  | "commute"
  | "hard_commute"
  | "relocate"
  | "unknown_distance";

export const TRAVEL_BANDS: readonly TravelBand[] = [
  "walkable",
  "local",
  "commute",
  "hard_commute",
  "relocate",
  "unknown_distance",
] as const;

export interface NearbyStation {
  name: string;
  /** `metro` is an urban line; `rail` is mainline. They are not the same offer. */
  mode: string;
  line: string | null;
  km: number;
}

export interface NearbyOption {
  id: string;
  name: string;
  kind: string;
  sector: string;
  /** Levels the institution's own name says it teaches — see SCHEMA.md. */
  offers: string[];
  district: string | null;
  province: string;
  /** True when the institution is in the learner's own province. */
  home: boolean;
  /** Road distance in km, or null when no trustworthy coordinate exists. */
  km: number | null;
  /** Driving minutes. Not the time a learner on a songthaew would take. */
  minutes: number | null;
  band: TravelBand;
  modes: string[];
  station?: NearbyStation;
  /**
   * Routes this institution is recorded as actually running an entry-level
   * programme in, from the MHESI admission plan.
   *
   * Present only for degree-awarding institutions, because that is the only
   * register that publishes programmes per campus. Absent means "not covered by
   * that source" and never "teaches nothing" — every vocational college is
   * absent, and they are the majority.
   */
  runs?: string[];
}

export interface NearbyCounts {
  inside: number;
  outside: number;
  within30: number;
  vocational: number;
  degree: number;
  distanceUnknown: number;
}

export interface NearbyProvince {
  iso: string;
  th: string;
  en: string;
  counts: NearbyCounts;
  options: NearbyOption[];
}

/** `TH-` followed by two digits, which is every Thai province code. */
const PROVINCE_CODE = /^TH-\d{2}$/;

export function isProvinceCode(value: unknown): value is string {
  return typeof value === "string" && PROVINCE_CODE.test(value);
}

/**
 * Travel band to its dictionary key. Lives here rather than in a component
 * because two screens now describe the same distance — the nearby list and the
 * programme cards — and they must word it identically or the reader will think
 * they are being told two different things.
 */
export const BAND_KEY = {
  walkable: "bandWalkable",
  local: "bandLocal",
  commute: "bandCommute",
  hard_commute: "bandHardCommute",
  relocate: "bandRelocate",
  unknown_distance: "bandUnknown",
} as const;
