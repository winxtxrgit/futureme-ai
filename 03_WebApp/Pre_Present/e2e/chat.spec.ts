import { expect, test } from "@playwright/test";

test("the repo-grounded chat works without an AI key and can be cleared", async ({ page }) => {
  await page.goto("/");
  // The landing page leads with one action and keeps the other ways in behind
  // a tab, so reaching chat from the front page now takes the tab first. Going
  // through it rather than straight to /chat is the point of this line: it is
  // the only test that proves a learner can still get there from the start.
  await page.getByTestId("landing-tab-more").click();
  await page.getByTestId("open-chat").click();

  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("heading", { name: "Ask about study and career directions" })).toBeVisible();
  await expect(page.getByText("Your message uses a separate network path")).toBeVisible();

  await page.getByTestId("chat-input").fill("I like coding and building apps. What could I explore?");
  await page.getByTestId("chat-send").click();

  await expect(page.getByTestId("chat-message-user")).toContainText("coding and building apps");
  await expect(page.getByTestId("chat-message-assistant")).toHaveCount(2);
  await expect(page.getByTestId("chat-message-assistant").last()).toHaveAttribute(
    "data-side",
    "left",
  );
  await expect(page.getByTestId("chat-message-user")).toHaveAttribute("data-side", "right");
  await expect(page.getByTestId("chat-avatar-assistant")).toHaveCount(2);
  await expect(page.getByTestId("chat-avatar-user")).toHaveCount(1);
  await expect(page.getByTestId("chat-tail-assistant")).toHaveCount(2);
  await expect(page.getByTestId("chat-tail-user")).toHaveCount(1);
  await expect(page.getByText("Project-data mode", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /FutureMe demo route: Vocational/ }),
  ).toBeVisible();

  await page.getByTestId("chat-clear").click();
  await expect(page.getByTestId("chat-message-user")).toHaveCount(0);
  await expect(page.getByTestId("chat-message-assistant")).toHaveCount(1);
});

test("the two-sided participant layout stays inside a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "offline",
        message: "A".repeat(400),
        note: "N".repeat(300),
        sources: [
          {
            id: "long-source",
            title: "T".repeat(220),
            excerpt: "E".repeat(500),
            url: `https://example.com/${"q".repeat(100)}`,
            status: "illustrative",
          },
        ],
        safety: false,
      }),
    });
  });

  await page.goto("/chat");
  await page.getByTestId("chat-input").fill("U".repeat(220));
  await page.getByTestId("chat-send").click();
  await expect(page.getByTestId("chat-message-assistant")).toHaveCount(2);

  const assistantMessage = page.getByTestId("chat-message-assistant").last();
  const userMessage = page.getByTestId("chat-message-user");
  await expect(assistantMessage).toHaveAttribute("data-side", "left");
  await expect(userMessage).toHaveAttribute("data-side", "right");
  await expect(assistantMessage.getByTestId("chat-avatar-assistant")).toBeVisible();
  await expect(userMessage.getByTestId("chat-avatar-user")).toBeVisible();
  await expect(assistantMessage.getByTestId("chat-tail-assistant")).toHaveAttribute(
    "data-tail-side",
    "left",
  );
  await expect(userMessage.getByTestId("chat-tail-user")).toHaveAttribute(
    "data-tail-side",
    "right",
  );

  const overflow = await page.evaluate(() => {
    const log = document.querySelector<HTMLElement>('[role="log"]');
    const messages = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid^="chat-message-"]'),
    );
    return {
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      logOverflow: log ? log.scrollWidth - log.clientWidth : Number.POSITIVE_INFINITY,
      messageOverflow: messages.some((message) => message.scrollWidth > message.clientWidth + 1),
    };
  });
  expect(overflow.documentOverflow).toBeLessThanOrEqual(1);
  expect(overflow.logOverflow).toBeLessThanOrEqual(1);
  expect(overflow.messageOverflow).toBe(false);
});

test("the browser safeguard stops distress text before the chat request", async ({ page }) => {
  let apiCalls = 0;
  await page.route("**/api/chat", async (route) => {
    apiCalls += 1;
    await route.continue();
  });

  await page.goto("/chat");
  await page.getByTestId("chat-input").fill("I want to die");
  await page.getByTestId("chat-send").click();

  const heading = page.getByRole("heading", {
    name: "Let's pause the career questions for a moment.",
  });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.getByText(/Nothing you typed was sent anywhere/)).toBeVisible();
  expect(apiCalls).toBe(0);

  await page.getByTestId("safety-back").click();
  await expect(page.getByTestId("chat-input")).toBeFocused();
});

