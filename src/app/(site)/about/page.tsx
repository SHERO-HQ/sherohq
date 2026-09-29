import type { Metadata } from "next";
import Link from "next/link";
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
  { name: "Purpose", text: "We build with intention. Everything we create should solve a real problem." },
  { name: "Integrity", text: "We're honest about what we can do, and we stand behind what we promise." },
  { name: "Ownership", text: "We take responsibility and see the work through." },
  { name: "Reliability", text: "People depend on what we build, so we make it dependable." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div className="container-site relative flex flex-col gap-5 pt-11 pb-9 lg:gap-7 lg:pt-28 lg:pb-24">
          {/* The logo's slanted bars: only the home hero, this hero and the 404 use them. */}
          <div
            aria-hidden="true"
            className="absolute top-28 right-20 hidden flex-col items-end gap-4 lg:flex"
          >
            <span className="slant h-[90px] w-[300px] bg-navy-700" />
            <span className="slant mr-[60px] h-[90px] w-[300px] bg-emerald-700" />
          </div>
          <h1 className="relative font-display text-[58px]/[54px] font-bold tracking-[-0.045em] text-heading lg:text-[120px]/[112px]">
            Redefine
            <br />
            Possible.
          </h1>
          <p className="relative max-w-[620px] text-[17px]/[26px] text-ink-secondary lg:text-[21px]/[33px]">
            It&rsquo;s our motto because it&rsquo;s how we work: start with one question, what becomes possible,
            and build towards the answer.
          </p>
          <div aria-hidden="true" className="flex gap-2.5 lg:hidden">
            <span className="slant h-[26px] w-[90px] bg-navy-700" />
            <span className="slant h-[26px] w-[54px] bg-emerald-700" />
          </div>
        </div>
      </section>

      <section className="container-site grid gap-0 lg:grid-cols-2 lg:items-start lg:gap-24 lg:py-[104px]">
        <figure className="flex flex-col gap-3.5 pt-8 lg:pt-0">
          {/* TODO(owner): screenshots of TrustCircle, Tastea and Dajrim. */}
          <Placeholder
            label="Screenshots: TrustCircle, Tastea and Dajrim"
            className="h-[240px] border border-border bg-surface lg:h-[520px]"
          />
          <figcaption className="flex items-center justify-between gap-4 font-mono text-xs/4 text-ink-muted">
            fig. 01 — systems we&rsquo;ve built
            <Link href={routes.work} className="font-text text-sm/5 font-medium text-primary hover:underline">
              See the work <InlineArrow />
            </Link>
          </figcaption>
        </figure>
        <div className="flex flex-col gap-5 py-10 lg:gap-6 lg:py-0 lg:pt-10">
          <p className="text-[19px]/[29px] text-ink lg:text-[21px]/8">
            The world is shaped by the limits people accept. SHERO was started on the belief that many of those
            limits aren&rsquo;t fixed.
          </p>
          <p className="text-base/[26px] text-ink-secondary lg:text-lg/[30px]">
            We use technology to challenge them, not because technology is the goal, but because it&rsquo;s one of
            the best tools for progress. It helps people solve problems, businesses grow with confidence, and
            communities build what comes next.
          </p>
          <p className="text-base/[26px] text-ink-secondary lg:text-lg/[30px]">
            Today we do that from Tamale by building software, supplying hardware and supporting the systems
            businesses depend on. We&rsquo;re also building our own products for problems we see around us every
            day.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-10 lg:py-[104px]" aria-labelledby="values-title">
        <div className="container-site flex flex-col gap-4 lg:gap-8">
          <h2
            id="values-title"
            className="font-display text-[26px]/[29px] font-bold text-heading lg:font-mono lg:text-xs/4 lg:font-medium lg:text-accent"
          >
            <span className="lg:hidden">What we value.</span>
            <span className="hidden lg:inline">what we value</span>
          </h2>
          <dl className="border-t border-rule-strong">
            {values.map((value) => (
              <div
                key={value.name}
                className="flex flex-col gap-1.5 border-b border-border py-[18px] lg:grid lg:grid-cols-[400px_1fr] lg:items-baseline lg:gap-10 lg:py-[30px]"
              >
                <dt className="font-display text-[28px]/8 font-bold text-heading lg:text-[44px]/[48px] lg:tracking-[-0.025em]">
                  {value.name}
                </dt>
                <dd className="text-base/[25px] text-ink-secondary lg:text-[19px]/[29px]">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-site grid gap-4 pt-10 lg:grid-cols-[1fr_1.3fr] lg:gap-24 lg:pt-[104px]">
        <h2 className="font-display text-[26px]/[29px] font-bold text-heading lg:text-[44px]/[48px] lg:tracking-[-0.025em]">
          Where we&rsquo;re going.
        </h2>
        <div className="flex max-w-[680px] flex-col gap-4 lg:gap-[22px]">
          <p className="text-base/[25px] text-ink lg:text-[19px]/[30px]">
            We&rsquo;re starting focused: technology for people and businesses in Ghana. Over time, we want to take
            the same approach to other areas where better tools can remove barriers, including health, education and
            financial access.
          </p>
          <p className="text-base/[25px] text-ink-secondary lg:text-[19px]/[30px]">
            We&rsquo;ll grow into those carefully, one real problem at a time.
          </p>
        </div>
      </section>

      <ConsultationCta />
    </>
  );
}
