import type { WaitlistProduct } from "@/lib/forms/waitlist";

// SHERO's own products. Shared structure (PRD): status, problem, who it's for,
// what it will do, waitlist. Each page swaps in the product's colours.

export type ProductPageContent = {
  slug: WaitlistProduct;
  name: string;
  theme: string;
  title: string;
  problem: string;
  problemMobile: string;
  audience: string;
  audienceMobile: string;
  form: {
    business: { label: string; placeholder: string };
    detail: { label: string; placeholder: string; inputMode?: "numeric" };
    namePlaceholder: string;
  };
  previewLabel: string;
  compareTitle: string;
  compareTitleMobile: string;
  compare: Array<{ today: string; todayMobile?: string; with: string; withMobile?: string }>;
};

export const products: Record<WaitlistProduct, ProductPageContent> = {
  merchander: {
    slug: "merchander",
    name: "Merchander",
    theme: "theme-merchander",
    title: "One place to run a business that sells on social media.",
    problem:
      "If you sell on WhatsApp or Instagram, your business lives in chats, screenshots and notebooks. Orders get lost, payments are hard to confirm, and pre-orders for imported goods are tracked by memory.",
    problemMobile:
      "If you sell on WhatsApp or Instagram, your business lives in chats, screenshots and notebooks. Orders get lost and payments are hard to confirm.",
    audience: "Merchants who sell through social media: importers, resellers, boutiques and other small businesses.",
    audienceMobile: "Merchants who sell through social media: importers, resellers, boutiques.",
    form: {
      namePlaceholder: "Ama Mensah",
      business: { label: "Business name", placeholder: "Ama's Imports" },
      detail: { label: "What do you sell?", placeholder: "Bags and shoes" },
    },
    previewLabel: "Dashboard preview: Merchander orders screen",
    compareTitle: "From how it works today, to what Merchander will do.",
    compareTitleMobile: "What Merchander will change.",
    compare: [
      {
        today: "Orders scattered across chats and screenshots",
        todayMobile: "Orders scattered across chats",
        with: "Every order from WhatsApp and Instagram in one list",
      },
      {
        today: "Payments checked by scrolling through MoMo messages",
        todayMobile: "Payments checked in MoMo messages",
        with: "Payments recorded, with a digital receipt for every sale",
        withMobile: "A digital receipt for every sale",
      },
      {
        today: "Stock counted by hand, often wrong",
        todayMobile: "Stock counted by hand",
        with: "Stock that updates itself, even when the internet drops",
        withMobile: "Stock that updates itself, even offline",
      },
      {
        today: "Pre-orders for imports tracked from memory",
        todayMobile: "Pre-orders tracked from memory",
        with: "Pre-orders tracked from deposit to delivery",
      },
    ],
  },
  pharmasyst: {
    slug: "pharmasyst",
    name: "Pharmasyst",
    theme: "theme-pharmasyst",
    title: "Sales and stock for pharmacies with labs.",
    problem:
      "Pharmacies with labs and several branches juggle sales, stock, expiry dates and insurance claims across separate systems or paper. Stock runs out at one branch while another has plenty, and NHIS claims take hours to prepare.",
    problemMobile:
      "Pharmacies with labs and several branches juggle sales, stock, expiry dates and insurance claims across separate systems or paper.",
    audience: "Pharmacies with labs, especially those with more than one branch.",
    audienceMobile: "Pharmacies with labs, especially those with more than one branch.",
    form: {
      namePlaceholder: "Kwame Asante",
      business: { label: "Pharmacy name", placeholder: "Kwame's Pharmacy" },
      detail: { label: "Number of branches", placeholder: "3", inputMode: "numeric" },
    },
    previewLabel: "Dashboard preview: Pharmasyst counter screen",
    compareTitle: "From how it works today, to what Pharmasyst will do.",
    compareTitleMobile: "What Pharmasyst will change.",
    compare: [
      {
        today: "Sales written up and totalled by hand",
        with: "Pharmacist prepares the sale, cashier takes payment, all in one flow",
      },
      { today: "Each branch keeps its own stock count", with: "Stock and expiry dates visible across every branch" },
      { today: "NHIS claims prepared from paper at month end", with: "NHIS details captured at the counter, claims exported" },
      { today: "Payments reconciled separately from sales", with: "MoMo and card payments recorded against each sale" },
    ],
  },
};
