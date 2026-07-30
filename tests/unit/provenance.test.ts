/**
 * The catalogue is demo data. That is defensible only while the repository is
 * precise about which parts have a source behind them and which are the team's
 * own framing — so these tests treat provenance as a contract, not a comment.
 */
import { describe, expect, it } from "vitest";
import routesData from "@/data/routes.json";
import { freshness, isStale, recommend, unverifiedFields } from "@/lib/decision-engine";
import questions from "@/data/questions.json";
import type { Dimension, InterviewInput } from "@/lib/decision-engine/types";

const STATUSES = ["partially-verified", "illustrative", "unverified"];

function interview(high: Dimension[]): InterviewInput {
  const interest: Record<string, number> = {};
  for (const q of questions.interest) interest[q.id] = high.includes(q.dimension as Dimension) ? 5 : 2;
  return {
    interest,
    context: { tier: "LOWER_SECONDARY", cost: "flexible", mobility: "can_move", horizon: "soon" },
  };
}

describe("route provenance", () => {
  it("gives every route a provenance record", () => {
    for (const route of routesData.routes) {
      expect(route.provenance, `${route.id} has no provenance`).toBeDefined();
      expect(STATUSES).toContain(route.provenance.status);
      // The note is bilingual now, so both sides have to be substantive — a Thai
      // note that is an empty string would otherwise pass unnoticed.
      expect(route.provenance.note.en.length).toBeGreaterThan(30);
      expect(route.provenance.note.th.length).toBeGreaterThan(20);
    }
  });

  it("requires a checkable source and date wherever a route claims to be verified", () => {
    for (const route of routesData.routes) {
      if (route.provenance.status !== "partially-verified") continue;
      expect(route.provenance.source, `${route.id}`).toBeTruthy();
      expect(route.provenance.sourceUrl, `${route.id}`).toMatch(/^https:\/\//);
      expect(route.provenance.lastVerified, `${route.id}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("does not let an unsourced route imply it was checked", () => {
    for (const route of routesData.routes) {
      if (route.provenance.status === "partially-verified") continue;
      expect(route.provenance.source).toBeNull();
      expect(route.provenance.sourceUrl).toBeNull();
      expect(route.provenance.lastVerified).toBeNull();
    }
  });

  it("declares the fields that carry no source at all", () => {
    const unsourced = unverifiedFields();
    // These four drive the eligibility filters, so their status is the single
    // most important disclosure in the catalogue.
    for (const field of ["costBand", "requiresRelocation", "timeToEarning", "flexibility"]) {
      expect(unsourced).toContain(field);
    }
    expect(routesData.meta.fieldStatus.verified).toEqual([]);
  });

  it("does not hard-code a ปวช. subject-area count", () => {
    // The source registry explicitly warns against embedding counts that change
    // with each curriculum revision, so none may appear in the seed data.
    const text = JSON.stringify(routesData);
    expect(text).not.toMatch(/\d+\s*(ปวช\.?\s*)?(subject areas|ประเภทวิชา)/);
  });

  it("carries provenance through to the recommendation", () => {
    const result = recommend(interview(["R", "I"]), null);
    expect(result.routes.length).toBeGreaterThan(0);
    for (const route of result.routes) {
      expect(STATUSES).toContain(route.provenance.status);
      const source = routesData.routes.find((r) => r.id === route.routeId)!;
      expect(route.provenance).toEqual(source.provenance);
    }
  });
});

describe("freshness reporting", () => {
  it("reports age against the declared threshold, not just a boolean", () => {
    const asOf = new Date(routesData.meta.dataAsOf);
    const report = freshness(new Date(asOf.getTime() + 30 * 86_400_000));
    expect(report.dataAsOf).toBe(routesData.meta.dataAsOf);
    expect(report.ageInDays).toBe(30);
    expect(report.thresholdDays).toBe(routesData.meta.freshnessThresholdDays);
    expect(report.stale).toBe(false);
  });

  it("agrees with isStale on both sides of the threshold", () => {
    const asOf = new Date(routesData.meta.dataAsOf).getTime();
    const threshold = routesData.meta.freshnessThresholdDays;

    const fresh = new Date(asOf + (threshold - 1) * 86_400_000);
    const stale = new Date(asOf + (threshold + 1) * 86_400_000);

    expect(freshness(fresh).stale).toBe(isStale(fresh));
    expect(freshness(stale).stale).toBe(isStale(stale));
    expect(freshness(fresh).stale).toBe(false);
    expect(freshness(stale).stale).toBe(true);
  });

  it("points at a source registry a reader can open", () => {
    expect(routesData.meta.sourceRegistry).toMatch(/^docs\//);
  });
});
