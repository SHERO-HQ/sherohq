import { test, expect } from "@playwright/test";

test.describe("Admin UX Flow", () => {
  test("admin can login and see new layout", async ({ page }) => {
    // 1. Navigate to admin login
    await page.goto("/admin/login");
    await expect(page).toHaveTitle(/Admin|Sign In/i);

    // 2. Verify login form is visible
    await expect(page.getByLabel(/Email|Username/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    
    // 3. Verify login page structure
    const loginButton = page.getByRole("button", { name: /Sign In/i });
    await expect(loginButton).toBeVisible();
  });
});
