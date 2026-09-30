import Link from "next/link";
import { Clock, ShieldCheck, Truck, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListingCard } from "@/components/shop/ListingCard";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { ShopListing } from "@/lib/shop";
import { formatCedis } from "@/lib/orders";
import { paymentSummary } from "@/lib/payments";
import { routes, whatsappLink } from "@/lib/site";

const buying = (thresholdPesewas: number) => [
  { icon: Truck, title: `Free delivery over ${formatCedis(thresholdPesewas)}`, detail: "Same day in Tamale, by bus elsewhere, or collect free." },
  { icon: Wallet, title: "Pay how you prefer", detail: paymentSummary() },
  { icon: ShieldCheck, title: "One-week warranty", detail: "We repair or replace anything we tested." },
];

const recommendMessage = "Hi SHERO, I'm looking for a laptop. I'll mainly use it for: ";

export function InStock({ listings, thresholdPesewas }: { listings: ShopListing[]; thresholdPesewas: number }) {
  return (
    <Section divider aria-labelledby="stock-heading">
      <SectionHeader
        id="stock-heading"
        title="In stock now."
        action={
          <Link href={routes.shop} className="group inline-flex items-center gap-1 text-label text-primary hover:underline">
            Full shop <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {listings.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-6">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-border pt-6 text-body text-ink-secondary">
          New stock is being checked. Every device is tested before it&rsquo;s listed, so stock arrives in batches.
        </p>
      )}

      {/* How buying works, next to the devices it applies to, and help choosing. */}
      <Card className="mt-8">
        <ul aria-label="How buying from SHERO works" className="grid gap-5 p-5 md:grid-cols-3 md:gap-8 lg:p-6">
          {buying(thresholdPesewas).map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-secondary/25 bg-secondary-subtle text-secondary shadow-xs">
                <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
              </span>
              <span className="flex flex-col">
                <span className="text-body-sm font-semibold text-ink">{title}</span>
                <span className="text-body-sm text-ink-secondary">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 border-t border-border bg-surface p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-4">
          {/* The recommendation prompt replaces fixed "Good for" categories (PRD). */}
          <p className="text-body text-ink">
            Not sure which one? Tell us what it&rsquo;s for and we&rsquo;ll recommend one.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <span className="flex items-center gap-2 text-body-sm text-ink-secondary">
              <Clock aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-secondary" />
              <DispatchCountdown fallback="Order before 5:00 PM for same-day dispatch to the bus station" />
            </span>
            <ButtonLink href={whatsappLink(recommendMessage)} variant="secondary" external>
              Ask on WhatsApp
            </ButtonLink>
          </div>
        </div>
      </Card>
    </Section>
  );
}