test("a server safeguard accurately describes the network path", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ mode: "safety", message: "", sources: [], safety: true }),
    });
  });

  await page.goto("/chat");
  await page.getByTestId("chat-input").fill("Tell me about digital study");
  await page.getByTestId("chat-send").click();

  await expect(page.getByText(/reached the FutureMe server/)).toBeVisible();
  await expect(page.getByText(/was not sent to the AI provider/)).toBeVisible();
});

test("the official mascot hydrates and follows chat state transitions", async ({ page }) => {
  const hydrationWarnings: string[] = [];
  page.on("console", (message) => {
    if (/hydration|did not match/i.test(message.text())) hydrationWarnings.push(message.text());
  });

  let releaseResponse = () => {};
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  await page.route("**/api/chat", async (route) => {
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "offline",
        message: "Project-data response",
        sources: [],
        safety: false,
      }),
    });
  });

  await page.goto("/chat");
  const mascot = page.getByTestId("chat-mascot-live");
  const actionMascot = page.getByTestId("chat-mascot-action");
  const svg = mascot.locator("svg.fm-mascot");
  const actionSvg = actionMascot.locator("svg.fm-mascot");
  await expect(mascot).toHaveAttribute("data-mascot-state", "idle");
  await expect(actionMascot).toHaveAttribute("data-mascot-state", "idle");
  await expect(svg).toHaveAttribute("data-emotion", "neutral");
  await expect(svg).toHaveAttribute("data-pose", "listen");
  await expect(actionSvg).toHaveAttribute("data-pose", "listen");
  await expect(actionMascot.locator("[data-fm-anim]")).toHaveAttribute("data-fm-anim", "on");

  await page.getByTestId("chat-input").fill("Tell me about vocational digital study");
  await page.getByTestId("chat-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "thinking");
  await expect(actionMascot).toHaveAttribute("data-mascot-state", "thinking");
  await expect(svg).toHaveAttribute("data-pose", "think");
  await expect(actionSvg).toHaveAttribute("data-pose", "think");

  releaseResponse();
  await expect(mascot).toHaveAttribute("data-mascot-state", "offline");
  await expect(actionMascot).toHaveAttribute("data-mascot-state", "offline");
  await expect(svg).toHaveAttribute("data-emotion", "smile");
  await expect(svg).toHaveAttribute("data-pose", "point-right");
  await expect(actionSvg).toHaveAttribute("data-pose", "point-right");

  await expect(mascot).toHaveAttribute("data-mascot-state", "idle", { timeout: 5_000 });
  await expect(actionMascot).toHaveAttribute("data-mascot-state", "idle");
  await expect(actionSvg).toHaveAttribute("data-pose", "listen");
  expect(hydrationWarnings).toEqual([]);
});

test("the full mascot visibly animates each chat action", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  let responseNumber = 0;
  await page.route("**/api/chat", async (route) => {
    responseNumber += 1;
    const mode = responseNumber === 1 ? "ai" : "offline";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode,
        message: mode === "ai" ? "AI response" : "Project-data response",
        sources: [],
        safety: false,
      }),
    });
  });

  await page.goto("/chat");
  const mascot = page.getByTestId("chat-mascot-action");
  const svg = mascot.locator("svg.fm-mascot");

  await expect(mascot).toHaveAttribute("data-mascot-state", "idle");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-name",
    "fm-listen-ping",
  );

  await page.getByTestId("chat-input").fill("Give me an AI response");
  await page.getByTestId("chat-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "thinking");
  await expect(svg).toHaveAttribute("data-pose", "think");
  await expect(svg.locator(".fm-thought-dot").first()).toHaveCSS(
    "animation-name",
    "fm-thought-pop",
  );

  await expect(mascot).toHaveAttribute("data-mascot-state", "speaking");
  await expect(svg).toHaveAttribute("data-pose", "point-right");
  await expect(svg.locator(".fm-mouth-shape--smile")).toHaveCSS(
    "animation-name",
    "fm-chat-talk",
  );
  await expect(svg.locator(".fm-arm--right .fm-arm-limb")).toHaveCSS(
    "animation-name",
    "fm-chat-present",
  );
  await expect(svg.locator(".fm-arm--right .fm-arm-limb")).toHaveCSS(
    "animation-duration",
    "1.2s",
  );
  await expect(svg.locator(".fm-arm--right .fm-arm-limb")).toHaveCSS(
    "animation-delay",
    "0.6s",
  );
  await expect(svg.locator(".fm-arm--right .fm-arm-limb")).toHaveCSS(
    "animation-iteration-count",
    "1",
  );
  await expect(mascot).toHaveAttribute("data-mascot-state", "idle", { timeout: 5_000 });

  await page.getByTestId("chat-input").fill("Give me a project-data response");
  await page.getByTestId("chat-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "thinking");
  await expect(mascot).toHaveAttribute("data-mascot-state", "offline");
  await expect(svg.locator(".fm-mouth-shape--smile")).toHaveCSS(
    "animation-name",
    "fm-chat-talk",
  );
  await expect(mascot).toHaveAttribute("data-mascot-state", "idle", { timeout: 5_000 });
});

