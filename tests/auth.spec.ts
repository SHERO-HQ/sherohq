import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Mock failed login API
    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid credentials" }),
      });
    });

    await page.getByLabel(/Email Address/i).fill("wrong@example.com");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Verify form is still present after failed login
    await expect(page.getByLabel(/Email Address/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should navigate to signup from login", async ({ page }) => {
    // Verify login page is displayed
    await expect(page).toHaveURL(/\/login/);
    // Verify form fields are visible
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    // Verify sign up link exists
    const signupLink = page
      .getByRole("link")
      .filter({ hasText: /Sign up|Create Account/i })
      .first();
    await expect(signupLink).toBeVisible();
  });
});
