import { test, expect } from "@playwright/test";

test.describe("Product Catalog Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the products API
    await page.route("**/api/products*", async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search");
      const category = url.searchParams.get("category");

      let products = [
        {
          id: "prod-1",
          name: "Wireless Headphones",
          price: 150,
          category: "Audio",
          inStock: true,
          slug: "wireless-headphones"
        },
        {
          id: "prod-2",
          name: "Smart Watch",
          price: 250,
          category: "Wearables",
          inStock: true,
          slug: "smart-watch"
        }
      ];

      if (search) {
        products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (category && category !== "All") {
        products = products.filter(p => p.category === category);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(products),
      });
    });

    await page.goto("/shop");
  });

  test("should load product catalog and display products", async ({ page }) => {
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByText("Wireless Headphones")).toBeVisible();
    await expect(page.getByText("Smart Watch")).toBeVisible();
  });

  test("should filter products by search query", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill("Headphones");
    // Depending on the implementation, it might search on enter or on typing.
    await searchInput.press("Enter");

    // "Smart Watch" should disappear
    await expect(page.getByText("Smart Watch")).not.toBeVisible();
    // "Wireless Headphones" should be visible
    await expect(page.getByText("Wireless Headphones")).toBeVisible();
  });

  test("should filter products by category", async ({ page }) => {
    // Assuming categories are buttons or links
    const wearablesBtn = page.getByRole("button", { name: "Wearables" }).or(page.getByText("Wearables", { exact: true }));
    if (await wearablesBtn.isVisible()) {
      await wearablesBtn.click();
      await expect(page.getByText("Wireless Headphones")).not.toBeVisible();
      await expect(page.getByText("Smart Watch")).toBeVisible();
    }
  });

  test("should navigate to product detail page", async ({ page }) => {
    // Mock the single product API
    await page.route("**/api/products/wireless-headphones", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "prod-1",
          name: "Wireless Headphones",
          description: "High quality audio.",
          price: 150,
          category: "Audio",
          inStock: true,
          slug: "wireless-headphones"
        }),
      });
    });

    const productLink = page.getByText("Wireless Headphones");
    await productLink.click();

    await page.waitForURL("**/shop/product/wireless-headphones*");
    await expect(page.getByText("High quality audio.")).toBeVisible();
  });
});
