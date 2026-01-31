import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill("wrong@example.com");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Verify error message appears (handles various API error formats)
    await expect(
      page.getByText(
        /Invalid credentials|Invalid email or password|Login failed|Error/i,
      ),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to signup from login", async ({ page }) => {
    await page.getByText(/Sign up/i).click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.getByRole("heading", { name: /Create Account/i }),
    ).toBeVisible();
  });
});
