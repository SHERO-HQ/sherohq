import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";

// TODO(owner): replace each placeholder with the real screenshot, photo or graphic.
const services = [
  {
    title: "Custom software",
    description: "Web apps, dashboards and internal tools built around how your business actually works.",
    image: "Screenshot: a dashboard SHERO built",
    href: `${routes.services}#software`,
  },
  {
    title: "Hardware",
    description: "UK-used laptops, phones and accessories, tested and graded before they reach you.",
    image: "Photo: laptops being tested on the bench",
    href: `${routes.services}#hardware`,
  },
  {
    title: "Managed IT",
    description: "Office setup, networks, backups and support when something breaks.",
    image: "Graphic: office network diagram",
    href: `${routes.services}#managed-it`,
  },
  {
    title: "Systems integration",
    description: "Payments, point of sale and stock, connected so nothing is typed twice.",
    image: "Screenshot: a MoMo sale recorded in point of sale",
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
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
        {services.map((service) => (
          <li key={service.title}>
            <Link href={service.href} className="group flex flex-col gap-2 lg:gap-3">
              <Placeholder label={service.image} className="aspect-[4/3] rounded-md border border-border bg-surface" />
              <span className="text-h3 font-display text-heading group-hover:text-primary-hover">{service.title}</span>
              <span className="text-body-sm text-ink-secondary">{service.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
