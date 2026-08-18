import { expect, test } from "@playwright/test";

/**
 * The page a learner uses to ask what is near them.
 *
 * The thing worth guarding here is not the layout but the promise: this is a
 * list of what exists, ordered by a journey, and it does not tell anyone which
 * place suits them.
 */

test("nothing is shown until the learner says where they are", async ({ page }) => {
  await page.goto("/nearby");

  await expect(page.getByTestId("nearby-province")).toBeVisible();
  await expect(page.getByTestId("nearby-summary")).toHaveCount(0);
  await expect(page.getByTestId("nearby-option")).toHaveCount(0);
});

test("no location permission is ever requested", async ({ page, context }) => {
  // A learner here is thirteen. The page must not be able to ask the browser
  // for their coordinates, so geolocation is made to fail loudly and the page
  // is expected never to touch it.
  let asked = false;
  await context.grantPermissions([]);
  await page.addInitScript(() => {
    const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    void original;
    Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
      value: () => {
        (window as unknown as { __askedForLocation?: boolean }).__askedForLocation = true;
      },
    });
  });

  await page.goto("/nearby");
  await page.getByTestId("nearby-province").selectOption("TH-50");
  await expect(page.getByTestId("nearby-summary")).toBeVisible();

  asked = await page.evaluate(
    () => (window as unknown as { __askedForLocation?: boolean }).__askedForLocation === true,
  );
  expect(asked).toBe(false);
});

test("picking a province lists what is there, nearest first", async ({ page }) => {
  await page.goto("/nearby");
  await page.getByTestId("nearby-province").selectOption("TH-50");

  await expect(page.getByTestId("nearby-summary")).toBeVisible();
  const options = page.getByTestId("nearby-option");
  await expect(options.first()).toBeVisible();

  // Chiang Mai's technical college is in the city, so the top of the list is
  // walking distance rather than an hour away.
  const first = options.first();
  await expect(first).toHaveAttribute("data-band", "walkable");
});

test("a place with no trustworthy coordinate is listed, not hidden", async ({ page }) => {
  // Loei's Rajabhat university has a quarantined coordinate. It still has to
  // appear, because telling a learner in Loei there is no Rajabhat there is a
  // worse error than not knowing how far away it is.
  await page.goto("/nearby?province=TH-42");

  await expect(page.getByTestId("nearby-summary")).toBeVisible();
  const unknown = page.getByTestId("nearby-band-unknown_distance");
  await expect(unknown).toBeVisible();
  await expect(unknown.getByTestId("nearby-option").first()).toBeVisible();
});

test("the province in the address bar is what gets loaded", async ({ page }) => {
  await page.goto("/nearby?province=TH-10");
  // Named in the language being read: the default here is English, and the
  // heading used to show the Thai name whatever the reader had chosen.
  await expect(page.getByTestId("nearby-summary")).toContainText("Bangkok");
  await expect(page.getByTestId("nearby-province")).toHaveValue("TH-10");

  // And choosing another writes it back, so a view can be shared or reloaded.
  await page.getByTestId("nearby-province").selectOption("TH-50");
  await expect(page.getByTestId("nearby-summary")).toContainText("Chiang Mai");
  expect(new URL(page.url()).searchParams.get("province")).toBe("TH-50");

  await page.getByRole("radio", { name: "ไทย" }).click();
  await expect(page.getByTestId("nearby-summary")).toContainText("เชียงใหม่");
});

test("a Bangkok campus on a line says which station, a rural one does not", async ({ page }) => {
  await page.goto("/nearby?province=TH-10");
  await expect(page.getByTestId("nearby-summary")).toBeVisible();
  await expect(page.getByText(/สถานีที่ใกล้ที่สุด|Nearest station/).first()).toBeVisible();

  await page.getByTestId("nearby-province").selectOption("TH-58");
  await expect(page.getByTestId("nearby-summary")).toContainText("Mae Hong Son");
  // Mae Hong Son has no railway at all, so no option may claim a station.
  await expect(page.getByText(/สถานีที่ใกล้ที่สุด|Nearest station/)).toHaveCount(0);
});

test("the page says it is not a recommendation", async ({ page }) => {
  await page.goto("/nearby");
  await expect(page.getByText(/ไม่ได้บอกว่าที่ไหนเหมาะกับคุณ|does not say which one suits you/))
    .toBeVisible();
});

test("it reads in English when the learner reads English", async ({ page }) => {
  await page.goto("/nearby?province=TH-50");
  await page.getByRole("radio", { name: "EN" }).click();

  await expect(page.getByRole("heading", { name: "What is near you" })).toBeVisible();
  await expect(page.getByTestId("nearby-summary")).toContainText("at a glance");
});
