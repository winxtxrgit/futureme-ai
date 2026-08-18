/**
 * The living-cost table is an estimate. These tests hold it to the two things
 * that make an estimate publishable: it must be internally coherent, and it
 * must never be presented for a learner who is not actually moving.
 */
import { describe, expect, it } from "vitest";
import provinces from "@/data/provinces.json";
import {
  MONTHS_PER_YEAR,
  courseLivingCost,
  livingCostFor,
  yearsForLevel,
} from "@/lib/recommend/living-cost";

describe("living cost", () => {
  it("covers every province in the register", () => {
    const missing = provinces.filter((p) => livingCostFor(p.iso) === null);
    expect(missing.map((p) => `${p.iso} ${p.th}`)).toEqual([]);
  });

  it("keeps each region's breakdown equal to its own average", () => {
    for (const p of provinces) {
      const cost = livingCostFor(p.iso)!;
      const { dormitory, food, transport, supplies } = cost.breakdown;
      expect(dormitory + food + transport + supplies, cost.regionCode).toBe(cost.avgPerMonth);
      expect(cost.minPerMonth).toBeLessThan(cost.avgPerMonth);
      expect(cost.avgPerMonth).toBeLessThan(cost.maxPerMonth);
    }
  });

  it("returns nothing when there is no province to price", () => {
    expect(livingCostFor(null)).toBeNull();
    expect(livingCostFor("TH-999")).toBeNull();
  });

  it("counts ten months a year, not twelve", () => {
    // The Thai academic year has a long break most students go home for.
    // Twelve months would overstate every learner's bill by a fifth.
    expect(MONTHS_PER_YEAR).toBe(10);
    const cost = livingCostFor("TH-50")!;
    const total = courseLivingCost(cost, 3);
    expect(total.min).toBe(cost.minPerMonth * 10 * 3);
  });

  it("uses the real length of each qualification", () => {
    expect(yearsForLevel("ปวช.")).toBe(3);
    expect(yearsForLevel("ปวส.")).toBe(2);
    expect(yearsForLevel("ปริญญาตรี")).toBe(4);
  });
});
