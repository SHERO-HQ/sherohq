"use client";

import { useState, useTransition } from "react";
import { CircleCheck } from "lucide-react";
import { joinWaitlist } from "@/app/(site)/waitlist-actions";
import { TextField } from "@/components/forms/fields";
import { trackEvent } from "@/lib/analytics";
import { parseWaitlist, type WaitlistConfig, type WaitlistErrors } from "@/lib/forms/waitlist";

export function WaitlistForm({ product }: { product: WaitlistConfig }) {
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const local = parseWaitlist(product, form);
    setMessage(null);
    if (!local.ok) {
      setErrors(local.errors);
      document.getElementById(`${product.slug}-${Object.keys(local.errors)[0]}`)?.focus();
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await joinWaitlist(product.slug, form);
      if (result.ok) {
        trackEvent("waitlist_joined", { product: product.slug });
        setJoined(true);
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? null);
      }
    });
  }

  const id = (field: string) => `${product.slug}-${field}`;

  return (
    <div
      id="waitlist"
      className="flex scroll-mt-24 flex-col gap-4 self-start rounded-md border border-t-4 border-border border-t-product-stripe bg-surface p-5 lg:p-8"
    >
      <h2 className="font-display text-h2 text-heading">Join the waitlist</h2>
      {joined ? (
        <p role="status" className="flex items-start gap-3 text-ink">
          <CircleCheck aria-hidden="true" size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-product-accent" />
          You&rsquo;re on the list. We&rsquo;ll contact you when {product.name} is ready.
        </p>
      ) : (
        <>
          <p className="text-body text-ink-secondary">
            We&rsquo;ll get in touch when {product.name} is ready to use.
          </p>
          <form noValidate onSubmit={onSubmit} data-clarity-mask="True" className="flex flex-col gap-4">
            {/* Field names match parseWaitlist; ids are unique per product. */}
            <TextField id={id("name")} name="name" label="Your name" autoComplete="name" placeholder={product.namePlaceholder} error={errors.name} />
            <TextField
              id={id("business")}
              name="business"
              label={product.businessLabel}
              autoComplete="organization"
              placeholder={product.businessPlaceholder}
              error={errors.business}
            />
            <TextField
              id={id("phone")}
              name="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0244123456"
              error={errors.phone}
            />
            <TextField
              id={id("detail")}
              name="detail"
              label={product.detailLabel}
              inputMode={product.detailNumeric ? "numeric" : undefined}
              placeholder={product.detailPlaceholder}
              error={errors.detail}
            />
            <button
              type="submit"
              disabled={pending}
              className="h-10 rounded-sm bg-product-action text-body font-medium text-on-product-action transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Joining…" : "Join the waitlist"}
            </button>
            {message && (
              <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
                {message}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
