import { expect, test, type Page } from "@playwright/test";
import { completeInterview, completeMission } from "./helpers/journey";

/**
 * How long these screens are on the phone a Thai student actually owns.
 *
 * Length was not being watched, and it drifted badly: /nearby for Bangkok ran to
 * 17,152px — twenty screens of flat list, which nobody reaches the bottom of —
 * and the routes screen pushed the first route card to y=1137, so a learner who
 * had just answered thirty questions saw no answer at all without scrolling.
 *
 * The ceilings below are generous against the numbers after the fix. They exist
 * to catch a return to that order of magnitude, not to freeze a pixel count, so
 * a section can be added without tripping them and a list cannot go unbounded
 * again without someone noticing.
 */

const PHONE = { width: 390, height: 850 };

async function pageHeight(page: Page) {
  return page.evaluate(() => document.documentElement.scrollHeight);
}

test.use({ viewport: PHONE });

test("the province with the most options stays readable", async ({ page }) => {
  await page.goto("/nearby?province=TH-10");
  await expect(page.getByTestId("nearby-summary")).toBeVisible();

  // Bangkok returns more institutions than anywhere else, so it is the case
  // that breaks first.
  expect(await pageHeight(page)).toBeLessThan(8_000);
});

test("a filter narrows the list rather than only reordering it", async ({ page }) => {
  await page.goto("/nearby?province=TH-10");
  await expect(page.getByTestId("nearby-summary")).toBeVisible();
  const everything = await pageHeight(page);

  await page.getByTestId("nearby-filter-degree").click();
  const degreeOnly = await pageHeight(page);

  expect(degreeOnly).toBeLessThan(everything);
  await expect(page.getByTestId("nearby-filter-degree")).toHaveAttribute("aria-pressed", "true");
});

test("a long group is previewed, and opens on request", async ({ page }) => {
  await page.goto("/nearby?province=TH-10");
  await expect(page.getByTestId("nearby-summary")).toBeVisible();

  const more = page.locator("[data-testid^='nearby-more-']").first();
  await expect(more).toBeVisible();

  const before = await page.getByTestId("nearby-option").count();
  await more.click();
  expect(await page.getByTestId("nearby-option").count()).toBeGreaterThan(before);
});

test("the routes a learner earned are near the top of the screen", async ({ page }) => {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);
  await expect(page.getByTestId("route-options")).toBeVisible();

  const top = await page.evaluate(() => {
    const card = document.querySelector("[data-route-id]");
    return card ? Math.round(card.getBoundingClientRect().top + window.scrollY) : -1;
  });

  expect(top).toBeGreaterThan(0);
  // One screen's worth of preamble at most. It was 1,137px.
  expect(top).toBeLessThan(1_000);
});

test("how the engine decided is available, but not in front of the answer", async ({ page }) => {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);

  // Present and reachable — this is the product's honesty, not decoration.
  const summary = page.getByTestId("signal-summary");
  await expect(summary).toBeVisible();
  await expect(summary).not.toHaveAttribute("open", "");

  // SignalSummary contains a nested disclosure of its own, so this names the
  // outer one rather than whichever the DOM happens to yield first.
  await summary.locator("> summary").click();
  await expect(summary).toHaveAttribute("open", "");
});

test("no screen scrolls sideways on a phone", async ({ page }) => {
  for (const path of ["/", "/nearby?province=TH-10", "/privacy", "/how-it-works"]) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows, `${path} scrolls sideways`).toBe(false);
  }
});
