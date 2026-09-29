import Link from "next/link";
import { HardwareArt, IntegrationArt, ManagedItArt, SoftwareArt } from "@/components/illustrations/ServiceArt";
import { CardBody, CardLink, CardMedia } from "@/components/ui/Card";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";

// Illustrations until SHERO has real photos and screenshots of this work. TODO(owner)
const services = [
  {
    title: "Custom software",
    description: "Web apps, dashboards and internal tools built around how your business actually works.",
    Art: SoftwareArt,
    href: `${routes.services}#software`,
  },
  {
    title: "Hardware",
    description: "UK-used laptops, phones and accessories, tested and graded before they reach you.",
    Art: HardwareArt,
    href: `${routes.services}#hardware`,
  },
  {
    title: "Managed IT",
    description: "Office setup, networks, backups and support when something breaks.",
    Art: ManagedItArt,
    href: `${routes.services}#managed-it`,
  },
  {
    title: "Systems integration",
    description: "Payments, point of sale and stock, connected so nothing is typed twice.",
    Art: IntegrationArt,
    href: `${routes.services}#integrations`,
  },
];

export function ServicesOverview() {
  return (
    <Section aria-labelledby="services-heading">
      <SectionHeader
        id="services-heading"
        eyebrow="what we do"
        title="Everything your business runs on, handled in one place."
        action={
          <Link href={routes.services} className="text-label text-primary hover:underline">
            All services <InlineArrow />
          </Link>
        }
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map(({ title, description, href, Art }) => (
          <li key={title}>
            <CardLink href={href} className="h-full">
              <CardMedia className="px-6 pt-5 pb-1">
                <Art />
              </CardMedia>
              <CardBody>
                <span className="font-display text-h3 text-heading">{title}</span>
                <span className="text-body-sm text-ink-secondary">{description}</span>
                <span className="mt-auto pt-2 text-label text-primary">
                  How it works <InlineArrow className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardBody>
            </CardLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
