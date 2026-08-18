import { expect, test, type Page } from "@playwright/test";
import routesData from "../data/routes.json";
import {
  ITEMS,
  completeInterview,
  completeMission,
  contextReplyNumber,
  sendInterviewReply,
} from "./helpers/journey";

/**
 * The plan reached the way a learner reaches it, rather than by seeding storage:
 * the roadmap is drawn from whichever route the engine actually selected, and a
 * hand-written session would not prove that path still works.
 */
async function reachPlan(page: Page) {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);

  await expect(page).toHaveURL(/\/routes/);
  await page.locator('[data-testid^="select-"]').first().click();
  await page.locator('[data-testid^="plan-"]').first().click();
  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByTestId("plan-heading")).toBeVisible();
}

/**
 * The same journey, but arranged so the engine actually has gaps to append
 * tasks for: "I don't know yet" on cost and location only becomes a notice on a
 * route that is expensive and needs relocation. The interest profile is shaped
 * to surface one; which route that is depends on the catalogue, so the test
 * reads it off the page rather than naming it. Without this the marker never
 * renders and a test about it could only ever skip.
 */
async function reachPlanWithGaps(page: Page) {
  await page.goto("/");
  await page.getByTestId("start-guest").click();
  await expect(page).toHaveURL(/\/interview/);

  for (const item of ITEMS) {
    // Investigative alone. R and I together now surface three vocational
    // routes — the expanded catalogue gave a hands-on learner much better
    // local, affordable options, which is the point of it, and leaves this
    // test with no expensive relocation route to hang a gap notice on.
    await sendInterviewReply(page, String(item.dimension === "I" ? 5 : 2));
  }
  await sendInterviewReply(page, contextReplyNumber("tier", "LOWER_SECONDARY"));
  await sendInterviewReply(page, contextReplyNumber("cost", "unknown"));
  await sendInterviewReply(page, contextReplyNumber("mobility", "unknown"));
  await sendInterviewReply(page, contextReplyNumber("horizon", "soon"));
  await page.getByTestId("assessment-skip").click();

  await page.getByTestId("interview-continue").click();
  await completeMission(page);
  await expect(page).toHaveURL(/\/routes/);

  /*
   * The route is found rather than named. This used to pin
   * sci-math-engineering, which was the expensive relocation-heavy route the
   * profile surfaced out of six — with twelve, another one outranks it and the
   * test failed while nothing was wrong.
   *
   * What the test actually needs is any route carrying the unknown-cost and
   * unknown-location gaps, so it takes whichever the engine put first.
   */
  await expect(page.getByTestId("route-options")).toBeVisible();

  // Whichever surfaced route is both expensive and needs relocation — those are
  // the two properties that turn "I don't know yet" into a gap notice. Read from
  // the catalogue rather than named, so adding routes cannot silently turn this
  // into a test that passes without ever rendering the thing it is about.
  const gapRoutes = new Set(
    routesData.routes
      .filter((route) => route.costBand === "high" && route.requiresRelocation)
      .map((route) => route.id),
  );
  const surfaced = await page.locator("[data-route-id]").evaluateAll((cards) =>
    cards.map((card) => card.getAttribute("data-route-id")),
  );
  const routeId = surfaced.find((id) => id && gapRoutes.has(id));
  expect(routeId, "no surfaced route is both expensive and relocation-heavy").toBeTruthy();

  await page.getByTestId(`select-${routeId}`).click();
  await page.getByTestId(`plan-${routeId}`).click();
  await expect(page).toHaveURL(/\/plan/);
}

test("the plan is drawn as a roadmap with one numbered stop per week", async ({ page }) => {
  await reachPlan(page);

  const roadmap = page.getByTestId("plan-roadmap");
  await expect(roadmap).toBeVisible();

  const stops = page.locator('[data-testid^="roadmap-stop-"]');
  await expect(stops).toHaveCount(4);

  // The stops carry the plan's order, not the layout's.
  for (let week = 1; week <= 4; week += 1) {
    await expect(page.getByTestId(`roadmap-stop-${week}`)).toBeVisible();
  }
  await expect(roadmap).toContainText("WEEK 1");
  await expect(roadmap).toContainText("WEEK 4");
});

