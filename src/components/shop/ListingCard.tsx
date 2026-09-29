import Link from "next/link";
import { ListingPhoto } from "@/components/shop/ListingPhoto";
import { specSummary } from "@/lib/listings";
import { formatCedis } from "@/lib/orders";
import type { ShopListing } from "@/lib/shop";
import { routes } from "@/lib/site";

export function listingHref(slug: string) {
  return `${routes.shop}/${slug}`;
}

export function BatteryLabel({ health }: { health: number | null }) {
  return <>battery {health ?? "[not recorded]"}%</>;
}

export function ListingCard({ listing, compact }: { listing: ShopListing; compact?: boolean }) {
  const spec = specSummary(listing.specs);
  const reserved = listing.status === "reserved";
  return (
    <Link href={listingHref(listing.slug)} className="group flex flex-col gap-2.5">
      <ListingPhoto
        src={listing.photos[0]}
        alt={listing.model}
        className="aspect-[4/3] w-full transition-colors group-hover:border-border-strong"
      />
      {!compact && (
        <span className="flex justify-between gap-2 font-mono text-xs/4 font-medium">
          <span className={reserved ? "text-warning" : "text-accent"}>
            {reserved ? "reserved" : `uk-used · ${listing.grade.toLowerCase()}`}
          </span>
          <span className="text-ink-secondary">
            <BatteryLabel health={listing.batteryHealth} />
          </span>
        </span>
      )}
      <span className="font-display text-[17px]/[23px] font-semibold text-heading group-hover:underline lg:text-[19px]/[25px]">
        {listing.model}
      </span>
      {!compact && spec && <span className="font-mono text-xs/4 text-ink-muted">{spec}</span>}
      <span className="mt-1 flex items-baseline justify-between gap-2">
        {compact && (
          <span className="font-mono text-xs/4 font-medium text-ink-secondary">
            <BatteryLabel health={listing.batteryHealth} />
          </span>
        )}
        <span className="font-mono text-base/5 font-medium text-ink lg:text-[19px]/6">
          {formatCedis(listing.pricePesewas)}
        </span>
      </span>
    </Link>
  );
}
