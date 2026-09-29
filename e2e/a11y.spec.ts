import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { pages, sampleListing } from "./pages";

// WCAG 2.1 AA on every page, in both themes. The design system promises
// 4.5:1 text contrast in both themes; this is what holds it to that.
for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const path of pages) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path);
        // Let client components (live status, theme toggle) hydrate.
        await page.waitForLoadState("load");
        await page.waitForTimeout(300);
        await expectNoViolations(page);
      });
    }

    // The phone menu is a dialog over the page; check it open.
    test("the open phone menu has no accessibility violations", async ({ page }) => {
      await page.goto("/");
      const open = page.getByRole("button", { name: "Open menu" });
      test.skip(!(await open.isVisible()), "The menu button only shows on small screens.");
      await open.click();
      await page.waitForSelector("#mobile-menu");
      await page.waitForTimeout(300);
      await expectNoViolations(page);
    });

    // The cart with something in it, and checkout, need a device in the cart.
    test("filled cart and checkout have no accessibility violations", async ({ page }) => {
      await page.goto(sampleListing);
      await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
      await page.goto("/cart");
      await page.waitForTimeout(300);
      await expectNoViolations(page);
      await page.goto("/checkout");
      await page.waitForTimeout(300);
      // Show the validation messages too.
      await page.getByRole("button", { name: "Place order" }).click();
      await expectNoViolations(page);
    });
  });
}

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Pure decoration is exempt from contrast (WCAG 1.4.3), e.g. the faint
    // section numbers on Services. Mark such text aria-hidden and data-decorative.
    .exclude("[data-decorative]")
    .analyze();

  const summary = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
  expect(summary).toEqual([]);
}
