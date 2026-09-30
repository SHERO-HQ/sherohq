"use client";

import { useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { removePreview, setPreview } from "@/app/admin/(app)/products/actions";
import { shrinkImage } from "@/lib/admin/shrink-image";
import { cn } from "@/lib/cn";

/** The product's dashboard preview: one image, replaced or removed. */
export function PreviewManager({ productId, url, inDevelopment }: { productId: string; url: string | null; inDevelopment: boolean }) {
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
    <section aria-labelledby="preview-title" className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6">
      <h2 id="preview-title" className="font-display text-h3 text-heading">
        Dashboard preview
      </h2>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="The current preview" className="aspect-[16/9] w-full rounded-sm border border-border object-cover object-top" />
      ) : (
        <p className="text-body-sm text-ink-secondary">No preview yet: the page shows a marked placeholder.</p>
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
              if (confirm("Remove the preview image?")) startTransition(async () => void (await removePreview(productId)));
            }}
            className={cn("text-body-sm text-ink-secondary hover:text-danger")}
          >
            Remove
          </button>
        )}
      </div>
      <p aria-live="polite" className={cn("text-body-sm", message ? "text-danger" : "text-ink-muted")}>
        {message ??
          (pending
            ? "Saving…"
            : inDevelopment
              ? "A screenshot, 16:9 works best. While in development it's shown with a \"Preview · in development\" tag."
              : "A screenshot, 16:9 works best.")}
      </p>
    </section>
  );
}
