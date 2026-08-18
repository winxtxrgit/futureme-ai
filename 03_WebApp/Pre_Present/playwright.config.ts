import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the production build with no LLM key present, which is
 * exactly how a reviewer will run it.
 *
 * Default: Playwright's bundled Chromium (`npm run test:e2e:install`).
 * If that download is blocked in your environment, set PW_CHANNEL=chrome to
 * drive a locally installed Google Chrome instead — identical tests, no download.
 */
const channel = process.env.PW_CHANNEL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  /*
   * `list` reads well in a terminal but writes nothing to disk, so on CI a
   * failed run left no playwright-report/ for the workflow to upload — the
   * artifact step was quietly collecting nothing, and a red build gave you a
   * line of text and no way to see the page it happened on.
   *
   * The HTML report is written on CI only. `never` stops it opening a browser
   * when the run ends, which would hang the job.
   */
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    // The app honours this: card transitions and the auto-advance delay both
    // collapse to zero. Without it Playwright waits for an animation to settle
    // before each of the assessment's thirty clicks, which dominates the run.
    contextOptions: { reducedMotion: "reduce" },
    baseURL: "http://127.0.0.1:3100",
    // A failure nobody can reproduce locally is the one that needs the trace,
    // and that is the CI one. Kept off otherwise: it costs time on every run
    // and locally you can just run the test again.
    trace: process.env.CI ? "retain-on-failure" : "off",
  },
  projects: [
    {
      name: channel ? `chrome (${channel})` : "chromium",
      use: { ...devices["Desktop Chrome"], ...(channel ? { channel } : {}) },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
