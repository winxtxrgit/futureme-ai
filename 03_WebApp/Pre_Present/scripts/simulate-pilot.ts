/**
 * Generates a synthetic pilot dataset with a known structure.
 *
 *   node scripts/simulate-pilot.ts <out-dir> [--n 300] [--loading 0.75] [--seed 7]
 *
 * This exists to validate the *analysis pipeline*, not the instrument. If the
 * pipeline is fed data built from an exactly known circumplex and does not
 * recover it, the pipeline is broken — and that has to be established before any
 * real participant data is analysed, because on real data there is no ground
 * truth to check the arithmetic against.
 *
 * To be explicit, since this is the easiest thing in the project to misread:
 * **numbers produced from this data say nothing about the instrument.** They are
 * a self-test of the code. Simulated participants have no interests.
 *
 * How the structure is built. Six latent dimensions are placed as unit vectors
 * on a circle at 60-degree intervals, so
 *
 *     corr(z_i, z_j) = cos(theta_i - theta_j)
 *
 * which gives +0.5 for adjacent types, -0.5 for alternate and -1.0 for
 * opposite. That is a textbook-perfect circular order, so the correspondence
 * index computed from it should come back at or very near +1.0.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { mulberry32 } from "../lib/research/psychometrics.ts";
import { RIASEC_ORDER } from "../lib/research/circumplex.ts";
import { DATASET_SCHEMA } from "../lib/research/dataset.ts";

const ITEMS_PER_DIMENSION = 5;
const SCALE_POINTS = [1, 2, 3, 4, 5];

function parseArgs(argv: string[]) {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i] ?? "";
    else positional.push(argv[i]);
  }
  return { dir: positional[0], flags };
}

/** Box-Muller, so the latent variables are actually normal. */
function makeNormal(rand: () => number) {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = rand() * 2 - 1;
      v = rand() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const factor = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * factor;
    return u * factor;
  };
}

/** Maps a continuous score onto 1..5 with roughly symmetric cut points. */
function discretise(x: number): number {
  if (x < -1.2) return 1;
  if (x < -0.4) return 2;
  if (x < 0.4) return 3;
  if (x < 1.2) return 4;
  return 5;
}

function main() {
  const { dir, flags } = parseArgs(process.argv.slice(2));
  if (!dir) {
    console.error("usage: node scripts/simulate-pilot.ts <out-dir> [--n 300] [--loading 0.75] [--seed 7]");
    process.exit(1);
  }

  const n = Number(flags.n ?? 300);
  const loading = Number(flags.loading ?? 0.75);
  const seed = Number(flags.seed ?? 7);
  const rand = mulberry32(seed);
  const normal = makeNormal(rand);

  const dims = [...RIASEC_ORDER];
  const itemOrder: string[] = [];
  const itemDimensions: string[] = [];
  // Interleaved, matching how the real instrument is administered.
  for (let k = 1; k <= ITEMS_PER_DIMENSION; k++) {
    for (const d of dims) {
      itemOrder.push(`SIM-${d}-${String(k).padStart(2, "0")}`);
      itemDimensions.push(d);
    }
  }

  mkdirSync(dir, { recursive: true });

  for (let p = 0; p < n; p++) {
    // Two independent normals define a point in the latent plane; each
    // dimension is that point projected onto its own direction on the circle.
    const u = normal();
    const v = normal();
    const latent = dims.map((_, i) => {
      const theta = (i * Math.PI) / 3; // 60 degrees
      return Math.cos(theta) * u + Math.sin(theta) * v;
    });

    const answers: Record<string, number> = {};
    const secondsPerItem: (number | null)[] = [];
    const revisions: Record<string, number> = {};

    itemOrder.forEach((id, idx) => {
      const d = dims.indexOf(itemDimensions[idx] as (typeof dims)[number]);
      const unique = Math.sqrt(Math.max(0, 1 - loading * loading)) * normal();
      answers[id] = discretise(loading * latent[d] + unique);
      // Plausible reading times so the careless indices have something to chew on.
      secondsPerItem.push(2 + rand() * 6);
      revisions[id] = rand() < 0.05 ? 1 : 0;
    });

    const tier = ["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"][Math.floor(rand() * 3)];
    const language = rand() < 0.5 ? "th" : "en";
    const startedAt = new Date(Date.now() - Math.floor(rand() * 6e5)).toISOString();

    const file = {
      meta: {
        schema: DATASET_SCHEMA,
        instrument: "simulated-circumplex-v1",
        itemOrder,
        itemDimensions,
        scalePoints: SCALE_POINTS,
        exportedAt: new Date().toISOString(),
      },
      participants: [
        {
          participantId: `sim-${seed}-${p}`,
          language,
          tier,
          answers,
          secondsPerItem,
          revisions,
          startedAt,
          exportedAt: new Date().toISOString(),
        },
      ],
    };

    writeFileSync(path.join(dir, `sim-${String(p).padStart(4, "0")}.json`), JSON.stringify(file), "utf8");
  }

  console.log(`wrote ${n} simulated participants to ${dir}`);
  console.log(`  latent structure: perfect circumplex (adjacent +0.5, alternate -0.5, opposite -1.0)`);
  console.log(`  item loading: ${loading}, items per dimension: ${ITEMS_PER_DIMENSION}`);
  console.log(`  NOTE: this validates the pipeline, not the instrument.`);
}

main();
