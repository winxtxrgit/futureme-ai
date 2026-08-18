import { expect, test } from "@playwright/test";
import questions from "../data/questions.json";

const first = questions.interest[0];
const second = questions.interest[1];
const third = questions.interest[2];

/** Answer the question on screen and wait for the next one to arrive. */
async function answer(page: import("@playwright/test").Page, reply: string, nextId: string) {
  await page.getByTestId("assessment-reply").fill(reply);
  await page.getByTestId("assessment-send").click();
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    nextId,
  );
}

test("the reset control is hidden until there is something to discard", async ({ page }) => {
  await page.goto("/interview");

  await expect(page.getByTestId("assessment-reset")).toHaveCount(0);

  await answer(page, "I love it", second.id);
  await expect(page.getByTestId("assessment-reset")).toBeVisible();
});

test("resetting asks first, and cancelling keeps every answer", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(2);

  await page.getByTestId("assessment-reset").click();

  // The prompt has to say what is about to be lost, before it is lost.
  const confirm = page.getByTestId("assessment-reset-confirm");
  await expect(confirm).toBeVisible();
  await expect(confirm).toHaveAttribute("role", "alertdialog");
  await expect(confirm).toContainText("cannot be undone");
  await expect(page.getByTestId("assessment-reset-confirm-yes")).toBeFocused();

  await page.getByTestId("assessment-reset-cancel").click();

  await expect(confirm).toHaveCount(0);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(2);
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    third.id,
  );
  // Focus returns to the control that opened the prompt, not to the page top.
  await expect(page.getByTestId("assessment-reset")).toBeFocused();
});

test("Escape backs out of the confirmation without discarding anything", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);

  await page.getByTestId("assessment-reset").click();
  await expect(page.getByTestId("assessment-reset-confirm")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByTestId("assessment-reset-confirm")).toHaveCount(0);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(1);
  await expect(page.getByTestId("assessment-reset")).toBeFocused();
});

test("confirming clears the answers and returns to the first question", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();

  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );
  await expect(page.getByTestId("interview-question-bubble")).toContainText(first.text.en);
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);
  await expect(page.getByTestId("assessment-reset-confirm")).toHaveCount(0);
  // Nothing left to discard, so the control stands down again.
  await expect(page.getByTestId("assessment-reset")).toHaveCount(0);
});

test("the cleared state survives a refresh rather than coming back", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);

  await page.reload();

  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}"),
  );
  expect(stored.interview.interest).toEqual({});
  expect(stored.interview.context).toEqual({});
});

test("research timing is discarded with the answers it describes", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await answer(page, "I dislike it", third.id);

  const before = await page.evaluate(() =>
    window.localStorage.getItem("futureme.research.v1"),
  );
  expect(before).not.toBeNull();

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);

  /*
   * Kept behind, the next attempt's answers get filed against the first
   * attempt's timings, and a learner who simply restarted reads in the pilot
   * data as one who deliberated a long time and then revised.
   *
   * The store is not empty afterwards and should not be: question one is on
   * screen again, so a fresh clock has already started for it. What must be
   * gone is everything the previous attempt recorded — no entry for the
   * question that was answered and left behind, and an unanswered clock for
   * the one now showing.
   */
  const after = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.research.v1") ?? "null"),
  );
  expect(after?.items?.[second.id]).toBeUndefined();
  expect(after?.items?.[first.id]).toMatchObject({ firstResponseMs: -1, revisions: 0 });
});

test("deleting your data on the privacy page takes the timing with it", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  await expect
    .poll(async () => page.evaluate(() => window.localStorage.getItem("futureme.research.v1")))
    .not.toBeNull();

  await page.goto("/privacy");
  await page.getByTestId("delete-data").click();

  const research = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.research.v1") ?? "null"),
  );
  expect(research?.items ?? {}).toEqual({});
});

test("focus stays in the composer when resetting from the first question", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);
  // Back to question one, so the reset does not change the step index and the
  // usual focus move never fires.
  await page.getByTestId("assessment-prev").click();
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();

  await expect(page.getByTestId("assessment-reply")).toBeFocused();
});

test("the reset is announced rather than happening silently", async ({ page }) => {
  await page.goto("/interview");
  await answer(page, "I love it", second.id);

  await page.getByTestId("assessment-reset").click();
  await page.getByTestId("assessment-reset-confirm-yes").click();

  await expect(page.getByRole("status").filter({ hasText: "answers were cleared" })).toHaveCount(1);
});

test("the control is written in Thai when the learner reads Thai", async ({ page }) => {
  await page.goto("/interview");
  await page.getByRole("radio", { name: "ไทย" }).click();
  // Answered the way a Thai learner actually types it, particle and all, which
  // also proves the parser's politeness handling is wired to the real screen.
  await answer(page, "ชอบครับ", second.id);

  await expect(page.getByTestId("assessment-reset")).toHaveText("เริ่มตอบใหม่");
  await page.getByTestId("assessment-reset").click();
  await expect(page.getByTestId("assessment-reset-confirm")).toContainText("กู้คืนไม่ได้");
  await expect(page.getByTestId("assessment-reset-confirm-yes")).toHaveText("ใช่ ลบคำตอบของฉัน");
});
