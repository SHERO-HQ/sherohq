"use client";

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/Button";
import { placeOrder } from "@/app/(shop)/checkout/actions";
import { SelectField, TextField } from "@/components/forms/fields";
import { SummaryRow, SummaryTotal } from "@/components/shop/OrderSummary";
import {
  deliveryOptions,
  parseCheckout,
  paymentOptions,
  type CheckoutErrors,
  type OnlinePayments,
} from "@/lib/forms/checkout";
import { regions, TAMALE_LOCAL } from "@/lib/ghana";
import { deliveryFeePesewas, formatCedis, type DeliveryMethod } from "@/lib/orders";
import { routes } from "@/lib/site";

type Item = { id: string; model: string; pricePesewas: number };

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-border py-7 lg:py-8">
      <h2 className="flex items-baseline gap-3.5 font-display text-h2 text-heading">
        <span className="font-mono text-body-sm font-medium text-secondary">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: Array<{ value: T; label: string; detail: string }>;
  value: T;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-start gap-3 rounded-sm border border-border-strong bg-surface-raised px-4 py-3.5 has-checked:border-primary has-checked:outline has-checked:outline-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 size-4 shrink-0 accent-primary focus-visible:outline-none"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-body font-medium text-ink">{option.label}</span>
            <span className="text-body-sm text-ink-secondary">{option.detail}</span>
          </span>
        </label>
      ))}
      {error && (
        <span id={`${name}-error`} className="text-body-sm text-danger">
          {error}
        </span>
      )}
    </fieldset>
  );
}

export function CheckoutForm({
  items,
  thresholdPesewas,
  rates,
  online,
}: {
  items: Item[];
  thresholdPesewas: number;
  rates: Record<string, number | null>;
  online: OnlinePayments;
}) {
  const [delivery, setDelivery] = useState<DeliveryMethod>("bus");
  const [region, setRegion] = useState("");
  const [payment, setPayment] = useState<string>(() => paymentOptions("bus", online)[0].value);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const payments = paymentOptions(delivery, online);
  const subtotal = items.reduce((sum, item) => sum + item.pricePesewas, 0);
  const rateKey = delivery === "tamale" ? TAMALE_LOCAL : region;
  const fee =
    delivery === "bus" && !region && subtotal < thresholdPesewas
      ? undefined // no region chosen yet
      : deliveryFeePesewas({
          method: delivery,
          subtotalPesewas: subtotal,
          thresholdPesewas,
          regionRatePesewas: rates[rateKey] ?? null,
        });

  function chooseDelivery(value: DeliveryMethod) {
    setDelivery(value);
    // Keep the payment choice if it's still offered; otherwise take the first.
    const next = paymentOptions(value, online);
    if (!next.some((option) => option.value === payment)) setPayment(next[0].value);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const local = parseCheckout(form, online);
    setMessage(null);
    if (!local.ok) {
      setErrors(local.errors);
      const first = Object.keys(local.errors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await placeOrder(form);
      // Success redirects to the confirmation page; only failures return.
      if (result && !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? null);
      }
    });
  }

  const deliveryValue =
    fee === undefined ? "Choose your region" : fee === null ? "Confirmed before dispatch" : fee === 0 ? "Free" : formatCedis(fee);

  return (
    <form method="post"
      noValidate
      onSubmit={onSubmit}
      // Keep personal details out of Microsoft Clarity recordings (see the Cookies page).
      data-clarity-mask="True"
      className="grid gap-4 lg:grid-cols-[1fr_400px] lg:gap-16"
    >
      <div>
        <Step number="01" title="Your details">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <TextField id="name" label="Full name" autoComplete="name" placeholder="Ama Mensah" error={errors.name} required />
            <TextField
              id="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0244123456"
              hint="We'll send your order number and tracking link to this number on WhatsApp."
              error={errors.phone}
              required
            />
          </div>
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="ama@email.com"
            hint="Optional, for a receipt"
            error={errors.email}
          />
          <TextField
            id="referrerPhone"
            label="Referred by someone?"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="Their phone number, e.g. 0201234567"
            hint="Optional. If a friend recommended us, add their number and we'll send them a thank-you once your order is delivered."
            error={errors.referrerPhone}
          />
        </Step>

        <Step number="02" title="Delivery">
          <Choices
            name="delivery"
            legend="How you'll get your order"
            options={deliveryOptions}
            value={delivery}
            onChange={chooseDelivery}
            error={errors.delivery}
          />
          {delivery === "bus" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                <SelectField
                  id="region"
                  label="Region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  options={[{ value: "", label: "Choose a region" }, ...regions.map((r) => ({ value: r, label: r }))]}
                  error={errors.region}
                />
                <TextField id="town" label="Town or city" autoComplete="address-level2" placeholder="Kumasi" error={errors.town} />
              </div>
              <TextField
                id="place"
                label="Pickup station"
                placeholder="e.g. VIP station, Kumasi"
                hint="Where you'll collect the package from the bus."
                error={errors.place}
              />
            </>
          )}
          {delivery === "tamale" && (
            <TextField
              id="place"
              label="Delivery address"
              autoComplete="street-address"
              placeholder="Area and a nearby landmark"
              error={errors.place}
            />
          )}
        </Step>

        <Step number="03" title="Payment">
          <Choices
            name="payment"
            legend="How you'll pay"
            options={payments}
            value={payment as (typeof payments)[number]["value"]}
            onChange={setPayment}
            error={errors.payment}
          />
        </Step>
      </div>

      <aside
        aria-labelledby="summary-heading"
        className="flex flex-col self-start rounded-md border border-border bg-surface p-5 lg:sticky lg:top-24 lg:p-7"
      >
        <h2 id="summary-heading" className="mb-2 font-display text-h2 text-heading">
          Order summary
        </h2>
        <ul className="flex flex-col gap-3 border-b border-border pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-body-sm text-ink">
              <span>{item.model}</span>
              <span className="font-mono font-medium whitespace-nowrap">{formatCedis(item.pricePesewas)}</span>
            </li>
          ))}
        </ul>
        <dl>
          <SummaryRow label="Subtotal" value={formatCedis(subtotal)} />
          <SummaryRow
            label="Delivery"
            value={deliveryValue}
            tone={fee === 0 ? "free" : typeof fee === "number" ? undefined : "muted"}
          />
          <SummaryTotal value={formatCedis(subtotal + (fee ?? 0))} />
        </dl>
        {fee === null && (
          <p className="-mt-1 mb-3 text-body-sm text-ink-secondary">
            We&rsquo;ll confirm the delivery fee for your region on WhatsApp before we dispatch.
          </p>
        )}
        {message && (
          <p role="alert" className="mb-3 text-body-sm text-danger">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className={buttonClass({ size: "lg", full: true })}
        >
          {pending ? "Placing your order…" : "Place order"}
        </button>
        <p className="mt-3 text-body-sm text-ink-muted">
          No account needed. By placing this order you agree to our{" "}
          <a href={routes.terms} className="underline underline-offset-3">
            Terms
          </a>
          .
        </p>
      </aside>
    </form>
  );
}
