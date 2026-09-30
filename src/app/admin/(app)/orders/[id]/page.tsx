import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Facts } from "@/components/admin/parts";
import { Badge, orderStatusTone } from "@/components/admin/Badge";
import { CancelOrderButton, MarkPaidButton, NextStep } from "@/components/admin/OrderControls";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { adminOrder } from "@/lib/admin/orders";
import { formatGhanaDate, formatGhanaDateTime } from "@/lib/dates";
import { paymentLabel } from "@/lib/forms/checkout";
import { advanceLabel, blockedByFee, customerChatLink, maskPhone, nextStatus, nextStepHint, whatsappMessage } from "@/lib/order-flow";
import { formatCedis, statusLabel, statusSteps } from "@/lib/orders";
import { cn } from "@/lib/cn";
import { displayPhone } from "@/lib/phone";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdmin();
  const row = await adminOrder((await params).id);
  return { title: row?.order.number ?? "Order" };
}

const card = "flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
const cardTitle = "font-display text-h3 text-heading";



export default async function OrderPage({ params }: Props) {
  await requireAdmin();
  const row = await adminOrder((await params).id);
  if (!row) notFound();
  const { order, items, events, referral } = row;
  const method = order.deliveryMethod;
  const next = nextStatus(order);
  const steps = statusSteps(method);
  const reached = steps.indexOf(order.status);
  const at = (status: string) => events.findLast((e) => e.status === status)?.createdAt;
  const message = order.phone ? whatsappMessage(order) : null;
  const cashPending = order.paymentStatus !== "paid" && (order.paymentMethod === "cash_on_delivery" || order.paymentMethod === "pay_at_pickup");

  const delivery =
    method === "tamale"
      ? `Tamale · ${order.address ?? "–"}`
      : method === "pickup"
        ? "Store pickup, Tamale"
        : `Bus · ${[order.pickupStation, order.pickupStation?.includes(order.town ?? "\u0000") ? null : order.town, order.region]
            .filter(Boolean)
            .join(" · ")}`;

  return (
    <>
      <AdminHeader
        title={order.number}
        badge={<Badge tone={orderStatusTone[order.status]}>{statusLabel(order.status, method)}</Badge>}
      >
        {order.status !== "arrived" && order.status !== "cancelled" && <CancelOrderButton orderId={order.id} number={order.number} />}
      </AdminHeader>

      <div className="flex flex-col gap-6 px-gutter py-6">
        <Link href="/admin/orders" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All orders
        </Link>

        {order.status === "cancelled" ? (
          <p className="rounded-md border border-border bg-surface px-5 py-4 text-body-sm text-ink">
            Cancelled {order.cancelledAt ? formatGhanaDateTime(order.cancelledAt) : ""}. Its devices went back in stock.
          </p>
        ) : (
          <ol aria-label="Progress" className={cn("grid gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6", steps.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
            {steps.map((step, i) => {
              const done = i <= reached;
              const time = at(step);
              return (
                <li key={step} aria-current={i === reached ? "step" : undefined} className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn("size-2.5 shrink-0 rounded-full", done ? "bg-secondary" : i === reached + 1 ? "bg-primary" : "border border-border-strong")}
                    />
                    <span aria-hidden="true" className={cn("h-0.5 flex-1", i < reached ? "bg-secondary" : "bg-border")} />
                  </span>
                  <span className={cn("text-body-sm", done ? "font-medium text-ink" : "text-ink-secondary")}>{statusLabel(step, method)}</span>
                  <span className="font-mono text-meta text-ink-muted">
                    {time ? formatGhanaDateTime(time) : i === reached + 1 ? "next" : "–"}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-3">
          <section aria-labelledby="items-title" className={card}>
            <h2 id="items-title" className={cardTitle}>
              Items
            </h2>
            <Facts
              rows={[
                ...items.map((item): [string, React.ReactNode] => [
                  item.model,
                  <>
                    {formatCedis(item.pricePesewas)}
                    {item.specSummary && <span className="block text-ink-muted">{item.specSummary}</span>}
                    {item.listingId && (
                      <Link href={`/admin/listings/${item.listingId}`} className="block text-primary hover:underline">
                        Open the listing <InlineArrow />
                      </Link>
                    )}
                  </>,
                ]),
                [
                  "Delivery",
                  order.deliveryFeePending ? (
                    <span className="text-warning">To agree before dispatch</span>
                  ) : order.deliveryFeePesewas === 0 ? (
                    "Free"
                  ) : (
                    formatCedis(order.deliveryFeePesewas)
                  ),
                ],
                ["Total", <span key="t" className="font-mono font-medium">{formatCedis(order.totalPesewas)}</span>],
              ]}
            />
          </section>

          <section aria-labelledby="customer-title" className={card}>
            <h2 id="customer-title" className={cardTitle}>
              Customer and delivery
            </h2>
            <Facts
              rows={[
                ["name", order.customerName ?? "–"],
                ["phone", displayPhone(order.phone)],
                ["email", order.email ?? "–"],
                ["delivery", delivery],
                [
                  "payment",
                  <span key="p" className="flex flex-col items-start gap-2">
                    {paymentLabel(order.paymentMethod)} · {order.paymentStatus === "paid" ? "paid" : "not yet paid"}
                    {order.paymentReference && <span className="font-mono text-meta">ref {order.paymentReference}</span>}
                    {cashPending && order.status !== "cancelled" && <MarkPaidButton orderId={order.id} label="Mark cash collected" />}
                  </span>,
                ],
                ...(referral
                  ? [
                      [
                        "referred by",
                        referral.referrerPhone
                          ? `${maskPhone(referral.referrerPhone)} · ${referral.status === "waiting_for_delivery" ? "thank after delivery" : "see Referrals"}`
                          : "number erased",
                      ] as [string, React.ReactNode],
                    ]
                  : []),
                ["warranty", order.warrantyEndsOn ? `ends ${formatGhanaDate(order.warrantyEndsOn)}` : "ends 7 days after delivery"],
                ["placed", formatGhanaDateTime(order.placedAt)],
              ]}
            />
          </section>

          <section aria-labelledby="next-title" className={card}>
            <h2 id="next-title" className={cardTitle}>
              Next step
            </h2>
            <NextStep
              orderId={order.id}
              status={order.status}
              hint={nextStepHint(order)}
              advance={next ? advanceLabel(next, method) : null}
              feeToAgree={blockedByFee(order) ? (order.region ?? "their region") : null}
              whatsapp={order.phone && message ? { text: message, link: customerChatLink(order.phone, message) } : null}
            />
          </section>
        </div>
      </div>
    </>
  );
}
