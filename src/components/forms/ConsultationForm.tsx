"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CircleCheck } from "lucide-react";
import { requestConsultation } from "@/app/(site)/support/consultation/actions";
import { RadioCards, SelectField, SubmitButton, TextArea, TextField } from "@/components/forms/fields";
import { trackEvent } from "@/lib/analytics";
import {
  contactOptions,
  needOptions,
  parseConsultation,
  type ContactMethod,
  type FieldErrors,
} from "@/lib/forms/consultation";

/** Reads ?service= (set by the links on /services) to preselect the need. */
export function ConsultationFormWithPreset() {
  const preset = useSearchParams().get("service");
  const initialNeed = needOptions.some((o) => o.value === preset) ? preset! : "software";
  return <ConsultationForm initialNeed={initialNeed} />;
}

export function ConsultationForm({ initialNeed = "software" }: { initialNeed?: string }) {
  const [contact, setContact] = useState<ContactMethod>("call");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const local = parseConsultation(form);
    setMessage(null);
    if (!local.ok) {
      setErrors(local.errors);
      // Move focus to the first field that needs attention.
      const first = Object.keys(local.errors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await requestConsultation(form);
      if (result.ok) {
        trackEvent("consultation_booked", { need: local.data.need });
        setSent(true);
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? null);
      }
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-md border border-border bg-surface p-6 lg:p-9">
        <CircleCheck aria-hidden="true" size={28} strokeWidth={1.5} className="text-accent" />
        <h2 className="font-display text-h3 text-heading">Thanks, we&rsquo;ve got your request.</h2>
        <p className="text-ink-secondary">We&rsquo;ll get in touch on your chosen channel, Monday to Friday.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-md border border-border bg-surface p-5 lg:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <TextField id="name" label="Your name" autoComplete="name" placeholder="Ama Mensah" error={errors.name} required />
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0244123456"
          error={errors.phone}
          required
        />
      </div>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="ama@business.com"
        hint="Optional"
        error={errors.email}
      />
      <TextField
        id="business"
        label="Business name"
        autoComplete="organization"
        placeholder="Ama's Imports"
        hint="Optional, if it's for a business"
      />
      <SelectField
        id="need"
        label="What do you need help with?"
        options={[...needOptions]}
        defaultValue={initialNeed}
        error={errors.need}
      />
      <TextArea
        id="message"
        label="Tell us a little more"
        placeholder="For example: we take orders on WhatsApp and keep losing track of them."
        error={errors.message}
      />
      <RadioCards
        name="contact"
        legend="How should we reach you?"
        options={[...contactOptions]}
        value={contact}
        onChange={(value) => setContact(value as ContactMethod)}
      />
      {errors.contact && <span className="text-[13px]/[18px] text-danger">{errors.contact}</span>}

      <SubmitButton pending={pending}>{pending ? "Sending…" : "Request a consultation"}</SubmitButton>
      {message && (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          {message}
        </p>
      )}
      <p className="text-[13px]/[19px] text-ink-muted">We&rsquo;ll only use your details to reply to this request.</p>
    </form>
  );
}
