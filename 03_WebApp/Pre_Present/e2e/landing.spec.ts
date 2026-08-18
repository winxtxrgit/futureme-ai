import { expect, test } from "@playwright/test";

/**
 * The first screen, after it was reduced to a character, a sentence and one
 * action with the rest behind tabs.
 *
 * The risk in moving explanation behind a control is that the explanation
 * quietly stops being reachable. These check the opposite: that everything that
 * moved is still there, still findable by keyboard, and still in the page for a
 * screen reader and for find-in-page — and that the one action a learner is
 * meant to take is visible without scrolling.
 */

test("the character is the first thing, at a size you can read", async ({ page }) => {
  await page.goto("/");

  const svg = page.locator("[data-testid='landing-mascot'] svg");
  await expect(svg).toHaveCount(1);
  await expect(svg).toHaveAttribute("data-pose", "wave");

  const box = await page.getByTestId("landing-mascot").boundingBox();
  // It was 96px in a corner, which is a favicon rather than a face.
  expect(box!.width).toBeGreaterThanOrEqual(170);
});

test("the one action is visible without scrolling", async ({ page }) => {
  for (const [width, height] of [
    [1280, 800],
    [390, 850],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const top = await page.evaluate(() => {
      const button = document.querySelector("[data-testid='start-guest']");
      return Math.round(button!.getBoundingClientRect().top + window.scrollY);
    });
    expect(top, `${width}x${height}`).toBeLessThan(height);
  }
});

test("nothing that moved behind the tabs was lost", async ({ page }) => {
  await page.goto("/");

  // All three panels exist in the document from the start, so find-in-page and
  // assistive technology reach text that is not the open tab.
  for (const id of ["how", "honest", "more"]) {
    await expect(page.getByTestId(`landing-panel-${id}`)).toHaveCount(1);
  }

  // The honest-limitations list is the product's position, not filler.
  const honest = page.getByTestId("landing-panel-honest");
  await expect(honest).toContainText(/lib\/decision-engine/);

  // And the other entry points are still offered, just not as four equal
  // buttons before a learner knows what any of them are.
  await page.getByTestId("landing-tab-more").click();
  await expect(page.getByTestId("open-chat")).toBeVisible();
  await expect(page.getByTestId("open-nearby")).toBeVisible();
});

test("only the open panel is shown", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("landing-panel-how")).toBeVisible();
  await expect(page.getByTestId("landing-panel-honest")).toBeHidden();

  await page.getByTestId("landing-tab-honest").click();
  await expect(page.getByTestId("landing-panel-honest")).toBeVisible();
  await expect(page.getByTestId("landing-panel-how")).toBeHidden();
});

test("the tabs work from the keyboard", async ({ page }) => {
  await page.goto("/");

  // Content behind a control a keyboard cannot operate is content removed.
  await page.getByTestId("landing-tab-how").focus();
  await expect(page.getByTestId("landing-tab-how")).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("landing-tab-honest")).toBeFocused();
  await expect(page.getByTestId("landing-panel-honest")).toBeVisible();

  await page.keyboard.press("End");
  await expect(page.getByTestId("landing-tab-more")).toBeFocused();

  // Wraps, as a tab strip does.
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("landing-tab-how")).toBeFocused();
});

test("it is announced as a tab strip, not as three buttons", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("tablist")).toHaveCount(1);
  await expect(page.getByRole("tab")).toHaveCount(3);
  // Exactly one panel is exposed at a time.
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
});

test("it reads in both languages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "ไทย" }).click();
  await expect(page.getByTestId("landing-tab-how")).toHaveText("ทำงานอย่างไร");

  await page.getByRole("radio", { name: "EN" }).click();
  await expect(page.getByTestId("landing-tab-how")).toHaveText("How it works");
});

test("the character is decorative, so a screen reader is not told twice", async ({ page }) => {
  await page.goto("/");
  // The heading already says what this is; the drawing adds nothing a reader
  // needs announced.
  await expect(page.locator("[data-testid='landing-mascot'] svg")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("the character has a real box at every width", async ({ page }) => {
  for (const [width, height, atLeast] of [
    [390, 850, 150],
    [768, 900, 200],
    [1280, 800, 260],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const box = await page.getByTestId("landing-mascot").boundingBox();
    // Clipped to zero is the failure this guards: the component writes its
    // width as an inline style, so a class without `!` never wins.
    expect(box, `no box at ${width}px`).not.toBeNull();
    expect(box!.width, `${width}px viewport`).toBeGreaterThanOrEqual(atLeast);
    expect(box!.height, `${width}px viewport`).toBeGreaterThan(60);
  }
});

test("the page does not grow sideways to fit it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto("/");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflows).toBe(false);
});
