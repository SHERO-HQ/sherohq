import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { newConsultations } from "@/lib/admin/consultations";
import { listingsNeedingCheck } from "@/lib/admin/listings";
import { ordersNeedingAction } from "@/lib/admin/orders";
import { referrersToThank } from "@/lib/admin/referrals";
import { testimonialsNeedingConsent } from "@/lib/admin/testimonials";
import { newSignups } from "@/lib/admin/waitlists";
import { getShopSettings } from "@/lib/shop";

// Signed-in admin pages. Each page and action also checks the session itself.
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const settings = await getShopSettings();
  const [toCheck, toHandle, consultations, signups, toThank, consent] = await Promise.all([
    listingsNeedingCheck(settings.minBatteryHealth),
    ordersNeedingAction(),
    newConsultations(),
    newSignups(),
    referrersToThank(),
    testimonialsNeedingConsent(),
  ]);
  return (
    <AdminShell
      nav={[
        { items: [{ label: "Dashboard", href: "/admin/dashboard" }] },
        {
          label: "shop",
          items: [
            { label: "Orders", href: "/admin/orders", count: toHandle },
            { label: "Listings", href: "/admin/listings", count: toCheck },
          ],
        },
        {
          label: "leads",
          items: [
            { label: "Consultations", href: "/admin/consultations", count: consultations },
            { label: "Waitlists", href: "/admin/waitlists", count: signups },
            { label: "Referrals", href: "/admin/referrals", count: toThank },
          ],
        },
        {
          label: "site",
          items: [
            { label: "Testimonials", href: "/admin/testimonials", count: consent },
            { label: "Work", href: "/admin/work" },
            { label: "Products", href: "/admin/products" },
            { label: "Careers", href: "/admin/careers" },
          ],
        },
      ]}
      footer={[{ label: "Settings", href: "/admin/settings" }]}
    >
      {children}
    </AdminShell>
  );
}
