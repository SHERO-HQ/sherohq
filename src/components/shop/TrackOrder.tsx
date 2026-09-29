"use client";

import { useState, useTransition } from "react";
import { trackOrder, type TrackResult } from "@/app/(site)/track/actions";
import { TextField } from "@/components/forms/fields";
import { formatGhanaDateTime } from "@/lib/dates";
import { paymentLabel } from "@/lib/forms/checkout";
import type { OrderView } from "@/lib/order-lookup";
import { formatCedis, statusLabel, statusSteps } from "@/lib/orders";
import { business, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/cn";

function Timeline({ order }: { order: OrderView }) {
  if (order.status === "cancelled") {
    return (
      <p className="text-base/[26px] text-ink">
        This order was cancelled. If that&rsquo;s unexpected,{" "}
        <a
          href={whatsappLink(`Hi SHERO, about my order ${order.number}: `)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-3"
        >
          message us on WhatsApp
        </a>
        .
      </p>
    );
  }

  const steps = statusSteps(order.deliveryMethod);
  const reached = steps.indexOf(order.status);
  const at = (status: string) => order.events.findLast((event) => event.status === status)?.at;
  const destination =
    order.deliveryMethod === "bus"
      ? order.pickupStation && `Your station: ${order.pickupStation}`
      : order.deliveryMethod === "pickup"
        ? "Our store in Tamale"
        : null;

  return (
    <ol className="pt-2">
      {steps.map((step, i) => {
        const done = i <= reached;
        const current = i === reached;
        const time = at(step);
        const label = step === "placed" ? "Order placed" : statusLabel(step, order.deliveryMethod);
        const detail = time ? formatGhanaDateTime(time) : i === steps.length - 1 ? destination : null;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className="relative grid grid-cols-[22px_1fr] gap-4 pb-7 lg:grid-cols-[24px_1fr] lg:gap-5 lg:pb-8"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("absolute top-[26px] -bottom-1.5 left-[10px] w-0.5 lg:left-[11px]", i < reached ? "bg-accent" : "bg-border")}
              />
            )}
            <span aria-hidden="true" className={cn("mt-[5px] ml-[5px] size-3 rounded-full lg:ml-1.5", done ? "bg-accent" : "bg-border-strong")} />
            <span className="flex flex-col gap-1">
              <span
                className={cn(
                  current
                    ? "font-display text-lg/6 font-semibold text-heading lg:text-xl/[26px]"
                    : done
                      ? "text-base/6 font-medium text-ink lg:text-[17px]/[26px]"
                      : "text-base/6 font-medium text-ink-muted lg:text-[17px]/[26px]",
                )}
              >
                {label}
                {!done && <span className="sr-only"> (not yet)</span>}
              </span>
              {detail && <span className={cn("font-mono text-[13px]/[17px]", done ? "text-ink-secondary" : "text-ink-muted")}>{detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetails({ order }: { order: OrderView }) {
  const method = paymentLabel(order.paymentMethod);
  return (
    <div className="grid gap-8 pt-10 lg:grid-cols-[1fr_380px] lg:gap-[72px] lg:pt-12">
      <div className="flex flex-col gap-6">
        <h2 className="border-b border-rule-strong pb-4 font-display text-2xl/[30px] font-semibold text-heading">
          Order {order.number}
        </h2>
        <Timeline order={order} />
      </div>
      <aside aria-label="In this order" className="flex flex-col gap-3.5 self-start rounded-md border border-border p-6">
        <h3 className="font-mono text-xs/4 font-normal text-ink-muted">in this order</h3>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <li key={i} className="text-[15px]/[22px] text-ink">
              {item.model}
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm/5 text-ink-secondary">{order.paymentStatus === "paid" ? `Paid by ${method}` : method}</span>
          <span className="font-mono text-[15px]/5 font-medium text-ink">{formatCedis(order.totalPesewas)}</span>
        </div>
        {order.deliveryFeePending && (
          <p className="text-[13px]/[19px] text-ink-secondary">Plus the delivery fee we confirm with you on WhatsApp.</p>
        )}
        <p className="text-[13px]/[19px] text-ink-secondary">
          Something wrong? Call{" "}
          <a href={`tel:${business.phoneE164}`} className="underline underline-offset-3">
            {business.phoneDisplay}
          </a>{" "}
          or{" "}
          <a
            href={whatsappLink(`Hi SHERO, about my order ${order.number}: `)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-3"
          >
            WhatsApp us
          </a>
          .
        </p>
      </aside>
    </div>
  );
}

export function TrackOrder({ initialNumber }: { initialNumber?: string }) {
  const [result, setResult] = useState<TrackResult | null>(null);
  const [pending, startTransition] = useTransition();
  const errors = result && !result.ok ? (result.errors ?? {}) : {};

  return (
    <>
      <form
        noValidate
        // Personal details stay out of the URL and out of Clarity recordings.
        data-clarity-mask="True"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => setResult(await trackOrder(form)));
        }}
        className="grid items-start gap-4 rounded-md border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:p-7"
      >
        <TextField
          id="number"
          label="Order number"
          placeholder="SH-7K2QX"
          autoCapitalize="characters"
          autoComplete="off"
          defaultValue={initialNumber}
          error={errors.number}
        />
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0244123456"
          error={errors.phone}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-[52px] rounded-sm bg-primary px-7 text-base/5 font-medium text-on-primary hover:bg-primary-hover disabled:opacity-60 sm:col-span-2 lg:col-span-1 lg:mt-[26px]"
        >
          {pending ? "Looking it up" : "Track order"}
        </button>
      </form>
      <div aria-live="polite">
        {result && !result.ok && result.message && <p className="pt-6 text-base/6 text-danger">{result.message}</p>}
        {result?.ok && <OrderDetails order={result.order} />}
      </div>
    </>
  );
}
