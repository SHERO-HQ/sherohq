import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Public pages checked against WCAG 2.1 A and AA, in light and dark.
const PAGES = ["/", "/work", "/consultation", "/about-us", "/merchander", "/support", "/faq", "/login", "/signup"];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`Accessibility (${colorScheme})`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    for (const path of PAGES) {
      test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Check colours at rest, not halfway through a hover or fade transition.
        await page.addStyleTag({
          content: "*, *::before, *::after { transition: none !important; animation: none !important; }",
        });
        // Let entrance fades finish so text is checked at full opacity.
        await page.waitForTimeout(1000);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          // Development-only overlay injected by Next.js.
          .exclude("nextjs-portal")
          .analyze();
        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.length}x ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`,
        );
        expect(summary).toEqual([]);
      });
    }
  });
}
