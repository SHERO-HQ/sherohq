import type { Metadata } from "next";
import { Minus, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { LinkRows, type LinkRow } from "@/components/ui/LinkRows";
import { OpenNow } from "@/components/ui/LiveStatus";
import { buildFaq, type FaqGroup } from "@/content/faq";
import { getPublishedProducts } from "@/lib/products";
import { formatCedis } from "@/lib/orders";
import { shopSettingsForCopy } from "@/lib/shop";
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

function FaqJsonLd({ faq }: { faq: FaqGroup[] }) {
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

export default async function SupportPage() {
  const [products, shop] = await Promise.all([getPublishedProducts(), shopSettingsForCopy()]);
  const faq = buildFaq(products, formatCedis(shop.freeDeliveryThresholdPesewas));
  return (
    <>
      <FaqJsonLd faq={faq} />
      <section className="container-site flex flex-col gap-8 border-b border-border lg:gap-10 py-section">
        <div className="flex max-w-measure flex-col gap-5">
          <h1 className="text-h1">How can we help?</h1>
          <p className="text-body-lg text-ink-secondary">
            Questions about an order, a device or a project. Pick one, or call us on {business.phoneDisplay}.
          </p>
        </div>
        <LinkRows rows={paths} />
      </section>

      <section className="container-site grid gap-10 py-section lg:grid-cols-[1fr_320px] lg:gap-16">
        <div id="faq" className="flex scroll-mt-20 flex-col gap-2">
          <h2 className="font-display text-h2 text-heading">
            Common questions.
          </h2>
          {faq.map((group) => (
            <div key={group.topic} className="grid gap-3 pt-5 lg:grid-cols-[200px_1fr] lg:gap-10 lg:pt-7">
              <h3 className="font-mono text-meta font-medium text-secondary">{group.topic}</h3>
              <div className="border-t border-border">
                {group.items.map((item, i) => (
                  <details key={item.q} open={i === 0} className="group border-b border-border">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <Plus aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-muted group-open:hidden" />
                      <Minus aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 hidden shrink-0 text-ink-muted group-open:block" />
                    </summary>
                    <p className="mb-5 max-w-measure text-body text-ink-secondary">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside
          aria-label="Contact"
          className="flex flex-col gap-4 self-start rounded-md border border-border bg-surface p-6 lg:sticky lg:top-24"
        >
          <p className="font-mono text-eyebrow text-secondary">contact</p>
          <p className="flex flex-col text-body-lg font-semibold text-ink">
            <a href={`mailto:${business.email}`} className="hover:underline">
              {business.email}
            </a>
            <a href={`tel:${business.phoneE164}`} className="hover:underline">
              {business.phoneDisplay}
            </a>
          </p>
          <dl className="flex flex-col gap-1 border-t border-border pt-4 text-body-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Where</dt>
              <dd className="text-ink">{business.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Hours</dt>
              <dd className="text-ink">{business.hours}</dd>
            </div>
          </dl>
          <OpenNow fallback="" className="text-body-sm text-ink" />
          <ButtonLink href={whatsappLink("Hi SHERO")} variant="secondary" external full>
            Chat on WhatsApp
          </ButtonLink>
        </aside>
      </section>
    </>
  );
}
