import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end: the flow a reviewer is asked to complete.
 * Runs against the production build with no ANTHROPIC_API_KEY set.
 */

async function completeInterview(page: Page, high: "practical" | "people" = "practical") {
  await page.goto("/");
  await page.getByTestId("start-guest").click();
  await expect(page).toHaveURL(/\/interview/);

  // Answer every interest item: the chosen group high, the rest low.
  const highIds = high === "practical" ? ["R1", "R2", "I1", "I2"] : ["S1", "S2", "E1", "E2"];
  const allIds = ["R1", "R2", "I1", "I2", "A1", "A2", "S1", "S2", "E1", "E2", "C1", "C2"];
  for (const id of allIds) {
    await page.getByTestId(`q-${id}-${highIds.includes(id) ? 5 : 2}`).click();
  }

  await page.getByTestId("ctx-tier-LOWER_SECONDARY").click();
  await page.getByTestId("ctx-cost-moderate").click();
  await page.getByTestId("ctx-mobility-can_move").click();
  await page.getByTestId("ctx-horizon-soon").click();
}

async function completeMission(page: Page) {
  await expect(page).toHaveURL(/\/mission/);
  await page
    .getByTestId("m-problem")
    .fill("The tool cupboard is disorganised and people waste time looking for equipment.");
  await page.getByTestId("m-approach-observe").click();
  await page.getByTestId("m-approach-organise").click();
  await page
    .getByTestId("m-evidence")
    .fill("I would time how long it takes to find a tool before and after the change.");
  await page.getByTestId("m-energy-ordering").click();
  await page.getByTestId("mission-submit").click();
}

test("guest completes interview → mission → routes → compare → 30-day plan", async ({ page }) => {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();

  await completeMission(page);

  // Routes.
  await expect(page).toHaveURL(/\/routes/);
  const heading = page.getByTestId("routes-heading");
  await expect(heading).toBeVisible();

  const cards = page.locator("ul > li").filter({ has: page.locator("h2") });
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(3);

  // Every card must show evidence, reasons, limitations and unknowns.
  await expect(page.getByText("Why this appeared").first()).toBeVisible();
  await expect(page.getByText("Evidence used").first()).toBeVisible();
  await expect(page.getByText("Still unanswered").first()).toBeVisible();
  await expect(page.getByText("Next experiment").first()).toBeVisible();

  // Compare.
  await page.getByTestId("go-compare").click();
  await expect(page).toHaveURL(/\/compare/);
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Evidence strength")).toBeVisible();

  // Select a route from the comparison table.
  await page.locator('[data-testid^="compare-select-"]').first().click();

  // Plan.
  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByTestId("plan-heading")).toBeVisible();
  await expect(page.getByText("WEEK 1")).toBeVisible();
  await expect(page.getByText("WEEK 4")).toBeVisible();
  await expect(page.getByText("This plan is exploratory")).toBeVisible();

  // Check in on a task and confirm it survives a reload.
  const firstTask = page.locator('[data-testid^="task-"]').first();
  await firstTask.check();
  await expect(firstTask).toBeChecked();
  await page.reload();
  await expect(page.locator('[data-testid^="task-"]').first()).toBeChecked();
});

test("no route is presented as the winner", async ({ page }) => {
  await completeInterview(page);
  await page.getByTestId("interview-continue").click();
  await completeMission(page);
  await expect(page).toHaveURL(/\/routes/);

  // Scan the route cards themselves. The page intro deliberately contains the
  // phrase "best match" inside a denial ("none of them is a best match"), so
  // scanning all of main would test the disclaimer rather than the cards.
  const cardTexts = await page
    .locator('li:has([data-testid^="select-"])')
    .evaluateAll((els) => els.map((e) => (e.textContent ?? "").toLowerCase()));

  expect(cardTexts.length).toBeGreaterThanOrEqual(1);
  for (const text of cardTexts) {
    for (const banned of ["best match", "perfect fit", "recommended", "top match", "winner", "% match"]) {
      expect(text, `card should not contain "${banned}"`).not.toContain(banned);
    }
    // No artificial precision anywhere on a card.
    expect(text).not.toMatch(/\d+\.\d+\s*%/);
  }

  // Every route action button carries identical styling — no single highlighted CTA.
  const buttons = page.locator('[data-testid^="select-"]');
  const n = await buttons.count();
  expect(n).toBeGreaterThanOrEqual(1);
  const classes = await buttons.evaluateAll((els) => els.map((e) => e.className));
  expect(new Set(classes).size).toBe(1);
  for (const c of classes) expect(c).not.toContain("bg-mint ");
});

test("guest progress survives a page refresh mid-interview", async ({ page }) => {
  await completeInterview(page);
  await page.reload();
  await expect(page.getByTestId("q-R1-5")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("ctx-tier-LOWER_SECONDARY")).toHaveAttribute("aria-pressed", "true");
});

test("an incomplete interview is blocked with an explanation, not a guess", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("q-R1-5").click();
  await page.getByTestId("interview-continue").click();

  await expect(page).toHaveURL(/\/interview/);
  await expect(page.getByText("A few things are still missing")).toBeVisible();
});

test("thin evidence yields no routes rather than invented ones", async ({ page }) => {
  await page.goto("/interview");
  // Answer the minimum count, but identically — no dimension stands out.
  for (const id of ["R1", "R2", "I1", "I2", "A1", "A2", "S1", "S2"]) {
    await page.getByTestId(`q-${id}-3`).click();
  }
  await page.getByTestId("ctx-tier-LOWER_SECONDARY").click();
  await page.getByTestId("ctx-cost-moderate").click();
  await page.getByTestId("ctx-mobility-can_move").click();
  await page.getByTestId("ctx-horizon-unsure").click();
  await page.getByTestId("interview-continue").click();

  await page.goto("/routes");
  await expect(page.getByTestId("insufficient-heading")).toBeVisible();
  await expect(page.getByText(/do not have enough evidence/i)).toBeVisible();
});

test("the safety rule pauses recommendations and offers support", async ({ page }) => {
  await completeInterview(page);
  await page.getByTestId("ctx-proud").fill("honestly sometimes I want to die");
  await page.getByTestId("interview-continue").click();

  await expect(page.getByText(/pause the career questions/i)).toBeVisible();
  await expect(page.getByText(/not a mental-health service/i)).toBeVisible();
  await expect(page.getByText(/1323/)).toBeVisible();
  await expect(page).not.toHaveURL(/\/mission/);
});

test("the optional AI endpoint falls back cleanly with no API key", async ({ request }) => {
  const res = await request.post("/api/explain", {
    data: { routeName: "Test route", reasons: ["INTEREST_MATCH"], fallbackText: "deterministic" },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.source).toBe("fallback");
  expect(body.text).toBe("deterministic");
});

test("the AI endpoint survives a malformed request", async ({ request }) => {
  const res = await request.post("/api/explain", {
    headers: { "content-type": "application/json" },
    data: "not json at all",
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).source).toBe("fallback");
});

test("data deletion clears the guest session", async ({ page }) => {
  await completeInterview(page);
  await page.goto("/privacy");
  await page.getByTestId("delete-data").click();
  await expect(page.getByText(/Deleted\./)).toBeVisible();

  await page.goto("/interview");
  await expect(page.getByTestId("q-R1-5")).toHaveAttribute("aria-pressed", "false");
});
