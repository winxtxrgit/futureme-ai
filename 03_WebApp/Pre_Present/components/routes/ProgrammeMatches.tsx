"use client";

import { useMemo, useState } from "react";
import {
  CONTEXT_MAX,
  DIFFERENTIATION_GATE,
  PROGRAMME_META,
  recommendProgrammes,
  type ProgrammeRecommendation,
  type Quadrant,
  type ScoredProgramme,
} from "@/lib/recommend";
import type { InterviewInput } from "@/lib/decision-engine/types";
import { BAND_KEY } from "@/lib/geo/types";
import { courseLivingCost, livingCostFor, yearsForLevel } from "@/lib/recommend/living-cost";
import { format, type Dictionary } from "@/lib/i18n";

/**
 * The programme layer of the result: real courses at real institutions,
 * ranked, with every number it used on show.
 *
 * Two things this deliberately does that a score display usually does not.
 * It prints the academic fit and the contextual adjustment as separate
 * figures, because a learner is entitled to know that a programme is ranked
 * where it is partly for being nearby. And when the evidence is thin it shows
 * nothing at all and says why — an empty result with a reason is the honest
 * output, and the component treats it as a first-class state rather than an
 * error.
 */

/**
 * The routes dictionary holds nested objects as well as strings, so the label
 * lookup is written out rather than indexed by a computed key — the compiler
 * can then prove each of these five is a string.
 */
/** Mirrors levelOpenTo() in the engine — the chips must not offer more. */
const LEVELS_FOR_TIER: Record<string, string[]> = {
  LOWER_SECONDARY: ["ปวช."],
  UPPER_SECONDARY: ["ปริญญาตรี", "ปวส."],
  VOCATIONAL: ["ปวส.", "ปริญญาตรี"],
  none: ["ปวช.", "ปวส.", "ปริญญาตรี"],
};

function quadrantLabel(quadrant: Quadrant, t: Dictionary): string {
  switch (quadrant) {
    case "golden-fit":
      return t.routes.programmesQuadrantGolden;
    case "growth-area":
      return t.routes.programmesQuadrantGrowth;
    case "burnout-risk":
      return t.routes.programmesQuadrantBurnout;
    case "unfavourable":
      return t.routes.programmesQuadrantUnfavourable;
    default:
      return t.routes.programmesQuadrantUnknown;
  }
}

function Meter({ core, context }: { core: number; context: number }) {
  // The two components are drawn to the same scale so the reader can see how
  // small the contextual part is relative to the academic part.
  const total = core + context;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-subtle" aria-hidden="true">
      <div className="bg-accent" style={{ width: `${(core / total) * 100}%` }} />
      <div className="bg-accent/40" style={{ width: `${(context / total) * 100}%` }} />
    </div>
  );
}

