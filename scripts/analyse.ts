/**
 * Pilot analysis pipeline.
 *
 *   node scripts/analyse.ts <directory-of-exports> [--out report.md] [--min-seconds N]
 *
 * Reads a directory of per-participant exports, merges them, and writes the
 * report a validation study has to contain. Every statistic it prints comes from
 * lib/research/, whose arithmetic is verified against hand-checked reference
 * values in tests/unit/psychometrics.test.ts.
 *
 * The report deliberately states what it cannot conclude. A pipeline that
 * printed alpha next to a verdict would invite the reader to treat a screening
 * statistic as a validation, which is the specific mistake this project exists
 * to avoid.
 *
 * Run with plain node — the research modules have no imports and no
 * dependencies, so there is nothing to install and nothing that can change the
 * numbers between runs.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  mergeDatasets,
  scaleMatrix,
  itemsForDimension,
  scaleCorrelationMatrix,
  type PilotDataset,
} from "../lib/research/dataset.ts";
import { scaleStatistics } from "../lib/research/psychometrics.ts";
import {
  circumplexCorrespondence,
  meanCorrelationByDistance,
  RIASEC_ORDER,
} from "../lib/research/circumplex.ts";
import { assessCareless, type ScaleResponses } from "../lib/research/careless.ts";

/** Benchmarks from the literature. Context for a result, never a pass mark. */
const BENCHMARKS = {
  circumplexMeta: 0.63, // Tracey & Rounds (1993) meta-analytic CI across RIASEC measures
  alphaRuleOfThumb: 0.7, // The O*NET manual calls this "a heuristic", not a standard
};

