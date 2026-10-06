import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("Synthetic missions filter, point inspection and altitude profiles work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/data/");
  await expect(
    page.getByText("DEMO / SYNTHETIC DATA", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#explorer-status")).toContainText(
    "270 observations displayed",
  );
  await page
    .getByLabel("Mission", { exact: true })
    .selectOption("30000000-0000-4000-8000-000000000003");
  await page
    .getByLabel("Measurement", { exact: true })
    .selectOption("temperature_c");
  await expect(page.locator("#explorer-status")).toContainText(
    "90 observations displayed",
  );
  await page
    .getByRole("button", { name: "Inspect observation 1", exact: true })
    .click();
  await expect(page.locator("#point-detail")).toContainText(
    "DEMO / SYNTHETIC — Radiosonde profile",
  );
  await expect(page.locator("#point-detail")).toContainText("Altitude MSL (m)");
  await expect(page.locator("#profile-chart svg")).toBeVisible();
  await expect(page.locator("#mission-map canvas")).toBeVisible();
  expect(
    await page.locator("#mission-map").getAttribute("data-map-error"),
  ).not.toBe("true");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download displayed GeoJSON" })
    .click();
  const result = await download;
  expect(result.suggestedFilename()).toContain("SYNTHETIC");
  const stream = await result.createReadStream();
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  const geo = JSON.parse(Buffer.concat(chunks).toString());
  expect(geo.features).toHaveLength(90);
  expect(geo.metadata.synthetic).toBe(true);
  expect(geo.features[0].properties.source_sha256).toBeTruthy();
  await expect(page.locator("#mission-map")).toHaveAttribute(
    "data-map-ready",
    "true",
  );
  await page.screenshot({
    path: "artifacts/data-explorer-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("Invalid filters and empty results clear stale observations", async ({
  page,
}) => {
  await page.goto("/data/");
  await expect(page.locator("#explorer-status")).toContainText(
    "270 observations",
  );
  await page.getByLabel("Minimum altitude (m MSL)").fill("50000");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator("#explorer-status")).toContainText(
    "0 observations",
  );
  await expect(page.locator("#observation-rows tr")).toHaveCount(0);
  await page.getByLabel("Maximum altitude (m MSL)").fill("100");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator("#explorer-status")).toContainText(
    "minimum must not exceed",
  );
});
test("CSV review detects aliases, requires units and retains questionable rows without uploading", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") posts++;
  });
  await page.goto("/data/upload/");
  await page.getByLabel("CSV file", { exact: false }).setInputFiles({
    name: "test.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "time,lat,lon,temp,alt\n2026-06-15T12:00:00Z,45,-111,68,1000\ninvalid,95,-111,999,\n",
    ),
  });
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(page.locator("#upload-status")).toContainText("Confirm units");
  for (const [field, unit] of [
    ["latitude", "°"],
    ["longitude", "°"],
    ["temperature_c", "°F"],
    ["altitude_msl_m", "ft"],
  ])
    await page.locator("#unit-" + field).selectOption(unit);
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(page.locator("#upload-summary")).toContainText("2 rows");
  await expect(page.locator("#upload-warnings")).toContainText(
    "invalid_timestamp",
  );
  await expect(page.locator("#upload-warnings")).toContainText(
    "invalid_position",
  );
  await expect(
    page.getByRole("button", {
      name: "Archive original & import observations",
    }),
  ).toBeDisabled();
  expect(posts).toBe(0);
});
for (const width of [1440, 768, 320])
  test(`Data pages accessible and responsive at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/data/", "/data/upload/", "/data/standard/"]) {
      await page.goto(route);
      if (route === "/data/")
        await expect(page.locator("#explorer-status")).toContainText(
          "observations displayed",
        );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBeTruthy();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations,
        JSON.stringify(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.html),
          })),
        ),
      ).toEqual([]);
    }
  });
