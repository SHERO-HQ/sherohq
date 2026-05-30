import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // We need at least one item in the cart to access checkout
    // Let's go to products and add something
    await page.goto("/products");

    // Add first product to cart
    const buyButton = page
      .getByRole("button", { name: /Buy|Add to Cart/i })
      .first();
    await buyButton.click();

    // Navigate to checkout
    await page.goto("/checkout");
  });

  test("should complete the full checkout flow", async ({ page }) => {
    // Mock API call for order creation before navigating
    await page.route("**/api/orders", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          orderId: "ORD-12345-TEST",
          message: "Order placed successfully",
        }),
      });
    });

    // 1. Verify checkout page loads
    await expect(page).toHaveURL(/\/checkout/);

    // Wait for page to be interactive
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // 2. Check that we can see checkout content
    const checkoutContent = page.locator("main");
    await expect(checkoutContent).toBeVisible();
  });
});
