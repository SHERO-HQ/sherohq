"use client";

import { startTransition, useActionState, useState } from "react";
import { deleteDraft, saveListing, type SaveListingState } from "@/app/admin/(app)/listings/actions";
import { SelectField, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import type { DeviceCheck } from "@/lib/listings";
import { deviceTests, inStockBlockers } from "@/lib/listings";
import { listingStatuses, parseListingForm, specFields, type ListingStatus } from "@/lib/admin/listing-form";
import type { ListingSpecs } from "@/db/schema";
import { cn } from "@/lib/cn";

export type EditorListing = {
  id: string | null;
  model: string;
  category: string;
  price: string;
  note: string;
  specs: ListingSpecs;
  status: ListingStatus;
  check: DeviceCheck | null;
};

const card = "flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
const cardTitle = "font-display text-h3 text-heading";
const resultLabels = { untested: "Not tested", pass: "Pass", fail: "Fail" } as const;

function TestRow({ name, label, initial }: { name: string; label: string; initial: boolean | null | undefined }) {
  const start = initial === true ? "pass" : initial === false ? "fail" : "untested";
  return (
    <fieldset className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2">
      <legend className="float-left text-body-sm font-medium text-ink">{label}</legend>
      <div className="flex shrink-0 overflow-hidden rounded-sm border border-border-strong">
        {(Object.keys(resultLabels) as Array<keyof typeof resultLabels>).map((value) => (
          <label
            key={value}
            className={cn(
              "cursor-pointer px-2.5 py-1 text-meta text-ink-secondary not-first:border-l not-first:border-border-strong",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
              value === "pass" && "has-checked:bg-secondary-fill has-checked:text-on-secondary-fill",
              // Danger is dark red in light and light red in dark, so the page colour reads on it in both.
              value === "fail" && "has-checked:bg-danger has-checked:text-page",
              value === "untested" && "has-checked:bg-surface has-checked:text-ink",
            )}
          >
            <input type="radio" name={name} value={value} defaultChecked={start === value} className="sr-only" />
            {resultLabels[value]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ListingEditor({
  listing,
  categories,
  minBattery,
  saved,
  photos,
}: {
  listing: EditorListing;
  categories: string[];
  minBattery: number;
  saved: boolean;
  /** The photo manager; photos are added once the listing exists. */
  photos?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<SaveListingState, FormData>(saveListing.bind(null, listing.id), {
    errors: {},
    message: null,
    blockers: [],
  });
  const check = listing.check;
  const [hasBattery, setHasBattery] = useState(check?.hasBattery ?? true);
  const [replaced, setReplaced] = useState(check?.batteryReplaced ? "yes" : check?.batteryReplaced === false ? "no" : "");
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  // What still stops this device going in stock, worked out as the form changes.
  const [live, setLive] = useState<string[] | null>(null);

  function recheck(form: HTMLFormElement) {
    const parsed = parseListingForm(new FormData(form), categories);
    if (!parsed.ok) return setLive(null);
    setLive(inStockBlockers({ ...parsed.values.check, listingId: "", checkedAt: null, updatedAt: new Date() }, minBattery));
  }

  const e = state.errors;
  const wantsShop = status === "in_stock" || status === "reserved";
  const blockers = wantsShop ? (live ?? state.blockers) : [];

  return (
    <form method="post"
      // Submitted by hand so a refused save keeps everything typed (a form
      // action would reset the fields).
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      onChange={(event) => recheck(event.currentTarget)}
      noValidate
      className="flex flex-col gap-6"
    >
      {saved && !state.message && (
        <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
          Saved.
        </p>
      )}
      {state.message && (
        <div role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          <p>{state.message}</p>
          {state.blockers.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {state.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="details-title" className={card}>
          <h2 id="details-title" className={cardTitle}>
            Details
          </h2>
          {photos ?? (
            <p className="rounded-sm border border-dashed border-border-strong px-4 py-3 text-body-sm text-ink-secondary">
              Create the listing first, then add photos of the device.
            </p>
          )}
          <TextField id="model" label="Model" defaultValue={listing.model} error={e.model} placeholder="Dell Latitude 7490" required />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="category"
              label="Category"
              defaultValue={listing.category}
              error={e.category}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <TextField id="price" label="Price (GHS)" inputMode="decimal" defaultValue={listing.price} error={e.price} placeholder="4,200" required />
          </div>
          <TextField
            id="note"
            label="Note (optional)"
            defaultValue={listing.note}
            error={e.note}
            placeholder="e.g. light enough for school"
            hint="Shown on the listing. Say what it suits, in plain words."
          />
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-label text-ink">Specs</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {specFields.map((field) => (
                <TextField
                  key={field.key}
                  id={`spec-${field.key}`}
                  label={field.label}
                  defaultValue={listing.specs[field.key] ?? ""}
                  placeholder={field.placeholder}
                  error={e[`spec-${field.key}`]}
                />
              ))}
            </div>
          </fieldset>
        </section>

        {/* Right column: the check, then status (which depends on it). */}
        <div className="flex flex-col gap-6">
        <section aria-labelledby="check-title" className={card}>
          <h2 id="check-title" className={cardTitle}>
            Device check
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {deviceTests.map((test) => (
              <TestRow key={test.key} name={`test-${test.key}`} label={test.label} initial={check?.[test.key]} />
            ))}
          </div>

          <label className="flex items-center gap-2.5 text-body-sm text-ink">
            <input
              type="checkbox"
              name="hasBattery"
              checked={hasBattery}
              onChange={(event) => setHasBattery(event.target.checked)}
              className="size-4 accent-primary"
            />
            This device has a battery
          </label>

          {hasBattery && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="batteryHealth"
                label="Battery health (%)"
                inputMode="numeric"
                defaultValue={check?.batteryHealth ?? ""}
                error={e.batteryHealth}
                hint={`${minBattery}% or more to go in stock.`}
              />
              <SelectField
                id="batteryReplaced"
                label="Battery replaced?"
                value={replaced}
                onChange={(event) => setReplaced(event.target.value)}
                options={[
                  { value: "", label: "Not recorded" },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No, original to the device" },
                ]}
              />
              {replaced === "yes" && (
                <TextField
                  id="batteryType"
                  label="Replacement battery"
                  defaultValue={check?.batteryType ?? "Original"}
                  hint="Listings say an original battery was fitted."
                />
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="cosmeticCondition"
              label="Cosmetic condition (%)"
              inputMode="numeric"
              defaultValue={check?.cosmeticCondition ?? ""}
              error={e.cosmeticCondition}
            />
            <TextField
              id="serialLast4"
              label="Serial (last 4)"
              defaultValue={check?.serialLast4 ?? ""}
              error={e.serialLast4}
              maxLength={4}
              autoComplete="off"
            />
          </div>
          <label className="flex items-center gap-2.5 text-body-sm text-ink">
            <input type="checkbox" name="cleanedAndReset" defaultChecked={check?.cleanedAndReset ?? false} className="size-4 accent-primary" />
            Cleaned and reset to factory settings
          </label>
        </section>

      {/* The status field labels this card; a "Status" heading above "Status" would only repeat it. */}
      <section aria-label="Status and save" className={card}>
        <SelectField
          id="status"
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ListingStatus)}
          error={e.status}
          options={listingStatuses.map((s) => ({ value: s.value, label: s.label }))}
          hint="Draft stays out of the shop. Sold leaves it automatically."
        />
        {wantsShop && blockers.length > 0 && (
          <div className="rounded-sm bg-warning-subtle px-4 py-3 text-body-sm text-warning">
            <p className="font-medium">Can&rsquo;t go in stock yet:</p>
            <ul className="mt-1 list-disc pl-5">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
            {pending ? "Saving…" : listing.id ? "Save" : "Create listing"}
          </button>
          {listing.id && listing.status === "draft" && (
            <button
              type="button"
              className={buttonClass({ variant: "danger", size: "lg" })}
              onClick={async () => {
                if (confirm("Delete this draft? This can't be undone.")) await deleteDraft(listing.id!);
              }}
            >
              Delete draft
            </button>
          )}
        </div>
      </section>
        </div>
      </div>
    </form>
  );
}
