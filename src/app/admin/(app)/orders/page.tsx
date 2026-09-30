import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge, orderStatusTone as statusTone } from "@/components/admin/Badge";
import { requireAdmin } from "@/lib/admin/auth";
import { adminOrders, orderCounts, orderTabs } from "@/lib/admin/orders";
import { paymentLabel } from "@/lib/forms/checkout";
import { formatCedis, statusLabel } from "@/lib/orders";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Orders" };

const paymentWord = { pending: "pending", paid: "paid", failed: "failed" } as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 80);
  const status = orderTabs.find((t) => t.value === params.status)?.value ?? null;
  const [rows, counts] = await Promise.all([adminOrders(status, q), orderCounts()]);

  return (
    <>
      <AdminHeader title="Orders" meta={counts.all === 1 ? "1 order" : `${counts.all} orders`}>
        {/* A plain GET form: works without JavaScript, and the phone never leaves the admin. */}
        <form role="search" action="/admin/orders" className="relative">
          <label htmlFor="q" className="sr-only">
            Find an order by number, phone or name
          </label>
          <Search aria-hidden="true" size={16} strokeWidth={1.5} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Order number, phone or name"
            className="h-9 w-64 rounded-sm border border-border-strong bg-surface-raised pr-3 pl-9 text-body-sm text-ink placeholder:text-ink-muted"
          />
        </form>
      </AdminHeader>

      <div className="px-gutter py-6">
        {q ? (
          <p className="mb-4 text-body-sm text-ink-secondary">
            {rows.length === 1 ? "1 order" : `${rows.length} orders`} matching &ldquo;{q}&rdquo;.{" "}
            <Link href="/admin/orders" className="font-medium text-primary hover:underline">
              Clear
            </Link>
          </p>
        ) : (
          <nav aria-label="Filter by status" className="flex gap-6 overflow-x-auto border-b border-border">
            {orderTabs.map((tab) => {
              const current = tab.value === status;
              const n = tab.value ? (counts[tab.value] ?? 0) : counts.all;
              return (
                <Link
                  key={tab.label}
                  href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "-mb-px flex items-baseline gap-1.5 border-b-2 pb-2.5 text-body-sm whitespace-nowrap",
                    current ? "border-primary font-medium text-heading" : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  {tab.label}
                  <span className="font-mono text-meta text-ink-muted">{n}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {rows.length === 0 ? (
          <p className="py-12 text-body text-ink-secondary">
            {q ? "No orders match. Try the order number or the phone number it was placed with." : status ? "No orders with this status." : "No orders yet."}
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-md border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface font-mono text-meta text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-normal">order</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">customer</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal lg:table-cell">items</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal xl:table-cell">delivery</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal lg:table-cell">payment</th>
                  <th scope="col" className="px-4 py-3 font-normal">total</th>
                  <th scope="col" className="px-4 py-3 font-normal">status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ order, models }) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-body-sm font-medium text-heading hover:underline">
                        {order.number}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-body-sm text-ink md:table-cell">{order.customerName ?? "–"}</td>
                    <td className="hidden px-4 py-3 text-body-sm text-ink lg:table-cell">
                      {models[0] ?? "–"}
                      {models.length > 1 && <span className="text-ink-muted"> + {models.length - 1} more</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-body-sm text-ink xl:table-cell">
                      {order.deliveryMethod === "tamale" ? "Tamale" : order.deliveryMethod === "pickup" ? "Store pickup" : `Bus · ${order.town ?? "–"}`}
                    </td>
                    <td className="hidden px-4 py-3 text-body-sm text-ink lg:table-cell">
                      {paymentLabel(order.paymentMethod)} · {paymentWord[order.paymentStatus]}
                    </td>
                    <td className="px-4 py-3 font-mono text-body-sm whitespace-nowrap text-ink">
                      {formatCedis(order.totalPesewas)}
                      {order.deliveryFeePending && <span className="block text-meta text-warning">+ fee to agree</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[order.status]}>{statusLabel(order.status, order.deliveryMethod)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
