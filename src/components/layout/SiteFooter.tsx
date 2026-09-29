import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
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
      <div className="container-site flex flex-col gap-8 pt-12 pb-8 lg:gap-10 lg:pt-16 lg:pb-9">
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 flex flex-col gap-8 lg:col-span-1 lg:gap-4">
            <Logo variant="light" className="h-6 w-auto self-start lg:h-7" />
            <p className="font-mono text-xs/5 text-ink-inverse-muted">
              <a href={`mailto:${business.email}`} className="hover:text-ink-inverse">
                {business.email}
              </a>
              <br />
              <a href={`tel:${business.phoneE164}`} className="hover:text-ink-inverse">
                {business.phoneDisplay}
              </a>
              <br />
              {business.city} · {business.hours}
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-2.5">
              <span className="mb-0 font-mono text-xs/4 font-medium text-ink-inverse lg:mb-1">
                {column.heading}
              </span>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="self-start rounded-sm text-[15px]/[22px] text-ink-inverse-muted transition-colors duration-150 hover:text-ink-inverse lg:text-sm/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-inverse-border pt-5 font-mono text-xs/[18px] text-ink-inverse-muted lg:flex-row lg:justify-between lg:gap-6 lg:pt-6">
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
