import { test, expect } from "@playwright/test";

test.describe("Admin UX Flow", () => {
  test("admin can login and see new layout", async ({ page }) => {
    // Mock Login
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "fake-jwt-token",
          user: { id: "1", username: "admin", role: "ADMIN" },
        }),
      });
    });

    // Mock Me/Profile check
    await page.route("**/api/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "1",
          username: "admin",
          role: "ADMIN",
        }),
      });
    });

    // 1. Go to Admin Login
    await page.goto("/admin/login");

    // 2. Login (assuming mock auth or standard dev credentials)
    await page.getByPlaceholder("Username").fill("admin");
    await page.getByPlaceholder("Password").fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // 3. Verify Dashboard Load (extended timeout for navigation)
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible(
      { timeout: 5000 },
    );

    // 4. Verify Sidebar Style (Solid background check - roughly)
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    // Verify Logout is visible in sidebar (current UI design)
    await expect(sidebar.getByText("Logout")).toBeVisible();

    // 5. Verify User Menu in Header
    // 5. Verify User Menu in Header (Look for the Avatar Initial)
    const userMenuTrigger = page
      .locator("header button")
      .filter({ hasText: "A" })
      .first();
    await expect(userMenuTrigger).toBeVisible();
    await userMenuTrigger.click();

    // 6. Verify Dropdown Content
    const uniqueUserText = page.getByRole("menuitem", { name: "Profile" });
    await expect(uniqueUserText).toBeVisible();

    // 7. Verify Logout existence in dropdown
    const logoutBtn = page.getByRole("menuitem", { name: "Log out" });
    await expect(logoutBtn).toBeVisible();

    // 8. Test Logout
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
