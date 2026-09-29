import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { HardwareArt, IntegrationArt, ManagedItArt, SoftwareArt } from "@/components/illustrations/ServiceArt";
import { Card, CardMedia } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { business, routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

export const metadata: Metadata = {
  title: "Services: custom software, laptops, managed IT and integration",
  description:
    "Custom software, tested laptops, managed IT and systems integration for businesses in Tamale and across Ghana, set up and supported by SHERO.",
  alternates: { canonical: routes.services },
};

type Service = {
  id: string;
  Art: (props: { className?: string }) => React.ReactNode;
  title: string;
  intro: string;
  offers: string[];
  links: Array<{ label: string; href: string }>;
};

const consult = (service: string) => `${routes.consultation}?service=${service}`;

const services: Service[] = [
  {
    id: "software",
    Art: SoftwareArt,
    title: "Custom software",
    intro: "Software shaped around your workflow, not the other way round.",
    offers: ["Web applications and dashboards", "Internal business tools", "Mobile and web apps", "Cloud-based products"],
    links: [{ label: "Talk to us about custom software", href: consult("software") }],
  },
  {
    id: "hardware",
    Art: HardwareArt,
    title: "Hardware",
    intro: "Laptops and equipment your team can rely on, tested before delivery.",
    offers: [
      "UK-used business laptops and desktops",
      "Phones, audio and accessories",
      "Office hardware sourcing and setup",
      "Advice on what to buy for your needs and budget",
    ],
    links: [
      { label: "See laptops in stock", href: routes.shop },
      { label: "Talk to us about office hardware", href: consult("hardware") },
    ],
  },
  {
    id: "managed-it",
    Art: ManagedItArt,
    title: "Managed IT",
    intro: "We keep your technology running so your team doesn't have to think about it.",
    offers: [
      "Workstation setup for new staff",
      "Office network setup",
      "Data backups and maintenance",
      `Troubleshooting and support, ${business.hours}`,
    ],
    links: [{ label: "Talk to us about managed IT", href: consult("managed-it") }],
  },
  {
    id: "integrations",
    Art: IntegrationArt,
    title: "Systems integration",
    intro: "Your tools, talking to each other.",
    offers: [
      "Payment setup with MoMo and cards",
      "Point of sale and stock syncing",
      "Connecting third-party software",
      "Automating repetitive steps",
    ],
    links: [{ label: "Talk to us about systems integration", href: consult("integrations") }],
  },
];

const steps = [
  { title: "Talk", text: "We learn what your business does and what's getting in the way." },
  { title: "Plan", text: "We propose a solution, what it costs and how long it takes." },
  { title: "Build", text: "We build the software, install the hardware and configure systems." },
  { title: "Test", text: "We check everything works together before you rely on it." },
  { title: "Hand over", text: "We train your team so they're comfortable using it." },
  { title: "Support", text: "We stay available for fixes, updates and questions." },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function ServicesPage() {
  return (
    <>
      <section className="container-site flex flex-col gap-8 border-b border-border py-section">
        <div className="flex max-w-measure flex-col gap-5">
          <h1 className="text-h1">Set up, built and supported by SHERO.</h1>
          <p className="text-body-lg text-ink-secondary">
            Start with one service or combine them. Either way, support comes from the same place that set it up.
          </p>
        </div>
        <nav aria-label="Services on this page" className="flex flex-wrap gap-2">
          {services.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-label text-ink hover:border-border-strong"
            >
              {service.title}
              <InlineArrow direction="down" className="text-primary" />
            </a>
          ))}
        </nav>
      </section>

      {services.map((service, i) => (
        <Section
          key={service.id}
          id={service.id}
          divider={i > 0}
          aria-labelledby={`${service.id}-title`}
          className="grid scroll-mt-16 gap-8 lg:grid-cols-2 lg:gap-16"
        >
          <div className="flex flex-col gap-4">
            <p className="font-mono text-eyebrow text-secondary">{pad(i + 1)}</p>
            <h2 id={`${service.id}-title`} className="text-h2">
              {service.title}
            </h2>
            <p className="max-w-measure text-body-lg text-ink-secondary">{service.intro}</p>
            <div className="flex flex-col gap-2 pt-2">
              {service.links.map((link) => (
                <Link key={link.href} href={link.href} className="self-start text-label text-primary hover:underline">
                  {link.label} <InlineArrow />
                </Link>
              ))}
            </div>
          </div>
          <Card className="self-start">
            <CardMedia className="px-6 pt-6 pb-2 lg:px-10 lg:pt-8">
              <service.Art />
            </CardMedia>
            <ul>
              {service.offers.map((offer) => (
                <li key={offer} className="flex gap-3 border-border px-5 py-3.5 not-last:border-b lg:px-6">
                  <Check aria-hidden="true" size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-secondary" />
                  <span className="text-body text-ink">{offer}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ))}

      <Section tone="surface" aria-labelledby="process-heading">
        <SectionHeader id="process-heading" eyebrow="how we work" title="From first conversation to ongoing support." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full gap-2 p-5 lg:p-6">
                <span className="font-mono text-eyebrow text-secondary">step {pad(i + 1)}</span>
                <span className="font-display text-h3 text-heading">{step.title}</span>
                <span className="text-body text-ink-secondary">{step.text}</span>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <ConsultationCta />
    </>
  );
}