test("a stop turns complete only when every task in it is ticked", async ({ page }) => {
  await reachPlan(page);

  const stop = page.getByTestId("roadmap-stop-1");
  await expect(stop).toHaveAttribute("data-complete", "false");

  const tasks = stop.locator('input[type="checkbox"]');
  const count = await tasks.count();
  expect(count).toBeGreaterThan(1);

  // All but one: still incomplete, because a partly done week is not done.
  for (let i = 0; i < count - 1; i += 1) await tasks.nth(i).check();
  await expect(stop).toHaveAttribute("data-complete", "false");

  await tasks.nth(count - 1).check();
  await expect(stop).toHaveAttribute("data-complete", "true");
  await expect(stop).toContainText("All tasks ticked");

  // Unticking one takes it back, rather than latching on first completion.
  await tasks.nth(0).uncheck();
  await expect(stop).toHaveAttribute("data-complete", "false");
});

test("ticking a task still saves across a reload", async ({ page }) => {
  await reachPlan(page);

  const stop = page.getByTestId("roadmap-stop-1");
  const first = stop.locator('input[type="checkbox"]').first();
  await first.check();

  await page.reload();

  await expect(page.getByTestId("roadmap-stop-1").locator('input[type="checkbox"]').first())
    .toBeChecked();
});

test("the overall progress bar still tracks the ticked tasks", async ({ page }) => {
  await reachPlan(page);

  const bar = page.getByRole("progressbar");
  await expect(bar).toHaveAttribute("aria-valuenow", "0");

  await page.getByTestId("roadmap-stop-1").locator('input[type="checkbox"]').first().check();

  await expect(bar).not.toHaveAttribute("aria-valuenow", "0");
});

test("the roadmap fits a phone without scrolling sideways", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await reachPlan(page);

  await expect(page.getByTestId("plan-roadmap")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the earliest unfinished week is marked as where to pick up", async ({ page }) => {
  await reachPlan(page);

  // Nothing done yet, so week 1 is where you start.
  await expect(page.getByTestId("roadmap-stop-1")).toHaveAttribute("data-current", "true");
  await expect(page.getByTestId("roadmap-stop-1")).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("roadmap-stop-2")).toHaveAttribute("data-current", "false");
  await expect(page.getByTestId("roadmap-stop-2")).not.toHaveAttribute("aria-current", "step");

  // Finishing week 1 moves the marker on rather than leaving it behind.
  const tasks = page.getByTestId("roadmap-stop-1").locator('input[type="checkbox"]');
  const count = await tasks.count();
  for (let i = 0; i < count; i += 1) await tasks.nth(i).check();

  await expect(page.getByTestId("roadmap-stop-1")).toHaveAttribute("data-current", "false");
  await expect(page.getByTestId("roadmap-stop-2")).toHaveAttribute("data-current", "true");

  // Exactly one stop is current at a time.
  await expect(page.locator('[data-current="true"]')).toHaveCount(1);
});

test("the list keeps its semantics despite being laid out as a grid", async ({ page }) => {
  await reachPlan(page);

  // `display: grid` on a list item drops the role in WebKit, so it is explicit.
  await expect(page.getByTestId("plan-roadmap")).toHaveAttribute("role", "list");
  await expect(page.getByTestId("roadmap-stop-1")).toHaveAttribute("role", "listitem");
  await expect(page.getByRole("list").filter({ has: page.getByTestId("roadmap-stop-1") }))
    .toBeVisible();
});

test("a ticked task strikes the sentence but not the reason it exists", async ({ page }) => {
  // Answering "I don't know yet" to cost and location is what makes the engine
  // append gap tasks, so the marker exists to assert on at all.
  await reachPlanWithGaps(page);

  const marker = page.locator('[data-testid^="gap-marker-"]').first();
  await expect(marker).toBeVisible();

  const checkbox = marker
    .locator('xpath=ancestor::label')
    .locator('input[type="checkbox"]');
  await checkbox.check();

  await expect(marker).not.toHaveCSS("text-decoration-line", "line-through");
  // The sentence itself is struck, which is the part that is now done.
  await expect(marker.locator("xpath=preceding-sibling::span")).toHaveCSS(
    "text-decoration-line",
    "line-through",
  );
});

test("the roadmap reads in Thai", async ({ page }) => {
  await reachPlan(page);
  await page.getByRole("radio", { name: "ไทย" }).click();

  await expect(page.getByTestId("plan-roadmap")).toContainText("สัปดาห์ที่ 1");
  await expect(page.getByTestId("plan-roadmap")).toContainText("สัปดาห์ที่ 4");
});
