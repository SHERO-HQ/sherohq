import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

// TODO(owner): replace each placeholder with the real screenshot, photo or graphic.
const services = [
  {
    title: "Custom software",
    description: "Web apps, dashboards and internal tools built around how your business actually works.",
    descriptionMobile: "Web apps, dashboards and internal tools built around how your business works.",
    image: "Screenshot: a dashboard SHERO built",
    href: `${routes.services}#software`,
  },
  {
    title: "Hardware",
    description: "UK-used laptops, phones and accessories, tested and graded before they reach you.",
    descriptionMobile: "UK-used laptops, phones and accessories, tested before they reach you.",
    image: "Photo: laptops being tested on the bench",
    href: `${routes.services}#hardware`,
  },
  {
    title: "Managed IT",
    description: "Office setup, networks, backups and support when something breaks.",
    descriptionMobile: "Office setup, networks, backups and support.",
    image: "Graphic: office network diagram",
    href: `${routes.services}#managed-it`,
  },
  {
    title: "Systems integration",
    description: "Payments, point of sale and stock, connected so nothing is typed twice.",
    descriptionMobile: "Payments, point of sale and stock, connected.",
    image: "Screenshot: a MoMo sale recorded in point of sale",
    href: `${routes.services}#integrations`,
  },
];

function AllServicesLink({ className }: { className: string }) {
  return (
    <Link
      href={routes.services}
      className={`whitespace-nowrap font-medium text-primary hover:underline hover:underline-offset-3 ${className}`}
    >
      All services <InlineArrow />
    </Link>
  );
}

export function ServicesOverview() {
  return (
    <section className="container-site flex flex-col gap-8 pt-16 lg:gap-12 lg:pt-28">
      <div className="flex items-end justify-between gap-12">
        <h2 className="max-w-[720px] font-display text-[30px]/[33px] font-bold tracking-[-0.02em] text-heading lg:text-[52px]/[56px] lg:tracking-[-0.03em]">
          Everything your business runs on, handled in one place.
        </h2>
        <AllServicesLink className="hidden text-sm/5 lg:inline" />
      </div>

      <ul className="grid gap-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-14">
        {services.map((service) => (
          <li key={service.title}>
            <Link href={service.href} className="group flex flex-col gap-2.5 lg:gap-3.5">
              <Placeholder
                label={service.image}
                className="h-[220px] rounded-md border border-border bg-surface lg:h-[340px] lg:rounded-none"
              />
              <span className="font-display text-[23px]/7 font-semibold text-heading group-hover:text-primary-hover lg:text-[28px]/[34px] lg:tracking-[-0.015em]">
                {service.title}
              </span>
              <span className="max-w-[560px] text-base/[25px] text-ink-secondary lg:text-[17px]/[27px]">
                <span className="lg:hidden">{service.descriptionMobile}</span>
                <span className="hidden lg:inline">{service.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <AllServicesLink className="text-[15px]/[22px] lg:hidden" />
    </section>
  );
}
