import type { Metadata } from "next";
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
import { routes, whatsappLink } from "@/lib/site";

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
    <section className="container-site flex flex-col gap-8 pt-10 pb-20 lg:grid lg:grid-cols-[1fr_380px] lg:gap-[72px] lg:pt-[72px] lg:pb-[120px]">
      <OrderPlacedEvent
        number={order.number}
        value={order.totalPesewas / 100}
        delivery={order.deliveryMethod}
        payment={order.paymentMethod}
      />
      <div className="flex flex-col items-start gap-5">
        <CircleCheck aria-hidden="true" size={32} strokeWidth={1.5} className="text-accent" />
        <h1 className="font-display text-[34px]/[38px] font-bold tracking-[-0.03em] text-heading lg:text-[52px]/[56px] lg:tracking-[-0.035em]">
          Order {order.number} is placed.
        </h1>
        <p className="max-w-[620px] text-base/[26px] text-ink-secondary lg:text-lg/7">
          We&rsquo;ll confirm it on WhatsApp and send your tracking link. To track it yourself, use this order number
          with the phone number you ordered with.
        </p>
        {payNote && <p className="max-w-[620px] text-base/[26px] font-medium text-ink lg:text-lg/7">{payNote}</p>}
        {order.deliveryMethod === "bus" && (
          <DispatchCountdown fallback="Orders before 5:00 PM go to the bus station the same day." className="font-mono text-[13px]/[17px] text-ink-secondary" />
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`${routes.track}?n=${order.number}`}
            className="inline-flex h-[52px] items-center rounded-sm bg-primary px-7 text-base/5 font-medium text-on-primary hover:bg-primary-hover"
          >
            Track this order
          </Link>
          <a
            href={whatsappLink(`Hi SHERO, about my order ${order.number}: `)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] items-center rounded-sm border border-border-strong px-[22px] text-[15px]/5 font-medium text-ink hover:border-ink"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <aside aria-label="In this order" className="flex flex-col gap-3.5 self-start rounded-md border border-border p-6">
        <h2 className="font-mono text-xs/4 font-normal text-ink-muted">in this order</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 text-[15px]/[22px] text-ink">
              <span>{item.model}</span>
              <span className="font-mono whitespace-nowrap">{formatCedis(item.pricePesewas)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm/5 text-ink-secondary">{paymentLabel(order.paymentMethod)}</span>
          <span className="font-mono text-[15px]/5 font-medium text-ink">{total}</span>
        </div>
      </aside>
    </section>
  );
}
