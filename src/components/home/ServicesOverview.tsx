import Link from "next/link";
import { HardwareArt, IntegrationArt, ManagedItArt, SoftwareArt } from "@/components/illustrations/ServiceArt";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";

// One column per kind of need, in the visitor's words. Illustrations until SHERO
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
      {/*
        Open columns, Linear style: no cards, just tinted lines on either side
        of each column on tablets and up. Phones list them, a small illustration
        beside the words, all visible at once (no swiping).
      */}
      <ul className="grid border-border-subtle md:grid-cols-2 md:gap-y-12 md:border-r lg:grid-cols-4">
        {services.map(({ title, description, action, href, Art }, i) => (
          <li
            key={title}
            className={cn("border-border-subtle md:border-l", i > 0 && "border-t pt-8 md:border-t-0 md:pt-0", "pb-8 md:pb-0")}
          >
            <Link
              href={href}
              className="group grid h-full grid-cols-[6rem_1fr] content-start gap-x-4 gap-y-1.5 rounded-sm md:flex md:flex-col md:gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:px-6"
            >
              <span className="row-span-3 block md:mb-4">
                <Art />
              </span>
              <span className="font-display text-h3 text-heading">{title}</span>
              <span className="text-body-sm text-ink-secondary">{description}</span>
              <span className="pt-1 text-label md:mt-auto md:pt-2 text-primary group-hover:underline">
                {action} <InlineArrow className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
