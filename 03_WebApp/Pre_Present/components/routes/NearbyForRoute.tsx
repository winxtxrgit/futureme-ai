"use client";

import { usePreferences } from "@/components/PreferencesProvider";
import { format } from "@/lib/i18n";
import { nearbyForRoute } from "@/lib/geo/route-institutions";
import type { NearbyProvince } from "@/lib/geo/types";
import { BAND_KEY } from "@/lib/geo/types";

/**
 * Where a learner could actually do this route, shown under the route itself.
 *
 * Rendered identically for every route, including the ones with nothing nearby.
 * A route that has no provider within reach says so, because that is a real
 * constraint on the learner's life and hiding it would be the one way this
 * section could turn into a ranking.
 */
export function NearbyForRoute({
  routeId,
  province,
}: {
  routeId: string;
  province: NearbyProvince | null;
}) {
  const { t, lang } = usePreferences();
  if (!province) return null;

  // The province has an English name; an English reader was being shown the Thai one.
  const name = lang === "th" ? province.th : province.en;

  const { options, total, none } = nearbyForRoute(routeId, province);

  return (
    <section
      className="mt-4 rounded-control border border-line bg-surface2/60 p-3"
      data-testid={`route-nearby-${routeId}`}
      data-count={total}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
        {format(t.routes.nearbyTitle, { province: name })}
      </h3>

      {none ? (
        <p className="mt-2 text-xs text-muted" data-testid={`route-nearby-none-${routeId}`}>
          {format(t.routes.nearbyNone, { province: name })}
        </p>
      ) : (
        <>
          <ul className="mt-2 space-y-1.5">
            {options.map((option) => (
              <li key={option.id} className="text-xs text-muted">
                <span className="font-bold text-ink">{option.name}</span>
                {" · "}
                {format(t.nearby.kmAway, { km: option.km ?? 0 })}
                {" · "}
                {t.nearby[BAND_KEY[option.band]]}
                {option.station ? ` · ${option.station.name}` : ""}
              </li>
            ))}
          </ul>
          {total > options.length ? (
            <p className="mt-1.5 text-xs text-muted">
              {format(t.routes.nearbyMore, { count: total - options.length })}
            </p>
          ) : null}
        </>
      )}

      {/*
        Required, not optional. The register says what each place is, never
        which programmes it runs, so naming a college here is a claim about the
        kind of institution and not about its prospectus.
      */}
      <p className="mt-2 text-[11px] leading-relaxed text-muted">{t.routes.nearbyCaveat}</p>
    </section>
  );
}


