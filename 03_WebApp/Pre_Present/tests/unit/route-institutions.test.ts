import { describe, expect, it } from "vitest";
import nearby from "@/data/nearby.json";
import routesData from "@/data/routes.json";
import {
  ROUTES_WITH_INSTITUTION_KINDS,
  nearbyForRoute,
} from "@/lib/geo/route-institutions";
import type { NearbyProvince } from "@/lib/geo/types";

const DATA = nearby as unknown as Record<string, NearbyProvince>;
const ROUTE_IDS = routesData.routes.map((route) => route.id);

describe("connecting a route to real places", () => {
  it("covers every route the engine can suggest", () => {
    // A route with no mapping renders an empty section, which reads as "there
    // is nowhere to do this" when the truth is that nobody wrote the mapping.
    for (const id of ROUTE_IDS) {
      expect(ROUTES_WITH_INSTITUTION_KINDS, `no institution kinds for ${id}`).toContain(id);
    }
    expect(ROUTES_WITH_INSTITUTION_KINDS).toHaveLength(ROUTE_IDS.length);
  });

  it("returns nothing at all until the learner has said where they are", () => {
    for (const id of ROUTE_IDS) {
      const result = nearbyForRoute(id, null);
      expect(result.options).toEqual([]);
      expect(result.none).toBe(true);
    }
  });

  it("never names a place whose distance is unknown", () => {
    // /nearby lists those, because "what exists in my province" is answered by
    // an unmeasured place. Here the claim is about getting there, so it is not.
    for (const province of Object.values(DATA)) {
      for (const id of ROUTE_IDS) {
        for (const option of nearbyForRoute(id, province).options) {
          expect(option.km).not.toBeNull();
        }
      }
    }
  });

  it("orders places by distance within a route", () => {
    for (const province of Object.values(DATA)) {
      for (const id of ROUTE_IDS) {
        const distances = nearbyForRoute(id, province).options.map((o) => o.km ?? 0);
        expect(distances).toEqual([...distances].sort((a, b) => a - b));
      }
    }
  });

  it("only offers places that plausibly teach the route", () => {
    /*
     * Kind is the fallback, not the rule. A Rajabhat that the programme
     * register says runs nursing belongs under health care even though its
     * kind alone would not have said so — which is the point of consulting the
     * register at all. So each option must satisfy one test or the other,
     * never both.
     */
    const health = nearbyForRoute("health-care", DATA["TH-10"]);
    expect(health.total).toBeGreaterThan(0);
    for (const option of health.options) {
      const byRegister = option.runs?.includes("health-care") ?? false;
      const byKind =
        !option.runs &&
        ["nursing_college", "public_health_college", "university"].includes(option.kind);
      expect(byRegister || byKind, `${option.name} (${option.kind})`).toBe(true);
    }

    const digital = nearbyForRoute("vocational-digital", DATA["TH-10"]);
    for (const option of digital.options) {
      expect(option.kind).not.toBe("nursing_college");
    }
  });

  it("reaches a learner on the vocational track in every province", () => {
    // The whole point of using the OVEC register. If this fails anywhere, a
    // learner in that province is being told the vocational route leads nowhere.
    for (const [iso, province] of Object.entries(DATA)) {
      const result = nearbyForRoute("dve-dual", province);
      expect(result.total, `${iso} offers nowhere for dve-dual`).toBeGreaterThan(0);
    }
  });

  it("says plainly when a route has nowhere nearby rather than hiding it", () => {
    // Built rather than found: a province is stripped of everything that could
    // teach health care, and the result must be an explicit "none" that the UI
    // renders, not silence.
    const stripped: NearbyProvince = {
      ...DATA["TH-58"],
      options: DATA["TH-58"].options.filter(
        (option) =>
          !["nursing_college", "public_health_college", "university"].includes(option.kind),
      ),
    };
    const result = nearbyForRoute("health-care", stripped);
    expect(result.none).toBe(true);
    expect(result.total).toBe(0);
  });

  it("caps how many it names but reports how many there are", () => {
    const bangkok = nearbyForRoute("business-admin", DATA["TH-10"]);
    expect(bangkok.options.length).toBeLessThanOrEqual(4);
    expect(bangkok.total).toBeGreaterThanOrEqual(bangkok.options.length);
  });

  it("treats every route the same way, so the section cannot rank them", () => {
    // Same province, same call, same shape for all six — no route gets extra
    // slots, and none is silently dropped.
    const province = DATA["TH-50"];
    const shapes = ROUTE_IDS.map((id) => {
      const result = nearbyForRoute(id, province);
      return {
        capped: result.options.length <= 4,
        consistent: result.none === (result.total === 0),
      };
    });
    expect(shapes.every((s) => s.capped && s.consistent)).toBe(true);
  });
});

