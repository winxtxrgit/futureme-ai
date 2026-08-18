import { expect, test } from "@playwright/test";
import questions from "../data/questions.json";

const first = questions.interest[0];
const second = questions.interest[1];

test("the interview is a chronological bot-left and user-right chat", async ({ page }) => {
  const chatRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/chat") chatRequests.push(request.url());
  });

  await page.goto("/interview");

  const questionBubble = page.getByTestId("interview-question-bubble");
  const transcript = page.getByTestId("interview-transcript");
  const composer = page.getByTestId("interview-composer");
  const chatPanel = page.getByTestId("interview-chat-panel");
  await expect(questionBubble).toHaveAttribute("data-bubble-side", "left");
  await expect(questionBubble).toContainText(first.text.en);
  await expect(transcript).toHaveAttribute("role", "log");
  await expect(composer.getByTestId("assessment-reply")).toBeVisible();
  await expect(transcript.getByTestId("interview-message-assistant")).toHaveCount(1);
  await expect(transcript.getByTestId("interview-message-user")).toHaveCount(0);
  await expect(chatPanel.getByRole("radio")).toHaveCount(0);
  await expect(chatPanel.getByRole("radiogroup")).toHaveCount(0);
  await expect(page.getByTestId("chat-avatar-user")).toHaveCount(1);

  const mascot = page.getByTestId("interview-mascot");
  const mascotStage = page.getByTestId("interview-mascot-stage");
  const activeTurn = page.getByTestId("interview-active-turn");
  const activeTail = activeTurn.getByTestId("interview-tail-assistant");
  await expect(mascot).toHaveCount(1);
  await expect(mascotStage).toHaveCount(1);
  await expect(chatPanel.getByTestId("interview-mascot-stage")).toHaveCount(1);
  await expect(transcript.getByTestId("interview-mascot-stage")).toHaveCount(1);
  await expect(activeTurn.getByTestId("interview-mascot-stage")).toHaveCount(1);
  await expect(activeTurn.getByTestId("chat-avatar-assistant")).toHaveCount(0);
  await expect(mascot.locator('.fm-mascot[data-crop="full"]')).toHaveCount(1);
  await expect(page.locator('svg.fm-mascot[data-crop="full"]')).toHaveCount(1);
  await expect(mascot).toHaveAttribute("data-mascot-force-motion", "system");
  await expect(mascot.locator('[data-fm-anim="on"]')).toHaveCount(1);
  await expect(activeTail).toHaveAttribute("data-tail-target", "mascot");
  await expect(page.getByTestId("interview-mascot-aura")).toBeVisible();
  await expect(page.getByTestId("interview-mascot-status-dot")).toBeVisible();

  await page.getByTestId("assessment-reply").fill("I love it");
  await page.getByTestId("assessment-send").click();
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    second.id,
  );
  await expect(activeTurn).toHaveAttribute("data-question-id", second.id);
  await expect(
    activeTurn.locator('[data-testid="interview-message-assistant"][data-active="true"]'),
  ).toHaveAttribute("data-question-id", second.id);
  const firstExchange = page.getByTestId("interview-exchange").first();
  await expect(firstExchange.getByTestId("interview-mascot-stage")).toHaveCount(0);
  await expect(firstExchange.getByTestId("interview-tail-assistant")).toHaveAttribute(
    "data-tail-target",
    "avatar",
  );
  await expect(firstExchange.getByTestId("interview-tail-user")).toHaveAttribute(
    "data-tail-target",
    "avatar",
  );
  await expect(activeTail).toHaveAttribute("data-tail-target", "mascot");

  const activeBubbleBox = await activeTurn.getByTestId("interview-bubble-assistant").boundingBox();
  const mascotStageBox = await activeTurn.getByTestId("interview-mascot-stage").boundingBox();
  expect(activeBubbleBox).not.toBeNull();
  expect(mascotStageBox).not.toBeNull();
  if (activeBubbleBox && mascotStageBox) {
    const horizontalGap = Math.max(
      0,
      activeBubbleBox.x - (mascotStageBox.x + mascotStageBox.width),
      mascotStageBox.x - (activeBubbleBox.x + activeBubbleBox.width),
    );
    const verticalGap = Math.max(
      0,
      activeBubbleBox.y - (mascotStageBox.y + mascotStageBox.height),
      mascotStageBox.y - (activeBubbleBox.y + activeBubbleBox.height),
    );
    expect(Math.hypot(horizontalGap, verticalGap)).toBeLessThanOrEqual(32);
  }

  const messages = page.locator('[data-testid^="interview-message-"]');
  await expect(messages).toHaveCount(3);
  const order = await messages.evaluateAll((nodes) =>
    nodes.map((node) => ({
      role: node.getAttribute("data-role"),
      side: node.getAttribute("data-side"),
      questionId: node.getAttribute("data-question-id"),
    })),
  );
  expect(order).toEqual([
    { role: "assistant", side: "left", questionId: first.id },
    { role: "user", side: "right", questionId: first.id },
    { role: "assistant", side: "left", questionId: second.id },
  ]);
  const boxes = await messages.evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    }),
  );
  expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[1].top);
  expect(boxes[1].bottom).toBeLessThanOrEqual(boxes[2].top);
  await expect(transcript.getByTestId("interview-composer")).toHaveCount(0);
  await expect(page.locator("#assessment-question")).toHaveCount(1);

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}"),
  );
  expect(stored.interview.interest[first.id]).toBe(5);
  expect(chatRequests).toEqual([]);
});

