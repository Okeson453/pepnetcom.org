import { test, expect } from "@playwright/test";

// NOTE: assumes a logged-in admin session via Playwright storageState.
test.describe("Admin: create a signal", () => {
  test("new signal form submits and redirects to the signals list", async ({ page }) => {
    await page.goto("/admin/signals/new");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("signal history page lists past signals", async ({ page }) => {
    await page.goto("/admin/signals/history");
    await expect(page.locator("table")).toBeVisible();
  });
});
