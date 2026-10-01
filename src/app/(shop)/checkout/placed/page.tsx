import type { Metadata } from "next";
import { buttonClass } from "@/components/ui/Button";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { OrderPlacedEvent } from "@/components/shop/OrderPlacedEvent";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { PLACED_COOKIE } from "@/lib/cart";
import { paymentLabel } from "@/lib/forms/checkout";
import { getPlacedOrder } from "@/lib/order-lookup";
import { formatCedis } from "@/lib/orders";
import { routes, shopUrl, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false },
};

export default async function OrderPlacedPage() {
  const number = (await cookies()).get(PLACED_COOKIE)?.value;
  const order = number ? await getPlacedOrder(number) : null;
  if (!order) redirect(routes.track);

  const total = formatCedis(order.totalPesewas);
  const plusFee = order.deliveryFeePending ? ", plus the delivery fee we confirm with you" : "";
  const payNote =
    order.paymentMethod === "cash_on_delivery"
      ? `Pay ${total}${plusFee} in cash when it arrives.`
      : order.paymentMethod === "pay_at_pickup"
        ? `Pay ${total} when you collect it from our store in Tamale.`
        : null;

  return (
    <section className="container-site flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-18 py-section">
      <OrderPlacedEvent
        number={order.number}
        value={order.totalPesewas / 100}
        delivery={order.deliveryMethod}
        payment={order.paymentMethod}
      />
      <div className="flex flex-col items-start gap-5">
        <CircleCheck aria-hidden="true" size={32} strokeWidth={1.5} className="text-secondary" />
        <h1 className="font-display text-h1 text-heading">
          Order {order.number} is placed.
        </h1>
        <p className="max-w-measure text-body lg:text-body-lg text-ink-secondary">
          We&rsquo;ll confirm it on WhatsApp and send your tracking link. To track it yourself, use this order number
          with the phone number you ordered with.
        </p>
        {payNote && <p className="max-w-measure text-body lg:text-body-lg font-medium text-ink">{payNote}</p>}
        {order.deliveryMethod === "bus" && (
          <DispatchCountdown fallback="Orders before 5:00 PM go to the bus station the same day." className="font-mono text-meta text-ink-secondary" />
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`${shopUrl.track}?n=${order.number}`}
            className={buttonClass({ size: "lg" })}
          >
            Track this order
          </Link>
          <a
            href={whatsappLink(`Hi SHERO, about my order ${order.number}: `)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: "secondary", size: "lg" })}
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <aside aria-label="In this order" className="flex flex-col gap-3.5 self-start rounded-md border border-border p-6">
        <h2 className="font-mono text-meta font-normal text-ink-muted">in this order</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 text-body text-ink">
              <span>{item.model}</span>
              <span className="font-mono whitespace-nowrap">{formatCedis(item.pricePesewas)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 border-t border-border pt-3">
          <span className="text-body-sm text-ink-secondary">{paymentLabel(order.paymentMethod)}</span>
          <span className="font-mono text-body font-medium text-ink">{total}</span>
        </div>
      </aside>
    </section>
  );
}
