"use client";

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/Button";
import { trackOrder, type TrackResult } from "@/app/(shop)/track/actions";
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
      <p className="text-body text-ink">
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
                className={cn("absolute top-6.5 -bottom-1.5 left-2.5 w-0.5 lg:left-3", i < reached ? "bg-secondary" : "bg-border")}
              />
            )}
            <span aria-hidden="true" className={cn("mt-1 ml-1 size-3 rounded-full lg:ml-1.5", done ? "bg-secondary" : "bg-border-strong")} />
            <span className="flex flex-col gap-1">
              <span
                className={cn(
                  current
                    ? "font-display text-h3  text-heading "
                    : done
                      ? "text-body lg:text-body-lg font-medium text-ink "
                      : "text-body lg:text-body-lg font-medium text-ink-muted ",
                )}
              >
                {label}
                {!done && <span className="sr-only"> (not yet)</span>}
              </span>
              {detail && <span className={cn("font-mono text-meta", done ? "text-ink-secondary" : "text-ink-muted")}>{detail}</span>}
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
    <div className="grid gap-8 pt-10 lg:grid-cols-[1fr_380px] lg:gap-18 lg:pt-12">
      <div className="flex flex-col gap-6">
        <h2 className="border-b border-border pb-4 font-display text-h2 text-heading">
          Order {order.number}
        </h2>
        <Timeline order={order} />
      </div>
      <aside aria-label="In this order" className="flex flex-col gap-3.5 self-start rounded-md border border-border p-6">
        <h3 className="font-mono text-meta font-normal text-ink-muted">in this order</h3>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <li key={i} className="text-body text-ink">
              {item.model}
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 border-t border-border pt-3">
          <span className="text-body-sm text-ink-secondary">{order.paymentStatus === "paid" ? `Paid by ${method}` : method}</span>
          <span className="font-mono text-body font-medium text-ink">{formatCedis(order.totalPesewas)}</span>
        </div>
        {order.deliveryFeePending && (
          <p className="text-body-sm text-ink-secondary">Plus the delivery fee we confirm with you on WhatsApp.</p>
        )}
        <p className="text-body-sm text-ink-secondary">
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
      <form method="post"
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
          className={buttonClass({ size: "lg", className: "sm:col-span-2 lg:col-span-1 lg:mt-6.5" })}
        >
          {pending ? "Looking it up" : "Track order"}
        </button>
      </form>
      <div aria-live="polite">
        {result && !result.ok && result.message && <p className="pt-6 text-body text-danger">{result.message}</p>}
        {result?.ok && <OrderDetails order={result.order} />}
      </div>
    </>
  );
}