function fail(message: string): never {
  console.error(`analyse: ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i] ?? "";
    else positional.push(argv[i]);
  }
  return { dir: positional[0], flags };
}

function fmt(x: number | null | undefined, digits = 3): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "—";
  return x.toFixed(digits);
}

function loadDirectory(dir: string) {
  let names: string[];
  try {
    names = readdirSync(dir).filter((n) => n.endsWith(".json"));
  } catch {
    return fail(`cannot read directory ${dir}`);
  }
  if (names.length === 0) fail(`no .json exports found in ${dir}`);

  return names.map((name) => {
    const source = path.join(dir, name);
    try {
      return { source: name, data: JSON.parse(readFileSync(source, "utf8")) as unknown };
    } catch {
      return { source: name, data: null };
    }
  });
}

function carelessReport(dataset: PilotDataset, minSeconds: number | null) {
  const dims = [...RIASEC_ORDER];
  const rows = dataset.participants.map((p, index) => {
    const scales: ScaleResponses[] = dims.map((d) => ({
      scale: d,
      values: itemsForDimension(dataset, d).map((id) => {
        const v = p.answers[id];
        return typeof v === "number" ? v : null;
      }),
    }));
    const seconds = dataset.meta.itemOrder
      .map((_, i) => p.secondsPerItem?.[i])
      .filter((s): s is number => typeof s === "number" && Number.isFinite(s));

    const assessment = assessCareless(
      scales,
      minSeconds === null ? {} : { minSecondsPerItem: minSeconds },
      { secondsPerItem: seconds },
    );
    return { index, participantId: p.participantId, ...assessment };
  });

  const flagged = rows.filter((r) => r.flags.length > 0);
  return { rows, flagged };
}

function main() {
  const { dir, flags } = parseArgs(process.argv.slice(2));
  if (!dir) {
    fail("usage: node scripts/analyse.ts <directory-of-exports> [--out report.md] [--min-seconds N]");
  }

  const files = loadDirectory(dir);
  const { dataset, rejected, duplicates } = mergeDatasets(files);

  if (dataset.participants.length === 0) {
    fail(`merged 0 participants (${rejected.length} file(s) rejected)`);
  }

  const minSeconds = flags["min-seconds"] ? Number(flags["min-seconds"]) : null;
  const scaleMin = Math.min(...dataset.meta.scalePoints);
  const scaleMax = Math.max(...dataset.meta.scalePoints);
  const dims = [...RIASEC_ORDER];

  const careless = carelessReport(dataset, minSeconds);
  const structural = scaleCorrelationMatrix(dataset, dims, scaleMin, scaleMax);
  const circumplex = structural.n >= 3 ? circumplexCorrespondence(structural.matrix) : null;
  const byDistance = structural.n >= 3 ? meanCorrelationByDistance(structural.matrix) : null;

  const L: string[] = [];
  const w = (s = "") => L.push(s);

  w("# Pilot analysis report");
  w();
  w(`Generated ${new Date().toISOString()} from \`${dir}\`.`);
  w();
  w("> **What this report is.** Item and scale statistics for a collected sample, computed by");
  w("> `lib/research/`. It describes *this dataset*. It does not by itself establish that the");
  w("> instrument is valid — that requires the full sequence in");
  w("> [validation-plan.md](../docs/validation-plan.md), of which this is stages 2 to 4.");
  w();
  w("---");
  w();
  w("## 1. Sample");
  w();
  w(`- Instrument: \`${dataset.meta.instrument}\``);
  w(`- Files read: ${files.length}`);
  w(`- Participants merged: **${dataset.participants.length}**`);
  w(`- Files rejected: ${rejected.length}`);
  w(`- Duplicate participant ids dropped: ${duplicates.length}`);
  w(`- Items: ${dataset.meta.itemOrder.length}, scale points: ${dataset.meta.scalePoints.join("/")}`);
  if (rejected.length > 0) {
    w();
    w("Rejected files:");
    w();
    for (const r of rejected) w(`- \`${r.source}\` — ${r.reason}`);
  }

  const byTier = new Map<string, number>();
  const byLang = new Map<string, number>();
  for (const p of dataset.participants) {
    byTier.set(p.tier ?? "unstated", (byTier.get(p.tier ?? "unstated") ?? 0) + 1);
    byLang.set(p.language, (byLang.get(p.language) ?? 0) + 1);
  }
  w();
  w("| Stratum | n |");
  w("|---|---|");
  for (const [k, v] of byTier) w(`| tier: ${k} | ${v} |`);
  for (const [k, v] of byLang) w(`| language: ${k} | ${v} |`);

  if (dataset.participants.length < 200) {
    w();
    w(
      `> ⚠️ **n = ${dataset.participants.length}.** The validation plan asks for roughly 200–300 for stable item statistics. ` +
        "Everything below is provisional and the confidence intervals should be read, not the point estimates.",
    );
  }

  w();
  w("---");
  w();
  w("## 2. Data quality");
  w();
  w(
    `Screening indices per participant (Meade & Craig, 2012; Curran, 2016). Thresholds applied: ` +
      `longstring ≥ ${careless.rows[0]?.thresholdsUsed.longstringAtLeast}, IRV ≤ ` +
      `${careless.rows[0]?.thresholdsUsed.irvAtMost}, even–odd < ` +
      `${careless.rows[0]?.thresholdsUsed.evenOddBelow}` +
      (minSeconds === null
        ? ", no response-time floor (none supplied)."
        : `, median < ${minSeconds}s per item.`),
  );
  w();
  w(`- Participants with at least one flag: **${careless.flagged.length}** of ${careless.rows.length}`);
  const flagCounts = new Map<string, number>();
  for (const r of careless.flagged) for (const f of r.flags) flagCounts.set(f, (flagCounts.get(f) ?? 0) + 1);
  if (flagCounts.size > 0) {
    w();
    w("| Flag | n |");
    w("|---|---|");
    for (const [k, v] of flagCounts) w(`| ${k} | ${v} |`);
  }
  w();
  w(
    "> Flags are inputs to a judgement, not exclusions. Report results both with and without " +
      "flagged participants; some good data is always removed by cleaning. In a translated " +
      "instrument given to 13-year-olds, a flag may indicate reading difficulty rather than " +
      "inattention.",
  );

  if (minSeconds === null) {
    w();
    w(
      "> No response-time floor was applied because none was supplied. Calibrate one on this " +
        "sample's own distribution and state the percentile used — the commonly quoted " +
        "2 s/item is described in its own source as an educated guess.",
    );
  }

  w();
  w("---");
  w();
  w("## 3. Scale reliability");
  w();
  w("| Scale | items | n | α | 95% CI | ω (1-factor) | mean inter-item r | M | SD |");
  w("|---|---|---|---|---|---|---|---|---|");

  const scaleStats = dims.map((d) => {
    const matrix = scaleMatrix(dataset, d);
    return { dimension: d, stats: scaleStatistics(matrix, dataset.meta.scalePoints) };
  });

  for (const { dimension, stats } of scaleStats) {
    w(
      `| ${dimension} | ${stats.items} | ${stats.n} | ${fmt(stats.alpha)} | ` +
        `[${fmt(stats.alphaCI[0])}, ${fmt(stats.alphaCI[1])}] | ${fmt(stats.omegaTotal)} | ` +
        `${fmt(stats.averageInterItem)} | ${fmt(stats.scaleMean, 2)} | ${fmt(stats.scaleSd, 2)} |`,
    );
  }

  const below = scaleStats.filter(
    (s) => Number.isFinite(s.stats.alpha) && s.stats.alpha < BENCHMARKS.alphaRuleOfThumb,
  );
  w();
  if (below.length > 0) {
    w(
      `Scales below the conventional α ≥ ${BENCHMARKS.alphaRuleOfThumb} rule of thumb: ` +
        `**${below.map((s) => s.dimension).join(", ")}**. Note the O*NET manual describes that ` +
        "figure as a heuristic rather than a standard, and that its own school-aged sample " +
        "produced α .60–.79.",
    );
  } else {
    w(`All scales reach the conventional α ≥ ${BENCHMARKS.alphaRuleOfThumb} heuristic.`);
  }
  w();
  w(
    "> α assumes tau-equivalence, which interest scales rarely satisfy; ω from a single-factor " +
      "model is reported beside it. Neither replaces a confirmatory factor analysis.",
  );

  w();
  w("---");
  w();
  w("## 4. Item statistics");
  w();
  w("Corrected item–total correlations. Items below .30 are conventionally reviewed.");
  w();
  w("| Item | dim | M | SD | r(item, rest) | share at midpoint |");
  w("|---|---|---|---|---|---|");

  const midpoint = dataset.meta.scalePoints[Math.floor(dataset.meta.scalePoints.length / 2)];
  const weakItems: string[] = [];
  for (const { dimension, stats } of scaleStats) {
    const ids = itemsForDimension(dataset, dimension);
    stats.itemStats.forEach((it, i) => {
      const id = ids[i] ?? `${dimension}#${i}`;
      if (Number.isFinite(it.correctedItemTotal) && it.correctedItemTotal < 0.3) weakItems.push(id);
      w(
        `| \`${id}\` | ${dimension} | ${fmt(it.mean, 2)} | ${fmt(it.sd, 2)} | ` +
          `${fmt(it.correctedItemTotal)} | ${fmt(it.distribution[midpoint] ?? 0, 2)} |`,
      );
    });
  }
  w();
  if (weakItems.length > 0) {
    w(`Items with r(item, rest) < .30: **${weakItems.map((i) => `\`${i}\``).join(", ")}**.`);
  } else {
    w("No item fell below r(item, rest) = .30.");
  }
  w();
  w(
    `> The "share at midpoint" column is the per-item **${midpoint} = not sure** rate. An outlying ` +
      "value is a translation or exposure problem rather than noise — it means learners did not " +
      "recognise the activity. This is the diagnostic the midpoint was retained to provide.",
  );

  w();
  w("---");
  w();
  w("## 5. Structure — Holland's circular order");
  w();
  w(`Scale intercorrelations, complete cases only (n = ${structural.n}).`);
  w();
  w(`| | ${dims.join(" | ")} |`);
  w(`|---|${dims.map(() => "---").join("|")}|`);
  structural.matrix.forEach((row, i) => {
    w(`| **${dims[i]}** | ${row.map((v) => fmt(v)).join(" | ")} |`);
  });

  if (circumplex && byDistance) {
    w();
    w("| Statistic | Value |");
    w("|---|---|");
    w(`| Correspondence index (CI) | **${fmt(circumplex.ci)}** |`);
    w(`| Predictions met / violated / tied | ${circumplex.predictionsMet} / ${circumplex.predictionsViolated} / ${circumplex.ties} |`);
    w(`| Total order predictions | ${circumplex.totalPredictions} |`);
    w(`| Randomisation p (exact, ${circumplex.permutations} permutations) | ${fmt(circumplex.p, 4)} |`);
    w(`| Mean r, adjacent types | ${fmt(byDistance[1])} |`);
    w(`| Mean r, alternate types | ${fmt(byDistance[2])} |`);
    w(`| Mean r, opposite types | ${fmt(byDistance[3])} |`);
    w();
    const ordered = byDistance[1] > byDistance[2] && byDistance[2] > byDistance[3];
    w(
      ordered
        ? "The predicted ordering adjacent > alternate > opposite holds in the means."
        : "⚠️ The predicted ordering adjacent > alternate > opposite does **not** hold in the means — inspect the matrix for which band is out of place.",
    );
    w();
    w(
      `Compared with the meta-analytic benchmark of CI = ${BENCHMARKS.circumplexMeta} across RIASEC ` +
        "measures (Tracey & Rounds, 1993). There is no threshold at which this statistic " +
        "\"passes\"; read it against that benchmark and against the negative cross-cultural " +
        "finding in Rounds & Tracey (1996).",
    );
  } else {
    w();
    w("> Too few complete cases to run the structural test.");
  }

  w();
  w("---");
  w();
  w("## 6. What this does and does not establish");
  w();
  w("**Supported by this report, if the numbers hold:** internal consistency of each scale in this");
  w("sample; which items are weak; whether the circular order is recoverable in this sample.");
  w();
  w("**Not supported by this report:**");
  w();
  w("- Convergent validity — no second interest measure was administered.");
  w("- Criterion validity — no outcome was followed up.");
  w("- Measurement invariance — not tested here, so **scores must not be compared across tiers,");
  w("  languages or genders** on the basis of this report alone.");
  w("- Norms — no reference distribution exists, so no score may be called high or low.");
  w("- Test–retest reliability — a single administration cannot estimate it.");
  w();
  w("Cite this as a pilot item-analysis of a research-informed prototype instrument, not as a");
  w("validation study.");
  w();

  const report = L.join("\n");
  const out = flags.out;
  if (out) {
    writeFileSync(out, report, "utf8");
    console.log(`wrote ${out} (${dataset.participants.length} participants)`);
  } else {
    console.log(report);
  }
}

main();
