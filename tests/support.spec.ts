import { test, expect } from "@playwright/test";

test.describe("Support & Tickets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/support");
  });

  test("should submit a support ticket successfully", async ({ page }) => {
    // 1. Open Ticket Modal
    await page.getByRole("button", { name: /Ticket/i }).click();

    // 2. Verify Modal is open
    await expect(
      page.getByRole("heading", { name: /Submit a Support Ticket/i }),
    ).toBeVisible();

    // 3. Fill Form
    await page.getByLabel("Name", { exact: true }).fill("Test Reporter");
    await page
      .getByLabel("Email", { exact: true })
      .fill("reporter@example.com");
    await page.getByLabel("Subject", { exact: true }).fill("Test Issue");
    await page.getByLabel("Category").selectOption("General");
    await page
      .getByLabel("Message")
      .fill("This is a test support ticket message.");

    // Mock API call for ticket creation
    await page.route("**/api/tickets", async (route) => {
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

    // 4. Submit
    await page.getByRole("button", { name: /Submit Ticket/i }).click();

    // 5. Verify Success
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Ticket #999/)).toBeVisible();
  });
});
