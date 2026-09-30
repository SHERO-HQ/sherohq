import type { Metadata } from "next";
import Link from "next/link";
import { BatteryFull, Construction, Handshake, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Placeholder } from "@/components/ui/Placeholder";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

export const metadata: Metadata = {
  title: "About SHERO",
  description:
    "SHERO is a technology company in Tamale, Ghana. We build software, supply hardware and support the systems businesses depend on, and we're building our own products.",
  alternates: { canonical: routes.about },
};

// Promises a visitor can check, in place of generic values.
const commitments = [
  {
    name: "A quote before we start",
    icon: ReceiptText,
    text: "You know what it costs and how long it takes before any work begins.",
  },
  {
    name: "Every device checked",
    icon: BatteryFull,
    text: "Each laptop is tested before it's listed, and the listing shows its battery health.",
  },
  {
    name: "Only work we may show",
    icon: Handshake,
    text: "Every project on this site is shown with the client's permission.",
  },
  {
    name: "Plain labels",
    icon: Construction,
    text: "Products we're still building say In development until you can use them.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div className="container-site relative flex flex-col gap-5 lg:gap-7 py-section">
          {/* The logo's slanted bars: only the home hero, this hero and the 404 use them. */}
          <div
            aria-hidden="true"
            className="absolute top-28 right-20 hidden flex-col items-end gap-4 lg:flex"
          >
            <span className="slant h-12 w-40 bg-navy-700" />
            <span className="slant mr-8 h-12 w-40 bg-emerald-700" />
          </div>
          <h1 className="relative font-display text-h1 text-heading">
            Redefine
            <br />
            Possible.
          </h1>
          <p className="relative max-w-measure text-body-lg text-ink-secondary">
            Our motto: look at what&rsquo;s holding a business back, and build what would work better.
          </p>
          <div aria-hidden="true" className="flex gap-2.5 lg:hidden">
            <span className="slant h-6.5 w-22.5 bg-navy-700" />
            <span className="slant h-6.5 w-13.5 bg-emerald-700" />
          </div>
        </div>
      </section>

      <section className="container-site grid gap-0 lg:grid-cols-2 lg:items-start lg:gap-24 py-section">
        <figure className="flex flex-col gap-3.5 pt-8 lg:pt-0">
          {/* TODO(owner): screenshots of TrustCircle, Tastea and Dajrim. */}
          <Placeholder
            label="Screenshots: TrustCircle, Tastea and Dajrim"
            className="h-60 border border-border bg-surface lg:h-130"
          />
          <figcaption className="flex items-center justify-between gap-4 text-body-sm text-ink-muted">
            Systems we&rsquo;ve built
            <Link href={routes.work} className="font-text text-body-sm font-medium text-primary hover:underline">
              See the work <InlineArrow />
            </Link>
          </figcaption>
        </figure>
        <div className="flex flex-col gap-5 py-10 lg:gap-6 lg:py-0 lg:pt-10">
          <p className="text-h3 text-ink">
            SHERO is a technology company in Tamale. We started it because good tools shouldn&rsquo;t depend on
            where a business is based.
          </p>
          <p className="text-body lg:text-body-lg text-ink-secondary">
            We build software for businesses, sell tested UK-used laptops, and set up and support the IT that
            offices run on, delivering across Ghana.
          </p>
          <p className="text-body lg:text-body-lg text-ink-secondary">
            We&rsquo;re also building two products of our own, both in development: Merchander, for businesses that
            sell on social media, and Pharmasyst, for pharmacies with labs.
          </p>
        </div>
      </section>

      <Section tone="surface" aria-labelledby="values-title">
        <SectionHeader id="values-title" title="What you can hold us to." />
        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {commitments.map(({ name, text, icon: Icon }) => (
            <Card key={name} className="gap-2 p-5 lg:p-6">
              <Icon aria-hidden="true" size={22} strokeWidth={1.5} className="text-secondary" />
              <dt className="pt-1 font-display text-h3 text-heading">{name}</dt>
              <dd className="text-body text-ink-secondary">{text}</dd>
            </Card>
          ))}
        </dl>
      </Section>

      <section className="container-site grid gap-4 lg:grid-cols-[1fr_1.3fr] lg:gap-24 py-section">
        <h2 className="font-display text-h2 text-heading">
          Where we&rsquo;re going.
        </h2>
        <div className="flex max-w-measure flex-col gap-4 lg:gap-5.5">
          <p className="text-body lg:text-body-lg text-ink">
            For now, businesses in Ghana. Over time, we want to take the same approach to health, education and
            financial access, where the right tools are still hard to get.
          </p>
        </div>
      </section>

      <ConsultationCta />
    </>
  );
}
