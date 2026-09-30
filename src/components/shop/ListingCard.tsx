import { CardLink } from "@/components/ui/Card";
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
    <CardLink href={listingHref(listing.slug)} className="h-full">
      <ListingPhoto src={listing.photos[0]} alt={listing.model} inCard className="aspect-[4/3] w-full" />
      <span className="flex flex-1 flex-col gap-3 p-4">
        <span className="flex flex-col gap-1">
          {reserved && <span className="font-mono text-meta text-warning">reserved</span>}
          <span className="text-body font-semibold text-heading group-hover:underline">{listing.model}</span>
          {!compact && spec && <span className="hidden text-body-sm text-ink-muted sm:block">{spec}</span>}
        </span>
        <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <span className="font-mono text-price text-ink">{formatCedis(listing.pricePesewas)}</span>
          {/* Devices without a battery (desktops, bags) show no reading. */}
          {listing.hasBattery !== false && (
            <span className="font-mono text-meta text-secondary">
              <BatteryLabel health={listing.batteryHealth} />
            </span>
          )}
        </span>
      </span>
    </CardLink>
  );
}