test("reduced motion keeps action states but removes mascot animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "ai",
        message: "Reduced-motion response",
        sources: [],
        safety: false,
      }),
    });
  });

  await page.goto("/chat");
  const mascot = page.getByTestId("chat-mascot-action");
  const svg = mascot.locator("svg.fm-mascot");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS("animation-name", "none");

  await page.getByTestId("chat-input").fill("Show the reduced-motion state");
  await page.getByTestId("chat-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "thinking");
  await expect(svg).toHaveAttribute("data-pose", "think");
  await expect(svg.locator(".fm-thought-dot").first()).toHaveCSS("animation-name", "none");
  await expect(mascot).toHaveAttribute("data-mascot-state", "speaking");
  await expect(svg.locator(".fm-mouth-shape--smile")).toHaveCSS("animation-name", "none");
});

test("an explicit mascot motion choice overrides reduced motion and persists", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "offline",
        message: "Motion preference response",
        sources: [],
        safety: false,
      }),
    });
  });
  await page.goto("/chat");

  const mascot = page.getByTestId("chat-mascot-action");
  const svg = mascot.locator("svg.fm-mascot");
  const toggle = page.getByTestId("chat-motion-toggle");

  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS("animation-name", "none");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(svg).toHaveAttribute("data-fm-motion", "on");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-name",
    "fm-listen-ping",
  );
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-duration",
    "2.4s",
  );
  await expect(svg.locator(".fm-arm--right .fm-arm-limb")).toHaveCSS(
    "transition-duration",
    "0.6s",
  );

  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-name",
    "fm-listen-ping",
  );

  await page.getByTestId("chat-input").fill("Exercise the persisted motion setting");
  await page.getByTestId("chat-send").click();
  await expect(mascot).toHaveAttribute("data-mascot-state", "offline");
  await expect(mascot).toHaveAttribute("data-mascot-state", "idle", { timeout: 5_000 });
  await page.getByTestId("chat-clear").click();
  expect(await svg.getAttribute("data-fm-motion")).toBe("on");
  await expect(svg.locator(".fm-listen-ring").first()).toHaveCSS(
    "animation-duration",
    "2.4s",
  );
});

test("a failed chat request uses the mascot error state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/api/chat", async (route) => route.abort("failed"));
  await page.goto("/chat");
  await page.getByTestId("chat-input").fill("Tell me about vocational digital study");
  await page.getByTestId("chat-send").click();

  const mascot = page.getByTestId("chat-mascot-live");
  const actionMascot = page.getByTestId("chat-mascot-action");
  await expect(mascot).toHaveAttribute("data-mascot-state", "error");
  await expect(mascot.locator("svg.fm-mascot")).toHaveAttribute("data-emotion", "not-okay");
  await expect(actionMascot).toHaveAttribute("data-mascot-state", "error");
  await expect(actionMascot.locator(".fm-body")).toHaveCSS(
    "animation-name",
    "fm-chat-error-shake",
  );
  await expect(actionMascot.locator(".fm-breathe")).toHaveCSS(
    "animation-name",
    "fm-breathe",
  );
});
