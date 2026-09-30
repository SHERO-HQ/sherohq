import Link from "next/link";
import { ShieldCheck, Truck, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ListingCard } from "@/components/shop/ListingCard";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { ShopListing } from "@/lib/shop";
import { formatCedis } from "@/lib/orders";
import { onlinePayments } from "@/lib/payments";
import { routes, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/cn";

const recommendMessage = "Hi SHERO, I'm looking for a laptop. I'll mainly use it for: ";

/** How paying works, in three words or so; the full list is on the shop and in the FAQ. */
function payShort() {
  const online = onlinePayments();
  return online.momo || online.card ? "MoMo, card or cash" : "Pay on delivery or at pickup";
}

/**
 * A taste of the shop on Home: the newest devices and the three things buyers
 * ask first. Dispatch times, warranty terms and the device checks live on the
 * shop and laptop pages, where people are ready to buy.
 */
export function InStock({ listings, thresholdPesewas }: { listings: ShopListing[]; thresholdPesewas: number }) {
  const facts = [
    { icon: Truck, text: `Free delivery over ${formatCedis(thresholdPesewas)}` },
    { icon: Wallet, text: payShort() },
    { icon: ShieldCheck, text: "One-week warranty" },
  ];
  return (
    <Section divider aria-labelledby="stock-heading">
      <SectionHeader
        id="stock-heading"
        title="In stock now."
        action={
          <Link href={routes.shop} className="group inline-flex items-center gap-1 text-label text-primary hover:underline">
            All laptops <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {listings.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-6">
          {listings.map((listing, i) => (
            // Phones show two, side by side; the third waits in the shop.
            <li key={listing.id} className={cn(i === 2 && "max-md:hidden")}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-border pt-6 text-body text-ink-secondary">
          New stock is being checked. Every device is tested before it&rsquo;s listed, so stock arrives in batches.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 lg:flex-row lg:items-center lg:justify-between">
        <ul aria-label="Buying from SHERO" className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-body-sm text-ink">
              <Icon aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-secondary" />
              {text}
            </li>
          ))}
        </ul>
        {/* The recommendation prompt replaces fixed "Good for" categories (PRD). */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-body-sm text-ink-secondary">Not sure which one? Tell us what it&rsquo;s for.</p>
          <ButtonLink href={whatsappLink(recommendMessage)} variant="secondary" external className="self-start sm:self-auto">
            Ask on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
