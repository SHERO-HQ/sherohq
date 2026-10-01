import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { OpenNow } from "@/components/ui/LiveStatus";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { business, mainUrl, routes, shopUrl, whatsappLink } from "@/lib/site";

const linkClass =
  "self-start rounded-sm py-1 text-body-sm text-ink-inverse-muted transition-colors duration-150 hover:text-ink-inverse lg:py-0";
const headingClass = "mb-1 font-mono text-eyebrow text-ink-inverse";

/**
 * The shop's footer: what the shop is, help with buying, and the way back to
 * SHERO's business site. Same navy band and legal line as sherohq.com.
 */
export function ShopFooter() {
  const year = new Date().getFullYear();
  const columns = [
    {
      heading: "shop",
      links: [
        { label: "All devices", href: shopUrl.home },
        { label: "Track an order", href: shopUrl.track },
        { label: "Delivery and payment", href: mainUrl(routes.faq) },
      ],
    },
    {
      heading: "shero",
      links: [
        { label: "Software and IT support", href: mainUrl(routes.services) },
        { label: "Work", href: mainUrl(routes.work) },
        { label: "About", href: mainUrl(routes.about) },
      ],
    },
  ];

  return (
    <footer className="border-t border-border-inverse bg-surface-inverse text-ink-inverse">
      <div className="container-site flex flex-col gap-10 pt-12 pb-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr] lg:gap-x-8">
          <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-4 lg:col-span-1">
            <span className="flex items-center gap-2.5">
              <Logo variant="light" className="h-8 w-auto" />
              <span className="font-mono text-meta text-ink-inverse-muted">shop</span>
            </span>
            <p className="max-w-xs text-body-sm text-ink-inverse-muted">
              Tested UK-used laptops from SHERO in Tamale, delivered across Ghana.
            </p>
            <OpenNow
              fallback={business.hours}
              dotClassName="bg-emerald-400"
              className="rounded-full border border-border-inverse px-3 py-1 text-body-sm text-ink-inverse"
            />
          </div>
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading === "shop" ? "Shop" : "SHERO"} className="flex flex-col gap-2">
              <span className={headingClass}>{column.heading}</span>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
          <address className="col-span-2 flex flex-col gap-2 not-italic md:col-span-1">
            <span className={headingClass}>help</span>
            <a href={whatsappLink("Hi SHERO, I have a question about the shop: ")} className={linkClass}>
              WhatsApp {business.phoneDisplay}
            </a>
            <a href={`mailto:${business.email}`} className={linkClass}>
              {business.email}
            </a>
            <span className="py-1 text-body-sm text-ink-inverse-muted lg:py-0">{business.city}</span>
          </address>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-inverse pt-6 text-meta text-ink-inverse-muted md:flex-row md:items-center md:justify-between">
          {/* The legal line stands on its own (Meta verification), apart from the copyright. */}
          <div className="flex flex-col gap-1">
            <p>© {year} SHERO</p>
            <p>{business.legalLine}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5 md:justify-end">
            <nav aria-label="Legal" className="flex gap-5">
              <Link href={mainUrl(routes.terms)} className="hover:text-ink-inverse">
                Terms
              </Link>
              <Link href={mainUrl(routes.privacy)} className="hover:text-ink-inverse">
                Privacy
              </Link>
              <Link href={mainUrl(routes.cookies)} className="hover:text-ink-inverse">
                Cookies
              </Link>
            </nav>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
}