test("the interview mascot keeps a calm scene with readable character motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/interview");

  const mascot = page.getByTestId("interview-mascot");
  const scene = page.getByTestId("interview-mascot");
  const svg = mascot.locator("svg.fm-mascot");
  const aura = page.getByTestId("interview-mascot-aura");
  const orbit = mascot.locator(".interview-mascot-orbit");
  const spark = mascot.locator(".interview-mascot-spark").first();
  const statusDot = page.getByTestId("interview-mascot-status-dot");

  await expect(mascot).toHaveAttribute("data-mascot-state", "speaking");
  const openingStyles = await scene.evaluate((element) => {
    const getAnimation = (selector: string) => {
      const target = element.querySelector(selector);
      if (!target) return null;
      const style = getComputedStyle(target);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        delay: style.animationDelay,
      };
    };
    const sceneStyle = getComputedStyle(element);
    return {
      backgroundImage: sceneStyle.backgroundImage,
      boxShadow: sceneStyle.boxShadow,
      mouth: getAnimation(".fm-mouth-shape--smile"),
      arm: getAnimation(".fm-arm--right .fm-arm-limb"),
    };
  });
  expect(openingStyles.backgroundImage).toContain("radial-gradient");
  expect(openingStyles.boxShadow).not.toBe("none");
  expect(openingStyles.mouth).toEqual({
    name: "fm-chat-talk",
    duration: "0.9s",
    delay: "0s",
  });
  expect(openingStyles.arm).toEqual({
    name: "fm-chat-present",
    duration: "0.78s",
    delay: "0.14s",
  });
  await expect(aura).toHaveCSS("animation-name", "none");
  await expect(orbit).toHaveCSS("animation-name", "none");
  await expect(spark).toHaveCSS("animation-name", "none");
  await expect(statusDot).toHaveCSS("animation-name", "none");

  await expect(mascot).toHaveAttribute("data-mascot-state", "idle", { timeout: 3_000 });
  await expect(svg).toHaveAttribute("data-pose", "listen");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-name",
    "fm-listen-ping",
  );

  /*
   * The acknowledgement runs for 420ms and the page moves on at 480ms, so this
   * is a window that closes for good rather than a value to retry for. Waiting
   * for the state and *then* reading the style is two round trips through a
   * 60ms gap: when the first one lands late the second reads fm-breathe, the
   * resting animation, and the test fails for a reason that has nothing to do
   * with the acknowledgement.
   *
   * The read is armed before the click and fires on the attribute change
   * itself, so it captures the frame it is about rather than racing it.
   */
  const acknowledgement = scene.evaluate(
    (element) =>
      new Promise<{ name: string; duration: string } | null>((resolve) => {
        const read = () => {
          const target = element.querySelector(".fm-breathe");
          if (!target) return null;
          const style = getComputedStyle(target);
          return { name: style.animationName, duration: style.animationDuration };
        };
        if (element.getAttribute("data-mascot-state") === "offline") {
          resolve(read());
          return;
        }
        const observer = new MutationObserver(() => {
          if (element.getAttribute("data-mascot-state") !== "offline") return;
          observer.disconnect();
          resolve(read());
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["data-mascot-state"],
        });
      }),
  );

  await page.getByTestId("assessment-reply").fill("5");
  await page.getByTestId("assessment-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "offline");
  expect(await acknowledgement).toEqual({ name: "fm-interview-ack-pop", duration: "0.42s" });
});

