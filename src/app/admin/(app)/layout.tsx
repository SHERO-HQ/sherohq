import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { listingsNeedingCheck } from "@/lib/admin/listings";
import { getShopSettings } from "@/lib/shop";

// Signed-in admin pages. Each page and action also checks the session itself.
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const settings = await getShopSettings();
  const toCheck = await listingsNeedingCheck(settings.minBatteryHealth);
  return (
    <AdminShell
      nav={[
        { label: "shop", items: [{ label: "Listings", href: "/admin/listings", count: toCheck }] },
        {
          label: "site",
          items: [
            { label: "Products", href: "/admin/products" },
            { label: "Work", href: "/admin/work" },
          ],
        },
      ]}
    >
      {children}
    </AdminShell>
  );
}
