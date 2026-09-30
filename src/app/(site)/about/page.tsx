import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Scale, ShieldCheck, Target } from "lucide-react";
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

const values = [
  { name: "Purpose", icon: Target, text: "We build with intention. Everything we create should solve a real problem." },
  { name: "Integrity", icon: Scale, text: "We're honest about what we can do, and we stand behind what we promise." },
  { name: "Ownership", icon: Handshake, text: "We take responsibility and see the work through." },
  { name: "Reliability", icon: ShieldCheck, text: "People depend on what we build, so we make it dependable." },
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
            It&rsquo;s our motto because it&rsquo;s how we work: start with one question, what becomes possible,
            and build towards the answer.
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
          <figcaption className="flex items-center justify-between gap-4 font-mono text-meta text-ink-muted">
            fig. 01 — systems we&rsquo;ve built
            <Link href={routes.work} className="font-text text-body-sm font-medium text-primary hover:underline">
              See the work <InlineArrow />
            </Link>
          </figcaption>
        </figure>
        <div className="flex flex-col gap-5 py-10 lg:gap-6 lg:py-0 lg:pt-10">
          <p className="text-h3 text-ink">
            The world is shaped by the limits people accept. SHERO was started on the belief that many of those
            limits aren&rsquo;t fixed.
          </p>
          <p className="text-body lg:text-body-lg text-ink-secondary">
            We use technology to challenge them, not because technology is the goal, but because it&rsquo;s one of
            the best tools for progress. It helps people solve problems, businesses grow with confidence, and
            communities build what comes next.
          </p>
          <p className="text-body lg:text-body-lg text-ink-secondary">
            Today we do that from Tamale by building software, supplying hardware and supporting the systems
            businesses depend on. We&rsquo;re also building our own products for problems we see around us every
            day.
          </p>
        </div>
      </section>

      <Section tone="surface" aria-labelledby="values-title">
        <SectionHeader id="values-title" title="What we value." />
        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {values.map(({ name, text, icon: Icon }) => (
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
            We&rsquo;re starting focused: technology for people and businesses in Ghana. Over time, we want to take
            the same approach to other areas where better tools can remove barriers, including health, education and
            financial access.
          </p>
          <p className="text-body lg:text-body-lg text-ink-secondary">
            We&rsquo;ll grow into those carefully, one real problem at a time.
          </p>
        </div>
      </section>

      <ConsultationCta />
    </>
  );
}
