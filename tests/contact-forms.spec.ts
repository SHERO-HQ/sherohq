import { test, expect } from "@playwright/test";

test.describe("Consultation booking", () => {
  test("choosing a service moves on to picking a date", async ({ page }) => {
    await page.goto("/consultation");
    const service = page.getByRole("button", { name: /Software Engineering/i });
    const next = page.getByRole("button", { name: "Continue" });
    // Click again until the page has hydrated and the choice registers.
    await expect(async () => {
      await service.click();
      await expect(next).toBeEnabled({ timeout: 1000 });
    }).toPass({ timeout: 30000 });
    await next.click();
    await expect(page.getByRole("heading", { name: "Select a Service" })).toBeHidden();
  });
});
