import { test, expect } from "@playwright/test";

test.describe("Support & Tickets", () => {
  test("Submit a Ticket opens the ticket form", async ({ page }) => {
    await page.goto("/support");
    const heading = page.getByRole("heading", { name: "Submit a Support Ticket" });
    // Click again until the page has hydrated and the button responds.
    await expect(async () => {
      await page.getByRole("button", { name: "Submit a Ticket" }).click();
      await expect(heading).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 30000 });
  });
});
