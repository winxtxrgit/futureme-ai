import { expect, type Page } from "@playwright/test";
import questions from "../../data/questions.json";

/**
 * The journey a learner walks, as reusable steps.
 *
 * Extracted from journey.spec.ts so a second suite can reach a later screen
 * without seeding localStorage by hand: a hand-written session would prove the
 * screen renders, not that the path to it still works.
 */

/**
 * Item ids come from the bank, not from literals. The instrument is expected to
 * change as it is revised; the journey it drives is not.
 */
export const ITEMS = questions.interest.map((q) => ({ id: q.id, dimension: q.dimension }));

/**
 * The assessment is a text conversation. These helpers use the same red user
 * chatbox as a learner while keeping the expected stored answers data-driven.
 */
export async function sendInterviewReply(page: Page, reply: string) {
  const current = page.getByTestId("interview-current-question");
  const questionId = await current.getAttribute("data-question-id");
  expect(questionId).toBeTruthy();
  await page.getByTestId("assessment-reply").fill(reply);
  await page.getByTestId("assessment-send").click();
  await expect(current).not.toHaveAttribute("data-question-id", questionId!);
}

export function contextReplyNumber(questionId: string, value: string): string {
  const question = questions.context.find((item) => item.id === questionId);
  const index = question?.options?.findIndex((option) => option.value === value) ?? -1;
  if (index < 0) throw new Error(`No context option ${questionId}:${value}`);
  return String(index + 1);
}

export async function completeInterview(page: Page, high: "practical" | "people" = "practical") {
  await page.goto("/");
  await page.getByTestId("start-guest").click();
  await expect(page).toHaveURL(/\/interview/);

  // Answer every interest item: the chosen dimensions high, the rest low.
  const highDims = high === "practical" ? ["R", "I"] : ["S", "E"];
  for (const item of ITEMS) {
    await sendInterviewReply(page, String(highDims.includes(item.dimension) ? 5 : 2));
  }

  await sendInterviewReply(page, contextReplyNumber("tier", "LOWER_SECONDARY"));
  await sendInterviewReply(page, contextReplyNumber("cost", "moderate"));
  await sendInterviewReply(page, contextReplyNumber("mobility", "can_move"));
  await sendInterviewReply(page, contextReplyNumber("horizon", "soon"));

  // Past the optional "something you were proud of" question, onto review.
  await page.getByTestId("assessment-skip").click();
  await expect(page.getByTestId("interview-continue")).toBeVisible();
}

/**
 * Which mission appears depends on the interview, so the helper fills whichever
 * one is on screen rather than assuming a fixed set of fields.
 */
const MISSION_ANSWERS: Record<
  string,
  { texts: Record<string, string>; multi: string[]; single: string }
> = {
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
};

export async function currentMissionId(page: Page): Promise<string> {
  await expect(page).toHaveURL(/\/mission/);
  const id = await page.getByTestId("mission-title").getAttribute("data-mission-id");
  expect(id, "the mission page must declare which mission it is showing").toBeTruthy();
  return id!;
}

export async function fillMission(page: Page): Promise<string> {
  const id = await currentMissionId(page);
  const answers = MISSION_ANSWERS[id];
  expect(answers, `no e2e answers defined for mission ${id}`).toBeTruthy();

  for (const [step, text] of Object.entries(answers.texts)) {
    await page.getByTestId(`m-${step}`).fill(text);
  }
  for (const value of answers.multi) {
    await page.getByTestId(`m-approach-${value}`).click();
  }
  await page.getByTestId(`m-energy-${answers.single}`).click();
  return id;
}

export async function completeMission(page: Page) {
  await fillMission(page);
  await page.getByTestId("mission-submit").click();
}
