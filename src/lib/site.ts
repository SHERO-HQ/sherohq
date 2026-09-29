// Business details and routes shared across the site. Contact details come from
// docs/prd.md ("Contact details"); change them here, not in components.

export const business = {
  name: "SHERO",
  email: "hello@sherohq.com",
  phoneDisplay: "+233 54 871 1582",
  phoneE164: "+233548711582",
  whatsappNumber: "233548711582",
  city: "Tamale, Ghana",
  locality: "Tamale",
  region: "Northern Region",
  country: "GH",
  hours: "Mon–Fri, 8:00 AM – 6:00 PM",
  hoursShort: "mon–fri, 8:00 – 18:00",
  // Required word for word by Meta verification. Never reword.
  legalLine: "SHERO HQ is a brand of SHERO FINTECH",
} as const;

export const routes = {
  home: "/",
  services: "/services",
  shop: "/shop",
  products: "/#products",
  merchander: "/merchander",
  pharmasyst: "/pharmasyst",
  work: "/work",
  about: "/about",
  careers: "/about/careers",
  support: "/support",
  faq: "/support#faq",
  consultation: "/support/consultation",
  track: "/track",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  cookies: "/legal/cookies",
} as const;

export const siteUrl = "https://sherohq.com";

/** Pages that exist today. The sitemap lists these; add each page as it ships. */
export const livePages: string[] = [routes.home];

export const mainNav = [
  { label: "Services", href: routes.services },
  { label: "Shop", href: routes.shop },
  { label: "Products", href: routes.products },
  { label: "Work", href: routes.work },
  { label: "About", href: routes.about },
] as const;

/** WhatsApp click-to-chat link (Phase 1: no WhatsApp API). */
export function whatsappLink(text?: string, number: string = business.whatsappNumber): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
