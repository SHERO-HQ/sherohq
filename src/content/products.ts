import type { Product, ProductStatus } from "./types";

export const products: readonly Product[] = [
  {
    slug: "merchander",
    name: "Merchander",
    status: "in-development",
    forWho: "People who sell on WhatsApp, Instagram and TikTok.",
    problem: "Orders, stock and customers end up scattered across chats, notebooks and memory.",
    willDo: [
      "Keep orders, stock and customers in one place",
      "Work alongside the apps you already sell on",
      "Become the new home of the SHERO laptop shop",
    ],
    waitlistMessage: "Hi SHERO, please add me to the Merchander waitlist.",
  },
  {
    slug: "pharmasyst",
    name: "Pharmasyst",
    status: "in-development",
    forWho: "Community pharmacies.",
    problem: "Stock control and daily records take too much time and still miss things.",
    willDo: [
      "Track stock and expiry dates",
      "Record daily sales simply",
      "Work in the conditions local pharmacies operate in",
    ],
    waitlistMessage: "Hi SHERO, please add my pharmacy to the Pharmasyst waitlist.",
  },
];

export const statusLabel: Record<ProductStatus, string> = {
  "in-development": "In development",
  "in-validation": "In validation",
  live: "Live",
};

export function getProduct(slug: Product["slug"]): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}

