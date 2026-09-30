"use client";

import { useId, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { shrinkImage } from "@/lib/admin/shrink-image";
import { cn } from "@/lib/cn";

type Result = { ok: true } | { ok: false; message: string };

/** One image (a product preview, a client logo): added, replaced or removed. */
export function ImageManager({
  id: productId,
  url,
  title,
  empty,
  hint,
  wide = true,
  actions,
}: {
  id: string;
  url: string | null;
  title: string;
  /** What the site shows while there's no image. */
  empty: string;
  hint: string;
  /** A 16:9 screenshot; otherwise shown at its own shape (logos). */
  wide?: boolean;
  actions: { set: (id: string, form: FormData) => Promise<Result>; remove: (id: string) => Promise<Result> };
}) {
  const { set: setPreview, remove: removePreview } = actions;
  const headingId = useId();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function upload(file: File) {
    setMessage(null);
    startTransition(async () => {
      const data = new FormData();
      data.set("photo", await shrinkImage(file), "preview.jpg");
      const result = await setPreview(productId, data);
      if (!result.ok) setMessage(result.message);
    });
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6">
      <h2 id={headingId} className="font-display text-h3 text-heading">
        {title}
      </h2>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`The current ${title.toLowerCase()}`}
          className={cn(
            "rounded-sm border border-border",
            wide ? "aspect-[16/9] w-full object-cover object-top" : "h-16 w-auto self-start bg-surface p-2",
          )}
        />
      ) : (
        <p className="text-body-sm text-ink-secondary">{empty}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-border-strong px-3.5 text-label text-ink hover:border-ink",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
            pending && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus aria-hidden="true" size={16} strokeWidth={1.5} />
          {url ? "Replace image" : "Add image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])}
          />
        </label>
        {url && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove the ${title.toLowerCase()}?`)) startTransition(async () => void (await removePreview(productId)));
            }}
            className={cn("text-body-sm text-ink-secondary hover:text-danger")}
          >
            Remove
          </button>
        )}
      </div>
      <p aria-live="polite" className={cn("text-body-sm", message ? "text-danger" : "text-ink-muted")}>
        {message ?? (pending ? "Saving…" : hint)}
      </p>
    </section>
  );
}
