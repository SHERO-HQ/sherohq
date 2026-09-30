"use client";

import { startTransition, useActionState, useState } from "react";
import { saveTestimonial, type SaveTestimonialState } from "@/app/admin/(app)/testimonials/actions";
import { adminCard, adminCardTitle } from "@/components/admin/parts";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

type Initial = {
  quote: string;
  attribution: string;
  business: string;
  source: "project" | "order";
  projectId: string;
  orderNumber: string;
  consent: boolean;
  consentDate: string;
  consentMethod: string;
  published: boolean;
};

export function TestimonialEditor({
  id,
  initial,
  projects,
  saved,
}: {
  id: string | null;
  initial: Initial;
  projects: Array<{ id: string; name: string; client: string | null }>;
  saved: boolean;
}) {
  const [state, action, pending] = useActionState<SaveTestimonialState, FormData>(saveTestimonial.bind(null, id), {
    errors: {},
    message: null,
  });
  const [source, setSource] = useState(initial.source);
  const [consent, setConsent] = useState(initial.consent);
  const e = state.errors;

  return (
    <form
      method="post"
      // Submitted by hand so a refused save keeps everything typed.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      {saved && !state.message && (
        <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
          Saved.
        </p>
      )}
      {state.message && (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          {state.message}
        </p>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="words-title" className={adminCard}>
          <h2 id="words-title" className={adminCardTitle}>
            Their words
          </h2>
          <TextArea
            id="quote"
            label="Quote"
            defaultValue={initial.quote}
            error={e.quote}
            hint="Exactly as they said it. Trim, but never reword."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="attribution" label="Signed as" defaultValue={initial.attribution} error={e.attribution} placeholder="Abena O." />
            <TextField id="business" label="Business (optional)" defaultValue={initial.business} placeholder="Tastea" />
          </div>
          <SelectField
            id="source"
            label="From"
            value={source}
            onChange={(event) => setSource(event.target.value as Initial["source"])}
            options={[
              { value: "project", label: "A client project" },
              { value: "order", label: "A shop order" },
            ]}
          />
          {source === "project" ? (
            <SelectField
              id="projectId"
              label="Project"
              defaultValue={initial.projectId}
              error={e.projectId}
              hint="Its case study shows the quote too."
              options={[
                { value: "", label: "Choose…" },
                ...projects.map((p) => ({ value: p.id, label: p.client ? `${p.name} (${p.client})` : p.name })),
              ]}
            />
          ) : (
            <TextField id="orderNumber" label="Order number" defaultValue={initial.orderNumber} error={e.orderNumber} placeholder="SH-7K2QX" />
          )}
        </section>

        <section aria-labelledby="consent-title" className={adminCard}>
          <h2 id="consent-title" className={adminCardTitle}>
            Consent
          </h2>
          <label className="flex items-center gap-2.5 text-body-sm text-ink">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="size-4 accent-primary"
            />
            They agreed to be quoted on the site, named as above
          </label>
          {consent && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="consentDate" label="When" type="date" defaultValue={initial.consentDate} error={e.consentDate} />
              <TextField
                id="consentMethod"
                label="How"
                defaultValue={initial.consentMethod}
                error={e.consentMethod}
                placeholder="WhatsApp message"
              />
            </div>
          )}
          <label className="flex items-center gap-2.5 text-body-sm text-ink">
            <input type="checkbox" name="published" defaultChecked={initial.published} disabled={!consent} className="size-4 accent-primary" />
            Publish
          </label>
          {e.published && <p className="text-body-sm text-danger">{e.published}</p>}
          <p className="text-body-sm text-ink-secondary">
            The site shows testimonials only once 3 are published. If they withdraw consent, delete it.
          </p>
        </section>
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg", className: "self-start" })}>
        {pending ? "Saving…" : "Save testimonial"}
      </button>
    </form>
  );
}
