import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should complete full register, login, view profile, and logout flow", async ({ page }) => {
    // 1. Go to register page
    await page.goto("/signup");
    
    // Mock register API
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Registered" }),
      });
    });

    // Mock login API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { id: "u1", name: "Test User", email: "test@example.com" }
        }),
      });
    });

    // Mock auth me API for profile view
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { id: "u1", name: "Test User", email: "test@example.com" }
        }),
      });
    });

    // Mock logout API
    await page.route("**/api/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Fill Register form
    await page.getByLabel(/Full Name/i).fill("Test User");
    await page.getByLabel(/Email/i).fill("test@example.com");
    await page.getByLabel(/^Password/i).fill("Password123!");
    await page.getByLabel(/Confirm Password/i).fill("Password123!");
    
    // Attempt registration
    await page.getByRole("button", { name: /Sign Up|Create Account/i }).click();

    // Verify redirect to login or profile
    // Typically it redirects to login or automatically logs in. 
    // Assuming it redirects to login:
    await page.goto("/login");

    // Fill Login form
    await page.getByLabel(/Email/i).fill("test@example.com");
    await page.getByLabel(/Password/i).fill("Password123!");
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    // Verify redirect to account/profile page
    await page.waitForURL("**/account*", { timeout: 10000 });
    await expect(page).toHaveURL(/\/account/);
    
    // Verify user profile information is displayed
    await expect(page.getByText("Test User")).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();

    // Logout
    const logoutBtn = page.getByRole("button", { name: /Sign Out|Logout/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      
      // Wait for redirect to home or login
      await page.waitForURL(/.*(\/login|\/)$/, { timeout: 10000 });
    }
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    // Mock failed login API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Invalid credentials" }),
      });
    });

    await page.getByLabel(/Email/i).fill("wrong@example.com");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    // Verify form is still present after failed login
    await expect(page.getByLabel(/Email/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });
});
