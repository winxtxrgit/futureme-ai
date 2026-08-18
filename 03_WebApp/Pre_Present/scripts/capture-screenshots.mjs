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
import questions from "../data/questions.json" with { type: "json" };

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "assets/screenshots/app";

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

/**
 * Pins the interface language and theme.
 *
 * Without this the capture inherits the runner's `prefers-color-scheme`, so the
 * committed images flip between light and dark depending on which machine ran
 * the script. Documentation that changes appearance by accident is worse than
 * documentation that is slightly out of date, because nobody can tell which is
 * intended.
 */
async function setPreferences(page, { lang = "en", theme = "dark" } = {}) {
  await page.getByTestId(`theme-${theme}`).click();
  await page.getByTestId(`lang-${lang}`).click();
}

/** The interview answers that drive each captured state, read from the bank. */
const PROFILES = { practical: ["R", "I"], people: ["S", "E"] };
/*
 * Every screen the assessment asks before the context questions: the interest
 * items and, since the second axis shipped, the self-efficacy ones. Both are
 * answered the same way — a numbered chip — so one list drives both.
 */
const ALL_ITEMS = [...questions.interest, ...(questions.efficacy ?? [])].map((q) => ({
  id: q.id,
  dimension: q.dimension,
}));

/**
 * Walks the step-based assessment the way a learner does, one question at a
 * time, and stops on the review screen.
 *
 * `pause` is awaited just before the interest item at its index is answered,
 * which is how the documentation captures a mid-assessment question card rather
 * than the first or the last screen.
 */
async function answerInterview(page, profile = "practical", pause = null, prefs = {}) {
  const high = PROFILES[profile];
  await page.goto(`${BASE}/`);
  await setPreferences(page, prefs);
  await page.getByTestId("start-guest").click();

  /*
   * The assessment is a chat now: one question at a time, answered with a
   * numbered chip rather than a per-item radio. The old selector
   * (`q-<id>-<value>`) has not existed since that redesign, which is why this
   * script had quietly stopped producing images.
   *
   * Each answer plays a short acknowledgement before the next question
   * arrives, so the loop waits for the question counter to move rather than
   * for a fixed delay. A fixed delay silently dropped six answers and left the
   * capture stranded mid-assessment.
   */
  /*
   * Answer, then confirm the question actually changed before moving on.
   *
   * A fixed delay is not enough on its own: an acknowledgement animation plays
   * between questions, and a click that lands while the old card is unmounting
   * is swallowed with no error. That silently lost six answers and stranded
   * the capture mid-assessment, which looks exactly like a broken selector.
   * Re-clicking when the counter has not moved is self-healing and costs
   * nothing when it already has.
   */
  const counter = async () =>
    (await page.getByTestId("assessment-progress-label").textContent())?.trim() ?? "";

  const answerAndAdvance = async (choice) => {
    const before = await counter();
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await page.getByTestId(`quick-reply-${choice}`).click({ timeout: 5000 });
      await page.waitForTimeout(560);
      if ((await counter()) !== before) return;
    }
    throw new Error(`assessment did not advance past "${before}"`);
  };

  for (let i = 0; i < ALL_ITEMS.length; i++) {
    if (pause && pause.at === i) await pause.run();
    const item = ALL_ITEMS[i];
    await answerAndAdvance(high.includes(item.dimension) ? 5 : 2);
  }

  // Context questions use the same chips, in the order their options are
  // listed: ม.3, moderate budget, willing to move, deciding soon.
  for (const choice of [1, 2, 2, 1]) {
    await answerAndAdvance(choice);
  }
  // Past the optional free-text question, onto the review screen.
  await page.getByTestId("assessment-skip").click();
  await page.waitForTimeout(500);
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

async function shot(page, name, { fullPage = true } = {}) {
  // Long enough for the assessment's auto-advance plus its card transition,
  // otherwise the question card is captured part-way through its fade.
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log(`captured ${name}`);
}

async function capture(browser, viewport, suffix) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await page.goto(`${BASE}/`);
  await setPreferences(page);
  await shot(page, `landing-${suffix}`);

  // Captured part-way through, where the question card is the whole screen.
  // The pause deliberately does not navigate: stepping back and forward inside
  // the answering loop desynchronises it from the item it expects next.
  await answerInterview(page, "practical", {
    at: 3,
    run: () => shot(page, `interview-${suffix}`),
  });

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

/**
 * Showcase stills for the README.
 *
 * These exist to document capabilities that a single screenshot cannot show at
 * once: that the assessment is one question at a time, that it runs in Thai, and
 * that it has a real light theme rather than an inverted dark one.
 */
async function captureShowcase(browser) {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Thai, light: bilingual copy and the light palette in one frame.
  await page.goto(`${BASE}/privacy`);
  await setPreferences(page, { lang: "th", theme: "light" });
  await page.getByTestId("delete-data").click();
  await page.goto(`${BASE}/interview`);
  for (let i = 0; i < 4; i++) {
    const item = ALL_ITEMS[i];
    await page.getByTestId(`q-${item.id}-4`).click();
  }
  // Step back one: answering advances, so the card on screen would otherwise be
  // an unanswered one and the selected state — the thing worth showing — would
  // not appear in the still.
  await page.getByTestId("assessment-prev").click();
  await shot(page, "interview-th-light-desktop");

  // The review step, in English on dark, at the end of the assessment.
  await page.goto(`${BASE}/privacy`);
  await setPreferences(page, { lang: "en", theme: "dark" });
  await page.getByTestId("delete-data").click();
  await answerInterview(page);
  // Viewport height rather than the full page: the review lists all thirty
  // answers, and a 2,700px still would swamp the README it is embedded in.
  await shot(page, "interview-review-desktop", { fullPage: false });

  await context.close();
}

/** The two states a reviewer is least likely to reach by accident. */
async function captureEdgeCases(browser) {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Too-flat profile: every answer identical, so the engine refuses.
  await page.goto(`${BASE}/`);
  await setPreferences(page);
  await page.goto(`${BASE}/interview`);
  for (const item of ALL_ITEMS) await page.getByTestId(`q-${item.id}-3`).click();
  await page.getByTestId("ctx-tier-LOWER_SECONDARY").click();
  await page.getByTestId("ctx-cost-moderate").click();
  await page.getByTestId("ctx-mobility-can_move").click();
  await page.getByTestId("ctx-horizon-unsure").click();
  await page.goto(`${BASE}/routes`);
  await shot(page, "insufficient-desktop");

  // The safeguarding pause. The free text is reached back through the review
  // list, which is where the assessment leaves off.
  await page.goto(`${BASE}/privacy`);
  await page.getByTestId("delete-data").click();
  await answerInterview(page);
  await page.getByTestId("review-proud").click();
  await page.getByTestId("ctx-proud").fill("honestly sometimes I want to die");
  await page.getByTestId("go-review").click();
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

// Honour PW_CHANNEL (e.g. "chrome") so screenshots can be regenerated where the
// bundled Chromium download is blocked — the same fallback the e2e config uses.
const browser = await chromium.launch(
  process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {},
);
try {
  await mkdir(OUT, { recursive: true });
  await capture(browser, DESKTOP, "desktop");
  await capture(browser, MOBILE, "mobile");
  await captureShowcase(browser);
  await captureEdgeCases(browser);
} finally {
  await browser.close();
}

await compress();
console.log("done");
