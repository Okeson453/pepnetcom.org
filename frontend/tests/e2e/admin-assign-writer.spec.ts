import { test, expect } from "@playwright/test";

// NOTE: assumes a logged-in admin session via Playwright storageState.
test.describe("Admin: assign staff to an order", () => {
  test("assign-staff page renders the orders queue", async ({ page }) => {
    await page.goto("/admin/orders/assign-staff");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("SIWES order can be assigned to a writer", async ({ page }) => {
    await page.goto("/admin/siwes/orders");
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();
    await firstRow.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/admin\/siwes\/orders\/.+/);
  });
});
