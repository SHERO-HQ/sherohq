import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Shero/i);
    await expect(page.getByText(/Technology Solutions/i)).toBeVisible();
  });

  test("old shop links go to Merchander", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveURL(/\/merchander$/);
  });

  test("support page loads correctly", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByText(/Get Help in Minutes/i)).toBeVisible();
  });

  test("FAQ page loads correctly", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByText(/Answers to common/i)).toBeVisible();
  });
});
