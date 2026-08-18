#!/usr/bin/env node
/*
 * Copies the mascot's source of truth from the design lab into the app.
 *
 *   node scripts/sync-mascot.mjs           copy lab → app
 *   node scripts/sync-mascot.mjs --check   fail if they differ (runs in verify)
 *
 * The character is designed in 04_Design/FutureMe_Mascot_Lab, where it can be
 * previewed in every state without booting Next. The app gets a copy rather
 * than a reach across the repo so that a build never depends on a sibling
 * folder existing. The --check mode is what keeps the copy honest: without it
 * the two versions drift within a week and nobody notices until a state that
 * worked in the lab renders wrong in production.
 *
 * Only mascot.js and mascot.css are synced. The exported SVGs in public/mascot/
 * are regenerated in the lab (`node tools/export-assets.js`) and copied by hand
 * when the character changes, because they are build output, not source.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lab = resolve(appRoot, "../../04_Design/FutureMe_Mascot_Lab");

const FILES = [
  { from: join(lab, "mascot.js"), to: join(appRoot, "lib/mascot/mascot.js") },
  { from: join(lab, "mascot.css"), to: join(appRoot, "app/mascot.css") },
];

const check = process.argv.includes("--check");

if (!existsSync(lab)) {
  // A checkout of the app alone is a legitimate state — the vendored copies are
  // committed, so there is nothing to verify and nothing to fail.
  console.log("sync-mascot: design lab not present, skipping");
  process.exit(0);
}

let drifted = 0;

for (const { from, to } of FILES) {
  const source = readFileSync(from, "utf8");
  const current = existsSync(to) ? readFileSync(to, "utf8") : null;

  if (source === current) continue;

  if (check) {
    drifted += 1;
    console.error(`sync-mascot: ${to.replace(appRoot + "/", "")} differs from the design lab`);
  } else {
    writeFileSync(to, source);
    console.log(`sync-mascot: updated ${to.replace(appRoot + "/", "")}`);
  }
}

if (check && drifted > 0) {
  console.error(
    "\nThe mascot was edited in one place but not the other.\n" +
      "Edit it in 04_Design/FutureMe_Mascot_Lab, then run: npm run sync:mascot",
  );
  process.exit(1);
}

if (check) console.log("sync-mascot: in sync with the design lab");
