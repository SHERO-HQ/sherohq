import { test, expect } from "@playwright/test";

type Product = {
  id?: string;
  slug?: string;
  name?: string;
  price?: number;
  image?: string;
  images?: string[];
};

const SOCIAL_UAS = [
  "WhatsApp/2.24.1 i",
  "facebookexternalhit/1.1",
  "Twitterbot/1.0",
  "LinkedInBot/1.0",
];

function getDeploymentBaseUrl(): string {
  return (
    process.env.SOCIAL_SHARE_BASE_URL || "https://www.sherohq.com"
  ).replace(/\/$/, "");
}

function hasRealImage(product: Product): boolean {
  const primary =
    (Array.isArray(product.images) && product.images[0]) || product.image || "";
  return Boolean(primary && !primary.includes("shero.png"));
}

test.describe("Social OG metadata (deployed)", () => {
  test("crawler UAs receive product OG image + formatted title", async ({
    request,
  }) => {
    const baseUrl = getDeploymentBaseUrl();

    let productsRes;
    try {
      productsRes = await request.get(`${baseUrl}/api/products?limit=30`);
    } catch {
      test.skip(true, `Deployment unreachable: ${baseUrl}`);
      return;
    }

    if (!productsRes.ok()) {
      test.skip(
        true,
        `Products API unavailable at ${baseUrl} (status ${productsRes.status()})`,
      );
      return;
    }

    const products = (await productsRes.json()) as Product[];
    const candidate = products.find(hasRealImage);

    if (!candidate) {
      test.skip(
        true,
        "No product with a shareable image found in API response",
      );
      return;
    }

    const idOrSlug = candidate.slug || candidate.id;
    if (!idOrSlug) {
      test.skip(true, "Selected product is missing both slug and id");
      return;
    }

    for (const ua of SOCIAL_UAS) {
      const res = await request.get(`${baseUrl}/og/${idOrSlug}`, {
        headers: { "user-agent": ua },
      });

      expect(
        res.ok(),
        `Expected 2xx for ${ua}, got ${res.status()} at ${baseUrl}/og/${idOrSlug}`,
      ).toBeTruthy();

      const html = await res.text();
      const expectedTitle = `${candidate.name} - GH₵${Number(
        candidate.price,
      ).toLocaleString("en-GH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} | SHERO`;

      expect(html).toContain(`content=\"${expectedTitle}\"`);

      const ogImageMatch = html.match(
        /<meta\s+property=\"og:image\"\s+content=\"([^\"]+)\"/i,
      );
      expect(ogImageMatch, `Missing og:image for ${ua}`).not.toBeNull();
      expect(ogImageMatch?.[1] || "").not.toContain("shero.png");

      const twitterImageMatch = html.match(
        /<meta\s+name=\"twitter:image\"\s+content=\"([^\"]+)\"/i,
      );
      expect(
        twitterImageMatch,
        `Missing twitter:image for ${ua}`,
      ).not.toBeNull();
    }
  });
});
