import Link from "next/link";
import { HardwareArt, IntegrationArt, ManagedItArt, SoftwareArt } from "@/components/illustrations/ServiceArt";
import { CardBody, CardLink, CardMedia } from "@/components/ui/Card";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";

// One card per kind of need, in the visitor's words. Illustrations until SHERO
// has real photos and screenshots of this work. TODO(owner)
const services = [
  {
    title: "I need a laptop",
    description: "UK-used laptops, tested before they reach you, with the battery health on every listing.",
    action: "Shop laptops",
    Art: HardwareArt,
    href: routes.shop,
  },
  {
    title: "I need software built",
    description: "Web apps, dashboards and internal tools built around how your business works.",
    action: "Custom software",
    Art: SoftwareArt,
    href: `${routes.services}#software`,
  },
  {
    title: "I need IT support",
    description: "Office setup, networks, backups and support when something breaks.",
    action: "Managed IT",
    Art: ManagedItArt,
    href: `${routes.services}#managed-it`,
  },
  {
    title: "I need my systems connected",
    description: "Payments, point of sale and stock, connected so nothing is typed twice.",
    action: "Systems integration",
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
        title="What do you need?"
        intro="Everything your business runs on, handled in one place."
        action={
          <Link href={routes.services} className="text-label text-primary hover:underline">
            All services <InlineArrow />
          </Link>
        }
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map(({ title, description, action, href, Art }) => (
          <li key={title}>
            <CardLink href={href} className="h-full">
              <CardMedia className="px-6 pt-5 pb-1">
                <Art />
              </CardMedia>
              <CardBody>
                <span className="font-display text-h3 text-heading">{title}</span>
                <span className="text-body-sm text-ink-secondary">{description}</span>
                <span className="mt-auto pt-2 text-label text-primary">
                  {action} <InlineArrow className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardBody>
            </CardLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
