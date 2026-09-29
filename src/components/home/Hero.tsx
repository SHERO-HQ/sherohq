import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { ButtonLink } from "@/components/ui/Button";
import { CardBody, CardLink, CardMedia } from "@/components/ui/Card";
import { LaptopSpot, PharmacySpot, SocialSpot, SoftwareSpot } from "@/components/illustrations/ServiceArt";

const paths = [
  {
    title: "I need a laptop",
    Spot: LaptopSpot,
    description: "Strong enough for your work, with a battery you can trust.",
    action: "Shop laptops",
    href: routes.shop,
  },
  {
    title: "I need software built",
    Spot: SoftwareSpot,
    description: "Your own system, built around how your business works.",
    action: "Custom software",
    href: `${routes.services}#software`,
  },
  {
    title: "I sell on social media",
    Spot: SocialSpot,
    description: "Orders, payments and stock in one place.",
    action: "Join the waitlist",
    href: `${routes.merchander}#waitlist`,
    waitlist: true,
  },
  {
    title: "I run a pharmacy",
    Spot: PharmacySpot,
    description: "Sales, stock and NHIS claims across your branches.",
    action: "Join the waitlist",
    href: `${routes.pharmasyst}#waitlist`,
    waitlist: true,
  },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* The illustrations' dot grid, fading out from the top: depth without a picture. */}
      <div aria-hidden="true" className="bg-dots mask-fade-down absolute inset-x-0 top-0 -z-10 h-160" />

      <div className="container-site flex flex-col items-center gap-6 pt-section text-center">
        {/* The logo's slanted bars, in the fixed brand inks. */}
        <div aria-hidden="true" className="flex gap-2">
          <span className="slant h-4 w-14 bg-navy-700" />
          <span className="slant h-4 w-8 bg-emerald-700" />
        </div>
        {/* The motto appears only here, on About and in the footer. */}
        <h1 className="text-display">Redefine Possible.</h1>
        <p className="max-w-measure text-body-lg text-ink-secondary">
          SHERO builds software, supplies tested laptops and supports the technology businesses run on. From Tamale,
          delivering across Ghana.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <ButtonLink href={routes.shop} size="lg">
            Shop laptops
          </ButtonLink>
          <ButtonLink href={routes.consultation} variant="outline" size="lg">
            Book a free consultation
          </ButtonLink>
        </div>
      </div>

      <div className="container-site pt-16 pb-16 lg:pt-20">
        <nav aria-labelledby="paths-heading" className="flex flex-col gap-4">
        <h2 id="paths-heading" className="font-mono text-eyebrow text-secondary">
          what do you need?
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paths.map((path) => (
            <li key={path.title}>
              <CardLink href={path.href} className="h-full">
                <CardMedia className="flex justify-center px-6 py-3">
                  <path.Spot className="h-20 w-auto" />
                </CardMedia>
                <CardBody>
                  <span className="flex flex-wrap items-center gap-2 text-body font-semibold text-heading">
                    {path.title}
                    {path.waitlist && <StatusBadge status="dev" size="sm" />}
                  </span>
                  <span className="text-body-sm text-ink-secondary">{path.description}</span>
                  <span className="mt-auto pt-2 text-label text-primary">
                    {path.action} <InlineArrow className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardBody>
              </CardLink>
            </li>
          ))}
        </ul>
        <Link href={routes.consultation} className="self-start text-label text-primary hover:underline">
          Something else? Book a free consultation <InlineArrow />
        </Link>
      </nav>
      </div>
    </section>
  );
}
