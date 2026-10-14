import { test, expect } from "@playwright/test";

// Each public page loads and shows its main heading.
const PAGES: { path: string; title: RegExp; heading: RegExp }[] = [
  { path: "/", title: /SHERO/, heading: /Solutions for People/i },
  { path: "/work", title: /Our Work/, heading: /What We've Built/i },
  { path: "/consultation", title: /Consultation/, heading: /Accelerate Your Technical Vision/i },
  { path: "/about-us", title: /About/, heading: /./ },
  { path: "/merchander", title: /Merchander/, heading: /sells on social media/i },
  { path: "/support", title: /Support/, heading: /Help When You Need It/i },
  { path: "/faq", title: /FAQ/, heading: /Answers to common/i },
];

test.describe("Smoke Tests", () => {
  for (const { path, title, heading } of PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole("heading", { level: 1, name: heading }).or(
        page.getByRole("heading", { name: heading }).first(),
      ).first()).toBeVisible();
    });
  }

  test("an unknown page shows Page Not Found", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Page Not Found/i })).toBeVisible();
  });
});
