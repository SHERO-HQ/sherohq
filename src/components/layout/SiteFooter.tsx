import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { OpenNow } from "@/components/ui/LiveStatus";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { productPath, type Product } from "@/lib/products";
import { business, routes } from "@/lib/site";

const baseColumns = [
  {
    heading: "company",
    links: [
      { label: "About", href: routes.about },
      { label: "Work", href: routes.work },
      { label: "Careers", href: routes.careers },
    ],
  },
  {
    heading: "offer",
    links: [
      { label: "Services", href: routes.services },
      { label: "Shop", href: routes.shop },
    ],
  },
  {
    heading: "help",
    links: [
      { label: "Support", href: routes.support },
      { label: "FAQ", href: routes.faq },
      { label: "Track order", href: routes.track },
      // TODO(owner): the design has "Feedback" but no feedback page; it points to Support for now.
      { label: "Feedback", href: routes.support },
    ],
  },
];

const linkClass =
  "self-start rounded-sm py-1 text-body-sm text-ink-inverse-muted transition-colors duration-150 hover:text-ink-inverse lg:py-0";
const headingClass = "mb-1 font-mono text-eyebrow text-ink-inverse";

/**
 * Brand on the left (logo, motto, live status), then four short columns
 * ending in how to reach us; a quiet bottom line with the legal wording.
 */
export function SiteFooter({ products }: { products: Product[] }) {
  // SHERO's own products (from the admin) join the "offer" column.
  const columns = baseColumns.map((column) =>
    column.heading === "offer"
      ? { ...column, links: [...column.links, ...products.map((p) => ({ label: p.name, href: productPath(p.slug) }))] }
      : column,
  );
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-inverse bg-surface-inverse text-ink-inverse">
      <div className="container-site flex flex-col gap-12 pt-section pb-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr] lg:gap-x-8">
          <div className="col-span-2 flex flex-col items-start gap-5 md:col-span-4 lg:col-span-1">
            <Logo variant="light" className="h-10 w-auto" />
            {/* The motto appears only here, in the home hero and on About. */}
            <p className="font-display text-h3 text-ink-inverse">Redefine Possible.</p>
            <OpenNow
              fallback={business.hours}
              dotClassName="bg-emerald-400"
              className="rounded-full border border-border-inverse px-3 py-1 text-body-sm text-ink-inverse"
            />
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col gap-2">
              <h2 className={headingClass}>{column.heading}</h2>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}

          {/* Email and phone get full-height tap targets on phones (24px+). */}
          <address className="flex flex-col gap-2 not-italic">
            <h2 className={headingClass}>contact</h2>
            <a href={`mailto:${business.email}`} className={linkClass}>
              {business.email}
            </a>
            <a href={`tel:${business.phoneE164}`} className={linkClass}>
              {business.phoneDisplay}
            </a>
            <span className="py-1 text-body-sm text-ink-inverse-muted lg:py-0">{business.city}</span>
            {/* Days, then times, so neither breaks mid-phrase on phones. */}
            {business.hours.split(", ").map((part) => (
              <span key={part} className="py-1 text-body-sm text-ink-inverse-muted lg:py-0">
                {part}
              </span>
            ))}
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
              <Link href={routes.terms} className="hover:text-ink-inverse">
                Terms
              </Link>
              <Link href={routes.privacy} className="hover:text-ink-inverse">
                Privacy
              </Link>
              <Link href={routes.cookies} className="hover:text-ink-inverse">
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
