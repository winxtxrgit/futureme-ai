import { expect, test, type Page } from "@playwright/test";
import { completeInterview, completeMission } from "./helpers/journey";

/**
 * Route suggestions naming real places a learner could go.
 *
 * What these guard is the boundary: the section may make a route concrete, and
 * it may not make one route look preferable to another.
 */

/**
 * Reached the way a learner reaches it. Seeding storage would prove the section
 * renders but not that it renders for routes the engine actually chose.
 */
async function reachRoutes(page: Page) {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);
  await expect(page).toHaveURL(/\/routes/);
  await expect(page.getByTestId("route-options")).toBeVisible();
}

test("no places are named until the learner picks a province", async ({ page }) => {
  await reachRoutes(page);

  await expect(page.getByTestId("routes-province")).toBeVisible();
  await expect(page.locator("[data-testid^='route-nearby-']")).toHaveCount(0);
});

test("picking a province gives every route a section, including empty ones", async ({ page }) => {
  await reachRoutes(page);
  await page.getByTestId("routes-province").selectOption("TH-50");

  const routeCards = page.locator("[data-route-id]");
  const routeCount = await routeCards.count();
  expect(routeCount).toBeGreaterThan(0);

  // Every route gets exactly one section. A route whose section were missing
  // would read as having nowhere to study, which is a different claim.
  await expect(page.locator("[data-testid^='route-nearby-']")).toHaveCount(routeCount);
});

test("the section says what it is not — a claim about programmes", async ({ page }) => {
  await reachRoutes(page);
  await page.getByTestId("routes-province").selectOption("TH-50");
  await expect(
    page.getByText(/ควรถามสถานศึกษาโดยตรงว่าเปิดสาขานี้ไหม|ask the college itself/).first(),
  ).toBeVisible();
});

test("the province is remembered across screens", async ({ page }) => {
  await reachRoutes(page);
  await page.getByTestId("routes-province").selectOption("TH-50");
  await expect(page.locator("[data-testid^='route-nearby-']").first()).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("routes-province")).toHaveValue("TH-50");

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}"),
  );
  expect(stored.provinceIso).toBe("TH-50");
});

test("deleting your data takes the province with it", async ({ page }) => {
  await reachRoutes(page);
  await page.getByTestId("routes-province").selectOption("TH-50");
  await expect(page.locator("[data-testid^='route-nearby-']").first()).toBeVisible();

  await page.goto("/privacy");
  // It is listed on the page that promises what is kept, not stored quietly.
  await expect(page.getByText(/จังหวัดที่คุณเลือก|province you picked/)).toBeVisible();

  await page.getByTestId("delete-data").click();
  const stored = await page.evaluate(() =>
    window.localStorage.getItem("futureme.guest.v1"),
  );
  expect(stored).toBeNull();
});

test("a stored province that is not a province is discarded, not trusted", async ({ page }) => {
  await reachRoutes(page);
  await page.evaluate(() => {
    const raw = window.localStorage.getItem("futureme.guest.v1");
    const session = raw ? JSON.parse(raw) : {};
    session.provinceIso = "../../etc/passwd";
    window.localStorage.setItem("futureme.guest.v1", JSON.stringify(session));
  });
  await page.reload();

  await expect(page.getByTestId("routes-province")).toHaveValue("");
  await expect(page.locator("[data-testid^='route-nearby-']")).toHaveCount(0);
});
