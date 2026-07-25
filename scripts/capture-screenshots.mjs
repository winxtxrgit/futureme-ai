/**
 * Captures the screenshots used in the READMEs from the running application.
 *
 * Run against the production build so the images match what a reviewer sees:
 *
 *   npm run build && npm start -- --port 3100 &
 *   npm run screenshots
 *
 * Deliberately NOT part of the e2e suite. These are documentation assets, and a
 * CI job that rewrites committed images on every run makes every diff noisy.
 */
import { chromium } from "@playwright/test";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "assets/screenshots/app";

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** The interview answers that drive each captured state. */
const PROFILES = {
  practical: ["R1", "R2", "I1", "I2"],
  people: ["S1", "S2", "E1", "E2"],
};
const ALL_ITEMS = ["R1", "R2", "I1", "I2", "A1", "A2", "S1", "S2", "E1", "E2", "C1", "C2"];

async function answerInterview(page, profile = "practical") {
  const high = PROFILES[profile];
  await page.goto(`${BASE}/`);
  await page.getByTestId("start-guest").click();
  for (const id of ALL_ITEMS) {
    await page.getByTestId(`q-${id}-${high.includes(id) ? 5 : 2}`).click();
  }
  await page.getByTestId("ctx-tier-LOWER_SECONDARY").click();
  await page.getByTestId("ctx-cost-moderate").click();
  await page.getByTestId("ctx-mobility-can_move").click();
  await page.getByTestId("ctx-horizon-soon").click();
}

/** Fills whichever mission the rule selected, then submits. */
async function completeMission(page) {
  const id = await page.getByTestId("mission-title").getAttribute("data-mission-id");
  const answers = {
    "mission-school-problem": {
      texts: {
        problem: "The tool cupboard is disorganised and people waste time looking for equipment.",
        evidence: "I would time how long it takes to find a tool before and after the change.",
      },
      multi: ["observe", "organise"],
      single: "ordering",
    },
    "mission-make-something": {
      texts: {
        thing: "The club shelf is too shallow, so half the equipment sits on the floor instead.",
        tradeoff: "I would give up two weekends and some of my own money to buy the timber.",
      },
      multi: ["takeapart", "rough"],
      single: "hands",
    },
    "mission-run-something": {
      texts: {
        activity: "A revision session before the maths exam for anyone in my year who wants one.",
        hard: "Nobody turns up, so I would ask people to commit the week before and remind them.",
      },
      multi: ["askneed", "teach"],
      single: "helping",
    },
  }[id];

  if (!answers) throw new Error(`no screenshot answers defined for mission ${id}`);

  for (const [step, text] of Object.entries(answers.texts)) {
    await page.getByTestId(`m-${step}`).fill(text);
  }
  for (const value of answers.multi) await page.getByTestId(`m-approach-${value}`).click();
  await page.getByTestId(`m-energy-${answers.single}`).click();
  await page.getByTestId("mission-submit").click();
}

async function shot(page, name) {
  await page.waitForTimeout(250); // let transitions settle
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`captured ${name}`);
}

async function capture(browser, viewport, suffix) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await page.goto(`${BASE}/`);
  await shot(page, `landing-${suffix}`);

  await answerInterview(page);
  await shot(page, `interview-${suffix}`);

  await page.getByTestId("interview-continue").click();
  await shot(page, `mission-${suffix}`);

  await completeMission(page);
  await shot(page, `routes-${suffix}`);

  await page.getByTestId("go-compare").click();
  await shot(page, `compare-${suffix}`);

  await page.locator('[data-testid^="compare-select-"]').first().click();
  await shot(page, `plan-${suffix}`);

  await page.goto(`${BASE}/privacy`);
  await shot(page, `privacy-${suffix}`);

  await context.close();
}

/** The two states a reviewer is least likely to reach by accident. */
async function captureEdgeCases(browser) {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Too-flat profile: every answer identical, so the engine refuses.
  await page.goto(`${BASE}/interview`);
  for (const id of ALL_ITEMS) await page.getByTestId(`q-${id}-3`).click();
  await page.getByTestId("ctx-tier-LOWER_SECONDARY").click();
  await page.getByTestId("ctx-cost-moderate").click();
  await page.getByTestId("ctx-mobility-can_move").click();
  await page.getByTestId("ctx-horizon-unsure").click();
  await page.goto(`${BASE}/routes`);
  await shot(page, "insufficient-desktop");

  // The safeguarding pause.
  await page.goto(`${BASE}/privacy`);
  await page.getByTestId("delete-data").click();
  await answerInterview(page);
  await page.getByTestId("ctx-proud").fill("honestly sometimes I want to die");
  await page.getByTestId("interview-continue").click();
  await shot(page, "safety-desktop");

  await context.close();
}

/**
 * Recompress in place. Playwright writes uncompressed PNGs, and these are
 * committed — a README that costs 20 MB to clone is a bad README.
 */
async function compress() {
  let before = 0;
  let after = 0;

  for (const name of await readdir(OUT)) {
    if (!name.endsWith(".png")) continue;
    const file = path.join(OUT, name);
    before += (await stat(file)).size;

    const optimised = await sharp(file)
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer();

    await writeFile(file, optimised);
    after += optimised.length;
  }

  const mb = (n) => (n / 1024 / 1024).toFixed(1);
  console.log(`compressed ${mb(before)} MB -> ${mb(after)} MB`);
}

const browser = await chromium.launch();
try {
  await mkdir(OUT, { recursive: true });
  await capture(browser, DESKTOP, "desktop");
  await capture(browser, MOBILE, "mobile");
  await captureEdgeCases(browser);
} finally {
  await browser.close();
}

await compress();
console.log("done");
