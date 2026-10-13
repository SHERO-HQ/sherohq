import { expect, test } from "@playwright/test";
import { routes } from "./routes";

test.describe("every page", () => {
  for (const route of routes) {
    test(`${route} renders one h1 and the legal line`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByText("SHERO HQ is a brand of SHERO FINTECH.")).toBeVisible();
    });
  }
});

test("unknown pages return a helpful 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn't exist.");
});

test("skip link moves focus to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("theme toggle switches and remembers the theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});

test("header keeps the old menu and a Talk to us button", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop header");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link")).toHaveText(["Our Work", "Consultation", "About Us"]);
  await page.getByRole("banner").getByRole("link", { name: "Talk to us" }).click();
  await expect(page).toHaveURL(/\/contact-us$/);
});

test("old URLs redirect to their new homes", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveURL(/\/merchander$/);
  await page.goto("/services");
  await expect(page).toHaveURL(/\/solutions$/);
});

test("waitlist buttons open WhatsApp with a prefilled message", async ({ page }) => {
  await page.goto("/merchander");
  const join = page.getByRole("link", { name: "Join on WhatsApp" });
  await expect(join).toHaveAttribute("href", /^https:\/\/wa\.me\/233548711582\?text=.*Merchander/);
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Our Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(menu).toBeHidden();
  });

  test("closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  });
});
