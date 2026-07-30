import { test, expect } from "@playwright/test";

// NOTE: assumes a logged-in client session is set up via Playwright storageState
// once real auth/session seeding exists — see playwright.config.ts `use.storageState`.
test.describe("Place New Order", () => {
  test("multi-step form advances through Service -> Details -> Confirm", async ({ page }) => {
    await page.goto("/dashboard/orders/new");

    await page.getByPlaceholder(/SIWES, Academic, etc\./i).fill("Academic Services");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByPlaceholder(/Describe what you need/i).fill("Need a 5-page literature review.");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/Review your order details/i)).toBeVisible();
    await expect(page.getByText("Academic Services")).toBeVisible();
  });

  test("draft persists across a reload", async ({ page }) => {
    await page.goto("/dashboard/orders/new");
    await page.getByPlaceholder(/SIWES, Academic, etc\./i).fill("SIWES Report");
    await page.reload();
    await expect(page.getByPlaceholder(/SIWES, Academic, etc\./i)).toHaveValue("SIWES Report");
  });
});
