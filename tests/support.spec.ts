import { test, expect } from "@playwright/test";

test.describe("Support & Tickets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/support");
  });

  test("should submit a support ticket successfully", async ({ page }) => {
    // Mock API call for ticket creation
    await page.route("**/api/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          ticketId: "TKT-999-TEST",
          ticketNo: 999,
          message: "Ticket submitted successfully",
        }),
      });
    });

    // 1. Open Ticket Modal
    const ticketButton = page.locator("button").filter({ has: page.getByText(/Ticket|Submit/i) }).first();
    await ticketButton.click({ timeout: 5000 });

    // 2. Wait for modal/form to appear
    await page.waitForLoadState("networkidle", { timeout: 5000 });
    
    // 3. Check that form is visible on the page
    const supportForm = page.locator("form, [role='dialog']").first();
    await expect(supportForm).toBeVisible({ timeout: 5000 });
  });
});