describe("the programme register overrides the guess where it covers a place", () => {
  it("drops a degree institution that runs no programme in the route", () => {
    // Maejo is an agricultural university in Chiang Mai. It is a university, so
    // kind alone put it under health care; the register says it runs no health
    // programme at entry level.
    const chiangMai = DATA["TH-50"];
    const maejo = chiangMai.options.find((o) => o.name.includes("แม่โจ้"));
    expect(maejo, "Maejo missing from the Chiang Mai data").toBeDefined();
    expect(maejo?.runs, "Maejo should carry programme data").toBeDefined();
    expect(maejo?.runs).not.toContain("health-care");

    const health = nearbyForRoute("health-care", chiangMai);
    expect(health.options.map((o) => o.name).join(" ")).not.toContain("แม่โจ้");
  });

  it("keeps a degree institution that does run it", () => {
    const chiangMai = DATA["TH-50"];
    const health = nearbyForRoute("health-care", chiangMai);
    expect(health.total).toBeGreaterThan(0);
    for (const option of health.options) {
      if (option.runs) expect(option.runs).toContain("health-care");
    }
  });

  it("never reads a missing register entry as teaching nothing", () => {
    /*
     * The failure mode that would matter most. No register publishes programmes
     * per vocational college, so every one of them lacks `runs`. If absent were
     * read as "runs nothing", the vocational routes would empty out — and the
     * vocational learner is who this project is mostly for.
     */
    for (const [iso, province] of Object.entries(DATA)) {
      const withoutData = province.options.filter((o) => !o.runs && o.km !== null);
      expect(withoutData.length, `${iso} has no uncovered institutions to check`)
        .toBeGreaterThan(0);
      const dual = nearbyForRoute("dve-dual", province);
      expect(dual.total, `${iso} lost its work-based options`).toBeGreaterThan(0);
    }
  });

  it("still covers the vocational track everywhere after the change", () => {
    for (const [iso, province] of Object.entries(DATA)) {
      const digital = nearbyForRoute("vocational-digital", province);
      expect(digital.total, `${iso} offers nowhere for vocational-digital`)
        .toBeGreaterThan(0);
    }
  });
});

describe("the routes the expanded catalogue added", () => {
  const ADDED = [
    "vocational-ev-tech",
    "vocational-culinary",
    "vocational-logistics",
    "university-ai-data",
    "university-medtech-rehab",
    "university-digital-comm",
  ];

  it("gives every one of them somewhere to study in the country", () => {
    /*
     * A route in the catalogue with no institution kinds renders an empty
     * section everywhere, which reads to a learner as "there is nowhere to do
     * this" when the truth is that nobody finished the mapping. Growing the
     * catalogue is exactly when that happens.
     *
     * Nationally, not per province: a route legitimately having nowhere in one
     * province is a fact about that province, and the screen says so. Medical
     * technology and rehabilitation reaches only 44 of 77 because 23
     * institutions in the country run it — that is the learner's real
     * constraint, not a gap in this mapping.
     */
    for (const id of ADDED) {
      const provincesWithSomewhere = Object.values(DATA).filter(
        (province) => nearbyForRoute(id, province).total > 0,
      ).length;
      expect(provincesWithSomewhere, `${id} has nowhere in the entire country`)
        .toBeGreaterThan(0);
    }
  });

  it("reaches every province with the vocational ones", () => {
    // The promise that matters most for this product's main audience. A degree
    // route can be scarce; a vocational learner should never be told their
    // whole direction leads nowhere near them.
    for (const id of ["vocational-ev-tech", "vocational-culinary", "vocational-logistics"]) {
      for (const [iso, province] of Object.entries(DATA)) {
        expect(nearbyForRoute(id, province).total, `${id} has nowhere in ${iso}`)
          .toBeGreaterThan(0);
      }
    }
  });

  it("keeps the degree routes honest against the programme register", () => {
    // The three degree routes were added to the register matcher too, so an
    // institution that runs no such programme should not be offered under one.
    for (const id of ["university-ai-data", "university-medtech-rehab", "university-digital-comm"]) {
      for (const province of Object.values(DATA)) {
        for (const option of nearbyForRoute(id, province).options) {
          if (option.runs) expect(option.runs, `${option.name} under ${id}`).toContain(id);
        }
      }
    }
  });

  it("leaves the vocational ones on kind, because no register covers them", () => {
    // Not a shortcoming to fix — สอศ. publishes no per-college programme list,
    // and reading that absence as "teaches nothing" would empty the vocational
    // side of the catalogue.
    const vocational = ["vocational-ev-tech", "vocational-culinary", "vocational-logistics"];
    let matchedWithoutRegister = 0;
    for (const id of vocational) {
      for (const province of Object.values(DATA)) {
        for (const option of nearbyForRoute(id, province).options) {
          if (!option.runs) matchedWithoutRegister += 1;
        }
      }
    }
    expect(matchedWithoutRegister).toBeGreaterThan(0);
  });
});
