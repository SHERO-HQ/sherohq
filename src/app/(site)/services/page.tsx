import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { HardwareArt, IntegrationArt, ManagedItArt, SoftwareArt } from "@/components/illustrations/ServiceArt";
import { Card, CardMedia } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { business, routes, shopUrl } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

export const metadata: Metadata = {
  title: "Services: custom software, laptops, managed IT and integration",
  description:
    "Custom software, tested laptops, managed IT and systems integration from SHERO in Tamale, for businesses across Ghana and abroad.",
  alternates: { canonical: routes.services },
};

type Service = {
  id: string;
  Art: (props: { className?: string }) => React.ReactNode;
  title: string;
  /** For the jump links at the top, when the title is long. */
  short?: string;
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
    intro: "Web and mobile apps built around how your business already works.",
    offers: ["Web apps and dashboards", "Mobile apps", "Internal tools for your staff", "Online ordering for your customers"],
    links: [{ label: "Talk to us about custom software", href: consult("software") }],
  },
  {
    id: "hardware",
    Art: HardwareArt,
    title: "Hardware for your business",
    short: "Hardware",
    intro: "Laptops and office equipment for a team, sourced, tested and set up. Buying one laptop? The shop has them.",
    offers: [
      "Laptops and desktops for your staff, tested before they reach you",
      "Office hardware sourcing and setup",
      "Advice on what to buy for your needs and budget",
      "Bulk orders delivered outside Ghana, on request",
    ],
    links: [
      { label: "Talk to us about office hardware", href: consult("hardware") },
      { label: "Buying one? Visit the shop", href: shopUrl.home },
    ],
  },
  {
    id: "managed-it",
    Art: ManagedItArt,
    title: "Managed IT",
    intro: "Setup, backups and a number to call when something stops working.",
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
    intro: "Payments, point of sale and stock connected, so nothing is typed twice.",
    offers: [
      "Payment setup with MoMo and cards",
      "Point of sale and stock syncing",
      "Connecting third-party software",
      "Automating repetitive steps",
    ],
    links: [{ label: "Talk to us about systems integration", href: consult("integrations") }],
  },
];

// Three steps a client actually goes through; the promise that matters is
// the quote before any work starts.
const steps = [
  { title: "Talk", text: "A free consultation about what your business does and what's getting in the way." },
  { title: "Quote", text: "What we'd build or supply, what it costs and how long it takes, before any work starts." },
  { title: "Build and support", text: "We build, test and set it up, show you how it works, then help with fixes and questions after it goes live." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="container-site flex flex-col gap-8 border-b border-border py-section">
        <div className="flex max-w-measure flex-col gap-5">
          <h1 className="text-h1">Set up, built and supported by SHERO.</h1>
          <p className="text-body-lg text-ink-secondary">
            Start with one service or combine them. Either way, support comes from the same place that set it up.
            Software and IT support for clients anywhere; hardware across Ghana, and in bulk beyond it.
          </p>
        </div>
        <nav aria-label="Services on this page" className="flex flex-wrap gap-2">
          {services.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-label text-ink hover:border-border-strong"
            >
              {service.short ?? service.title}
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
        <SectionHeader id="process-heading" title="How working with us goes." />
        <ol className="grid gap-3 md:grid-cols-3 lg:gap-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full gap-2 p-5 lg:p-6">
                <span className="font-mono text-eyebrow text-secondary">{i + 1}</span>
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
