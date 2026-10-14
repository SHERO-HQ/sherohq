import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("sign up form shows every field", async ({ page }) => {
    await page.goto("/signup");
    for (const label of ["Full Name", "Email Address", "Phone Number"]) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
    await expect(page.getByRole("textbox", { name: "Password", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Confirm Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Invalid credentials" }),
      }),
    );
    await page.goto("/login");

    await page.getByLabel("Email Address").fill("wrong@example.com");
    await page.getByRole("textbox", { name: "Password" }).fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/Invalid email\/username or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
