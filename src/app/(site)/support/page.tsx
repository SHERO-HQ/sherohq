import type { Metadata } from "next";
import { Minus, Plus } from "lucide-react";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { LinkRows, type LinkRow } from "@/components/ui/LinkRows";
import { OpenNow } from "@/components/ui/LiveStatus";
import { faq } from "@/content/faq";
import { business, routes, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Book a free consultation, track an order or get tech help from SHERO in Tamale. Answers to common questions about buying, delivery and services.",
  alternates: { canonical: routes.support },
};

const paths: LinkRow[] = [
  {
    title: "Talk about a project",
    text: "Book a free consultation. Tell us what you need and we'll suggest a practical next step.",
    textMobile: "Book a free consultation.",
    href: routes.consultation,
  },
  {
    title: "Help with an order",
    text: "Track your order with your order number and phone number, or ask about a device you bought.",
    textMobile: "Track it with your order number and phone.",
    href: routes.track,
  },
  {
    title: "Tech help",
    text: "Stuck with a laptop, phone or setup? Tell us what's going on.",
    textMobile: "Stuck with a laptop, phone or setup?",
    href: whatsappLink("Hi SHERO, I need tech help with "),
    external: true,
  },
];

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function SupportPage() {
  return (
    <>
      <FaqJsonLd />
      <section className="container-site grid gap-6 border-b border-border pt-8 pb-8 lg:grid-cols-[1fr_1.5fr] lg:items-end lg:gap-24 lg:pt-24 lg:pb-[88px]">
        <h1 className="font-display text-[40px]/[42px] font-bold tracking-[-0.03em] text-heading lg:text-[72px]/[74px] lg:tracking-[-0.035em]">
          How can we help?
        </h1>
        <LinkRows rows={paths} />
      </section>

      <section className="container-site grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:gap-20 lg:pt-20 lg:pb-[104px]">
        <div id="faq" className="flex scroll-mt-20 flex-col gap-2">
          <h2 className="font-display text-[26px]/[29px] font-bold text-heading lg:text-[40px]/[44px] lg:tracking-[-0.025em]">
            Common questions.
          </h2>
          {faq.map((group) => (
            <div key={group.topic} className="grid gap-3 pt-5 lg:grid-cols-[200px_1fr] lg:gap-10 lg:pt-7">
              <h3 className="font-mono text-xs/4 font-medium text-accent">{group.topic}</h3>
              <div className="border-t border-border">
                {group.items.map((item, i) => (
                  <details key={item.q} open={i === 0} className="group border-b border-border">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-base/[23px] font-medium text-ink lg:py-[18px] lg:text-lg/[26px] [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <Plus aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-muted group-open:hidden" />
                      <Minus aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 hidden shrink-0 text-ink-muted group-open:block" />
                    </summary>
                    <p className="mb-5 max-w-[640px] text-[15px]/[23px] text-ink-secondary lg:text-base/[26px]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside
          aria-label="Contact"
          className="flex flex-col gap-4 self-start rounded-md border border-inverse-border bg-surface-inverse p-6 lg:gap-[18px] lg:p-7"
        >
          <span className="font-mono text-xs/4 font-medium text-emerald-300">contact</span>
          <p className="font-display text-[19px]/[26px] font-semibold text-ink-inverse lg:text-h3 lg:leading-[30px]">
            <a href={`mailto:${business.email}`} className="hover:underline">
              {business.email}
            </a>
            <br />
            <a href={`tel:${business.phoneE164}`} className="hover:underline">
              {business.phoneDisplay}
            </a>
          </p>
          <span className="text-sm/[22px] text-ink-inverse-muted">{business.city}</span>
          <div className="flex flex-col gap-2 border-t border-inverse-border pt-3.5 font-mono text-xs/4">
            <div className="flex justify-between gap-4">
              <span className="text-readout-label">hours</span>
              <span className="font-medium text-navy-100">{business.hoursShort}</span>
            </div>
            <OpenNow fallback="" dotClassName="bg-emerald-400" className="text-navy-100" />
          </div>
          <a
            href={whatsappLink("Hi SHERO")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm/5 font-medium text-navy-300 hover:underline"
          >
            Chat on WhatsApp <InlineArrow />
          </a>
        </aside>
      </section>
    </>
  );
}
