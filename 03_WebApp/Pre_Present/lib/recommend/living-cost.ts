/**
 * What it costs a student to live in each region, per month.
 *
 * ## This is an estimate, and it is labelled as one everywhere it appears
 *
 * The figures came in from the Kong19565 branch under a `TDRI-MHESI-NSO-2025`
 * provenance badge. They are not survey extracts: every one of the five
 * regional breakdowns sums to its own stated average exactly, which household
 * expenditure data does not do. They are a constructed table, informed by the
 * published ranges from those bodies.
 *
 * That makes them useful and it makes the badge wrong. A learner deciding
 * whether they can afford to move needs a number, and "about 6,000–13,000 a
 * month in the north" is a far better answer than silence. So the table ships
 * with the claim it can actually support: a team estimate citing those ranges,
 * never a measurement, and the interface says so in the same breath as the
 * number.
 *
 * Replace with per-province survey figures when NSO's household expenditure
 * tables are joined properly; the shape here will not have to change.
 */

export interface LivingCost {
  regionCode: string;
  regionTh: string;
  minPerMonth: number;
  avgPerMonth: number;
  maxPerMonth: number;
  /** dormitory · food · transport · supplies, summing to avgPerMonth */
  breakdown: { dormitory: number; food: number; transport: number; supplies: number };
}

const REGIONS: Record<string, LivingCost> = {
  BKK: {
    regionCode: "BKK",
    regionTh: "กรุงเทพฯ และปริมณฑล",
    minPerMonth: 9500,
    avgPerMonth: 13500,
    maxPerMonth: 20000,
    breakdown: { dormitory: 4500, food: 5500, transport: 2000, supplies: 1500 },
  },
  NORTH: {
    regionCode: "NORTH",
    regionTh: "ภาคเหนือ",
    minPerMonth: 6000,
    avgPerMonth: 8500,
    maxPerMonth: 13000,
    breakdown: { dormitory: 2800, food: 3800, transport: 900, supplies: 1000 },
  },
  NE: {
    regionCode: "NE",
    regionTh: "ภาคตะวันออกเฉียงเหนือ",
    minPerMonth: 5500,
    avgPerMonth: 7800,
    maxPerMonth: 11500,
    breakdown: { dormitory: 2400, food: 3500, transport: 800, supplies: 1100 },
  },
  SOUTH: {
    regionCode: "SOUTH",
    regionTh: "ภาคใต้",
    minPerMonth: 6500,
    avgPerMonth: 9200,
    maxPerMonth: 15000,
    breakdown: { dormitory: 3000, food: 4200, transport: 1000, supplies: 1000 },
  },
  CENTRAL_EAST: {
    regionCode: "CENTRAL_EAST",
    regionTh: "ภาคกลางและตะวันออก",
    minPerMonth: 7000,
    avgPerMonth: 9800,
    maxPerMonth: 14500,
    breakdown: { dormitory: 3200, food: 4300, transport: 1100, supplies: 1200 },
  },
};

/**
 * Province to region, written out rather than derived.
 *
 * A latitude rule would be shorter and would quietly misfile the provinces
 * that sit on a boundary. This list is wrong in exactly the places a reader
 * can see and correct, which the rule would not be. Bangkok's group is the
 * capital plus the five ปริมณฑล provinces.
 */
const PROVINCE_REGION: Record<string, string> = {};
const assign = (region: string, codes: number[]) => {
  for (const n of codes) PROVINCE_REGION[`TH-${n}`] = region;
};

assign("BKK", [10, 11, 12, 13, 73, 74]);
assign("NORTH", [50, 51, 52, 53, 54, 55, 56, 57, 58, 62, 63, 64, 65, 66, 67]);
assign("NE", [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
assign("SOUTH", [80, 81, 82, 83, 84, 85, 86, 90, 91, 92, 93, 94, 95, 96]);
assign("CENTRAL_EAST", [
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 60, 61, 70, 71, 72, 75, 76, 77,
]);

export function livingCostFor(provinceIso: string | null | undefined): LivingCost | null {
  if (!provinceIso) return null;
  const region = PROVINCE_REGION[provinceIso];
  return region ? REGIONS[region] : null;
}

/**
 * Living cost over a course, in whole baht.
 *
 * Ten months a year, not twelve: the Thai academic year runs roughly June to
 * March with a long break, and most students go home for it. Counting twelve
 * would overstate the bill by a fifth for every learner.
 */
export const MONTHS_PER_YEAR = 10;

export function courseLivingCost(cost: LivingCost, years: number) {
  return {
    min: cost.minPerMonth * MONTHS_PER_YEAR * years,
    max: cost.maxPerMonth * MONTHS_PER_YEAR * years,
  };
}

/** ปวช. and ปวส. are three and two years; a bachelor's is four. */
export function yearsForLevel(level: string): number {
  if (level === "ปวช.") return 3;
  if (level === "ปวส.") return 2;
  return 4;
}
