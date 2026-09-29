import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { ButtonLink } from "@/components/ui/Button";

const paths = [
  {
    title: "I need a laptop",
    description: "Strong enough for your work, with a battery you can trust.",
    action: "Shop laptops",
    href: routes.shop,
  },
  {
    title: "I need software built",
    description: "Your own system, built around how your business works.",
    action: "Custom software",
    href: `${routes.services}#software`,
  },
  {
    title: "I sell on social media",
    description: "Orders, payments and stock in one place.",
    action: "Join the waitlist",
    href: `${routes.merchander}#waitlist`,
    waitlist: true,
  },
  {
    title: "I run a pharmacy",
    description: "Sales, stock and NHIS claims across your branches.",
    action: "Join the waitlist",
    href: `${routes.pharmasyst}#waitlist`,
    waitlist: true,
  },
];

export function Hero() {
  return (
    <section className="container-site flex flex-col gap-12 lg:gap-16 py-section">
      <div className="flex flex-col gap-6">
        {/* The logo's slanted bars, in the fixed brand inks. */}
        <div aria-hidden="true" className="flex gap-2">
          <span className="slant h-4 w-14 bg-navy-700" />
          <span className="slant h-4 w-8 bg-emerald-700" />
        </div>
        <div className="flex max-w-measure flex-col gap-5">
          {/* The motto appears only here, on About and in the footer. */}
          <h1 className="text-display">Redefine Possible.</h1>
          <p className="text-body-lg text-ink-secondary">
            SHERO builds software, supplies tested laptops and supports the technology businesses run on. From
            Tamale, delivering across Ghana.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={routes.shop} size="lg">
              Shop laptops
            </ButtonLink>
            <ButtonLink href={routes.consultation} variant="outline" size="lg">
              Book a free consultation
            </ButtonLink>
          </div>
        </div>
      </div>

      <nav aria-labelledby="paths-heading" className="flex flex-col gap-4">
        <h2 id="paths-heading" className="font-mono text-eyebrow text-secondary">
          what do you need?
        </h2>
        <ul className="grid overflow-hidden rounded-md border border-border sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path) => (
            <li key={path.title} className="border-border not-last:border-b sm:odd:border-r lg:border-b-0 lg:not-last:border-r">
              <Link href={path.href} className="group flex h-full flex-col gap-2 p-5 transition-colors hover:bg-surface">
                <span className="flex flex-wrap items-center gap-2 text-body font-semibold text-heading">
                  {path.title}
                  {path.waitlist && <StatusBadge status="dev" size="sm" />}
                </span>
                <span className="text-body-sm text-ink-secondary">{path.description}</span>
                <span className="mt-auto pt-2 text-label text-primary">
                  {path.action} <InlineArrow className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={routes.consultation} className="self-start text-label text-primary hover:underline">
          Something else? Book a free consultation <InlineArrow />
        </Link>
      </nav>
    </section>
  );
}
