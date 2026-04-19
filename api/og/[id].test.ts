import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "./[id]";

type Req = {
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | undefined };
};

type Res = {
  send: ReturnType<typeof vi.fn>;
  redirect: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
};

function createRes(): Res {
  return {
    send: vi.fn(),
    redirect: vi.fn(),
    setHeader: vi.fn(),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OG handler social previews", () => {
  it("returns WhatsApp crawler HTML with product image and formatted title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "sku-123",
        slug: "macbook-pro-14",
        name: "MacBook Pro 14",
        description: "Powerful laptop for creators",
        price: 4500,
        image: "/uploads/fallback.jpg",
        images: ["/uploads/primary.jpg", "/uploads/secondary.jpg"],
        category: "laptops",
      }),
    } as Response);

    const req: Req = {
      query: { id: "sku-123" },
      headers: { "user-agent": "WhatsApp/2.24.1 i" },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledTimes(1);

    const html = String(res.send.mock.calls[0][0]);
    expect(html).toContain(
      "<meta property=\"og:title\" content=\"MacBook Pro 14 - GH₵4,500 | SHERO\">",
    );
    expect(html).toContain(
      "<meta name=\"twitter:title\" content=\"MacBook Pro 14 - GH₵4,500 | SHERO\">",
    );
    expect(html).toContain(
      "<meta property=\"og:image\" content=\"https://shop.sherohq.com/uploads/primary.jpg\">",
    );
    expect(html).toContain(
      "<meta property=\"og:url\" content=\"https://shop.sherohq.com/shop/macbook-pro-14\">",
    );
  });

  it("returns social HTML for Facebook/Twitter/LinkedIn crawlers", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        name: "ThinkPad X1",
        description: "Business flagship",
        price: 3200,
        image: "/uploads/x1.jpg",
        category: "laptops",
      }),
    } as Response);

    for (const userAgent of [
      "facebookexternalhit/1.1",
      "Twitterbot/1.0",
      "LinkedInBot/1.0",
    ]) {
      const req: Req = {
        query: { id: "x1" },
        headers: { "user-agent": userAgent },
      };
      const res = createRes();

      await handler(req, res);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledTimes(1);
      const html = String(res.send.mock.calls[0][0]);
      expect(html).toContain("<meta property=\"og:image\"");
      expect(html).toContain("<meta name=\"twitter:image\"");
    }
  });

  it("redirects non-social requests to /shop/:id", async () => {
    const req: Req = {
      query: { id: "sku-55" },
      headers: { "user-agent": "Mozilla/5.0" },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      "https://shop.sherohq.com/shop/sku-55",
    );
  });
});
