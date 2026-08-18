import type { NearbyOption, NearbyProvince } from "@/lib/geo/types";

/**
 * Which kinds of institution teach a route, so a suggestion can name a place.
 *
 * The product's arc ends in an abstraction: a learner is shown "vocational,
 * digital" and goes home with a phrase. This is what turns the phrase into
 * somewhere they could go on Monday.
 *
 * ## What this is not
 *
 * `institutions.json` records what each place *is* — a technical college, a
 * Rajabhat university — from its name in the government register. It does not
 * record which programmes each one actually runs, because no register we have
 * lists that per campus. So the honest claim is "this is the kind of place that
 * teaches this route, and it is near you", never "this college offers this
 * programme". The wording on screen says so, and the caller is required to show
 * it: see `t.routes.nearbyCaveat`.
 *
 * ## Why this does not rank routes
 *
 * The engine chooses routes and never ranks them, and it does not take distance
 * as an input — adding places afterwards does not change that. Every route gets
 * the same treatment, options are ordered by distance within a route and never
 * across routes, and a route with nothing nearby says so plainly rather than
 * being hidden or pushed down. That a route has no provider within reach is a
 * fact the learner needs, not a reason for us to prefer another one.
 */

/**
 * Institution kinds that plausibly teach each route.
 *
 * Deliberately generous at the vocational end: a learner on that track is the
 * one most often told there is nothing for them, and a technical college that
 * turns out not to run the exact programme is a phone call, while an empty list
 * is a closed door.
 */
const KINDS_BY_ROUTE: Record<string, readonly string[]> = {
  "sci-math-engineering": [
    "university",
    "rajabhat",
    "rajamangala",
    "institute",
  ],
  "vocational-digital": [
    "technical_college",
    "vocational_college",
    "private_vocational",
    "polytechnic",
    "rajamangala",
    "tech_management_college",
    // วิทยาลัยการอาชีพ runs a broad vocational curriculum that ordinarily
    // includes คอมพิวเตอร์ธุรกิจ. Leaving it out told a learner in Mae Hong
    // Son — where it is the only institution with a measurable distance — that
    // there was nowhere near them to study anything digital.
    "career_college",
  ],
  "dve-dual": [
    "technical_college",
    "career_college",
    "vocational_college",
    "private_vocational",
    "polytechnic",
    "agricultural_college",
    "rajamangala",
  ],
  "arts-design": [
    "arts_college",
    "vocational_college",
    "private_vocational",
    "university",
    "rajabhat",
  ],
  "business-admin": [
    "vocational_college",
    "private_vocational",
    "career_college",
    "university",
    "rajabhat",
    "rajamangala",
  ],
  "health-care": [
    "nursing_college",
    "public_health_college",
    "university",
  ],

  // ── Added with the expanded catalogue ─────────────────────────────────────
  // The vocational four lean on the same broad colleges as the routes above,
  // because a Thai technical or career college runs many trades under one roof
  // and no register lists which. The programme register narrows the degree
  // routes precisely; these stay generous for the reason given at the top of
  // this file — an empty list is a closed door.
  "vocational-ev-tech": [
    "technical_college",
    "career_college",
    "polytechnic",
    "private_vocational",
    "rajamangala",
  ],
  "vocational-culinary": [
    "vocational_college",
    "career_college",
    "private_vocational",
    "polytechnic",
    "rajabhat",
  ],
  "vocational-logistics": [
    "vocational_college",
    "career_college",
    "technical_college",
    "private_vocational",
    "rajamangala",
    "rajabhat",
  ],
  "university-ai-data": [
    "university",
    "rajabhat",
    "rajamangala",
    "institute",
  ],
  "university-medtech-rehab": [
    "university",
    "nursing_college",
    "public_health_college",
  ],
  "university-digital-comm": [
    "university",
    "rajabhat",
    "arts_college",
  ],
};

/** How many places to name per route before the list stops being readable. */
const SHOWN_PER_ROUTE = 4;

export interface RouteNearby {
  /** Places of a kind that teaches this route, nearest first. */
  options: NearbyOption[];
  /** How many were found in total, so the screen can say "and 6 more". */
  total: number;
  /** True when the province has none of the kinds this route needs. */
  none: boolean;
}

/**
 * Places near the learner that teach a given route.
 *
 * Institutions whose distance is unknown are excluded here — unlike on the
 * `/nearby` screen, where the question is "what exists in my province" and an
 * unmeasured place still answers it. Here the claim being made is about
 * reaching somewhere, and a place we cannot measure cannot support it.
 */
export function nearbyForRoute(
  routeId: string,
  province: NearbyProvince | null,
): RouteNearby {
  const kinds = KINDS_BY_ROUTE[routeId];
  if (!province || !kinds) return { options: [], total: 0, none: true };

  const allowed = new Set(kinds);
  const matches = province.options
    .filter((option) => {
      if (option.km === null) return false;
      /*
       * Where the programme register covers an institution, it decides. Kind
       * was always a generalisation — universities generally teach engineering
       * — and generally is not always: fifty-nine degree institutions run no
       * health programme, and every one of them was being offered to a learner
       * asking where they could study health care.
       *
       * `runs` is absent for every vocational college, because no register
       * publishes their programmes per campus. Absent has to mean "fall back to
       * kind", never "teaches nothing" — reading it the other way would empty
       * the vocational side of this product entirely.
       */
      if (option.runs) return option.runs.includes(routeId);
      return allowed.has(option.kind);
    })
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));

  return {
    options: matches.slice(0, SHOWN_PER_ROUTE),
    total: matches.length,
    none: matches.length === 0,
  };
}

/** Exposed so a test can prove every route in the catalogue is covered. */
export const ROUTES_WITH_INSTITUTION_KINDS = Object.keys(KINDS_BY_ROUTE);
