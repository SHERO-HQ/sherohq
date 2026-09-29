import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { pages } from "./pages";

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
      });
    }
  });
}
