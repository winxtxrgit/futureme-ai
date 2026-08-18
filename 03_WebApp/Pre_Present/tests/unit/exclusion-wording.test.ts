import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { th } from "@/lib/i18n/th";

/**
 * How a route that did not make the list is described to the learner.
 *
 * A psychometric review of this project's own framework warned that deducting
 * for cost or family resistance risks turning a social disadvantage into a
 * statement that a person is unsuited, and that a guidance system should not
 * filter options away at all.
 *
 * The engine does not do the first: cost and mobility reach eligibility and
 * never the score, so being poor cannot lower a learner's interest score. It
 * does a version of the second, and the answer is disclosure — excluded routes
 * are shown with their reason rather than removed.
 *
 * That leaves the wording, which is what these check. "Filtered out: you said
 * cost matters a lot" announces a decision about the learner before saying
 * anything about the route. The same two facts in the other order, with what
 * would change them, is information.
 */

const DICTIONARIES = [
  ["en", en],
  ["th", th],
] as const;

describe("an excluded route is described, not judged", () => {
  it("no longer opens with a verdict on the learner", () => {
    expect(en.engine.reasons.COST_CONSTRAINT).not.toMatch(/^Filtered out/);
    expect(en.engine.reasons.LOCATION_CONSTRAINT).not.toMatch(/^Filtered out/);
    expect(en.engine.reasons.TIER_MISMATCH).not.toMatch(/^Filtered out/);
    expect(th.engine.reasons.COST_CONSTRAINT).not.toMatch(/^ถูกคัดออก/);
    expect(th.engine.reasons.LOCATION_CONSTRAINT).not.toMatch(/^ถูกคัดออก/);
    expect(th.engine.reasons.TIER_MISMATCH).not.toMatch(/^ถูกคัดออก/);
  });

  it("leads with the route rather than with the learner", () => {
    // "This route is high-cost and you said…" not "You said… so this route".
    expect(en.engine.reasons.COST_CONSTRAINT).toMatch(/^This route/);
    expect(en.engine.reasons.LOCATION_CONSTRAINT).toMatch(/^This route/);
    expect(th.engine.reasons.COST_CONSTRAINT).toMatch(/^เส้นทางนี้/);
    expect(th.engine.reasons.LOCATION_CONSTRAINT).toMatch(/^เส้นทางนี้/);
  });

  it("says a money exclusion is not permanent, and where to look", () => {
    /*
     * The one that matters most. A fifteen-year-old told a direction is closed
     * because their family has no money should be told in the same breath that
     * money is the part that can change — the catalogue has records for the
     * loan fund, the equity grants and free education at ปวช. level.
     */
    expect(en.engine.reasons.COST_CONSTRAINT).toMatch(/scholarship|loan/i);
    expect(th.engine.reasons.COST_CONSTRAINT).toMatch(/ทุน|กู้/);
  });

  it("says a stage exclusion is nothing to do with the learner's answers", () => {
    // TIER_MISMATCH is the one exclusion that is purely a fact about admission,
    // so it should not read as feedback at all.
    expect(en.engine.reasons.TIER_MISMATCH).toMatch(/nothing to do with your answers/i);
    expect(th.engine.reasons.TIER_MISMATCH).toMatch(/ไม่ใช่เรื่องคำตอบของคุณ/);
  });

  it("does not call the excluded set a rejection in either language", () => {
    for (const [name, dict] of DICTIONARIES) {
      expect(dict.routes.filteredSummary, name).not.toMatch(/filtered out|ถูกคัดออก/);
      expect(dict.routes.filteredSummary, name).toMatch(/\{n\}/);
    }
  });

  it("still names both facts, so the reason stays checkable", () => {
    // Softening must not cost the learner the information. Each reason has to
    // keep the property of the route and the thing they told us.
    expect(en.engine.reasons.COST_CONSTRAINT).toMatch(/high-cost/);
    expect(en.engine.reasons.COST_CONSTRAINT).toMatch(/you said/);
    expect(en.engine.reasons.LOCATION_CONSTRAINT).toMatch(/moving away/);
    expect(en.engine.reasons.LOCATION_CONSTRAINT).toMatch(/you said/);
    expect(th.engine.reasons.COST_CONSTRAINT).toMatch(/ค่าใช้จ่ายสูง/);
    expect(th.engine.reasons.COST_CONSTRAINT).toMatch(/คุณบอกว่า/);
  });
});
