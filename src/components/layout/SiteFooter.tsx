import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { OpenNow } from "@/components/ui/LiveStatus";
import { business, routes } from "@/lib/site";

const columns = [
  {
    heading: "company",
    links: [
      { label: "About", href: routes.about },
      { label: "Work", href: routes.work },
      { label: "Careers", href: routes.careers },
      { label: "Contact", href: routes.support },
    ],
  },
  {
    heading: "offer",
    links: [
      { label: "Services", href: routes.services },
      { label: "Shop", href: routes.shop },
      { label: "Merchander", href: routes.merchander },
      { label: "Pharmasyst", href: routes.pharmasyst },
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

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-inverse text-ink-inverse">
      <div className="container-site flex flex-col gap-10 pb-8 pt-section">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
            <Logo variant="light" className="h-6 w-auto self-start" />
            {/* Email and phone get full-height tap targets on phones (24px+). */}
            <div className="flex flex-col items-start gap-1 text-body-sm text-ink-inverse-muted">
              <a href={`mailto:${business.email}`} className="py-1.5 hover:text-ink-inverse lg:py-0">
                {business.email}
              </a>
              <a href={`tel:${business.phoneE164}`} className="py-1.5 hover:text-ink-inverse lg:py-0">
                {business.phoneDisplay}
              </a>
              <span className="pt-1 lg:pt-0">
                {business.city} · {business.hours}
              </span>
              <OpenNow fallback="" dotClassName="bg-emerald-400" className="text-ink-inverse" />
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-2">
              <span className="mb-1 font-mono text-eyebrow text-ink-inverse">
                {column.heading}
              </span>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="self-start rounded-sm py-1 text-body-sm text-ink-inverse-muted transition-colors duration-150 hover:text-ink-inverse lg:py-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border-inverse pt-6 font-mono text-meta text-ink-inverse-muted lg:flex-row lg:justify-between lg:gap-6">
          <p>
            ©{year} SHERO. {business.legalLine} ·{" "}
            <Link href={routes.terms} className="hover:text-ink-inverse">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href={routes.privacy} className="hover:text-ink-inverse">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href={routes.cookies} className="hover:text-ink-inverse">
              Cookies
            </Link>
          </p>
          <p>Visa · Mastercard · MTN MoMo · Telecel Cash</p>
        </div>
      </div>
    </footer>
  );
}
