import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge, listingStatusBadge } from "@/components/admin/Badge";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { MAX_PHOTOS } from "@/lib/admin/photo-store";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { adminListing } from "@/lib/admin/listings";
import { getShopSettings } from "@/lib/shop";
import { routes } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdmin();
  const row = await adminListing((await params).id);
  return { title: row?.listing.model ?? "Listing" };
}

export default async function ListingPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [row, settings, { saved }] = await Promise.all([adminListing((await params).id), getShopSettings(), searchParams]);
  if (!row) notFound();
  const { listing, check } = row;
  const badge = listingStatusBadge[listing.status];
  const inShop = listing.status === "in_stock" || listing.status === "reserved";

  return (
    <>
      <AdminHeader title={listing.model} badge={<Badge tone={badge.tone}>{badge.label}</Badge>} />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/listings" className="text-label text-primary hover:underline">
            <InlineArrow direction="left" /> All listings
          </Link>
          {inShop && (
            <a href={`${routes.shop}/${listing.slug}`} target="_blank" rel="noopener noreferrer" className="text-label text-primary hover:underline">
              See it in the shop <InlineArrow />
            </a>
          )}
        </div>
        <ListingEditor
          listing={{
            id: listing.id,
            model: listing.model,
            category: listing.category,
            price: String(listing.pricePesewas / 100),
            note: listing.note ?? "",
            specs: listing.specs,
            status: listing.status,
            check,
          }}
          categories={settings.categories}
          minBattery={settings.minBatteryHealth}
          saved={saved === "1"}
          photos={<PhotoManager listingId={listing.id} photos={listing.photos} max={MAX_PHOTOS} />}
        />
      </div>
    </>
  );
}
