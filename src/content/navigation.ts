import type { NavItem } from "./types";

/** Same menu and URLs as the previous sherohq.com, so links and habits keep working. */
export const mainNav: readonly NavItem[] = [
  { label: "Our Work", href: "/work" },
  { label: "Consultation", href: "/consultation" },
  { label: "About Us", href: "/about-us" },
];

/** The site-wide call to action. */
export const talkToUs: NavItem = { label: "Talk to us", href: "/contact-us" };

export const footerNav: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Company",
    items: [
      { label: "Solutions", href: "/solutions" },
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Consultation", href: "/consultation" },
      { label: "Partners", href: "/partners" },
      { label: "Support", href: "/support" },
      { label: "FAQ", href: "/faq" },
      { label: "Feedback", href: "/feedback" },
    ],
  },
];

export const legalNav: readonly NavItem[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
];
