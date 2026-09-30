import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { getShopSettings } from "@/lib/shop";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  await requireAdmin();
  const settings = await getShopSettings();
  return (
    <>
      <AdminHeader title="New listing" />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/listings" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All listings
        </Link>
        <ListingEditor
          listing={{
            id: null,
            model: "",
            category: settings.categories[0] ?? "Laptops",
            price: "",
            note: "",
            specs: {},
            status: "draft",
            check: null,
          }}
          categories={settings.categories}
          minBattery={settings.minBatteryHealth}
          saved={false}
        />
      </div>
    </>
  );
}
