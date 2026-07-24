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
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3100", trace: "off" },
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
