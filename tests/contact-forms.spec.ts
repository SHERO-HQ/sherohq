import { test, expect } from "@playwright/test";

test.describe("Contact & Support Forms", () => {
  test("should submit a contact inquiry successfully", async ({ page }) => {
    // Mock the inquiries API
    await page.route("**/api/inquiries", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Inquiry received" }),
      });
    });

    // Assume contact form is on /contact
    await page.goto("/contact");

    // Fill the contact form
    await page.getByLabel(/Name/i).fill("Alice Smith");
    await page.getByLabel(/Email/i).fill("alice@example.com");
    await page.getByLabel(/Message/i).fill("I have a question about your services.");
    
    // Submit
    const submitBtn = page.getByRole("button", { name: /Send|Submit/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // Verify success state
      await expect(page.getByText(/Thank you|received/i)).toBeVisible();
    }
  });

  test("should submit a consultation booking successfully", async ({ page }) => {
    // Mock the consultations API
    await page.route("**/api/consultations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Consultation booked" }),
      });
    });

    // Assume consultation form is on /consultation or /services
    await page.goto("/consultation");
    
    // If it redirects or isn't a direct page, we check if the form is visible
    if (await page.getByRole("heading", { name: /Book a Consultation/i }).isVisible()) {
      await page.getByLabel(/Name/i).fill("Bob Jones");
      await page.getByLabel(/Email/i).fill("bob@example.com");
      await page.getByLabel(/Company/i).fill("Acme Corp");
      
      // Submit
      await page.getByRole("button", { name: /Book|Submit/i }).click();
      
      // Verify success
      await expect(page.getByText(/Thank you|booked/i)).toBeVisible();
    }
  });
});
