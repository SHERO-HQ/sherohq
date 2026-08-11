import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock products API so we always have a product to buy
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{
          id: "prod-test-1",
          name: "Test Product",
          price: 100,
          originalPrice: 150,
          image: "/placeholder.jpg",
          category: "Accessories",
          inStock: true,
          quantity: 10,
          slug: "test-product",
          isNew: true
        }]),
      });
    });

    // We need at least one item in the cart to access checkout
    await page.goto("/shop");

    // Wait for network to settle so products render
    await page.waitForLoadState("networkidle");

    // Add first product to cart
    const buyButton = page
      .getByRole("button", { name: /Buy|Add to Cart/i })
      .first();
    await buyButton.click({ force: true }); 

    // Wait for the client-side navigation to complete
    await page.waitForURL("**/shop/checkout", { waitUntil: 'commit' });
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
          paymentUrl: "/shop/checkout/success?order=ORD-12345-TEST" // Mock payment redirect
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

    // 3. Fill in the checkout form
    // Since we don't know the exact IDs of the checkout form, we'll use placeholder text or names
    await page.getByRole('textbox', { name: /Name/i }).fill("John Doe");
    await page.getByRole('textbox', { name: /Email/i }).fill("john@example.com");
    await page.getByRole('textbox', { name: /Phone/i }).fill("0244123456");
    
    // Delivery details (assuming there's a delivery method selection or address field)
    const addressInput = page.getByRole('textbox', { name: /Address|Location/i });
    if (await addressInput.isVisible()) {
      await addressInput.fill("123 Test Street");
    }

    // 4. Submit the order
    const placeOrderBtn = page.getByRole('button', { name: /Place Order|Pay/i });
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // 5. Verify redirection to success page
    await page.waitForURL("**/shop/checkout/success*", { timeout: 15000 });
    
    await expect(page.getByText(/Order placed successfully|Thank you/i)).toBeVisible();
  });
});
