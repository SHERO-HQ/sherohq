import type { NavItem } from "./types";

export const mainNav: readonly NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Merchander", href: "/merchander" },
  { label: "Pharmasyst", href: "/pharmasyst" },
  { label: "About", href: "/about" },
];

export const footerNav: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "What we do",
    items: [
      { label: "Services", href: "/services" },
      { label: "Merchander", href: "/merchander" },
      { label: "Pharmasyst", href: "/pharmasyst" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
