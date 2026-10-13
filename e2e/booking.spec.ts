import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .include("#schedule")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`booking (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    test("books a consultation through the three steps", async ({ page, context }) => {
      // A fixed Tuesday morning in Accra so slots are predictable.
      await context.route("https://wa.me/**", (route) => route.fulfill({ body: "WhatsApp" }));
      await page.clock.setFixedTime(new Date("2026-10-13T08:00:00Z"));
      await page.goto("/consultation?service=managed-it");

      // An old About link preselects the matching service.
      await expect(page.getByRole("radio", { name: /IT Support/ })).toBeChecked();
      await page.getByRole("button", { name: "Continue" }).click();

      await expect(page.getByRole("heading", { name: "Choose Date & Time" })).toBeFocused();
      await expect(page.getByRole("button", { name: /Saturday, 17 October 2026/ })).toBeDisabled();
      await page.getByRole("button", { name: /Wednesday, 14 October 2026/ }).click();
      await page.getByRole("button", { name: /^10:00 GMT/ }).click();
      await expectAccessible(page);
      await page.getByRole("button", { name: "Continue" }).click();

      await page.getByLabel("First name").fill("Ama");
      await page.getByLabel("Last name").fill("Mensah");
      await page.getByLabel("Email address").fill("ama@example.com");
      await page.getByLabel("Phone number").fill("+233 20 000 0000");

      await expectAccessible(page);
      const popup = context.waitForEvent("page");
      await page.getByRole("button", { name: "Confirm Booking" }).click();
      const wa = await popup;
      await wa.waitForURL(/wa\.me/);
      expect(decodeURIComponent(wa.url())).toContain(
        "When: Wednesday, 14 October 2026 at 10:00 GMT (Accra)",
      );
      await expect(page.getByRole("heading", { name: /send your request/ })).toBeVisible();
    });
  });
}

test("work pages show the owner's write-up and a link to the live site", async ({ page }) => {
  await page.goto("/work/tastea");
  await expect(page.getByRole("heading", { name: "What we built" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Hubtel" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Visit tasteagh\.com/ })).toHaveAttribute(
    "href",
    "https://tasteagh.com",
  );
});