function ProgrammeCard({
  row,
  rank,
  t,
  homeProvince,
}: {
  row: ScoredProgramme;
  rank: number;
  t: Dictionary;
  homeProvince: string | null;
}) {
  const { programme: p } = row;
  /*
   * Living cost is shown only when the learner would have to move. Someone
   * studying in their own province is already paying to live there, so adding
   * a rent-and-food total to their card would invent a cost they do not incur.
   */
  const mustMove = homeProvince !== null && p.provinceIso !== homeProvince;
  const living = mustMove ? livingCostFor(p.provinceIso) : null;
  const years = yearsForLevel(p.level);
  const total = living ? courseLivingCost(living, years) : null;
  return (
    <li className="rounded-lg border border-subtle p-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-muted">{rank}</span>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold leading-snug">{p.title}</h4>
          <p className="mt-0.5 text-sm text-muted">
            {p.institutionTh} · {p.provinceTh}
          </p>
          {/*
            The distance in kilometres, next to what that distance means for a
            learner who cannot drive. The score already used this number; a
            reader could not see it. "12 กม. · เดินหรือปั่นจักรยานไปได้" decides
            more than "บริบท +13.2" does.
          */}
          {row.travel.km !== null && (
            <p className="mt-0.5 text-xs text-muted">
              {row.travel.district ? `อ.${row.travel.district} · ` : ""}
              {format(t.nearby.kmAway, { km: row.travel.km.toFixed(1) })}
              {row.travel.band && row.travel.band in BAND_KEY
                ? ` · ${t.nearby[BAND_KEY[row.travel.band as keyof typeof BAND_KEY]]}`
                : ""}
            </p>
          )}
          {/* How the trip is actually made. Already collected and already
              translated; it had simply never reached a screen. */}
          {row.travel.modes.length > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              {t.routes.programmesModes}{" "}
              {row.travel.modes
                .map((m) => (t.nearby.modes as Record<string, string>)[m] ?? m)
                .join(" · ")}
            </p>
          )}
        </div>
        {/*
          The interest x efficacy quadrant is shown only when efficacy was
          actually answered. The interview does not ask those six items yet, so
          for now this chip is usually absent — which is the right absence: a
          chip reading "confidence not measured" on every card teaches a reader
          to ignore the chip.
        */}
        {row.quadrant !== "unknown-efficacy" && (
          <span className="whitespace-nowrap rounded-full bg-subtle px-2 py-0.5 text-xs">
            {quadrantLabel(row.quadrant, t)}
          </span>
        )}
      </div>

      {/*
        The one honest answer to "how much does it cost". We hold no tuition
        figure and will not estimate one, so the card points at the body that
        publishes it. A register URL is a link; anything else is labelled a
        search, because inventing a URL for a real institution is worse than
        offering none.
      */}
      <p className="mt-2 text-xs">
        {p.website ? (
          <a href={p.website} target="_blank" rel="noreferrer noopener"
             className="underline underline-offset-2">
            {t.routes.programmesSite}
          </a>
        ) : (
          <a href={`https://www.google.com/search?q=${encodeURIComponent(p.institutionTh + " ค่าธรรมเนียมการศึกษา " + p.title)}`}
             target="_blank" rel="noreferrer noopener"
             className="underline underline-offset-2 text-muted">
            {t.routes.programmesSearch}
          </a>
        )}
      </p>

      {/*
        The occupations the field's vector was averaged from, in Thai. This is
        the crosswalk shown to the learner rather than only to a reviewer: it
        is both the most concrete thing on the card and the evidence for the
        number beside it.
      */}
      {p.occupations.length > 0 && (
        <p className="mt-2 text-xs">
          <span className="text-muted">{t.routes.programmesOccupations}</span>{" "}
          {p.occupations.join(" · ")}
        </p>
      )}

      {p.outcome && (
        <div className="mt-2 rounded border border-subtle bg-subtle/40 px-2.5 py-1.5 text-xs">
          <p>
            {format(t.routes.programmesOutcome, {
              province: p.provinceTh,
              level: p.level,
              working: p.outcome.workingPct.toFixed(0),
              studying: p.outcome.studyingPct.toFixed(0),
            })}
          </p>
          {/* The base always travels with the percentage. 100% of fifteen
              tracked people is not a fact about a field, and a reader who
              cannot see the fifteen has no way to know that. */}
          <p className="text-muted">
            {format(t.routes.programmesOutcomeBase, {
              tracked: p.outcome.tracked,
              graduates: p.outcome.graduates,
              year: p.outcome.academicYear,
            })}
            {p.outcome.smallSample ? ` · ${t.routes.programmesOutcomeSmall}` : ""}
          </p>
        </div>
      )}

      {living && total && (
        <p className="mt-2 text-xs text-muted">
          {format(t.routes.programmesLiving, {
            region: living.regionTh,
            min: living.minPerMonth.toLocaleString("th-TH"),
            max: living.maxPerMonth.toLocaleString("th-TH"),
            years,
            totalMin: Math.round(total.min / 1000).toLocaleString("th-TH"),
            totalMax: Math.round(total.max / 1000).toLocaleString("th-TH"),
          })}
        </p>
      )}

      {p.productionCost !== null && (
        <p className="mt-2 text-xs text-muted">
          {format(t.routes.programmesCost, {
            baht: p.productionCost.toLocaleString("th-TH"),
          })}
        </p>
      )}

      <div className="mt-3">
        <Meter core={row.core} context={row.contextComponent} />
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <div className="flex gap-1.5">
            <dt className="text-muted">{t.routes.programmesCore}</dt>
            <dd className="font-mono font-bold tabular-nums">{row.core.toFixed(1)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">{t.routes.programmesContext}</dt>
            <dd className="font-mono tabular-nums">+{row.contextComponent.toFixed(1)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">
              {p.seatsPlanned === null
                ? t.routes.programmesSeatsUnknown
                : format(t.routes.programmesSeats, { count: p.seatsPlanned })}
            </dt>
          </div>
        </dl>
      </div>

      {/*
        Directive 3 from the Kong19565 PR: show where each figure came from.
        These are our own registers, named per field rather than as one badge
        on the card — a single badge would imply the whole card shares one
        source, and the distance, the intake and the employment survey do not.
      */}
      <p className="mt-2 text-[10px] leading-relaxed text-muted">
        {t.routes.programmesProvenance}
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">{t.routes.programmesWhy}</summary>
        <div className="mt-2 space-y-1 font-mono text-xs text-muted">
          <p>{p.level} · cos(profile, programme) = {row.congruence.toFixed(3)}</p>
          {/* Thin fields are common enough to matter: a vector averaged from
              one occupation reads exactly like one averaged from forty. */}
          {/* The degree side counts occupations per ISCED field. The
              vocational side is audited per subject instead, so it carries no
              count — showing "0 occupations" there would read as no evidence
              rather than evidence recorded elsewhere. */}
          <p>
            {p.iscedTitle}
            {p.iscedOccupations > 0
              ? ` · RIASEC วัดจาก ${p.iscedOccupations} อาชีพ${p.iscedOccupations < 3 ? " ⚠ หลักฐานบาง" : ""}`
              : " · ดูการจับคู่อาชีพใน vocational_audit.md"}
          </p>

          {row.efficacy !== null && (
            <p>
              efficacy({row.efficacyDimensions.join("")}) = {row.efficacy.toFixed(2)}
            </p>
          )}
          {Object.entries(row.context.known).map(([key, value]) => (
            <p key={key}>
              {key} = {(value as number).toFixed(2)}
            </p>
          ))}
          <p className="pt-1">
            {t.routes.programmesUnknown}: {row.context.unknown.join(", ")}
          </p>
        </div>
      </details>
    </li>
  );
}

export function ProgrammeMatches({
  interview,
  provinceIso,
  t,
}: {
  interview: InterviewInput;
  provinceIso: string | null;
  t: Dictionary;
}) {
  const [level, setLevel] = useState<string>("all");
  const [sector, setSector] = useState<"all" | "public" | "private">("all");
  const [homeOnly, setHomeOnly] = useState(false);

  const result = useMemo<ProgrammeRecommendation>(
    () =>
      recommendProgrammes(interview.interest, {
        provinceIso: provinceIso ?? undefined,
        tier: interview.context.tier,
        mobility: interview.context.mobility,
        budgetBand:
          interview.context.cost === "unknown" ? undefined : interview.context.cost,
        onlyLevel: level === "all" ? undefined : level,
        onlySector: sector === "all" ? undefined : sector,
        onlyHomeProvince: homeOnly || undefined,
      }),
    [interview, provinceIso, level, sector, homeOnly],
  );

  if (!result.confidentEnough) {
    return (
      <section className="mt-8 rounded-lg border border-subtle bg-subtle/40 p-5" data-testid="programmes-declined">
        <h3 className="font-bold">{t.routes.programmesDeclineTitle}</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {result.blockers.includes("LOW_CONFIDENCE") && (
            <li>{t.routes.programmesDeclineLowConfidence}</li>
          )}
          {result.blockers.includes("UNDIFFERENTIATED_PROFILE") && (
            <li>
              {format(t.routes.programmesDeclineFlat, {
                diff: result.profile.differentiation.toFixed(2),
                gate: DIFFERENTIATION_GATE.toFixed(2),
              })}
            </li>
          )}
        </ul>
        <p className="mt-3 text-sm">{t.routes.programmesDeclineAction}</p>
      </section>
    );
  }

  const shown = result.top;

  const chip = (active: boolean) =>
    [
      "rounded-full border px-2.5 py-1 text-xs",
      active ? "border-accent bg-accent/10 font-bold" : "border-subtle text-muted",
    ].join(" ");

  return (
    <section className="mt-8" data-testid="programmes">
      <h3 className="text-xl font-bold">{t.routes.programmesTitle}</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        {format(t.routes.programmesIntro, { cap: CONTEXT_MAX })}
      </p>

      <div className="mt-4 rounded-lg border border-subtle p-4">
        <h4 className="text-sm font-bold">{t.routes.programmesFieldsTitle}</h4>
        <p className="mt-0.5 text-xs text-muted">{t.routes.programmesFieldsNote}</p>
        <ul className="mt-3 space-y-1.5">
          {result.fields.slice(0, 4).map((field) => (
            <li key={field.isced} className="flex items-baseline gap-3 text-sm">
              <span className="w-12 shrink-0 font-mono font-bold tabular-nums">
                {field.core.toFixed(1)}
              </span>
              <span className="min-w-0 flex-1 truncate">{field.iscedTitle}</span>
              <span className="shrink-0 text-xs text-muted">
                {format(t.routes.programmesReachable, { count: field.reachable })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/*
        Only levels this learner can actually enter next are offered. A ม.3
        leaver cannot enrol on ปวส., so a ปวส. chip is a button that can only
        ever produce an empty list — the filter row would be teaching them
        their own options wrongly.
      */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5" data-testid="programmes-filters">
        {["all", ...LEVELS_FOR_TIER[interview.context.tier ?? "none"]].map((value) => (
          <button key={value} type="button" onClick={() => setLevel(value)}
                  className={chip(level === value)}>
            {value === "all" ? t.routes.programmesFilterAll : value}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-subtle" aria-hidden="true" />
        {(["all", "public", "private"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setSector(value)}
                  className={chip(sector === value)}>
            {value === "all"
              ? t.routes.programmesFilterAll
              : value === "public"
                ? t.routes.programmesFilterPublic
                : t.routes.programmesFilterPrivate}
          </button>
        ))}
        {provinceIso && (
          <>
            <span className="mx-1 h-4 w-px bg-subtle" aria-hidden="true" />
            <button type="button" onClick={() => setHomeOnly((v) => !v)}
                    className={chip(homeOnly)}>
              {t.routes.programmesFilterProvince}
            </button>
          </>
        )}
        <span className="ml-auto text-xs text-muted">
          {format(t.routes.programmesShowing, {
            shown: shown.length,
            total: result.candidates,
          })}
        </span>
      </div>

      {shown.length === 0 && (
        <p className="mt-4 rounded border border-subtle bg-subtle/40 p-4 text-sm text-muted">
          {t.routes.programmesNoneAfterFilter}
        </p>
      )}

      <ol className="mt-3 space-y-3">
        {shown.map((row, i) => (
          <ProgrammeCard
            key={`${row.programme.institutionId}-${row.programme.title}`}
            row={row}
            rank={i + 1}
            t={t}
            homeProvince={provinceIso}
          />
        ))}
      </ol>

      <p className="mt-4 text-xs text-muted">
        {format(t.routes.programmesCoverage, {
          n: PROGRAMME_META.programmes,
          inst: PROGRAMME_META.institutions,
        })}{" "}
        {t.routes.programmesUnknownNote}
      </p>

      {/* Said once at the foot rather than on every card: it is a property
          of how the whole list was measured, not of any one programme. */}
      <p className="mt-1 text-xs text-muted">{t.routes.programmesDistanceCaveat}</p>
    </section>
  );
}