test("the static interview scene preserves reduced motion and character-only opt-in", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/interview");

  const stage = page.getByTestId("interview-mascot-stage");
  const scene = page.getByTestId("interview-mascot");
  const aura = page.getByTestId("interview-mascot-aura");
  const orbit = scene.locator(".interview-mascot-orbit");
  const spark = scene.locator(".interview-mascot-spark").first();
  const statusDot = page.getByTestId("interview-mascot-status-dot");
  const characterRoot = scene.locator(".fm-root");
  const toggle = page.getByTestId("interview-motion-toggle");

  await expect(stage).toHaveAttribute("data-mascot-force-motion", "system");
  await expect(aura).toHaveCSS("animation-name", "none");
  await expect(orbit).toHaveCSS("animation-name", "none");
  await expect(spark).toHaveCSS("animation-name", "none");
  await expect(statusDot).toHaveCSS("animation-name", "none");
  await expect(characterRoot).toHaveCSS("animation-name", "none");
  await expect(scene).not.toHaveCSS("background-image", "none");
  await expect(scene).not.toHaveCSS("box-shadow", "none");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(stage).toHaveAttribute("data-mascot-force-motion", "on");
  await expect(scene.locator("svg.fm-mascot")).toHaveAttribute("data-fm-motion", "on");
  await expect(aura).toHaveCSS("animation-name", "none");
  await expect(orbit).toHaveCSS("animation-name", "none");
  await expect(spark).toHaveCSS("animation-name", "none");
  await expect(statusDot).toHaveCSS("animation-name", "none");
  await expect(characterRoot).toHaveCSS("animation-name", "fm-float");

  await page.reload();
  await expect(page.getByTestId("interview-motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("interview-mascot-stage")).toHaveAttribute(
    "data-mascot-force-motion",
    "on",
  );
});

test("unclear text is not guessed and Enter sends a corrected reply", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/interview");

  const input = page.getByTestId("assessment-reply");
  const mascot = page.getByTestId("interview-mascot");
  await input.fill("maybe I guess");
  await page.getByTestId("assessment-send").click();

  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    first.id,
  );
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#assessment-reply-error")).toContainText(/without guessing/i);
  await expect(mascot).toHaveAttribute("data-mascot-state", "error");
  await expect(page.getByTestId("interview-message-user")).toHaveCount(0);
  const afterInvalid = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("futureme.guest.v1") ?? "{}"),
  );
  expect(afterInvalid.interview?.interest?.[first.id]).toBeUndefined();

  await input.fill("4");
  await input.press("Enter");
  await expect(mascot).toHaveAttribute("data-mascot-state", "offline");
  await expect(page.getByTestId("interview-current-question")).toHaveAttribute(
    "data-question-id",
    second.id,
  );
  await expect(page.getByTestId("assessment-reply")).toBeFocused();
});

