import { expect, test, type Page } from "@playwright/test";
import questions from "../data/questions.json";

/**
 * Answering by tapping.
 *
 * Thirty-five questions with five fixed answers each used to be reachable only
 * through the keyboard. These check that the chips are a genuine second route
 * to the same place — not a separate path that records answers its own way.
 */

const first = questions.interest[0];
const second = questions.interest[1];
const scale = questions.scale as { value: number; label: { en: string; th: string } }[];

const currentQuestion = (page: Page) => page.getByTestId("interview-current-question");

test("offers one chip per answer, in scale order", async ({ page }) => {
  await page.goto("/interview");

  const chips = page.getByTestId("interview-quick-replies").getByRole("button");
  await expect(chips).toHaveCount(scale.length);

  for (const [index, point] of scale.entries()) {
    await expect(page.getByTestId(`quick-reply-${index + 1}`)).toContainText(point.label.en);
  }
});

test("a tap answers the question and moves on", async ({ page }) => {
  await page.goto("/interview");
  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", first.id);

  await page.getByTestId("quick-reply-4").click();

  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
  await expect(page.getByTestId("interview-message-user")).toContainText(scale[3].label.en);
});

test("a tap and the typed word record the same answer", async ({ page }) => {
  const read = async (p: Page) =>
    p.evaluate(
      () => JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}").interview.interest,
    );

  await page.goto("/interview");
  await page.getByTestId("quick-reply-4").click();
  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
  const tapped = await read(page);

  // Same question again, answered with the keyboard instead.
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/interview");
  await page.getByTestId("assessment-reply").fill(scale[3].label.en);
  await page.getByTestId("assessment-send").click();
  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
  const typed = await read(page);

  expect(tapped).toEqual(typed);
});

test("the chips follow the language the learner reads", async ({ page }) => {
  await page.goto("/interview");
  await page.getByRole("radio", { name: "ไทย" }).click();

  await expect(page.getByTestId("quick-reply-4")).toContainText(scale[3].label.th);
  await page.getByTestId("quick-reply-4").click();
  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
});

test("the situation questions get their own options, not the interest scale", async ({ page }) => {
  await page.goto("/interview");
  for (const item of questions.interest) {
    void item;
    await page.getByTestId("quick-reply-4").click();
  }

  // First context question: its own set, so the count differs from the scale.
  const tier = questions.context.find((q) => q.id === "tier");
  await expect(page.getByTestId("interview-quick-replies").getByRole("button")).toHaveCount(
    tier?.options?.length ?? 0,
  );
});

test("the optional free-text question offers no chips to tap", async ({ page }) => {
  await page.goto("/interview");
  for (const item of questions.interest) {
    void item;
    await page.getByTestId("quick-reply-4").click();
  }
  for (const context of questions.context) {
    if (!context.options) continue;
    await page.getByTestId("quick-reply-1").click();
  }

  // Nothing here is a fixed choice, so there is nothing to offer.
  await expect(page.getByTestId("interview-quick-replies")).toHaveCount(0);
  await expect(page.getByTestId("assessment-reply")).toBeVisible();
});

test("typing still works, and the chips do not steal the composer", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("assessment-reply").fill("I love it");
  await page.getByTestId("assessment-send").click();
  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
  await expect(page.getByTestId("assessment-reply")).toHaveValue("");
});

test("the chips are reachable and operable from the keyboard", async ({ page }) => {
  await page.goto("/interview");

  const chip = page.getByTestId("quick-reply-2");
  await chip.focus();
  await expect(chip).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(currentQuestion(page)).toHaveAttribute("data-question-id", second.id);
});

test("the set is announced as a group rather than as loose words", async ({ page }) => {
  await page.goto("/interview");
  const group = page.getByTestId("interview-quick-replies");
  await expect(group).toHaveAttribute("role", "group");
  await expect(group).toHaveAttribute("aria-label", /.+/);
});

test("the chips fit a phone without scrolling it sideways", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/interview");
  await expect(page.getByTestId("interview-quick-replies")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
