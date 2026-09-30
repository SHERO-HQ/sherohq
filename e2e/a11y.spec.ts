import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { adminPages, adminState, pages, sampleListing } from "./pages";

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
        // Nothing may push the page wider than the screen (a sideways scroll on phones).
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
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

// The admin, signed in with the session from admin.setup.ts.
for (const theme of ["light", "dark"] as const) {
  test.describe(`admin, ${theme} theme`, () => {
    test.use({ colorScheme: theme });

    test("the admin sign-in page has no accessibility violations", async ({ page }) => {
      await page.goto("/admin/login");
      await expectNoViolations(page);
    });

    test.describe("signed in", () => {
      test.use({ storageState: adminState });

      for (const path of adminPages) {
        test(`${path} has no accessibility violations`, async ({ page }) => {
          await page.goto(path);
          await page.waitForLoadState("load");
          await expectNoViolations(page);
        });
      }

      for (const [section, name] of [
        ["orders", "SH-SAMP1"],
        ["products", "Merchander"],
        ["work", "TrustCircle"],
        ["testimonials", "Abena O. (sample)"],
        ["careers", "Hardware technician (sample)"],
      ] as const) {
        test(`the ${section} editor has no accessibility violations`, async ({ page }) => {
          await page.goto(`/admin/${section}`);
          await page.getByRole("link", { name }).click();
          await page.waitForURL(new RegExp(`/admin/${section}/[0-9a-f-]{36}`));
          await expectNoViolations(page);
        });
      }

      test("a consultation request has no accessibility violations", async ({ page }) => {
        await page.goto("/admin/consultations");
        await page.getByRole("link", { name: /Yaw Boateng \(sample\)/ }).click();
        await page.waitForURL(/id=[0-9a-f-]{36}/);
        await expectNoViolations(page);
      });

      test("a listing's editor has no accessibility violations", async ({ page }) => {
        await page.goto("/admin/listings");
        await page.getByRole("link", { name: "Dell Latitude 7490 (sample)" }).click();
        await page.waitForURL(/\/admin\/listings\/[0-9a-f-]{36}/);
        await expectNoViolations(page);
        // With the In stock warning showing.
        await page.getByLabel("Status", { exact: true }).selectOption("in_stock");
        await page.getByRole("radio", { name: "Fail" }).first().check({ force: true });
        await expectNoViolations(page);
      });
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
