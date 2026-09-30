import { paymentSummary } from "@/lib/payments";

// Support FAQ. Every answer must stay true; the FAQ page also publishes these
// to search engines as structured data.

export type FaqGroup = { topic: string; items: Array<{ q: string; a: string }> };

const baseFaq: FaqGroup[] = [
  {
    topic: "buying",
    items: [
      {
        q: "Are your laptops new?",
        a: "No. They're UK-used, Grade A++, tested and cleaned before listing. Each listing shows the battery health.",
      },
      {
        q: "What does the warranty cover?",
        a: "One week from delivery. If something we tested stops working, we'll repair or replace it.",
      },
      {
        q: "How can I pay?",
        a: paymentSummary(),
      },
    ],
  },
  {
    topic: "delivery",
    items: [
      {
        q: "Do you deliver outside Ghana?",
        a: "The shop delivers within Ghana. For bulk orders outside Ghana, message us on WhatsApp with what you need and where, and we'll quote delivery.",
      },
      {
        q: "Do you deliver outside Tamale?",
        a: "Yes, nationwide. Orders placed before 5:00 PM leave the same day, and delivery usually takes 12–72 hours from dispatch. Free over {threshold}.",
      },
      {
        q: "How do I track my order?",
        a: "Use your order number and phone number on the Track Order page. You don't need an account.",
      },
    ],
  },
  {
    topic: "services and products",
    items: [
      {
        q: "Do you work with clients outside Ghana?",
        a: "Yes. We build software and provide IT support for clients anywhere. Book a free consultation and include your country code with your phone number.",
      },
      {
        q: "How much does custom software cost?",
        a: "It depends on what you need. After a free consultation, we give you a clear quote before any work starts.",
      },
    ],
  },
];

const list = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/** "Can I use your products yet?", answered from the products the admin publishes. */
export function productsAnswer(products: Array<{ name: string; status: string }>): string | null {
  if (products.length === 0) return null;
  const live = products.filter((p) => p.status === "live").map((p) => p.name);
  const building = products.filter((p) => p.status !== "live").map((p) => p.name);
  const parts: string[] = [];
  if (live.length > 0) parts.push(`${list(live)} ${live.length === 1 ? "is" : "are"} live: open ${live.length === 1 ? "its" : "each"} page to start.`);
  if (building.length > 0)
    parts.push(
      `${list(building)} ${building.length === 1 ? "is" : "are"} in development. Join the waitlist on ${building.length === 1 ? "its page" : "their pages"} to hear first.`,
    );
  return (live.length === 0 ? "Not yet. " : "") + parts.join(" ");
}

/** The FAQ, with the products question kept true as products are added or launched. */
export function buildFaq(products: Array<{ name: string; status: string }>, freeOver: string): FaqGroup[] {
  // The free-delivery threshold is set in the admin's Settings.
  const faq = baseFaq.map((group) => ({ ...group, items: group.items.map((i) => ({ ...i, a: i.a.replace("{threshold}", freeOver) })) }));
  const answer = productsAnswer(products);
  if (!answer) return faq;
  return faq.map((group) =>
    group.topic === "services and products"
      ? { ...group, items: [...group.items, { q: "Can I use your own products yet?", a: answer }] }
      : group,
  );
}
