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
  cart: "/cart",
  checkout: "/checkout",
  products: "/#products",
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

/**
 * The shop is its own site (owner, 1 Oct 2026): shop.sherohq.com, same app and
 * admin. In production NEXT_PUBLIC_SHOP_URL is "https://shop.sherohq.com" and
 * links go there at clean paths ("/", "/<laptop>", "/cart"); next.config.ts
 * maps those to the routes below. Elsewhere (local, previews) it's unset and
 * links use this app's own paths. `routes.shop` etc. stay the internal paths,
 * for revalidatePath, cookies and server redirects.
 */
const shopOrigin = (process.env.NEXT_PUBLIC_SHOP_URL ?? "").replace(/\/$/, "");

export const shopUrl = {
  home: shopOrigin ? `${shopOrigin}/` : routes.shop,
  cart: shopOrigin ? `${shopOrigin}/cart` : routes.cart,
  checkout: shopOrigin ? `${shopOrigin}/checkout` : routes.checkout,
  track: shopOrigin ? `${shopOrigin}/track` : routes.track,
  listing: (slug: string) => (shopOrigin ? `${shopOrigin}/${slug}` : `${routes.shop}/${slug}`),
};

/** A main-site page linked from the shop: the full sherohq.com address once the shop has its own. */
export function mainUrl(path: string): string {
  return shopOrigin ? `${siteUrl}${path === "/" ? "" : path}` : path;
}

/** A full address for canonical links and structured data. */
export function absoluteUrl(href: string): string {
  return href.startsWith("http") ? href : `${siteUrl}${href}`;
}

/** Pages that exist today (shop pages included: same app). The sitemap lists the main site's plus each product and project. */
export const livePages: string[] = [routes.home, routes.services, routes.shop, routes.track, routes.about, routes.work, routes.support, routes.consultation, routes.careers, routes.terms, routes.privacy, routes.cookies];

/** The business site's sections. The shop has its own link, set apart, since it's its own site. */
export const mainNav = [
  { label: "Services", href: routes.services },
  { label: "Work", href: routes.work },
  { label: "Products", href: routes.products },
  { label: "About", href: routes.about },
] as const;

/** WhatsApp click-to-chat link (Phase 1: no WhatsApp API). */
export function whatsappLink(text?: string, number: string = business.whatsappNumber): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
