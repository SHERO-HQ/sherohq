import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Shero/i);
    await expect(page.getByText(/Technology Solutions/i)).toBeVisible();
  });

  test("shop page loads correctly", async ({ page }) => {
    await page.goto("/shop");
    // Wait for products to load - use first() to avoid strict mode violation
    await expect(
      page.getByText(/All Products|Laptops|Accessories|Filter/i).first(),
    ).toBeVisible({ timeout: 10000 });
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