test("the chat timeline fits phone, narrow desktop and desktop screens", async ({ page }) => {
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 760 });
    await page.goto("/interview");

    /*
     * Measure the resting layout, not a frame of the entry animation.
     *
     * The active turn arrives under `animate-[card-in_220ms_ease-out]`, whose
     * transform puts it two pixels outside the transcript while it plays. A
     * measurement that landed inside those 220ms failed this assertion for a
     * reason it is not about: the laid-out width is fine, and the overshoot is
     * the animation doing its job. That is the whole of the intermittency here.
     *
     * Only finite animations are awaited. The mascot breathes and floats on
     * infinite loops, so waiting on those would hang forever.
     */
    await page.locator("svg.fm-mascot").first().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      const settling = document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined));
      await Promise.all(settling);
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${width}px viewport should not scroll horizontally`).toBeLessThanOrEqual(0);
    const transcriptOverflow = await page.getByTestId("interview-transcript").evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(transcriptOverflow, `${width}px transcript should not scroll horizontally`).toBeLessThanOrEqual(1);
    const transcript = page.getByTestId("interview-transcript");
    const activeTurn = page.getByTestId("interview-active-turn");
    const stage = activeTurn.getByTestId("interview-mascot-stage");
    const fullMascot = stage.locator('svg.fm-mascot[data-crop="full"]');
    const bubble = activeTurn.getByTestId("interview-bubble-assistant");
    const tail = activeTurn.getByTestId("interview-tail-assistant");
    await expect(page.getByTestId("interview-mascot-stage")).toHaveCount(1);
    await expect(transcript.getByTestId("interview-mascot-stage")).toHaveCount(1);
    await expect(activeTurn.getByTestId("interview-mascot-stage")).toHaveCount(1);
    await expect(fullMascot).toHaveCount(1);
    await expect(tail).toHaveAttribute("data-tail-target", "mascot");
    const [transcriptBox, stageBox, mascotBox, bubbleBox, tailBox] = await Promise.all([
      transcript.boundingBox(),
      stage.boundingBox(),
      fullMascot.boundingBox(),
      bubble.boundingBox(),
      tail.boundingBox(),
    ]);
    expect(transcriptBox).not.toBeNull();
    expect(stageBox).not.toBeNull();
    expect(mascotBox).not.toBeNull();
    expect(bubbleBox).not.toBeNull();
    expect(tailBox).not.toBeNull();
    if (transcriptBox && stageBox && mascotBox && bubbleBox && tailBox) {
      /*
       * The character is deliberately smaller below `sm`, where it stacks
       * above the question instead of sitting beside it. At the size it keeps
       * on wider screens it pushed the question itself off a 390×850 phone —
       * the learner opened the interview and had to scroll before finding out
       * what was being asked. The floor stays in place at every width so it
       * cannot quietly shrink to nothing; it is just a lower floor here.
       */
      const [minMascotWidth, minMascotHeight] = width < 640 ? [100, 110] : [140, 160];
      expect(mascotBox.width).toBeGreaterThanOrEqual(minMascotWidth);
      expect(mascotBox.width).toBeLessThanOrEqual(200);
      expect(mascotBox.height).toBeGreaterThanOrEqual(minMascotHeight);
      expect(stageBox.x).toBeGreaterThanOrEqual(transcriptBox.x - 1);
      expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(
        transcriptBox.x + transcriptBox.width + 1,
      );
      if (width < 640) {
        expect(stageBox.y + stageBox.height).toBeLessThanOrEqual(bubbleBox.y + 1);
        expect(tailBox.y).toBeLessThan(bubbleBox.y);
        expect(tailBox.y + tailBox.height).toBeGreaterThanOrEqual(bubbleBox.y - 2);
        expect(tailBox.x + tailBox.width / 2).toBeGreaterThan(bubbleBox.x);
        expect(tailBox.x + tailBox.width / 2).toBeLessThan(bubbleBox.x + bubbleBox.width);
      } else {
        expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(bubbleBox.x + 1);
        expect(tailBox.x).toBeLessThan(bubbleBox.x);
        expect(tailBox.x + tailBox.width).toBeGreaterThanOrEqual(bubbleBox.x - 2);
        expect(tailBox.y + tailBox.height / 2).toBeGreaterThan(bubbleBox.y);
        expect(tailBox.y + tailBox.height / 2).toBeLessThan(bubbleBox.y + bubbleBox.height);
      }
    }
    await expect(page.getByTestId("interview-question-bubble")).toBeVisible();
    await expect(page.getByTestId("interview-composer")).toBeVisible();
    await expect(page.getByTestId("interview-mascot")).toBeVisible();
    await expect(page.getByTestId("chat-avatar-user")).toBeVisible();
  }
});
