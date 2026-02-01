import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Shero/i);
    await expect(page.getByText(/Redefine Possible/i)).toBeVisible();
    await expect(page.getByLabel("main navigation")).toBeVisible();
  });

  test("shop page loads correctly", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText(/Premium Gear/i)).toBeVisible();
  });

  test("support page loads correctly", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByText(/How can we help/i)).toBeVisible();
  });

  test("FAQ page loads correctly", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByText(/Frequently Asked Questions/i)).toBeVisible();
  });
});
