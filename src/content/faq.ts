import { paymentSummary } from "@/lib/payments";

// Support FAQ. Every answer must stay true; the FAQ page also publishes these
// to search engines as structured data.

export type FaqGroup = { topic: string; items: Array<{ q: string; a: string }> };

export const faq: FaqGroup[] = [
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
        q: "Do you deliver outside Tamale?",
        a: "Yes, nationwide. Orders placed before 5:00 PM leave the same day, and delivery usually takes 12–72 hours from dispatch. Free over GHS 2,000.",
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
        q: "How much does custom software cost?",
        a: "It depends on what you need. After a free consultation, we give you a clear quote before any work starts.",
      },
      {
        q: "Can I use Merchander or Pharmasyst now?",
        a: "Not yet. Both are in development. Join the waitlist on their pages to hear first.",
      },
    ],
  },
];
