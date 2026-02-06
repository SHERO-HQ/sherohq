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
    // 1. Cart Review
    await expect(
      page.getByRole("heading", { name: /Review Your Cart/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Continue to Shipping/i }).click();

    // 2. Shipping Information
    await expect(
      page.getByRole("heading", { name: /Shipping Information/i }),
    ).toBeVisible();

    await page.getByLabel(/First Name/i).fill("Test");
    await page.getByLabel(/Last Name/i).fill("User");
    await page.getByLabel(/Email Address/i).fill("test@example.com");
    await page.getByLabel(/Phone Number/i).fill("0240000000");
    await page.getByLabel(/Street Address/i).fill("123 Test Street");
    await page.getByLabel(/City/i).fill("Accra");
    await page.getByLabel(/Region/i).selectOption("Greater Accra");

    await page.getByRole("button", { name: /Continue to Payment/i }).click();

    // 3. Payment Method
    await expect(
      page.getByRole("heading", { name: /Payment Method/i }),
    ).toBeVisible();

    // Select Cash on Delivery
    await page.getByText(/Cash on Delivery/i).click();

    // Mock API call for order creation
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

    await page.getByRole("button", { name: /Place Order/i }).click();

    // 4. Confirmation
    await expect(
      page.getByRole("heading", { name: /Order Confirmed/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("ORD-12345-TEST")).toBeVisible();
  });
});
