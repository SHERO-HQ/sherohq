import { expect, test } from "@playwright/test";

test("old shop links go to Merchander", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveURL(/\/merchander$/);
});
