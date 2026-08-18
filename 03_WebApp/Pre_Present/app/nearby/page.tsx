"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import provinces from "@/data/provinces.json";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { usePreferences, useT } from "@/components/PreferencesProvider";
import { format } from "@/lib/i18n";
import { TRAVEL_BANDS, type NearbyOption, type NearbyProvince, type TravelBand } from "@/lib/geo/types";

/**
 * Where a learner could study, and whether they could get there.
 *
 * The province is chosen from a list rather than read from the device. Location
 * permission would hand us the home coordinates of a thirteen-year-old, which
 * 00_Governance/SOURCE_POLICY.md says to collect only where necessary — and it
 * is not necessary here, because the underlying dataset is measured from the
 * provincial capital anyway. A precise fix would buy no precision and cost the
 * most sensitive field we could hold.
 *
 * The choice is not stored. It lives in this component and in the URL, so a
 * learner can share or bookmark a view without anything about them being kept.
 */

/**
 * Which levels a learner wants to see.
 *
 * Bangkok returns 128 places and the page ran to twenty phone screens, which is
 * not a list anyone reaches the bottom of. Almost nobody is weighing a technical
 * college against a university in the same breath, so the first thing offered is
 * the split that actually matches how the question is asked.
 */
type LevelFilter = "all" | "vocational" | "degree";

const MATCHES: Record<LevelFilter, (option: NearbyOption) => boolean> = {
  all: () => true,
  vocational: (option) => option.offers.some((level) => level === "ปวช." || level === "ปวส."),
  degree: (option) => option.offers.includes("ปริญญาตรี"),
};

/** How many to show in a group before the rest is behind a control. */
const GROUP_PREVIEW = 6;

type Loading = { state: "idle" } | { state: "loading" } | { state: "error" } | {
  state: "ready";
  data: NearbyProvince;
};

/*
 * Narrowed to the band keys rather than "any key under nearby". The looser type
 * let the lookup resolve to the `modes` object once that was added, which type
 * checked as a value and would have rendered nothing.
 */
type BandLabelKey =
  | "bandWalkable"
  | "bandLocal"
  | "bandCommute"
  | "bandHardCommute"
  | "bandRelocate"
  | "bandUnknown";

const BAND_LABEL: Record<TravelBand, BandLabelKey> = {
  walkable: "bandWalkable",
  local: "bandLocal",
  commute: "bandCommute",
  hard_commute: "bandHardCommute",
  relocate: "bandRelocate",
  unknown_distance: "bandUnknown",
};

/** Colour carries no ranking — it is a legend for journey length, not quality. */
const BAND_TONE: Record<TravelBand, string> = {
  walkable: "border-mint/40 bg-mint/5",
  local: "border-mint/30 bg-mint/5",
  commute: "border-line bg-surface2",
  hard_commute: "border-line bg-surface2",
  relocate: "border-line bg-surface2",
  unknown_distance: "border-line bg-surface2",
};

function OptionRow({ option }: { option: NearbyOption }) {
  const t = useT();
  return (
    <li
      className="border-t border-line/60 px-3 py-3 first:border-t-0"
      data-testid="nearby-option"
      data-band={option.band}
      data-home={option.home ? "true" : "false"}
    >
      <p className="text-sm font-bold leading-snug">{option.name}</p>

      <p className="mt-1 text-xs text-muted">
        {option.km === null
          ? t.nearby.unknownDistance
          : [
              format(t.nearby.kmAway, { km: option.km }),
              option.minutes ? format(t.nearby.minutesAway, { minutes: option.minutes }) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
        {!option.home ? ` · ${format(t.nearby.outsideProvince, { province: option.province })}` : ""}
        {option.district ? ` · ${option.district}` : ""}
      </p>

      {option.offers.length > 0 ? (
        <p className="mt-1.5 text-xs text-muted">
          <span className="font-bold text-ink">{t.nearby.offersLabel}:</span>{" "}
          {option.offers.join(" · ")}
          <span className="text-muted"> · {option.sector}</span>
        </p>
      ) : null}

      {option.modes.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t.nearby.pickLabel}>
          {option.modes.map((mode) => (
            <li
              key={mode}
              className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] text-muted"
            >
              {t.nearby.modes[mode as keyof typeof t.nearby.modes] ?? mode}
            </li>
          ))}
        </ul>
      ) : null}

      {option.station ? (
        <p className="mt-1.5 text-[11px] text-muted">
          {t.nearby.stationLabel}: {option.station.name}
          {option.station.line ? ` (${option.station.line})` : ""}{" · "}
          {format(t.nearby.stationAway, { km: option.station.km })}
        </p>
      ) : null}
    </li>
  );
}

