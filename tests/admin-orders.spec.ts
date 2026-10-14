import { test, expect } from "@playwright/test";

const ORDER = {
  id: "ord_test_0001",
  guestId: "g1",
  userId: null,
  items: [],
  total: 500,
  shippingInfo: {
    firstName: "Test",
    lastName: "Customer",
    email: "customer@test.com",
    phone: "0200000000",
    address: "1 Test Street",
    city: "Tamale",
    region: "Northern",
  },
  paymentMethod: "momo",
  status: "pending",
  paymentStatus: "confirmed",
  createdAt: new Date().toISOString(),
};

test.describe("Admin Orders", () => {
  test("lists orders from the API", async ({ page }) => {
    await page.route("**/api/admin-auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          admin: { id: "admin1", username: "admin", email: "admin@sherohq.com", role: "super_admin" },
        }),
      }),
    );
    await page.route(/\/api\/orders(\?|$)/, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([ORDER]) }),
    );

    await page.goto("/admin/orders");
    await expect(page).toHaveURL(/\/admin\/orders/);
    await expect(page.getByText("Test Customer").first()).toBeVisible();
  });
});
