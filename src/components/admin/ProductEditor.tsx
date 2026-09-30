"use client";

import { startTransition, useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { deleteProduct, saveProduct, type SaveProductState } from "@/app/admin/(app)/products/actions";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import type { Product } from "@/lib/products";
import { MAX_COMPARE_ROWS } from "@/lib/admin/product-form";
import { productThemes } from "@/lib/product-themes";

const card = "flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
const cardTitle = "font-display text-h3 text-heading";

export function ProductEditor({
  product,
  signups,
  saved,
  preview,
}: {
  product: Product | null;
  signups: number;
  saved: boolean;
  /** The preview image manager; added once the product exists. */
  preview?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<SaveProductState, FormData>(saveProduct.bind(null, product?.id ?? null), {
    errors: {},
    message: null,
  });
  const [status, setStatus] = useState(product?.status ?? "in_development");
  // Each row keeps a stable key, so removing one doesn't shift the others' text.
  const [rows, setRows] = useState(() =>
    (product?.compare.length ? product.compare : [{ today: "", with: "" }]).map((row, i) => ({ ...row, key: i })),
  );
  const [nextKey, setNextKey] = useState(rows.length);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const e = state.errors;

  return (
    <form method="post"
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
          Saved. The site shows the change now.
        </p>
      )}
      {state.message && (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          {state.message}
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="product-title" className={card}>
            <h2 id="product-title" className={cardTitle}>
              Product
            </h2>
            <TextField id="name" label="Name" defaultValue={product?.name} error={e.name} placeholder="Merchander" required />
            {product ? (
              <p className="text-body-sm text-ink-secondary">
                Page address: <span className="font-mono text-ink">sherohq.com/{product.slug}</span> (fixed, so shared links keep working)
              </p>
            ) : (
              <TextField
                id="slug"
                label="Page address"
                error={e.slug}
                placeholder="made from the name if left empty"
                hint="sherohq.com/… Lowercase letters, numbers and dashes. It can't change later."
              />
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                id="status"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                options={[
                  { value: "in_development", label: "In development" },
                  { value: "live", label: "Live" },
                ]}
                hint={status === "in_development" ? "Labelled In development everywhere, with a waitlist." : undefined}
              />
              <SelectField
                id="theme"
                label="Colours"
                defaultValue={product?.theme ?? "shero"}
                error={e.theme}
                options={productThemes.map((t) => ({ value: t.value, label: t.label }))}
              />
            </div>
            {status === "live" && (
              <TextField
                id="liveUrl"
                label="Where it lives"
                type="url"
                defaultValue={product?.liveUrl ?? ""}
                error={e.liveUrl}
                placeholder="https://merchander.sherohq.com"
                hint="The page's button opens this. The waitlist form is hidden."
              />
            )}
            <div className="grid items-end gap-5 sm:grid-cols-2">
              <TextField
                id="displayOrder"
                label="Order"
                inputMode="numeric"
                defaultValue={String(product?.displayOrder ?? 0)}
                error={e.displayOrder}
                hint="Lower numbers come first."
              />
              <label className="flex h-10 items-center gap-2.5 text-body-sm text-ink">
                <input type="checkbox" name="published" defaultChecked={product?.published ?? false} className="size-4 accent-primary" />
                Show on the site
              </label>
            </div>
          </section>

          <section aria-labelledby="copy-title" className={card}>
            <h2 id="copy-title" className={cardTitle}>
              Page
            </h2>
            <TextField id="title" label="Headline" defaultValue={product?.title} error={e.title} placeholder="One place to run a business that sells on social media." />
            <TextField
              id="summary"
              label="One-line summary"
              defaultValue={product?.summary}
              error={e.summary}
              hint="On the Home card and in search results."
            />
            <TextArea id="problem" label="The problem it solves" defaultValue={product?.problem} error={e.problem} />
            <TextField id="audience" label="Who it's for" defaultValue={product?.audience} error={e.audience} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {preview ?? (
            <p className="rounded-sm border border-dashed border-border-strong px-4 py-3 text-body-sm text-ink-secondary">
              Save the product first, then add a dashboard preview image.
            </p>
          )}

          <section aria-labelledby="compare-title" className={card}>
            <h2 id="compare-title" className={cardTitle}>
              Today, and with {product?.name ?? "it"}
            </h2>
            <p className="-mt-2 text-body-sm text-ink-secondary">How things work now, and what changes. Up to {MAX_COMPARE_ROWS} rows.</p>
            {rows.map((row, i) => (
              <fieldset key={row.key} className="flex flex-col gap-3 border-t border-border pt-4">
                <legend className="sr-only">Row {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField id={`compare-today-${i}`} label="Today" defaultValue={row.today} />
                  <TextField id={`compare-with-${i}`} label="With it" defaultValue={row.with} />
                </div>
                {e[`compare-${i}`] && <p className="text-body-sm text-danger">{e[`compare-${i}`]}</p>}
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    className="flex items-center gap-1.5 self-start text-body-sm text-ink-secondary hover:text-danger"
                  >
                    <X aria-hidden="true" size={16} strokeWidth={1.5} /> Remove row {i + 1}
                  </button>
                )}
              </fieldset>
            ))}
            {rows.length < MAX_COMPARE_ROWS && (
              <button
                type="button"
                onClick={() => {
                  setRows([...rows, { today: "", with: "", key: nextKey }]);
                  setNextKey(nextKey + 1);
                }}
                className={buttonClass({ variant: "outline", className: "self-start" })}
              >
                <Plus aria-hidden="true" size={16} strokeWidth={1.5} /> Add a row
              </button>
            )}
          </section>

          {status === "in_development" && (
            <section aria-labelledby="waitlist-title" className={card}>
              <h2 id="waitlist-title" className={cardTitle}>
                Waitlist form
              </h2>
              <p className="-mt-2 text-body-sm text-ink-secondary">
                Name and phone are always asked. These are the product&rsquo;s own questions.
                {signups > 0 && ` ${signups} ${signups === 1 ? "person has" : "people have"} joined so far.`}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField id="businessLabel" label="Business question" defaultValue={product?.businessLabel ?? "Business name"} />
                <TextField id="businessPlaceholder" label="Example answer" defaultValue={product?.businessPlaceholder ?? ""} placeholder="Ama's Imports" />
                <TextField
                  id="detailLabel"
                  label="Your question"
                  defaultValue={product?.detailLabel ?? ""}
                  error={e.detailLabel}
                  placeholder="What do you sell?"
                />
                <TextField id="detailPlaceholder" label="Example answer" defaultValue={product?.detailPlaceholder ?? ""} placeholder="Bags and shoes" />
                <TextField id="namePlaceholder" label="Example name" defaultValue={product?.namePlaceholder ?? "Ama Mensah"} />
              </div>
              <label className="flex items-center gap-2.5 text-body-sm text-ink">
                <input type="checkbox" name="detailNumeric" defaultChecked={product?.detailNumeric ?? false} className="size-4 accent-primary" />
                The answer is a number (e.g. number of branches)
              </label>
            </section>
          )}

          <section aria-label="Save" className={card}>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
                {pending ? "Saving…" : product ? "Save" : "Create product"}
              </button>
              {product && (
                <button
                  type="button"
                  className={buttonClass({ variant: "danger", size: "lg" })}
                  onClick={async () => {
                    if (!confirm(`Delete ${product.name}? This can't be undone.`)) return;
                    const result = await deleteProduct(product.id);
                    if (result) setDeleteMessage(result.message);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            {deleteMessage && (
              <p role="alert" className="text-body-sm text-danger">
                {deleteMessage}
              </p>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}