export default function NearbyPage() {
  const { t, lang } = usePreferences();
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState<LevelFilter>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<Loading>({ state: "idle" });
  // Guards against a slow response for an earlier province landing after a
  // faster one for the province now on screen.
  const sequence = useRef(0);

  const load = useCallback(async (iso: string) => {
    const id = sequence.current + 1;
    sequence.current = id;

    if (!iso) {
      setResult({ state: "idle" });
      return;
    }
    setResult({ state: "loading" });
    try {
      const response = await fetch(`/api/nearby?province=${encodeURIComponent(iso)}`);
      if (!response.ok) throw new Error(`nearby returned ${response.status}`);
      const data = (await response.json()) as NearbyProvince;
      if (sequence.current !== id) return;
      setResult({ state: "ready", data });
    } catch {
      if (sequence.current !== id) return;
      setResult({ state: "error" });
    }
  }, []);

  // A province in the URL is honoured so a view can be linked to or reloaded.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("province") ?? "";
    if (!fromUrl) return;
    setSelected(fromUrl);
    void load(fromUrl);
  }, [load]);

  const choose = (iso: string) => {
    setSelected(iso);
    const url = new URL(window.location.href);
    if (iso) url.searchParams.set("province", iso);
    else url.searchParams.delete("province");
    window.history.replaceState(null, "", url);
    void load(iso);
  };

  const data = result.state === "ready" ? result.data : null;
  const visible = data?.options.filter(MATCHES[filter]) ?? [];
  const grouped = TRAVEL_BANDS.map((band) => ({
    band,
    options: visible.filter((option) => option.band === band),
  })).filter((group) => group.options.length > 0);

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.nearby.title}</h1>
        <p className="mt-3 text-sm text-muted">{t.nearby.intro}</p>

        <div className="mt-5">
          <Notice title={t.nearby.noticeTitle}>{t.nearby.notARecommendation}</Notice>
        </div>

        <Card className="mt-5">
          <label htmlFor="nearby-province" className="text-sm font-bold">
            {t.nearby.pickLabel}
          </label>
          <select
            id="nearby-province"
            data-testid="nearby-province"
            value={selected}
            onChange={(event) => choose(event.target.value)}
            className="mt-2 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"
          >
            <option value="">{t.nearby.pickPlaceholder}</option>
            {provinces.map((province) => (
              <option key={province.iso} value={province.iso}>
                {province.th} · {province.en}
              </option>
            ))}
          </select>
        </Card>

        <div aria-live="polite" className="mt-4">
          {result.state === "loading" ? (
            <p className="text-sm text-muted" data-testid="nearby-loading">
              {t.nearby.loading}
            </p>
          ) : null}
          {result.state === "error" ? (
            <p className="text-sm text-coral" role="status" data-testid="nearby-error">
              {t.nearby.error}
            </p>
          ) : null}
        </div>

        {data ? (
          <>
            <Card className="mt-4" testId="nearby-summary">
              <h2 className="text-lg font-bold">
                {format(t.nearby.summaryTitle, { province: lang === "th" ? data.th : data.en })}
              </h2>
              <ul className="mt-3 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
                <li>• {format(t.nearby.summaryInside, { count: data.counts.inside })}</li>
                <li>• {format(t.nearby.summaryWithin30, { count: data.counts.within30 })}</li>
                <li>• {format(t.nearby.summaryVocational, { count: data.counts.vocational })}</li>
                <li>• {format(t.nearby.summaryDegree, { count: data.counts.degree })}</li>
                {data.counts.distanceUnknown > 0 ? (
                  <li>
                    • {format(t.nearby.summaryUnknown, { count: data.counts.distanceUnknown })}
                  </li>
                ) : null}
              </ul>
              <p className="mt-3 text-xs text-muted">{t.nearby.originNote}</p>
              <p className="mt-1.5 text-xs text-muted">{t.nearby.driveNote}</p>
            </Card>

            <div className="mt-4" role="group" aria-label={t.nearby.filterLabel}>
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                {t.nearby.filterLabel}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["all", "vocational", "degree"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                    data-testid={`nearby-filter-${value}`}
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      filter === value
                        ? "border-mint bg-mint/10 text-ink"
                        : "border-line bg-surface text-muted"
                    }`}
                  >
                    {value === "all"
                      ? t.nearby.filterAll
                      : value === "vocational"
                        ? t.nearby.filterVocational
                        : t.nearby.filterDegree}
                  </button>
                ))}
              </div>
            </div>

            {grouped.length === 0 ? (
              <p className="mt-4 text-sm text-muted" data-testid="nearby-empty">
                {filter === "all" ? t.nearby.empty : t.nearby.filterEmpty}
              </p>
            ) : null}

            {grouped.map((group) => (
              <section key={group.band} className="mt-4" data-testid={`nearby-band-${group.band}`}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
                  {t.nearby[BAND_LABEL[group.band]]}
                  <span className="ml-2 font-normal normal-case">({group.options.length})</span>
                </h3>
                <ul
                  className={`mt-2 overflow-hidden rounded-control border ${BAND_TONE[group.band]}`}
                >
                  {(expanded[group.band]
                    ? group.options
                    : group.options.slice(0, GROUP_PREVIEW)
                  ).map((option) => (
                    <OptionRow key={option.id} option={option} />
                  ))}
                </ul>
                {group.options.length > GROUP_PREVIEW ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [group.band]: !current[group.band],
                      }))
                    }
                    data-testid={`nearby-more-${group.band}`}
                    className="mt-2 text-xs font-bold text-mint underline underline-offset-2"
                  >
                    {expanded[group.band]
                      ? t.nearby.showLess
                      : format(t.nearby.showMore, {
                          count: group.options.length - GROUP_PREVIEW,
                        })}
                  </button>
                ) : null}
              </section>
            ))}

            <p className="mt-6 text-xs text-muted">{t.nearby.dataNote}</p>
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/" variant="secondary">
            {t.privacy.back}
          </Button>
          <Link
            href="/how-it-works"
            className="self-center text-sm text-mint underline underline-offset-2"
          >
            {t.nearby.sourceLink}
          </Link>
        </div>
      </div>
    </Shell>
  );
}
