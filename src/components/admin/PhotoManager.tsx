"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { addPhoto, movePhoto, removePhoto } from "@/app/admin/(app)/listings/actions";
import { cn } from "@/lib/cn";

const MAX_EDGE = 2000;

/**
 * Shrinks a phone photo in the browser before upload (hosting caps a request
 * at about 4.5 MB). Drawing it also drops the file's metadata; the server
 * re-encodes it again either way.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", 0.88),
    );
  } catch {
    return file; // The server says if it can't read it.
  }
}

export function PhotoManager({ listingId, photos, max }: { listingId: string; photos: string[]; max: number }) {
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setMessage(null);
    const list = Array.from(files).slice(0, max - photos.length);
    for (const [i, file] of list.entries()) {
      setProgress(`Adding photo ${i + 1} of ${list.length}…`);
      const data = new FormData();
      data.set("photo", await shrink(file), "photo.jpg");
      const result = await addPhoto(listingId, data);
      if (!result.ok) {
        setMessage(result.message);
        break;
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  const run = (action: () => Promise<{ ok: boolean; message?: string }>) =>
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? null : (result.message ?? null));
    });

  const iconButton =
    "flex size-8 items-center justify-center rounded-sm bg-surface-raised/90 text-ink shadow-sm hover:text-primary disabled:opacity-40";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-ink">Photos</span>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((url, i) => (
          <li key={url} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-sm bg-surface-raised px-1.5 font-mono text-meta text-ink">cover</span>
            )}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} earlier`}
                  disabled={pending || i === 0}
                  onClick={() => run(() => movePhoto(listingId, url, -1))}
                  className={iconButton}
                >
                  <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} later`}
                  disabled={pending || i === photos.length - 1}
                  onClick={() => run(() => movePhoto(listingId, url, 1))}
                  className={iconButton}
                >
                  <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                disabled={pending}
                onClick={() => {
                  if (confirm("Remove this photo?")) run(() => removePhoto(listingId, url));
                }}
                className={cn(iconButton, "hover:text-danger")}
              >
                <X aria-hidden="true" size={16} strokeWidth={1.5} />
              </button>
            </div>
          </li>
        ))}
        {photos.length < max && (
          <li>
            <label
              className={cn(
                "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border-strong text-body-sm text-ink-secondary hover:text-primary",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                progress && "pointer-events-none opacity-60",
              )}
            >
              <ImagePlus aria-hidden="true" size={20} strokeWidth={1.5} />
              Add photos
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => event.target.files?.length && upload(event.target.files)}
              />
            </label>
          </li>
        )}
      </ul>
      <p aria-live="polite" className={cn("text-body-sm", message ? "text-danger" : "text-ink-muted")}>
        {message ?? progress ?? "Photos of this exact device. The first is the cover; front, keyboard, ports and lid work well."}
      </p>
    </div>
  );
}
