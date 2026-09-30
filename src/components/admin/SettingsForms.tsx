"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import {
  saveDeliveryRates,
  saveNotifications,
  saveShopSettings,
  sendTestEmail,
  type SettingsState,
} from "@/app/admin/(app)/settings/actions";
import { TextArea, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

export const settingsCard = "flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
export const settingsCardTitle = "font-display text-h3 text-heading";

const initial: SettingsState = { errors: {}, message: null, saved: false };

function Outcome({ state, saved }: { state: SettingsState; saved: string }) {
  if (state.message)
    return (
      <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
        {state.message}
      </p>
    );
  if (state.saved)
    return (
      <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
        {saved}
      </p>
    );
  return null;
}

/** Submitted by hand so a refused save keeps everything typed. */
function submitWith(action: (data: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}

export function ShopSettingsForm({
  threshold,
  minBattery,
  categories,
}: {
  threshold: string;
  minBattery: number;
  categories: string[];
}) {
  const [state, action, pending] = useActionState(saveShopSettings, initial);
  const e = state.errors;
  return (
    <form method="post" onSubmit={submitWith(action)} noValidate aria-labelledby="shop-title" className={settingsCard}>
      <h2 id="shop-title" className={settingsCardTitle}>
        Shop
      </h2>
      <Outcome state={state} saved="Saved. The shop, Home, FAQ and Terms show the change now." />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="threshold"
          label="Free delivery over (GHS)"
          inputMode="decimal"
          defaultValue={threshold}
          error={e.threshold}
          hint="Orders at or above this deliver free."
        />
        <TextField
          id="minBattery"
          label="Grade A++ minimum battery (%)"
          inputMode="numeric"
          defaultValue={String(minBattery)}
          error={e.minBattery}
          hint="A device needs this or more to be In stock."
        />
      </div>
      <TextArea
        id="categories"
        label="Categories"
        rows={5}
        defaultValue={categories.join("\n")}
        error={e.categories}
        hint="One per line, in the order the shop shows them."
      />
      <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
        {pending ? "Saving…" : "Save shop settings"}
      </button>
    </form>
  );
}

export function DeliveryRatesForm({ regions, rates, freeOver }: { regions: string[]; rates: string[]; freeOver: string }) {
  const [state, action, pending] = useActionState(saveDeliveryRates, initial);
  return (
    <form method="post" onSubmit={submitWith(action)} noValidate aria-labelledby="rates-title" className={settingsCard}>
      <div className="flex flex-col gap-1.5">
        <h2 id="rates-title" className={settingsCardTitle}>
          Delivery fees
        </h2>
        <p className="text-body-sm text-ink-secondary">
          In cedis, for orders under {freeOver}. Leave a region empty and checkout says the fee is confirmed before dispatch;
          you agree it on WhatsApp. Store pickup is always free.
        </p>
      </div>
      <Outcome state={state} saved="Saved. Checkout uses the new fees now." />
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {regions.map((region, i) => (
          <TextField
            key={region}
            id={`rate-${i}`}
            label={region}
            inputMode="decimal"
            defaultValue={rates[i]}
            error={state.errors[`rate-${i}`]}
            placeholder="Agreed per order"
          />
        ))}
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
        {pending ? "Saving…" : "Save delivery fees"}
      </button>
    </form>
  );
}

export function NotificationsForm({
  accountEmail,
  notifyEmail,
  on,
  connected,
}: {
  accountEmail: string;
  notifyEmail: string | null;
  on: { orders: boolean; consultations: boolean; waitlists: boolean };
  /** Whether the email service is set up (RESEND_API_KEY). */
  connected: boolean;
}) {
  const [state, action, pending] = useActionState(saveNotifications, initial);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, startTest] = useTransition();
  const switches = [
    { id: "notifyOrders", label: "New orders", checked: on.orders },
    { id: "notifyConsultations", label: "Consultation requests", checked: on.consultations },
    { id: "notifyWaitlists", label: "Waitlist signups", checked: on.waitlists },
  ];
  return (
    <form method="post" onSubmit={submitWith(action)} noValidate aria-labelledby="notify-title" className={settingsCard}>
      <div className="flex flex-col gap-1.5">
        <h2 id="notify-title" className={settingsCardTitle}>
          Notifications
        </h2>
        <p className="text-body-sm text-ink-secondary">
          An email as soon as something comes in, with what you need to reply. Orders link straight to the order here.
        </p>
      </div>
      {!connected && (
        <p className="rounded-sm bg-warning-subtle px-4 py-3 text-body-sm text-ink">
          Email sending isn&rsquo;t connected yet, so nothing is sent. It needs a Resend account with sherohq.com
          verified, and its key added to the hosting (RESEND_API_KEY).
        </p>
      )}
      <Outcome state={state} saved="Saved." />
      <TextField
        id="notifyEmail"
        label="Send to"
        type="email"
        defaultValue={notifyEmail ?? ""}
        placeholder={accountEmail}
        error={state.errors.notifyEmail}
        hint={`Leave empty to use your sign-in email, ${accountEmail}.`}
      />
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-label text-ink">Email me about</legend>
        {switches.map((item) => (
          <label key={item.id} className="flex items-center gap-2.5 text-body-sm text-ink">
            <input type="checkbox" name={item.id} defaultChecked={item.checked} className="size-4 accent-primary" />
            {item.label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass()}>
          {pending ? "Saving…" : "Save notifications"}
        </button>
        <button
          type="button"
          disabled={testing || !connected}
          onClick={() => startTest(async () => setTest(await sendTestEmail()))}
          className={buttonClass({ variant: "outline" })}
        >
          {testing ? "Sending…" : "Send a test email"}
        </button>
      </div>
      {test && (
        <p role="status" className={test.ok ? "text-body-sm text-secondary" : "text-body-sm text-danger"}>
          {test.message}
        </p>
      )}
    </form>
  );
}
