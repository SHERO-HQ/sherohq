import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { dashboardTodos, monthNumbers } from "@/lib/admin/dashboard";
import { formatCedis } from "@/lib/orders";
import { getShopSettings } from "@/lib/shop";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  const settings = await getShopSettings();
  const [groups, month] = await Promise.all([dashboardTodos(settings.minBatteryHealth), monthNumbers()]);
  const total = groups.reduce((sum, g) => sum + g.items.length + g.more, 0);

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="flex flex-col gap-8 px-gutter py-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-h2 text-heading">
            {total === 0 ? "Nothing needs you right now." : `${total} ${total === 1 ? "thing needs" : "things need"} you today.`}
          </h2>
          {total > 0 && <p className="text-body-sm text-ink-secondary">Oldest first in each group.</p>}
        </div>

        {groups.length > 0 && (
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {groups.map((group, i) => (
              <section
                key={group.title}
                aria-labelledby={`todo-${i}`}
                className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-raised"
              >
                <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3">
                  <h3 id={`todo-${i}`} className="font-display text-h3 text-heading">
                    {group.title}
                  </h3>
                  <span className="font-mono text-meta text-ink-muted">{group.items.length + group.more} to do</span>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={`${item.href}${item.title}`} className="border-t border-border">
                      <Link href={item.href} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface">
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-body-sm font-medium text-ink">{item.title}</span>
                          <span className="truncate text-body-sm text-ink-secondary">{item.detail}</span>
                        </span>
                        <span className="shrink-0 text-label text-primary">{item.action}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {group.more > 0 && (
                  <Link href={group.href} className="border-t border-border px-5 py-3 text-label text-primary hover:underline">
                    {group.more} more <InlineArrow />
                  </Link>
                )}
              </section>
            ))}
          </div>
        )}

        <section aria-labelledby="month-title" className="flex flex-col gap-3">
          <h2 id="month-title" className="text-label text-ink">
            This month
          </h2>
          <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-border lg:grid-cols-4">
            {[
              ["orders", String(month.orders)],
              ["revenue, delivered", formatCedis(month.revenuePesewas)],
              ["consultations", String(month.consultations)],
              ["waitlist signups", String(month.signups)],
            ].map(([label, value], i) => (
              <div key={label} className={`flex flex-col gap-1 bg-surface-raised px-5 py-4 ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-lg:border-l-0 max-lg:border-t" : ""} ${i === 3 ? "max-lg:border-t" : ""}`}>
                <dt className="font-mono text-meta text-ink-muted">{label}</dt>
                <dd className="font-mono text-price text-heading">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
