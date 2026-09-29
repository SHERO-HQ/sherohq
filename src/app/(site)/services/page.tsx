import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Readout, type ReadoutRow } from "@/components/ui/Readout";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services: custom software, laptops, managed IT and integration",
  description:
    "Custom software, tested laptops, managed IT and systems integration for businesses in Tamale and across Ghana, set up and supported by SHERO.",
  alternates: { canonical: routes.services },
};

type Service = {
  id: string;
  title: string;
  intro: string;
  offers: string[];
  readout: { title: string; rows: ReadoutRow[] };
  links: Array<{ label: string; href: string }>;
};

const consult = (service: string) => `${routes.consultation}?service=${service}`;

const services: Service[] = [
  {
    id: "software",
    title: "Custom software",
    intro: "Software shaped around your workflow, not the other way round.",
    offers: ["Web applications and dashboards", "Internal business tools", "Mobile and web apps", "Cloud-based products"],
    readout: {
      title: "project / your-business",
      rows: [
        { label: "1 · talk", value: "done", tone: "done" },
        { label: "2 · plan and quote", value: "done", tone: "done" },
        { label: "3 · build", value: "in progress", tone: "pending" },
        { label: "4 · test", value: "next" },
        { label: "5 · hand over and train", value: "—" },
      ],
    },
    links: [{ label: "Talk to us about custom software", href: consult("software") }],
  },
  {
    id: "hardware",
    title: "Hardware",
    intro: "Laptops and equipment your team can rely on, tested before delivery.",
    offers: [
      "UK-used business laptops and desktops",
      "Phones, audio and accessories",
      "Office hardware sourcing and setup",
      "Advice on what to buy for your needs and budget",
    ],
    readout: {
      title: "device check / grade a++",
      rows: [
        { label: "screen · keyboard · trackpad", value: "pass", tone: "done" },
        { label: "ports · speakers · camera", value: "pass", tone: "done" },
        { label: "wi-fi · charging", value: "pass", tone: "done" },
        { label: "battery health", value: "90%+" },
        { label: "cosmetic condition", value: "90%+", tone: "done" },
      ],
    },
    links: [
      { label: "See laptops in stock", href: routes.shop },
      { label: "Talk to us about office hardware", href: consult("hardware") },
    ],
  },
  {
    id: "managed-it",
    title: "Managed IT",
    intro: "We keep your technology running so your team doesn't have to think about it.",
    offers: [
      "Workstation setup for new staff",
      "Office network setup",
      "Data backups and maintenance",
      `Troubleshooting and support, ${business.hours}`,
    ],
    readout: {
      title: "support / your-office",
      rows: [
        { label: "new staff laptop setup", value: "scheduled", tone: "pending" },
        { label: "office wi-fi", value: "configured", tone: "done" },
        { label: "weekly backup", value: "set up", tone: "done" },
        { label: "support hours", value: "mon–fri 8–6" },
      ],
    },
    links: [{ label: "Talk to us about managed IT", href: consult("managed-it") }],
  },
  {
    id: "integrations",
    title: "Systems integration",
    intro: "Your tools, talking to each other.",
    offers: [
      "Payment setup with MoMo and cards",
      "Point of sale and stock syncing",
      "Connecting third-party software",
      "Automating repetitive steps",
    ],
    readout: {
      title: "flow / sale recorded",
      rows: [
        { label: "customer pays by momo", value: "→" },
        { label: "point of sale", value: "updated", tone: "done" },
        { label: "stock count", value: "updated", tone: "done" },
        { label: "receipt", value: "sent", tone: "done" },
      ],
    },
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
      <section className="container-site grid gap-8 border-b border-border pt-8 pb-7 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-24 lg:pt-24 lg:pb-[88px]">
        <div className="flex flex-col gap-3.5 lg:gap-7">
          <h1 className="font-display text-4xl/[37px] font-bold tracking-[-0.03em] text-heading lg:text-[72px]/[74px] lg:tracking-[-0.035em]">
            Set up, built and supported by SHERO.
          </h1>
          <p className="max-w-[620px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
            Start with one service or combine them. Either way, support comes from the same place that set it up.
          </p>
        </div>
        <nav aria-label="Services on this page" className="hidden border-t border-rule-strong lg:block">
          {services.map((service, i) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="grid grid-cols-[40px_1fr_20px] items-center gap-3 border-b border-border py-3.5 hover:text-primary"
            >
              <span className="font-mono text-xs/4 text-ink-muted">{pad(i + 1)}</span>
              <span className="text-[17px]/6 font-medium text-ink">{service.title}</span>
              <span aria-hidden="true" className="text-primary">
                ↓
              </span>
            </a>
          ))}
        </nav>
      </section>

      {services.map((service, i) => (
        <section
          key={service.id}
          id={service.id}
          aria-labelledby={`${service.id}-title`}
          className="container-site grid scroll-mt-20 gap-3.5 border-b border-border py-9 lg:grid-cols-[120px_1fr_1fr] lg:gap-14 lg:py-20"
        >
          <span
            aria-hidden="true"
            className="font-mono text-[13px]/[17px] text-ink-muted lg:font-display lg:text-[64px]/[64px] lg:font-bold lg:tracking-[-0.04em] lg:text-border"
          >
            {pad(i + 1)}
          </span>
          <div className="flex flex-col gap-3.5 lg:gap-[18px]">
            <h2
              id={`${service.id}-title`}
              className="font-display text-[28px]/[31px] font-bold tracking-[-0.02em] text-heading lg:text-[40px]/[44px] lg:tracking-[-0.025em]"
            >
              {service.title}
            </h2>
            <p className="max-w-[620px] text-base/[25px] text-ink-secondary lg:text-lg/7">{service.intro}</p>
            <ul className="lg:mt-2">
              {service.offers.map((offer) => (
                <li key={offer} className="flex gap-3 border-t border-border py-2.5 lg:gap-3.5 lg:py-3">
                  <span aria-hidden="true" className="font-mono text-[13px]/[17px] font-medium text-accent lg:text-sm/[18px]">
                    →
                  </span>
                  <span className="text-[15px]/[22px] text-ink lg:text-base/6">{offer}</span>
                </li>
              ))}
            </ul>
            <Readout {...service.readout} className="lg:hidden" />
            <div className="flex flex-col gap-2 lg:mt-2">
              {service.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="self-start text-[15px]/[22px] font-medium text-primary hover:underline hover:underline-offset-3 lg:text-sm/5"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden pt-2 lg:block">
            <Readout {...service.readout} />
          </div>
        </section>
      ))}

      <section className="container-site flex flex-col gap-8 pt-16 lg:gap-12 lg:pt-[104px]">
        <h2 className="font-display text-[30px]/[33px] font-bold tracking-[-0.02em] text-heading lg:text-[44px]/[48px] lg:tracking-[-0.025em]">
          From first conversation to ongoing support.
        </h2>
        <ol className="grid gap-0 lg:grid-cols-6 lg:gap-5">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={step.title} className="grid grid-cols-[22px_1fr] gap-x-4 lg:flex lg:flex-col lg:gap-3.5">
                {/* Timeline: vertical on mobile, horizontal on desktop. */}
                <div aria-hidden="true" className="flex flex-col items-center lg:flex-row lg:gap-2.5">
                  <span className="mt-1 size-3 shrink-0 rounded-full bg-accent lg:mt-0 lg:ml-[5px]" />
                  <span className={`w-px flex-1 lg:h-px lg:w-auto ${last ? "bg-transparent" : "bg-border"}`} />
                </div>
                <div className="flex flex-col gap-1.5 pb-7 lg:gap-3.5 lg:pb-0">
                  <span className="font-mono text-xs/4 font-medium text-accent">step {pad(i + 1)}</span>
                  <span className="font-display text-h3 text-heading">{step.title}</span>
                  <span className="text-[15px]/[23px] text-ink-secondary">{step.text}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <ConsultationCta />
    </>
  );
}
